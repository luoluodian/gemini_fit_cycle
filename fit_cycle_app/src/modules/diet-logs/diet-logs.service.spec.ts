import { Test, TestingModule } from '@nestjs/testing';
import { DietLogsService } from './diet-logs.service';

describe('DietLogsService', () => {
  let service: DietLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DietLogsService],
    }).compile();

    service = module.get<DietLogsService>(DietLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
