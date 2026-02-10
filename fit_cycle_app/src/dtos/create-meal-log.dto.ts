import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Matches } from 'class-validator';
import { MealType } from '@/database/entity/meal-log.entity';

/**
 * 添加餐食记录请求 DTO
 */
export class CreateMealLogDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @IsEnum(MealType)
  @IsNotEmpty()
  mealType: MealType;

  @IsInt()
  @IsNotEmpty()
  foodId: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
