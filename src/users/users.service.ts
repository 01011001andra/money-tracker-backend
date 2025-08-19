import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const newUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return newUser;
  }
  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        password: true,
        email: true,
        name: true,
        image: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Konfirmasi password tidak sama');
    }

    const isOldCorrect = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isOldCorrect) {
      throw new BadRequestException('Password lama salah');
    }

    const isSameAsOld = await bcrypt.compare(dto.newPassword, user.password);
    if (isSameAsOld) {
      throw new BadRequestException(
        'Password baru tidak boleh sama dengan yang lama',
      );
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
      select: { id: true, email: true, name: true, image: true },
    });

    return updated;
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
