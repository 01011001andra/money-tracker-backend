import { Injectable } from '@nestjs/common';
import { Filter, getPeriodRange } from 'src/common/utils/helper';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BffService {
  constructor(private prisma: DatabaseService) {}

  async dashboard() {
    const getBalanceByPeriod = async (period: Filter) => {
      const range = getPeriodRange(period);
      const [incomeAgg, expenseAgg] = await Promise.all([
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { transactionDate: range, type: 'INCOME' },
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { transactionDate: range, type: 'EXPENSE' },
        }),
      ]);
      const income = incomeAgg._sum.amount ?? 0;
      const expense = expenseAgg._sum.amount ?? 0;
      return income - expense;
    };

    const transactions = await this.prisma.transaction.findMany({
      select: {
        id: true,
        title: true,
        amount: true,
        transactionDate: true,
        category: { select: { id: true, name: true } },
        type: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const activity = transactions.map((transaction) => {
      return {
        ...transaction,
        icon: {
          name:
            transaction.type === 'INCOME'
              ? 'emojione-monotone:money-bag'
              : 'streamline-freehand:e-commerce-click-buy',
          style: {
            backgroundColor: '#fff',
            color: transaction.type === 'INCOME' ? 'green' : 'red',
            width: 20,
            height: 20,
          },
        },
      };
    });
    const monthIncome = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { transactionDate: getPeriodRange('month'), type: 'INCOME' },
    });
    const monthExpense = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { transactionDate: getPeriodRange('month'), type: 'EXPENSE' },
    });
    const [todayBal, weekBal, monthBal, yearBal] = await Promise.all([
      getBalanceByPeriod('day'),
      getBalanceByPeriod('week'),
      getBalanceByPeriod('month'),
      getBalanceByPeriod('year'),
    ]);
    return {
      message: 'Dashboard data',
      status: 'success',
      data: {
        banner: {
          title: 'Total balance',
          balances: [
            { name: 'Today', amount: todayBal },
            { name: 'This week', amount: weekBal },
            { name: 'This month', amount: monthBal },
            { name: 'This year', amount: yearBal },
          ],
          footer: {
            type: 'high',
            percentAge: 24,
            label: 'vs last month',
          },
        },
        activity: activity,
        spendingOverview: [
          {
            name: 'income',
            total: monthIncome._sum.amount || 0,
            progress: 76,
            label: 'of target',
          },
          {
            name: 'expense',
            total: monthExpense._sum.amount || 0,
            progress: 76,
            label: 'of budget used',
          },
        ],
        notification: {
          title: 'Notification',
          news: 8,
          details: [
            {
              id: '1',
              title: 'Transaction just added',
              createdAt: '20200241214112',
              read: false,
              icon: {
                name: 'emojione-monotone:money-bag',
                style: {
                  backgroundColor: '#fff',
                  color: 'green',
                  width: 20,
                  height: 20,
                },
              },
              type: 'success',
            },
            {
              id: '2',
              title: 'Transaction just added',
              createdAt: '20200241214112',
              read: false,
              icon: {
                name: 'emojione-monotone:money-bag',
                style: {
                  backgroundColor: '#fff',
                  color: 'green',
                  width: 20,
                  height: 20,
                },
              },
              type: 'info',
            },
          ],
        },
      },
    };
  }
}
