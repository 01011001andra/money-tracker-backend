import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Period } from '@/common/types/global/enum.type';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PaginatedResponse } from '@/common/types/global/response.type';
import { Prisma } from '@prisma/client';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class SummaryService {
  constructor(private prisma: DatabaseService) {}

  async create(userId: string) {
    const today = dayjs();

    // Fungsi untuk menghitung dan menyimpan summary
    // const saveSummary = async (
    //   period: Period,
    //   startDate: dayjs.Dayjs,
    //   endDate: dayjs.Dayjs,
    // ) => {
    //   // Mengambil total pendapatan dan pengeluaran untuk periode yang ditentukan
    //   const totalIncome = await this.prisma.transaction.aggregate({
    //     _sum: {
    //       amount: true,
    //     },
    //     where: {
    //       deletedAt: null,
    //       userId: userId,
    //       transactionDate: {
    //         gte: startDate.toDate(), // Mengonversi ke JavaScript Date
    //         lte: endDate.toDate(),
    //       },
    //       type: 'INCOME', // Hanya pendapatan
    //     },
    //   });

    //   const totalExpense = await this.prisma.transaction.aggregate({
    //     _sum: {
    //       amount: true,
    //     },
    //     where: {
    //       deletedAt: null,
    //       userId: userId,
    //       transactionDate: {
    //         gte: startDate.toDate(),
    //         lte: endDate.toDate(),
    //       },
    //       type: 'EXPENSE', // Hanya pengeluaran
    //     },
    //   });

    //   const balance =
    //     (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0);

    //   // Menyimpan summary ke database
    //   await this.prisma.summary.create({
    //     data: {
    //       userId,
    //       period,
    //       startDate: startDate.toDate(),
    //       endDate: endDate.toDate(),
    //       totalIncome: totalIncome._sum.amount || 0,
    //       totalExpense: totalExpense._sum.amount || 0,
    //       balance,
    //     },
    //   });
    // };

    const saveSummary = async (
      period: Period,
      startDate: dayjs.Dayjs,
      endDate: dayjs.Dayjs,
    ) => {
      // Ambil semua transaksi aktif dalam rentang (sekalian untuk di-attach ke DetailSummary)
      const transactionsInRange = await this.prisma.transaction.findMany({
        where: {
          userId,
          deletedAt: null,
          transactionDate: {
            gte: startDate.toDate(),
            lte: endDate.toDate(),
          },
        },
        select: {
          id: true,
          type: true,
          amount: true,
        },
      });

      // Hitung agregat dari hasil di atas (biar 1x ambil)
      const totalIncome = transactionsInRange
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + t.amount, 0);

      const totalExpense = transactionsInRange
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + t.amount, 0);

      const balance = totalIncome - totalExpense;

      // Simpan Summary + DetailSummary dalam satu transaction
      const summary = await this.prisma.$transaction(async (db) => {
        const created = await db.summary.create({
          data: {
            userId,
            period,
            startDate: startDate.toDate(),
            endDate: endDate.toDate(),
            totalIncome,
            totalExpense,
            balance,
          },
        });

        if (transactionsInRange.length > 0) {
          await this.prisma.detailSummary.createMany({
            data: transactionsInRange.map((t) => ({
              summaryId: created.id,
              transactionId: t.id,
              userId,
            })),
            skipDuplicates: true, // hormati @@unique([summaryId, transactionId])
          });
        }

        return created;
      });

      return {
        message: 'Summary & details created',
        status: 'success',
        data: { summaryId: summary.id, totalIncome, totalExpense, balance },
      };
    };

    // Setiap hari, hitung 1 hari sebelumnya
    const alwaysSaveDaily = true; // Perubahan dari "selaluSimpanHarian" agar lebih deskriptif
    if (alwaysSaveDaily) {
      const startDate = today.subtract(1, 'day');
      const endDate = today;
      await saveSummary(Period.DAILY, startDate, endDate);
    }

    // Setiap hari Minggu, hitung 7 hari sebelumnya
    if (today.day() === 0) {
      const startDate = today.subtract(1, 'week').startOf('week');
      const endDate = today.subtract(1, 'week').endOf('week');
      await saveSummary(Period.WEEKLY, startDate, endDate);
    }

    // Setiap tanggal 1, hitung 1 bulan sebelumnya
    if (today.date() === 1) {
      const startDate = today.subtract(1, 'month').startOf('month');
      const endDate = today.subtract(1, 'month').endOf('month');
      await saveSummary(Period.MONTHLY, startDate, endDate);
    }

    // Setiap tanggal 1 Januari, hitung 1 tahun sebelumnya
    if (today.date() === 1 && today.month() === 0) {
      const startDate = today.subtract(1, 'year').startOf('year');
      const endDate = today.subtract(1, 'year').endOf('year');
      await saveSummary(Period.YEARLY, startDate, endDate);
    }

    return { message: 'Summary created!', status: 'success', data: null };
  }

  // async create(userId: string) {
  //   const today = dayjs();

  //   const saveSummary = async (
  //     period: Period,
  //     startDate: dayjs.Dayjs,
  //     endDate: dayjs.Dayjs,
  //   ) => {
  //     // Ambil transaksi aktif dalam rentang
  //     const transactionsInRange = await this.prisma.transaction.findMany({
  //       where: {
  //         userId,
  //         deletedAt: null,
  //         transactionDate: {
  //           gte: startDate.toDate(),
  //           lte: endDate.toDate(),
  //         },
  //       },
  //       select: { id: true, type: true, amount: true },
  //     });

  //     // Hitung agregat
  //     const totalIncome = transactionsInRange
  //       .filter((t) => t.type === 'INCOME')
  //       .reduce((acc, t) => acc + t.amount, 0);

  //     const totalExpense = transactionsInRange
  //       .filter((t) => t.type === 'EXPENSE')
  //       .reduce((acc, t) => acc + t.amount, 0);

  //     const balance = totalIncome - totalExpense;

  //     // Simpan Summary + DetailSummary dalam satu transaksi DB
  //     const summary = await this.prisma.$transaction(async (db) => {
  //       const created = await db.summary.create({
  //         data: {
  //           userId,
  //           period,
  //           startDate: startDate.toDate(),
  //           endDate: endDate.toDate(),
  //           totalIncome,
  //           totalExpense,
  //           balance,
  //         },
  //       });

  //       if (transactionsInRange.length > 0) {
  //         await db.detailSummary.createMany({
  //           data: transactionsInRange.map((t) => ({
  //             summaryId: created.id,
  //             transactionId: t.id,
  //             userId, // hapus jika kolom ini tidak ada di model
  //           })),
  //           skipDuplicates: true, // hormati @@unique([summaryId, transactionId])
  //         });
  //       }

  //       return created;
  //     });

  //     return {
  //       message: 'Summary & details created',
  //       status: 'success',
  //       data: { summaryId: summary.id, totalIncome, totalExpense, balance },
  //     };
  //   };

  //   // DAILY: 1 hari sebelumnya
  //   if (true) {
  //     const startDate = today.subtract(1, 'day');
  //     const endDate = today;
  //     await saveSummary(Period.DAILY, startDate, endDate);
  //   }

  //   // WEEKLY: jika Minggu, 1 minggu sebelumnya
  //   if (today.day() === 0) {
  //     const startDate = today.subtract(1, 'week').startOf('week');
  //     const endDate = today.subtract(1, 'week').endOf('week');
  //     await saveSummary(Period.WEEKLY, startDate, endDate);
  //   }

  //   // MONTHLY: jika tanggal 1, bulan sebelumnya
  //   if (today.date() === 1) {
  //     const startDate = today.subtract(1, 'month').startOf('month');
  //     const endDate = today.subtract(1, 'month').endOf('month');
  //     await saveSummary(Period.MONTHLY, startDate, endDate);
  //   }

  //   // YEARLY: jika 1 Januari, tahun sebelumnya
  //   if (today.date() === 1 && today.month() === 0) {
  //     const startDate = today.subtract(1, 'year').startOf('year');
  //     const endDate = today.subtract(1, 'year').endOf('year');
  //     await saveSummary(Period.YEARLY, startDate, endDate);
  //   }

  //   return { message: 'Summary created!', status: 'success', data: null };
  // }

  // async filterSummary(
  //   userId: string,
  //   startDateQuery: string,
  //   endDateQuery: string,
  //   type: string,
  // ) {
  //   const startDate = startDateQuery
  //     ? dayjs(startDateQuery).startOf('day')
  //     : null; // Menambahkan waktu '00:00:00' pada startDate
  //   const endDate = endDateQuery ? dayjs(endDateQuery).endOf('day') : null; // Menambahkan waktu '23:59:59' pada endDate
  //   const uppercaseType = type.toUpperCase();

  //   if (!['INCOME', 'EXPENSE', 'BALANCE'].includes(uppercaseType)) {
  //     throw new BadRequestException(
  //       'Type is required for INCOME, EXPENSES, or BALANCE',
  //     );
  //   }
  //   if (!startDate || !endDate) {
  //     throw new BadRequestException('Start date or And date is required');
  //   }

  //   if (uppercaseType === 'INCOME') {
  //     const totalIncome = await this.prisma.transaction.aggregate({
  //       _sum: {
  //         amount: true,
  //       },
  //       where: {
  //         userId: userId,
  //         transactionDate: {
  //           gte: startDate.toDate(), // Mengonversi ke JavaScript Date
  //           lte: endDate.toDate(),
  //         },
  //         type: 'INCOME', // Hanya pendapatan
  //       },
  //     });
  //     const incomeDetail = await this.prisma.transaction.findMany({
  //       where: {
  //         userId: userId,
  //         transactionDate: {
  //           gte: startDate.toDate(), // Mengonversi ke JavaScript Date
  //           lte: endDate.toDate(),
  //         },
  //         type: 'INCOME', // Hanya pendapatan
  //       },
  //     });
  //     return {
  //       message: `Income summary for ${startDate.format('YYYY-MM-DD HH:mm:ss')} - ${endDate.format('YYYY-MM-DD HH:mm:ss')}`,
  //       status: 'success',
  //       data: { totalIncome: totalIncome._sum.amount, detail: incomeDetail },
  //     };
  //   }

  //   if (uppercaseType === 'EXPENSE') {
  //     const totalExpense = await this.prisma.transaction.aggregate({
  //       _sum: {
  //         amount: true,
  //       },
  //       where: {
  //         userId: userId,
  //         transactionDate: {
  //           gte: startDate.toDate(),
  //           lte: endDate.toDate(),
  //         },
  //         type: 'EXPENSE', // Hanya pengeluaran
  //       },
  //     });
  //     const expenseDetail = await this.prisma.transaction.findMany({
  //       where: {
  //         userId: userId,
  //         transactionDate: {
  //           gte: startDate.toDate(), // Mengonversi ke JavaScript Date
  //           lte: endDate.toDate(),
  //         },
  //         type: 'EXPENSE', // Hanya pendapatan
  //       },
  //     });
  //     return {
  //       message: `Expense summary for ${startDate.format('YYYY-MM-DD HH:mm:ss')} - ${endDate.format('YYYY-MM-DD HH:mm:ss')}`,
  //       status: 'success',
  //       data: { totalExpense: totalExpense._sum.amount, detail: expenseDetail },
  //     };
  //   }

  //   if (uppercaseType === 'BALANCE') {
  //     const totalIncome = await this.prisma.transaction.aggregate({
  //       _sum: {
  //         amount: true,
  //       },
  //       where: {
  //         userId: userId,
  //         transactionDate: {
  //           gte: startDate.toDate(), // Mengonversi ke JavaScript Date
  //           lte: endDate.toDate(),
  //         },
  //         type: 'INCOME', // Hanya pendapatan
  //       },
  //     });
  //     const incomeDetail = await this.prisma.transaction.findMany({
  //       where: {
  //         userId: userId,
  //         transactionDate: {
  //           gte: startDate.toDate(), // Mengonversi ke JavaScript Date
  //           lte: endDate.toDate(),
  //         },
  //         type: 'INCOME', // Hanya pendapatan
  //       },
  //     });

  //     const totalExpense = await this.prisma.transaction.aggregate({
  //       _sum: {
  //         amount: true,
  //       },
  //       where: {
  //         userId: userId,
  //         transactionDate: {
  //           gte: startDate.toDate(),
  //           lte: endDate.toDate(),
  //         },
  //         type: 'EXPENSE', // Hanya pengeluaran
  //       },
  //     });
  //     const expenseDetail = await this.prisma.transaction.findMany({
  //       where: {
  //         userId: userId,
  //         transactionDate: {
  //           gte: startDate.toDate(), // Mengonversi ke JavaScript Date
  //           lte: endDate.toDate(),
  //         },
  //         type: 'EXPENSE', // Hanya pendapatan
  //       },
  //     });

  //     const balance =
  //       (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0);
  //     return {
  //       message: `Balance summary for ${startDate.format('YYYY-MM-DD HH:mm:ss')} - ${endDate.format('YYYY-MM-DD HH:mm:ss')}`,
  //       status: 'success',
  //       data: {
  //         balance: balance,
  //         totalIncome: {
  //           amount: totalIncome._sum.amount || 0,
  //           detail: incomeDetail,
  //         },
  //         totalExpense: {
  //           amount: totalExpense._sum.amount || 0,
  //           detail: expenseDetail,
  //         },
  //       },
  //     };
  //   }
  // }

  async findAllByUser(
    userId: string,
    page: number,
    limit: number,
    search: string,
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const whereCondition = {
      userId: userId,
      // ...(search && {
      //   OR: [
      //     {
      //       period: {
      //         contains: search,
      //         mode: Prisma.QueryMode.insensitive,
      //       },
      //     },
      //   ],
      // }),
    };
    const summaries = await this.prisma.summary.findMany({
      where: whereCondition,
      skip,
      take: limit,
      select: {
        id: true,
        balance: true,
        totalExpense: true,
        totalIncome: true,
        period: true,
        startDate: true,
        endDate: true,
        details: {
          select: {
            id: true,
            transaction: {
              select: {
                id: true,
                title: true,
                type: true,
                amount: true,
                note: true,
                transactionDate: true,
                category: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { transaction: { transactionDate: 'asc' } },
        },
      },
    });

    const totalSummary = await this.prisma.summary.count({
      where: whereCondition,
    });

    return {
      message: 'Summary List',
      status: 'Success',
      data: summaries,
      meta: {
        total: totalSummary,
        page,
        limit,
        totalPages: Math.ceil(totalSummary / limit),
      },
    };
  }

  async handleCronJob() {
    const users = await this.prisma.user.findMany();
    for (const user of users) {
      await this.create(user.id);
    }
    return {
      message: `Crob executed and applied for ${users.length} users`,
      status: 'success',
      data: null,
    };
  }
}
