import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { VoucherKind } from '@prisma/client';

export class CreateVoucherDto {
  @IsEnum(VoucherKind, { message: 'kind يجب أن يكون RECEIPT أو PAYMENT' })
  kind: VoucherKind;

  @IsString()
  @IsNotEmpty({ message: 'اسم المستفيد/الدافع مطلوب' })
  party: string;

  @IsString()
  @IsNotEmpty({ message: 'الحساب مطلوب' })
  accountId: string;

  @IsNumber()
  @IsPositive({ message: 'المبلغ يجب أن يكون أكبر من صفر' })
  amount: number;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
