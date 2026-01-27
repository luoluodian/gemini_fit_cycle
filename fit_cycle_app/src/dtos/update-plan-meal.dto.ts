import { IsOptional, IsNumber, IsString } from 'class-validator';

/**
 * 更新计划餐次请求 DTO。
 * 与创建 DTO 相同，所有字段可选。
 */
export class UpdatePlanMealDto {
  @IsOptional()
  @IsNumber()
  mealTypeId?: number;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsString()
  note?: string;
}