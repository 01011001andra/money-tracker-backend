import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SummaryService } from './summary.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: Request) {
    return this.summaryService.create(String(req.user?.id));
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('/filter')
  // filterSummary(@Req() req: Request) {
  //   return this.summaryService.filterSummary(
  //     String(req.user?.id),
  //     req.query.startDate as string,
  //     req.query.endDate as string,
  //     req.query.type as string,
  //   );
  // }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllByUser(@Req() req: Request) {
    return this.summaryService.findAllByUser(
      String(req.user?.id),
      Number(req.query.page || 1),
      Number(req.query.limit || 10),
      (req.query.search as string) || '',
    );
  }

  @Get('/cron')
  handleCronJob() {
    return this.summaryService.handleCronJob();
  }
}
