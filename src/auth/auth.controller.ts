import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() authPayload: LoginDto) {
    return this.authService.login(authPayload);
  }

  @Post('register')
  register(@Body() authPayload: RegisterDto) {
    return this.authService.register(authPayload);
  }

  @Get('initial')
  @UseGuards(JwtAuthGuard)
  getInitial(@Req() req: Request) {
    return this.authService.getInitial(String(req.user?.id));
  }
}
