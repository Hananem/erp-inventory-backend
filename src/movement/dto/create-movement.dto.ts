import { IsString, IsInt, IsEnum, IsOptional } from 'class-validator';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

export class CreateMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  quantity: number;

  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsOptional()
  @IsString()
  note?: string;
}