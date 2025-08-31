import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);
import { Filter, getPeriodRange } from 'src/common/utils/helper';
import { DatabaseService } from 'src/database/database.service';
import { IncomeTargetService } from 'src/income-target/income-target.service';
const THRESHOLD_PCT = 5;

@Injectable()
export class BffService {
  constructor(
    private prisma: DatabaseService,
    private targetIncome: IncomeTargetService,
  ) {}
  private kFormatter(v: number) {
    return v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`;
  }

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

    const notification = {
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
    };
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
        overview: await this.targetIncome.overview(userId),
        notification: null,
      },
    };
  }

  async report(userId: string) {
    const start = dayjs().startOf('month').toDate();
    const end = dayjs().endOf('month').toDate();

    const tx = await this.prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: start, lte: end },
        deletedAt: null,
      },
      select: {
        amount: true,
        type: true, // 'INCOME' | 'EXPENSE'
        transactionDate: true,
        category: { select: { name: true } },
      },
      orderBy: { transactionDate: 'asc' },
    });

    // Minggu dalam bulan (W1..W4/5)
    const weeksCount = Math.max(1, Math.ceil(dayjs(end).date() / 7)); // 4 atau 5
    const labels = Array.from({ length: weeksCount }, (_, i) => `W${i + 1}`);

    const weeklyIncome = Array<number>(weeksCount).fill(0);
    const weeklyExpense = Array<number>(weeksCount).fill(0);

    // Pie: total expense per kategori
    const expenseByCategory = new Map<string, number>();

    for (const t of tx) {
      const d = dayjs(t.transactionDate);
      let weekIndex = Math.floor((d.date() - 1) / 7); // 0-based minggu dalam bulan
      if (weekIndex < 0) weekIndex = 0;
      if (weekIndex >= weeksCount) weekIndex = weeksCount - 1;

      const amt = Number(t.amount) || 0;
      if (t.type === 'INCOME') weeklyIncome[weekIndex] += amt;
      else {
        weeklyExpense[weekIndex] += amt;
        const cat = t.category?.name ?? 'Unknown';
        expenseByCategory.set(cat, (expenseByCategory.get(cat) ?? 0) + amt);
      }
    }

    // Totals (hitung SETELAH pengisian)
    const totalIncome = weeklyIncome.reduce((a, b) => a + b, 0);
    const totalExpense = weeklyExpense.reduce((a, b) => a + b, 0);

    const idr = new Intl.NumberFormat('id-ID');
    const axisText = '#94a3b8';
    const gridLine = '#e2e8f0';
    const incomeColor = '#7c3aed';
    const expenseColor = '#ef4444';

    const incomeLabel = `Income Rp ${idr.format(totalIncome)}`;
    const expenseLabel = `Expense Rp ${idr.format(totalExpense)}`;

    // === Chart 1: Weekly Income vs Expense (Bar) ===
    const weeklyBarOption = {
      legend: {
        top: 0,
        left: 'left',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: axisText, fontSize: 12, fontWeight: 600 },
        data: [incomeLabel, expenseLabel], // sinkron dg series.name
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        confine: true,
      },
      grid: {
        left: 12,
        right: 12,
        top: 60,
        bottom: 12,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: axisText },
      },
      yAxis: {
        type: 'value',
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: axisText,
          formatter: (v: number) =>
            v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`,
        },
        splitLine: { lineStyle: { color: gridLine } },
      },
      series: [
        {
          name: incomeLabel,
          type: 'bar',
          barWidth: 14,
          itemStyle: { color: incomeColor, borderRadius: [6, 6, 0, 0] },
          data: weeklyIncome,
        },
        {
          name: expenseLabel,
          type: 'bar',
          barWidth: 14,
          barGap: '30%',
          itemStyle: { color: expenseColor, borderRadius: [6, 6, 0, 0] },
          data: weeklyExpense,
        },
      ],
    };

    // === Chart 2: Expense by Category (Pie) ===
    const pieData = Array.from(expenseByCategory.entries()).map(
      ([name, value]) => ({ name, value }),
    );
    const pieOption = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', confine: true },
      legend: { top: 0, left: 'center', textStyle: { color: axisText } },
      series: [
        {
          name: 'Expense by Category',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '55%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 12, fontWeight: 600 } },
          labelLine: { show: false },
          data: pieData,
        },
      ],
    };

    return {
      message: 'Report list',
      status: 'success',
      data: [
        {
          name: 'Semua Transaksi',
          type: 'section',
          charts: [
            {
              header: {
                title: 'Ringkasan Uang (Bulan ini)',
                subTitle: `Perminggu`,
              },
              option: weeklyBarOption,
            },
            {
              header: {
                title: 'Pengeluaran per Kategori',
                subTitle: 'Bulan ini',
              },
              option: pieOption,
            },
          ],
        },
      ],
    };
  }
}
