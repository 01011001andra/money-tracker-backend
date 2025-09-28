import { Test, TestingModule } from '@nestjs/testing';
import { N8nController } from './n8n.controller';
import { N8nService } from './n8n.service';

describe('N8nController', () => {
  let controller: N8nController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [N8nController],
      providers: [N8nService],
    }).compile();

    controller = module.get<N8nController>(N8nController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
