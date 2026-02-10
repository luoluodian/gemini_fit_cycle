import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietRecordsService } from './diet-records.service';
import { DietRecordsController } from './diet-records.controller';
import { DailyRecord } from '@/database/entity/daily-record.entity';
import { MealLog } from '@/database/entity/meal-log.entity';
import { FoodItem } from '@/database/entity/food-item.entity';
import { DietPlan } from '@/database/entity/diet-plan.entity';
import { DietPlansModule } from '../diet-plans/diet-plans.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyRecord, MealLog, FoodItem, DietPlan]),
    DietPlansModule,
    UserModule,
  ],
  controllers: [DietRecordsController],
  providers: [DietRecordsService],
  exports: [DietRecordsService],
})
export class DietRecordsModule {}