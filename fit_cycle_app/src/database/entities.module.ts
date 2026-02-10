// src/database/entities.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// 核心实体导入
import { User } from './entity/user.entity';
import { DataDictionary } from './entity/data-dictionary.entity';
import { DietPlan } from './entity/diet-plan.entity';
import { PlanDay } from './entity/plan-day.entity';
import { PlanMeal } from './entity/plan-meal.entity';
import { PlanMealItem } from './entity/plan-meal-item.entity';
import { FoodItem } from './entity/food-item.entity';
import { ExerciseLog } from './entity/exercise-log.entity';
import { ExerciseType } from './entity/exercise-type.entity';
import { WeightRecord } from './entity/weight-record.entity';
import { UserFavoriteFood } from './entity/user-favorite-food.entity';
import { HealthProfile } from './entity/health-profile.entity';
import { PlanShare } from './entity/plan-share.entity';
// R-1 新增实体
import { DailyRecord } from './entity/daily-record.entity';
import { MealLog } from './entity/meal-log.entity';

/**
 * 统一实体模块：
 * - 用于集中通过 TypeOrmModule.forFeature 注册所有生效实体
 * - 删除了所有冗余/旧版实体 (Badge, MealRecord, TemplateMeal 等)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      HealthProfile,
      DataDictionary,
      DietPlan,
      PlanDay,
      PlanMeal,
      PlanMealItem,
      FoodItem,
      ExerciseLog,
      ExerciseType,
      WeightRecord,
      UserFavoriteFood,
      PlanShare,
      DailyRecord,
      MealLog,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}