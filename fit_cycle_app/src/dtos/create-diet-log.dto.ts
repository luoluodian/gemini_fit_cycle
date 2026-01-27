import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * 新增饮食记录请求 DTO。
 * 用于记录用户某一餐的摄入。
 */
export class CreateDietLogDto {
  /** 记录日期，格式 YYYY-MM-DD */
  @IsString()
  readonly date!: string;

  /** 餐次类型字典 ID */
  @IsNumber()
  readonly mealTypeId!: number;

  /** 食材 ID，可选 */
  @IsOptional()
  @IsNumber()
  foodItemId?: number;

  /** 自定义名称，可选 */
  @IsOptional()
  @IsString()
  customName?: string;

  /** 数量 */
  @IsNumber()
  readonly quantity!: number;

  /** 单位 */
  @IsString()
  readonly unit!: string;

  /** 关联计划 ID，可选 */
  @IsOptional()
  @IsNumber()
  planId?: number;

  /** 关联计划明细 ID，可选 */
  @IsOptional()
  @IsNumber()
  planMealItemId?: number;
}