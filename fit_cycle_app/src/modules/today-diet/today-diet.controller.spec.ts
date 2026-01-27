import { Test, TestingModule } from '@nestjs/testing';
import { TodayDietController } from './today-diet.controller';

describe('TodayDietController', () => {
  let controller: TodayDietController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodayDietController],
    }).compile();

    controller = module.get<TodayDietController>(TodayDietController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});