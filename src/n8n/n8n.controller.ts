import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { N8nService } from './n8n.service';
import { CreateN8nDto } from './dto/create-n8n.dto';
import { UpdateN8nDto } from './dto/update-n8n.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('n8n')
export class N8nController {
  constructor(private readonly n8nService: N8nService) {}

  @Post()
  create(@Body() createN8nDto: CreateN8nDto) {
    return this.n8nService.create(createN8nDto);
  }

  @Get('/transaction')
  findTransactionByTelegramId(@Req() req: Request) {
    return this.n8nService.findTransactionByTelegramId(
      req.query.telegramId as string,
    );
  }

  @Post('/transaction')
  createTransactionByTelegramId(@Req() req: Request) {
    return this.n8nService.createTransactionByTelegramId(
      req.query.telegramId as string,
      req.body,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.n8nService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateN8nDto: UpdateN8nDto) {
    return this.n8nService.update(+id, updateN8nDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.n8nService.remove(+id);
  }
}
