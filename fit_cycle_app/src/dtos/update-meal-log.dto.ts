import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { MealType } from '@/database/entity/meal-log.entity';

/**
 * 更新餐食记录请求 DTO
 */
export class UpdateMealLogDto {
  @IsEnum(MealType)
  @IsOptional()
  mealType?: MealType;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @IsOptional()
  quantity?: number;
}
