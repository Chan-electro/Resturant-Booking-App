import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty({ minimum: 1, default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;
}
