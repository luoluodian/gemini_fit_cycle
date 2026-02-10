import { IsInt, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { MealType } from '@/database/entity/meal-log.entity';

export class UpdateMealLogDto {
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  // 🚀 核心补全：允许手动切换记录状态
  @IsOptional()
  @IsBoolean()
  isRecorded?: boolean;
}