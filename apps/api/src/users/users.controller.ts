import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get own profile' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.usersService.findById(user.id);
    return { success: true, data: profile };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return { success: true, data: updated };
  }

  @Get('addresses')
  @ApiOperation({ summary: 'List all addresses' })
  async getAddresses(@CurrentUser() user: any) {
    const addresses = await this.usersService.getAddresses(user.id);
    return { success: true, data: addresses };
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add a new address' })
  async createAddress(
    @CurrentUser() user: any,
    @Body() dto: CreateAddressDto,
  ) {
    const address = await this.usersService.createAddress(user.id, dto);
    return { success: true, data: address };
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update an address' })
  async updateAddress(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.usersService.updateAddress(user.id, id, dto);
    return { success: true, data: address };
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete an address' })
  async deleteAddress(@CurrentUser() user: any, @Param('id') id: string) {
    const result = await this.usersService.deleteAddress(user.id, id);
    return { success: true, data: result };
  }

  @Patch('addresses/:id/default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefaultAddress(@CurrentUser() user: any, @Param('id') id: string) {
    const address = await this.usersService.setDefaultAddress(user.id, id);
    return { success: true, data: address };
  }
}
