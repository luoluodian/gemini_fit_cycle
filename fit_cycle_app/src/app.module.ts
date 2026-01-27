// src/app.module.ts
import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { EntitiesModule } from './database/entities.module';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FoodModule } from './modules/food/food.module';
import { DictModule } from './modules/dict/dict.module';
import { DietPlansModule } from './modules/diet-plans/diet-plans.module';
import { DietLogsModule } from './modules/diet-logs/diet-logs.module';
// TODO: TodayDietModule 模块待完善，目前暂时禁用
// import { TodayDietModule } from './modules/today-diet/today-diet.module';
import { ShareModule } from './modules/share/share.module';

import { FoodItemModule } from './modules/food-items/food-items.module';
import { LoggerModule } from './common/logger/logger.module';
import { RedisModule } from './redis/redis.module';

import {
  RequestLoggerInterceptor,
  TransformInterceptor,
} from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TrimInterceptor } from './common/interceptors/trim.interceptor';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    EntitiesModule,
    AuthModule,
    UserModule,
    FoodModule,
    DictModule,
    DietPlansModule,
    DietLogsModule,
    ShareModule,
    FoodItemModule,
    LoggerModule,
    RedisModule,
  ],
  providers: [
    TransformInterceptor,
    RequestLoggerInterceptor,
    HttpExceptionFilter,
    TrimInterceptor,
  ],
})
export class AppModule {}
