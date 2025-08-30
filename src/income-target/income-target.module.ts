import { Module } from '@nestjs/common';
import { IncomeTargetService } from './income-target.service';
import { IncomeTargetController } from './income-target.controller';

@Module({
  controllers: [IncomeTargetController],
  providers: [IncomeTargetService],
  exports: [IncomeTargetService],
})
export class IncomeTargetModule {}
