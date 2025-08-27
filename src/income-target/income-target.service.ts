import { Injectable } from '@nestjs/common';
import { CreateIncomeTargetDto } from './dto/create-income-target.dto';
import { UpdateIncomeTargetDto } from './dto/update-income-target.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class IncomeTargetService {
  constructor(private prisma: DatabaseService) {}

  async create(dto: CreateIncomeTargetDto, userId: string) {
    const incomeTarget = await this.prisma.incomeTarget.findUnique({
      where: { userId },
    });
    if (incomeTarget) {
      const result = await this.prisma.incomeTarget.update({
        data: {
          dailyTarget: dto.dailyTarget,
          weeklyTarget: dto.weeklyTarget,
          monthlyTarget: dto.monthlyTarget,
          yearlyTarget: dto.yearlyTarget,
        },
        where: { userId: userId },
        select: {
          dailyTarget: true,
          weeklyTarget: true,
          monthlyTarget: true,
          yearlyTarget: true,
        },
      });
      return { message: 'Updated', status: 'success', data: result };
    } else {
      const result = await this.prisma.incomeTarget.create({
        data: {
          dailyTarget: dto.dailyTarget,
          weeklyTarget: dto.weeklyTarget,
          monthlyTarget: dto.monthlyTarget,
          yearlyTarget: dto.yearlyTarget,
          userId,
        },
        select: {
          dailyTarget: true,
          weeklyTarget: true,
          monthlyTarget: true,
          yearlyTarget: true,
        },
      });
      return { message: 'Created', status: 'success', data: result };
    }
  }

  findAll() {
    return `This action returns all incomeTarget`;
  }

  findOne(id: string) {
    return `This action returns a #${id} incomeTarget`;
  }

  update(id: number, updateIncomeTargetDto: UpdateIncomeTargetDto) {
    return `This action updates a #${id} incomeTarget`;
  }

  remove(id: number) {
    return `This action removes a #${id} incomeTarget`;
  }
}
