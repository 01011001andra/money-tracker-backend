import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { SummaryModule } from './summary/summary.module';
import { CategoryModule } from './category/category.module';
import { BffModule } from './bff/bff.module';
import { IncomeTargetModule } from './income-target/income-target.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    TransactionModule,
    SummaryModule,
    CategoryModule,
    BffModule,
    IncomeTargetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
