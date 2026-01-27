import { Test, TestingModule } from '@nestjs/testing';
import { DietLogsController } from './diet-logs.controller';

describe('DietLogsController', () => {
  let controller: DietLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DietLogsController],
    }).compile();

    controller = module.get<DietLogsController>(DietLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
