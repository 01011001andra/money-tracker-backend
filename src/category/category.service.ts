import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: DatabaseService) {}

  async create(dto: CreateCategoryDto, userId: string) {
    const lowerCaseCategory = dto.categoryId.toLowerCase();
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

  async findAllByUser(userId: string) {
    const result = await this.prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    return { message: 'Category List', status: 'success', data: result };
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
