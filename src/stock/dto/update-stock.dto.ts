import { IsString, IsInt } from 'class-validator';

export class UpdateStockDto {
  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsInt()
  quantity: number;
}