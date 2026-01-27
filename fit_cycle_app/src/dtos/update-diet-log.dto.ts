import { IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * 更新饮食记录请求 DTO。
 * 与创建 DTO 相同，全部字段可选。
 */
export class UpdateDietLogDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsNumber()
  mealTypeId?: number;

  @IsOptional()
  @IsNumber()
  foodItemId?: number;

  @IsOptional()
  @IsString()
  customName?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  planId?: number;

  @IsOptional()
  @IsNumber()
  planMealItemId?: number;
}