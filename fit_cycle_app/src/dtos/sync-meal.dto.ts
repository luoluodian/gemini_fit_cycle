import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { MealType } from '@/database/entity/meal-log.entity';

/**
 * 按计划同步餐食请求 DTO
 */
export class SyncMealDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @IsEnum(MealType)
  @IsNotEmpty()
  mealType: MealType;
}
