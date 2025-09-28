import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateN8nDto } from './dto/create-n8n.dto';
import { UpdateN8nDto } from './dto/update-n8n.dto';
import { DatabaseService } from 'src/database/database.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';

@Injectable()
export class N8nService {
  constructor(
    private prisma: DatabaseService,
    private transaction: TransactionService,
  ) {}
  create(createN8nDto: CreateN8nDto) {
    return 'This action adds a new n8n';
  }

  async findTransactionByTelegramId(telegramId: string) {
    const n8nDetail = await this.prisma.n8N.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!n8nDetail) {
      throw new NotFoundException('Chat id tidak ditemukan');
    }

    const result = await this.prisma.transaction.findMany({
      where: { userId: n8nDetail?.userId, deletedAt: null },
      select: {
        id: true,
        title: true,
        type: true,
        amount: true,
        transactionDate: true,
      },
    });
    return result;
  }

  async createTransactionByTelegramId(
    telegramId: string,
    createTransactionDto: CreateTransactionDto,
  ) {
    const n8nDetail = await this.prisma.n8N.findUnique({
      where: { telegramId: String(telegramId) },
    });
    console.log({ n8nDetail, telegramId });
    if (!n8nDetail) {
      throw new NotFoundException('Chat id tidak ditemukan');
    }

    const result = await this.transaction.create(
      createTransactionDto,
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
