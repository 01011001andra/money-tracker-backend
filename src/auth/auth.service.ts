import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
      const { id } = user;

      const token = this.jwtService.sign({ id });
      const initial = await this.getInitial(user.id);

      return {
        initial,
        token,
      };
    } else {
      throw new HttpException('Invalid Credentials', 400);
    }
  }

  logout() {
    throw new UnauthorizedException('Logout succeed');
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

  async getInitial(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const data = {
      user: {
        id: user.id,
        name: user.name,
        image: user?.image as string | null,
        email: user.email,
      },
    };
    // throw new UnauthorizedException('Logout succeed');

    return data;
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
