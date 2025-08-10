import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    await this.isUserExist(createUserDto.email);

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(String(createUserDto.password), salt);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password: String(hashPassword) },
    });

    return user;
  }

  async findAll(): Promise<User[]> {
    const users = this.prisma.user.findMany();
    return users;
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: string,
    updateUserDto: Prisma.UserUpdateInput,
  ): Promise<User> {
    const newUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return newUser;
  }

  async remove(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }

  async isUserExist(email: string) {
    const isUserExist = await this.prisma.user.findUnique({
      where: { email },
    });

    if (isUserExist) {
      throw new ConflictException('User already exist');
    }
  }
}
