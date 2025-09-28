import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { CategoryModule } from './category/category.module';
import { BffModule } from './bff/bff.module';
import { IncomeTargetModule } from './income-target/income-target.module';
import { N8nModule } from './n8n/n8n.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    TransactionModule,
    CategoryModule,
    BffModule,
    IncomeTargetModule,
    N8nModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
