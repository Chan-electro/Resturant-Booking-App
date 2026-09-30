import { currentUser } from "@clerk/nextjs/server";
import type { User } from "@brahma-kalasha/prisma";
import { prisma } from "@/lib/server/prisma";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

function adminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function requireAppUser(): Promise<User> {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new ApiError("Unauthorized", 401);

  const primaryEmail =
    clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) throw new ApiError("Your Clerk account needs an email address", 400);

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    primaryEmail.split("@")[0];
  const role = adminEmails().has(primaryEmail.toLowerCase()) ? "ADMIN" : undefined;

  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          email: primaryEmail.toLowerCase(),
          avatarUrl: clerkUser.imageUrl,
          emailVerified: clerkUser.primaryEmailAddress?.verification?.status === "verified" ? new Date() : existing.emailVerified,
          ...(role ? { role } : {}),
        },
      })
    : await prisma.user.upsert({
        where: { email: primaryEmail.toLowerCase() },
        update: { clerkId: clerkUser.id, name, avatarUrl: clerkUser.imageUrl },
        create: {
          clerkId: clerkUser.id,
          name,
          email: primaryEmail.toLowerCase(),
          avatarUrl: clerkUser.imageUrl,
          emailVerified: clerkUser.primaryEmailAddress?.verification?.status === "verified" ? new Date() : null,
          ...(role ? { role } : {}),
        },
      });

  if (!user.isActive) throw new ApiError("This account has been disabled", 403);
  return user;
}

export function requireRole(user: User, ...roles: User["role"][]) {
  if (!roles.includes(user.role)) throw new ApiError("Forbidden", 403);
}
