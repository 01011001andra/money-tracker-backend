import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

enum TypeTransaction {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateTransactionDto {
  @IsString()
  title: string;

  @IsEnum(TypeTransaction)
  type: 'INCOME' | 'EXPENSE';

  @IsString()
  categoryId: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  note: string;

  @IsDateString(
    {},
    { message: 'transactionDate harus format ISO (YYYY-MM-DDTHH:mm:ss.sssZ)' },
  )
  transactionDate: string;
}
