import { Module } from '@nestjs/common';
import { N8nService } from './n8n.service';
import { N8nController } from './n8n.controller';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  controllers: [N8nController],
  providers: [N8nService],
  imports: [TransactionModule],
})
export class N8nModule {}
