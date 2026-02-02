// src/database/entities.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// 这里统一把所有实体都引进来
import { User } from './entity/user.entity';
import { DataDictionary } from './entity/data-dictionary.entity';
import { DietPlan } from './entity/diet-plan.entity';
import { PlanDay } from './entity/plan-day.entity';
import { PlanMeal } from './entity/plan-meal.entity';
import { PlanMealItem } from './entity/plan-meal-item.entity';
import { DietLog } from './entity/diet-log.entity';
import { FoodItem } from './entity/food-item.entity';
import { ExerciseLog } from './entity/exercise-log.entity';
import { ExerciseType } from './entity/exercise-type.entity';
import { WeightRecord } from './entity/weight-record.entity';
import { PlanTemplate } from './entity/plan-template.entity';
import { TemplateDay } from './entity/template-day.entity';
import { TemplateMeal } from './entity/template-meal.entity';
import { TemplateMealItem } from './entity/template-meal-item.entity';
import { TemplateLike } from './entity/template-like.entity';
import { TemplateFavorite } from './entity/template-favorite.entity';
import { TemplateComment } from './entity/template-comment.entity';
import { Badge } from './entity/badge.entity';
import { UserBadge } from './entity/user-badge.entity';
import { DailyCheckin } from './entity/daily-checkin.entity';
import { Reminder } from './entity/reminder.entity';
import { MealRecord } from './entity/meal-record.entity';
import { PlanDetail } from './entity/plan-detail.entity';
import { DailyGoal } from './entity/daily-goal.entity';
import { HealthProfile } from './entity/health-profile.entity';

/**
 * 统一实体模块：
 * - 用于集中通过 TypeOrmModule.forFeature 注册所有实体
 * - export 出 TypeOrmModule，其他业务模块只需要引入本模块，
 *   就可以在 service 里通过 @InjectRepository 使用这些实体的 Repository。
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
      DietLog,
      FoodItem,
      ExerciseLog,
      ExerciseType,
      WeightRecord,
      PlanTemplate,
      TemplateDay,
      TemplateMeal,
      TemplateMealItem,
      TemplateLike,
      TemplateFavorite,
      TemplateComment,
      Badge,
      UserBadge,
      DailyCheckin,
      Reminder,
      MealRecord,
      PlanDetail,
      DailyGoal,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
