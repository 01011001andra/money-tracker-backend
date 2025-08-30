import { Module } from '@nestjs/common';
import { BffService } from './bff.service';
import { BffController } from './bff.controller';
import { IncomeTargetModule } from 'src/income-target/income-target.module';

@Module({
  controllers: [BffController],
  providers: [BffService],
  imports: [IncomeTargetModule],
})
export class BffModule {}
