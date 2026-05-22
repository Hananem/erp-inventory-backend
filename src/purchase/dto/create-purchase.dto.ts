import { IsString, IsArray, IsInt, IsNumber } from 'class-validator';

class PurchaseItemDto {
  @IsString()
  productId: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreatePurchaseDto {
  @IsString()
  supplierId: string;

  @IsArray()
  items: PurchaseItemDto[];
}