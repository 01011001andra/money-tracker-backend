import { Controller, Get } from '@nestjs/common';
import { BffService } from './bff.service';

@Controller('bff')
export class BffController {
  constructor(private readonly bffService: BffService) {}

  @Get('dashboard')
  dashboard() {
    return this.bffService.dashboard();
  }
}
