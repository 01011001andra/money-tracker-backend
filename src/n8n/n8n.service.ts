import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateN8nDto } from './dto/create-n8n.dto';
import { UpdateN8nDto } from './dto/update-n8n.dto';
import { DatabaseService } from 'src/database/database.service';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  CreateTransactionDto,
  TypeTransaction,
} from 'src/transaction/dto/create-transaction.dto';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { toIsoUtcFromDdMmYyyy } from 'src/common/utils/helper';
dayjs.extend(utc);

@Injectable()
export class N8nService {
  constructor(
    private prisma: DatabaseService,
    private transaction: TransactionService,
  ) {}
  create(createN8nDto: CreateN8nDto) {
    return 'This action adds a new n8n';
  }

  async findTransactionByTelegramId(telegramId: string, type: string) {
    const transactionType = type.toUpperCase() as TypeTransaction;

    const n8nDetail = await this.prisma.n8N.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!n8nDetail) {
      throw new NotFoundException('Chat id tidak ditemukan');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: n8nDetail?.userId,
        deletedAt: null,
        type: transactionType,
      },
      select: {
        title: true,
        type: true,
        amount: true,
        transactionDate: true,
      },
    });
    const filteredResult = transactions.map((transaction) => {
      return {
        ...transaction,
        amount: Number(transaction.amount),
        transactionDate: dayjs(transaction.transactionDate).format(
          'DD-MM-YYYY',
        ),
      };
    });
    return filteredResult;
  }

  async createTransactionByTelegramId(
    telegramId: string,
    createTransactionDto: CreateTransactionDto,
  ) {
    const n8nDetail = await this.prisma.n8N.findUnique({
      where: { telegramId: String(telegramId) },
    });
    if (!n8nDetail) {
      throw new NotFoundException('Chat id tidak ditemukan');
    }

    const result = await this.transaction.create(
      {
        ...createTransactionDto,
        transactionDate: toIsoUtcFromDdMmYyyy(
          createTransactionDto.transactionDate,
        ),
      },
      n8nDetail.userId,
    );
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} n8n`;
  }

  update(id: number, updateN8nDto: UpdateN8nDto) {
    return `This action updates a #${id} n8n`;
  }

  remove(id: number) {
    return `This action removes a #${id} n8n`;
  }
}
