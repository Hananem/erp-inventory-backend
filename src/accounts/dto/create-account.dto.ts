import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم الحساب مطلوب' })
  name: string;

  @IsEnum(AccountType, { message: 'النوع يجب أن يكون cash أو bank أو ccp' })
  type: AccountType;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'الرصيد الافتتاحي لا يمكن أن يكون سالباً' })
  balance?: number;
}
