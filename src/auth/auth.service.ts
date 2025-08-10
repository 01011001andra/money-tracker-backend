import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpException('Invalid Credentials', 401);
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const { password, ...restUser } = user;

      const token = this.jwtService.sign(restUser);

      return {
        id: restUser.id,
        name: restUser.name,
        email: restUser.email,
        token,
      };
    }
  }

  async register(createUserDto: RegisterDto) {
    await this.isUserExist(createUserDto.email);

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(String(createUserDto.password), salt);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password: String(hashPassword) },
    });

    return user;
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
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
