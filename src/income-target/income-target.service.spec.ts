import { Test, TestingModule } from '@nestjs/testing';
import { IncomeTargetService } from './income-target.service';

describe('IncomeTargetService', () => {
  let service: IncomeTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncomeTargetService],
    }).compile();

    service = module.get<IncomeTargetService>(IncomeTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
