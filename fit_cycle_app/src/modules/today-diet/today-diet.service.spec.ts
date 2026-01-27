import { Test, TestingModule } from '@nestjs/testing';
import { TodayDietService } from './today-diet.service';

describe('TodayDietService', () => {
  let service: TodayDietService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodayDietService],
    }).compile();

    service = module.get<TodayDietService>(TodayDietService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});