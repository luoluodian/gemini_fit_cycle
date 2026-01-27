import { Test, TestingModule } from '@nestjs/testing';
import { DietPlansController } from './diet-plans.controller';

describe('DietPlansController', () => {
  let controller: DietPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DietPlansController],
    }).compile();

    controller = module.get<DietPlansController>(DietPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});