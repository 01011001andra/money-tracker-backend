import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomeTargetDto } from './create-income-target.dto';

export class UpdateIncomeTargetDto extends PartialType(CreateIncomeTargetDto) {}
