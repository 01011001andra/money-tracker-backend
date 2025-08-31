import { Injectable } from '@nestjs/common';
import { CreateIncomeTargetDto } from './dto/create-income-target.dto';
import { UpdateIncomeTargetDto } from './dto/update-income-target.dto';
import { DatabaseService } from 'src/database/database.service';
import { Filter, getLabel, getPeriodRange } from 'src/common/utils/helper';

@Injectable()
export class IncomeTargetService {
  constructor(private prisma: DatabaseService) {}

  async create(dto: CreateIncomeTargetDto, userId: string) {
    const incomeTarget = await this.prisma.incomeTarget.findUnique({
      where: { userId },
    });
    if (incomeTarget) {
      await this.prisma.incomeTarget.update({
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

      return {
        message: 'Updated',
        status: 'success',
        data: await this.overview(userId),
      };
    } else {
      await this.prisma.incomeTarget.create({
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
      return {
        message: 'Created',
        status: 'success',
        data: await this.overview(userId),
      };
    }
  }

  async overview(userId: string) {
    const getTotalIncomeByPeriod = async (
      period: Exclude<Filter, undefined>,
    ) => {
      const range = getPeriodRange(period);
      const incomeTotal = await this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { transactionDate: range, type: 'INCOME' },
      });
      const income = incomeTotal._sum.amount ?? 0;
      return income;
    };

    const [todayIncome, weekIncome, monthIncome, yearIncome] =
      await Promise.all([
        getTotalIncomeByPeriod('day'),
        getTotalIncomeByPeriod('week'),
        getTotalIncomeByPeriod('month'),
        getTotalIncomeByPeriod('year'),
      ]);

    const overview = await this.prisma.incomeTarget.findUnique({
      where: { userId: userId },
      select: {
        dailyTarget: true,
        weeklyTarget: true,
        monthlyTarget: true,
        yearlyTarget: true,
      },
    });
    const getPercentAge = (
      type: 'dailyTarget' | 'weeklyTarget' | 'monthlyTarget' | 'yearlyTarget',
    ) => {
      if (type === 'dailyTarget') {
        return overview?.dailyTarget
          ? (todayIncome / overview?.dailyTarget) * 100
          : null;
      }
      if (type === 'weeklyTarget') {
        return overview?.weeklyTarget
          ? (weekIncome / overview?.weeklyTarget) * 100
          : null;
      }
      if (type === 'monthlyTarget') {
        return overview?.monthlyTarget
          ? (monthIncome / overview?.monthlyTarget) * 100
          : null;
      }
      if (type === 'yearlyTarget') {
        return overview?.yearlyTarget
          ? (yearIncome / overview?.yearlyTarget) * 100
          : null;
      }
    };
    const [todayPercentAge, weekPercentAge, monthPercentAge, yearPercentAge] =
      await Promise.all([
        getPercentAge('dailyTarget'),
        getPercentAge('weeklyTarget'),
        getPercentAge('monthlyTarget'),
        getPercentAge('yearlyTarget'),
      ]);
    const overViewResult = overview
      ? [
          {
            type: 'daily',
            amount: overview?.dailyTarget ?? null,
            percentTarget: todayPercentAge,
            label: getLabel(todayPercentAge || 0),
          },
          {
            type: 'weekly',
            amount: overview?.weeklyTarget ?? null,
            percentTarget: weekPercentAge,
            label: getLabel(weekPercentAge || 0),
          },
          {
            type: 'monthly',
            amount: overview?.monthlyTarget ?? null,
            percentTarget: monthPercentAge,
            label: getLabel(monthPercentAge || 0),
          },
          {
            type: 'yearly',
            amount: overview?.yearlyTarget ?? null,
            percentTarget: yearPercentAge,
            label: getLabel(yearPercentAge || 0),
          },
        ]
      : null;

    return overViewResult;
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
