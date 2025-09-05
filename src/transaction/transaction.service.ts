import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTransactionDto,
  TypeTransaction,
} from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import {
  BaseResponse,
  PaginatedResponse,
} from '../common/types/global/response.type';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { CategoryService } from '../category/category.service';
import { getPeriodRange, PrismaDecimal } from '../common/utils/helper';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class TransactionService {
  constructor(
    private prisma: DatabaseService,
    private category: CategoryService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const category = await this.category.create(
      { categoryId: createTransactionDto.categoryId },
      userId,
    );

    const transaction = await this.prisma.transaction.create({
      data: {
        title: createTransactionDto.title,
        type: createTransactionDto.type,
        transactionDate: createTransactionDto.transactionDate,
        amount: createTransactionDto.amount,
        note: createTransactionDto.note,
        categoryId: category.id,
        userId: userId,
      },
    });

    return {
      message: 'Transaction Created!',
      status: 'success',
      data: transaction,
    };
  }

  findAll() {
    return `This action returns all transaction`;
  }

  async filterTransaction(
    userId: string,
    startDateQuery: string,
    endDateQuery: string,
    type: string,
  ) {
    const startDate = startDateQuery
      ? dayjs(startDateQuery).startOf('day')
      : null; // Menambahkan waktu '00:00:00' pada startDate
    const endDate = endDateQuery ? dayjs(endDateQuery).endOf('day') : null; // Menambahkan waktu '23:59:59' pada endDate
    const uppercaseType = type.toUpperCase();

    if (!['INCOME', 'EXPENSE', 'BALANCE'].includes(uppercaseType)) {
      throw new BadRequestException(
        'Type is required for INCOME, EXPENSES, or BALANCE',
      );
    }
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date or And date is required');
    }

    if (uppercaseType === 'INCOME') {
      const totalIncome = await this.prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: userId,
          transactionDate: {
            gte: startDate.toDate(), // Mengonversi ke JavaScript Date
            lte: endDate.toDate(),
          },
          type: 'INCOME', // Hanya pendapatan
          deletedAt: null,
        },
      });
      const incomeDetail = await this.prisma.transaction.findMany({
        where: {
          userId: userId,
          transactionDate: {
            gte: startDate.toDate(), // Mengonversi ke JavaScript Date
            lte: endDate.toDate(),
          },
          type: 'INCOME', // Hanya pendapatan
          deletedAt: null,
        },
      });
      return {
        message: `Income summary for ${startDate.format('YYYY-MM-DD HH:mm:ss')} - ${endDate.format('YYYY-MM-DD HH:mm:ss')}`,
        status: 'success',
        data: { totalIncome: totalIncome._sum.amount, detail: incomeDetail },
      };
    }

    if (uppercaseType === 'EXPENSE') {
      const totalExpense = await this.prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: userId,
          transactionDate: {
            gte: startDate.toDate(),
            lte: endDate.toDate(),
          },
          type: 'EXPENSE', // Hanya pengeluaran
          deletedAt: null,
        },
      });
      const expenseDetail = await this.prisma.transaction.findMany({
        where: {
          userId: userId,
          transactionDate: {
            gte: startDate.toDate(), // Mengonversi ke JavaScript Date
            lte: endDate.toDate(),
          },
          type: 'EXPENSE', // Hanya pendapatan
          deletedAt: null,
        },
      });
      return {
        message: `Expense summary for ${startDate.format('YYYY-MM-DD HH:mm:ss')} - ${endDate.format('YYYY-MM-DD HH:mm:ss')}`,
        status: 'success',
        data: { totalExpense: totalExpense._sum.amount, detail: expenseDetail },
      };
    }

    if (uppercaseType === 'BALANCE') {
      const totalIncome = await this.prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: userId,
          transactionDate: {
            gte: startDate.toDate(), // Mengonversi ke JavaScript Date
            lte: endDate.toDate(),
          },
          type: 'INCOME', // Hanya pendapatan
          deletedAt: null,
        },
      });
      const incomeDetail = await this.prisma.transaction.findMany({
        where: {
          userId: userId,
          transactionDate: {
            gte: startDate.toDate(), // Mengonversi ke JavaScript Date
            lte: endDate.toDate(),
          },
          type: 'INCOME', // Hanya pendapatan
          deletedAt: null,
        },
      });

      const totalExpense = await this.prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: userId,
          transactionDate: {
            gte: startDate.toDate(),
            lte: endDate.toDate(),
          },
          type: 'EXPENSE', // Hanya pengeluaran
          deletedAt: null,
        },
      });
      const expenseDetail = await this.prisma.transaction.findMany({
        where: {
          userId: userId,
          transactionDate: {
            gte: startDate.toDate(), // Mengonversi ke JavaScript Date
            lte: endDate.toDate(),
          },
          type: 'EXPENSE', // Hanya pendapatan
          deletedAt: null,
        },
      });

      const decTotalIncome = PrismaDecimal(totalIncome._sum.amount);
      const decTotalExpense = PrismaDecimal(totalExpense._sum.amount);
      const balance = decTotalIncome.minus(decTotalExpense);

      return {
        message: `Balance summary for ${startDate.format('YYYY-MM-DD HH:mm:ss')} - ${endDate.format('YYYY-MM-DD HH:mm:ss')}`,
        status: 'success',
        data: {
          balance: balance,
          totalIncome: {
            amount: totalIncome._sum.amount || 0,
            detail: incomeDetail,
          },
          totalExpense: {
            amount: totalExpense._sum.amount || 0,
            detail: expenseDetail,
          },
        },
      };
    }
  }

  async findAllByUser(
    userId: string,
    page: number,
    limit: number,
    search: string,
    filter?: 'day' | 'week' | 'month' | 'year',
    type?: TypeTransaction,
  ): Promise<PaginatedResponse<any>> {
    const range = getPeriodRange(filter, 'Asia/Jakarta');
    const skip = (page - 1) * limit;
    if (type && !['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      throw new BadRequestException(`error ${type}`);
    }
    const whereCondition: Prisma.TransactionWhereInput = {
      userId: userId,
      deletedAt: null,
      ...(filter && {
        transactionDate: range,
      }),
      ...(type && {
        type: type.toUpperCase() as TypeTransaction,
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { note: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const transactions = await this.prisma.transaction.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      select: {
        id: true,
        title: true,
        amount: true,
        type: true,
        category: {
          select: { id: true, name: true },
        },
        transactionDate: true,
        note: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const result = transactions.map((t) => ({
      ...t,
      icon: {
        name: 'streamline-flex-color:wallet',
        style: {
          backgroundColor: '#fff',
          color: '',
          width: 20,
          height: 20,
        },
      },
    }));

    const totalTransactions = await this.prisma.transaction.count({
      where: whereCondition,
    });

    return {
      message: `Transaction ${filter ? `${dayjs(range?.gte).format('DD/MM/YYYY')} - ${dayjs(range?.lt).format('DD/MM/YYYY')}` : 'All'}`,
      status: 'Success',
      data: result,
      meta: {
        total: totalTransactions,
        page,
        limit,
        totalPages: Math.ceil(totalTransactions / limit),
      },
    };
  }

  async findOne(id: string): Promise<BaseResponse<any>> {
    const transaction = await this.findOneOrError(id);

    return {
      message: 'Transaction data',
      status: 'success',
      data: transaction,
    };
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<BaseResponse<any>> {
    const transaction = await this.findOneOrError(id);

    const category = await this.getOrCreateCategory(
      String(updateTransactionDto.categoryId),
      userId,
    );

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { ...updateTransactionDto, categoryId: category.id },
      select: {
        id: true,
        title: true,
        type: true,
        amount: true,
        category: { select: { id: true, name: true } },
        transactionDate: true,
        note: true,
      },
    });

    return {
      message: 'Transaction updated!',
      status: 'success',
      data: updatedTransaction,
    };
  }

  async remove(id: string): Promise<BaseResponse<any>> {
    await this.findOneOrError(id);

    await this.prisma.transaction.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Transaction deleted', status: 'success', data: null };
  }

  async findOneOrError(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        type: true,
        amount: true,
        transactionDate: true,
        note: true,
        category: { select: { id: true, name: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async getOrCreateCategory(categoryId: string, userId: string) {
    const lowerCaseCategory = categoryId.toLowerCase();
    let category = await this.prisma.category.findFirst({
      where: {
        userId,
        OR: [{ id: lowerCaseCategory }, { name: lowerCaseCategory }],
      },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: { name: lowerCaseCategory, userId },
      });
    }
    return category;
  }
}
