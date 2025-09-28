import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateN8nDto } from './dto/create-n8n.dto';
import { UpdateN8nDto } from './dto/update-n8n.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class N8nService {
  constructor(private prisma: DatabaseService) {}
  create(createN8nDto: CreateN8nDto) {
    return 'This action adds a new n8n';
  }

  async findTransactionByTelegramId(chatId: string) {
    const user = await this.prisma.n8N.findUnique({
      where: { telegramId: String(chatId) },
    });

    if (!user) {
      throw new NotFoundException('Chat id tidak ditemukan');
    }

    const result = await this.prisma.transaction.findMany({
      where: { userId: user?.userId, deletedAt: null },
      select: {
        id: true,
        title: true,
        type: true,
        amount: true,
        transactionDate: true,
      },
    });
    console.log({ result, user });
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
