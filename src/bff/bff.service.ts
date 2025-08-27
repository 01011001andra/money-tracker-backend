import { Injectable } from '@nestjs/common';
import { Filter, getPeriodRange } from 'src/common/utils/helper';
import { DatabaseService } from 'src/database/database.service';
const THRESHOLD_PCT = 5;

@Injectable()
export class BffService {
  constructor(private prisma: DatabaseService) {}

  async dashboard(userId: string) {
    function buildMessage(
      income: number,
      expense: number,
      period: Exclude<Filter, undefined>,
    ) {
      const net = income - expense;
      const total = income + expense;
      const pct = total === 0 ? 0 : Math.round((net / total) * 100); // + = lebih hemat, - = boros
      const absPct = Math.abs(pct);
      const PERIOD_LABEL: Record<Exclude<Filter, undefined>, string> = {
        day: 'hari ini',
        week: 'minggu ini',
        month: 'bulan ini',
        year: 'tahun ini',
      };

      const label = PERIOD_LABEL[period];

      if (income === 0 && expense === 0) {
        return {
          type: 'info',
          color: '#60A5FA', // blue-400
          icon: 'mdi:information-outline',
          text: `Belum ada transaksi ${label}.`,
        };
      }

      if (net > 0) {
        // income > expense
        if (pct >= THRESHOLD_PCT) {
          return {
            type: 'success',
            color: '#22C55E', // emerald-500
            icon: 'mdi:check-circle',
            text: `Bagus! Pemasukan lebih besar ${absPct}% dari pengeluaran ${label}. Pertahankan ritme ini.`,
          };
        }
        return {
          type: 'warning',
          color: '#F59E0B', // amber-500
          icon: 'mdi:alert-circle',
          text: `Seimbang, pemasukan sedikit lebih tinggi (selisih kecil ${absPct}%) ${label}.`,
        };
      }

      if (net < 0) {
        // expense > income
        if (-pct >= THRESHOLD_PCT) {
          return {
            type: 'danger',
            color: '#EF4444', // red-500
            icon: 'ic:baseline-dangerous',
            text: `Perhatikan pengeluaran: lebih besar ${absPct}% daripada pemasukan ${label}. Coba kurangi biaya yang tidak penting.`,
          };
        }
        return {
          type: 'warning',
          color: '#F59E0B', // amber-500
          icon: 'mdi:alert-circle',
          text: `Pengeluaran sedikit lebih besar (selisih kecil ${absPct}%) ${label}. Tetap waspada.`,
        };
      }

      // net === 0
      return {
        type: 'warning',
        color: '#F59E0B',
        icon: 'mdi:alert-circle',
        text: `Pemasukan dan pengeluaran pas seimbang ${label}.`,
      };
    }
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
    const getTotalTransactionByPeriod = async (
      period: Exclude<Filter, undefined>,
    ) => {
      const range = getPeriodRange(period);
      const [incomeTotal, expenseTotal] = await Promise.all([
        this.prisma.transaction.count({
          where: { transactionDate: range, type: 'INCOME' },
        }),
        this.prisma.transaction.count({
          where: { transactionDate: range, type: 'EXPENSE' },
        }),
      ]);
      const income = incomeTotal ?? 0;
      const expense = expenseTotal ?? 0;
      const message = buildMessage(income, expense, period);
      return { income, expense, message };
    };
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

    const [todayBal, weekBal, monthBal, yearBal] = await Promise.all([
      getBalanceByPeriod('day'),
      getBalanceByPeriod('week'),
      getBalanceByPeriod('month'),
      getBalanceByPeriod('year'),
    ]);
    const [todayTotal, weekTotal, monthTotal, yearTotal] = await Promise.all([
      getTotalTransactionByPeriod('day'),
      getTotalTransactionByPeriod('week'),
      getTotalTransactionByPeriod('month'),
      getTotalTransactionByPeriod('year'),
    ]);
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
    const overViewResult = overview
      ? [
          {
            type: 'daily',
            amount: overview?.dailyTarget ?? null,
            percentTarget: overview?.dailyTarget
              ? (todayIncome / overview?.dailyTarget) * 100
              : null,
            label: 'Good',
          },
          {
            type: 'weekly',
            amount: overview?.weeklyTarget ?? null,
            percentTarget: overview?.weeklyTarget
              ? (weekIncome / overview?.weeklyTarget) * 100
              : null,
            label: 'Very Good',
          },
          {
            type: 'monthly',
            amount: overview?.monthlyTarget ?? null,
            percentTarget: overview?.monthlyTarget
              ? (monthIncome / overview?.monthlyTarget) * 100
              : null,
            label: 'Nice',
          },
          {
            type: 'yearly',
            amount: overview?.yearlyTarget ?? null,
            percentTarget: overview?.yearlyTarget
              ? (yearIncome / overview?.yearlyTarget) * 100
              : null,
            label: 'Yes',
          },
        ]
      : null;

    return {
      message: 'Dashboard data',
      status: 'success',
      data: {
        banner: {
          title: 'Total balance',
          balances: [
            { name: 'Today', amount: todayBal, totalTransaction: todayTotal },
            { name: 'This week', amount: weekBal, totalTransaction: weekTotal },
            {
              name: 'This month',
              amount: monthBal,
              totalTransaction: monthTotal,
            },
            { name: 'This year', amount: yearBal, totalTransaction: yearTotal },
          ],
        },
        activity: activity,
        overview: overViewResult,
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
