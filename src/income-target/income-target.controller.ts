import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IncomeTargetService } from './income-target.service';
import { CreateIncomeTargetDto } from './dto/create-income-target.dto';
import { UpdateIncomeTargetDto } from './dto/update-income-target.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Request } from 'express';

@Controller('income-target')
export class IncomeTargetController {
  constructor(private readonly incomeTargetService: IncomeTargetService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createIncomeTargetDto: CreateIncomeTargetDto,
    @Req() req: Request,
  ) {
    return this.incomeTargetService.create(
      createIncomeTargetDto,
      String(req.user?.id),
    );
  }

  @Get()
  findAll() {
    return this.incomeTargetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeTargetService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIncomeTargetDto: UpdateIncomeTargetDto,
  ) {
    return this.incomeTargetService.update(+id, updateIncomeTargetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomeTargetService.remove(+id);
  }
}
