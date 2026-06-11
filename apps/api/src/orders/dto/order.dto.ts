import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class PlaceOrderDto {
  @ApiProperty()
  @IsString()
  addressId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ enum: ['COD', 'ONLINE'], default: 'COD' })
  @IsOptional()
  @IsEnum(['COD', 'ONLINE'])
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ description: 'Delivery date YYYY-MM-DD' })
  @IsString()
  deliveryDate: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'ASSIGNED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
    ],
  })
  @IsEnum([
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'ASSIGNED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
