import { Module } from '@nestjs/common';
import { DietLogsController } from './diet-logs.controller';
import { DietLogsService } from './diet-logs.service';
import { EntitiesModule } from '@/database/entities.module';

@Module({
  imports: [EntitiesModule],
  controllers: [DietLogsController],
  providers: [DietLogsService],
  exports: [DietLogsService],
})
export class DietLogsModule {}
