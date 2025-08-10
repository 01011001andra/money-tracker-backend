import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [AuthModule, DatabaseModule, UsersModule, TransactionModule, SummaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
