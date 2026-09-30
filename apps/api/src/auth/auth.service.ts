import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { createClerkClient, verifyToken } from '@clerk/backend';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('User with this phone already exists');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        role: 'CUSTOMER',
      },
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async exchangeClerkToken(token: string) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!secretKey) {
      throw new UnauthorizedException('Clerk authentication is not configured');
    }

    const authorizedParties = this.configService
      .get<string>('CLERK_AUTHORIZED_PARTIES')
      ?.split(',')
      .map((party) => party.trim())
      .filter(Boolean);

    let clerkUserId: string;
    try {
      const payload = await verifyToken(token, {
        secretKey,
        ...(authorizedParties?.length ? { authorizedParties } : {}),
      });
      clerkUserId = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired Clerk session');
    }

    const clerk = createClerkClient({ secretKey });
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const primaryEmail = clerkUser.emailAddresses.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId,
    );

    if (
      !primaryEmail?.emailAddress ||
      primaryEmail.verification?.status !== 'verified'
    ) {
      throw new UnauthorizedException('A verified email address is required');
    }

    const email = primaryEmail.emailAddress.toLowerCase();
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      email.split('@')[0];

    const [userByClerkId, userByEmail] = await Promise.all([
      this.prisma.user.findUnique({ where: { clerkId: clerkUserId } }),
      this.prisma.user.findUnique({ where: { email } }),
    ]);
    if (userByClerkId && userByEmail && userByClerkId.id !== userByEmail.id) {
      throw new ConflictException('Clerk identity and email belong to different accounts');
    }
    let user = userByClerkId || userByEmail;

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account is disabled');
      }
      if (user.clerkId && user.clerkId !== clerkUserId) {
        throw new ConflictException('This email is linked to another identity');
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          clerkId: clerkUserId,
          name,
          avatarUrl: clerkUser.imageUrl || user.avatarUrl,
          emailVerified: user.emailVerified || new Date(),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          name,
          avatarUrl: clerkUser.imageUrl,
          emailVerified: new Date(),
          role: 'CUSTOMER',
        },
      });
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const session = await this.prisma.session.findFirst({
      where: { userId, sessionToken: refreshToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.session.delete({ where: { id: session.id } });

    const tokens = await this.generateTokens(session.user);
    await this.storeRefreshToken(userId, tokens.refreshToken);

    return {
      ...tokens,
      user: this.sanitizeUser(session.user),
    };
  }

  async googleLogin(googleUser: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.avatarUrl,
          role: 'CUSTOMER',
          emailVerified: new Date(),
        },
      });
    }

    // Upsert Google account
    await this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleUser.googleId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: googleUser.googleId,
      },
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async logout(accessToken?: string, refreshToken?: string) {
    let userId: string | null = null;

    if (accessToken) {
      try {
        const decoded = await this.jwtService.verifyAsync(accessToken, {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        });
        userId = decoded.sub;
      } catch (err) {
        // Access token might be expired, try decoding refresh token
      }
    }

    if (!userId && refreshToken) {
      try {
        const decoded = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        });
        userId = decoded.sub;
      } catch (err) {
        // Both tokens are invalid or expired
      }
    }

    if (userId) {
      if (refreshToken) {
        await this.prisma.session.deleteMany({
          where: { userId, sessionToken: refreshToken },
        });
      } else {
        await this.prisma.session.deleteMany({ where: { userId } });
      }
    }
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.verificationToken.upsert({
      where: { token },
      update: { expires },
      create: {
        identifier: email,
        token,
        expires,
      },
    });

    // Until an email provider is connected, expose reset tokens only in local logs.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset token for ${email}: ${token}`);
    }

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.prisma.verificationToken.delete({ where: { token } });

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId,
        sessionToken: token,
        expires,
      },
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
