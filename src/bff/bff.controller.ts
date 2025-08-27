import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BffService } from './bff.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Request } from 'express';

@Controller('bff')
export class BffController {
  constructor(private readonly bffService: BffService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  dashboard(@Req() req: Request) {
    return this.bffService.dashboard(String(req.user?.id));
  }
}
