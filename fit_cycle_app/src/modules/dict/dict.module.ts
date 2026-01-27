import { Module } from '@nestjs/common';
import { DictService } from './dict.service';
import { DictController } from './dict.controller';
import { EntitiesModule } from '@/database/entities.module';
import { RedisModule } from '@/redis/redis.module';

@Module({
  imports: [EntitiesModule, RedisModule],
  controllers: [DictController],
  providers: [DictService],
})
export class DictModule {}
