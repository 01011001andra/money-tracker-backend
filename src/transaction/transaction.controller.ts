import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: Request,
  ) {
    return this.transactionService.create(
      createTransactionDto,
      String(req.user?.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllByUser(@Req() req: Request) {
    return this.transactionService.findAllByUser(
      String(req.user?.id),
      Number(req.query.page || 1),
      Number(req.query.limit || 10),
      (req.query.search as string) || '',
      (req.query.filter as 'day' | 'week' | 'month' | 'year') || '',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/filter')
  filterTransaction(@Req() req: Request) {
    return this.transactionService.filterTransaction(
      String(req.user?.id),
      req.query.startDate as string,
      req.query.endDate as string,
      req.query.type as string,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() req: Request,
  ) {
    return this.transactionService.update(
      id,
      String(req.user?.id),
      updateTransactionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
