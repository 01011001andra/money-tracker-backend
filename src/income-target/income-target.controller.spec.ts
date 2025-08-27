import { Test, TestingModule } from '@nestjs/testing';
import { IncomeTargetController } from './income-target.controller';
import { IncomeTargetService } from './income-target.service';

describe('IncomeTargetController', () => {
  let controller: IncomeTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeTargetController],
      providers: [IncomeTargetService],
    }).compile();

    controller = module.get<IncomeTargetController>(IncomeTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
