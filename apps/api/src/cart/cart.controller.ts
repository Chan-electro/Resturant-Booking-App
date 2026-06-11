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
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's cart" })
  async getCart(@CurrentUser() user: any) {
    const cart = await this.cartService.getCart(user.id);
    return { success: true, data: cart };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(@CurrentUser() user: any, @Body() dto: AddCartItemDto) {
    const cart = await this.cartService.addItem(user.id, dto);
    return { success: true, data: cart };
  }

  @Patch('items/:menuItemId')
  @ApiOperation({ summary: 'Update item quantity (0 removes it)' })
  async updateItem(
    @CurrentUser() user: any,
    @Param('menuItemId') menuItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateItem(user.id, menuItemId, dto);
    return { success: true, data: cart };
  }

  @Delete('items/:menuItemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @CurrentUser() user: any,
    @Param('menuItemId') menuItemId: string,
  ) {
    const cart = await this.cartService.removeItem(user.id, menuItemId);
    return { success: true, data: cart };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser() user: any) {
    const result = await this.cartService.clearCart(user.id);
    return { success: true, data: result };
  }
}
