import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BffService } from './bff.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('bff')
export class BffController {
  constructor(private readonly bffService: BffService) {}

  @Get('dashboard')
  dashboard(@Req() req: Request) {
    return this.bffService.dashboard(String(req.user?.id));
  }

  @Get('report')
  report(@Req() req: Request) {
    return this.bffService.report(String(req.user?.id));
  }
}
