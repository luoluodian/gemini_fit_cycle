import { IsOptional, IsNumber, IsString } from 'class-validator';

/**
 * 更新计划餐次食材明细 DTO。
 * 与创建 DTO 字段相同，但全部字段均可选。
 */
export class UpdatePlanMealItemDto {
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
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fiber?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}