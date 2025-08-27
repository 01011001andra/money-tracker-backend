import { IsNumber, IsOptional } from 'class-validator';

export class CreateIncomeTargetDto {
  @IsNumber()
  @IsOptional()
  dailyTarget?: number;

  @IsNumber()
  @IsOptional()
  weeklyTarget?: number;

  @IsNumber()
  @IsOptional()
  monthlyTarget?: number;

  @IsNumber()
  @IsOptional()
  yearlyTarget?: number;
}
