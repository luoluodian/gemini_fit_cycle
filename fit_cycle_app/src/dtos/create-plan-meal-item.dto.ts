import { IsOptional, IsNumber, IsString } from 'class-validator';

/**
 * 新增计划餐次食材明细 DTO。
 * 可引用系统食材或自定义名称，并可预填营养信息以覆盖计算值。
 */
export class CreatePlanMealItemDto {
  /** 食材 ID，可为空表示自定义名称 */
  @IsOptional()
  @IsNumber()
  foodItemId?: number;

  /** 自定义食材名称 */
  @IsOptional()
  @IsString()
  customName?: string;

  /** 数量 */
  @IsNumber()
  readonly quantity!: number;

  /** 单位 */
  @IsString()
  readonly unit!: string;

  /** 总能量，可选覆盖系统计算值 */
  @IsOptional()
  @IsNumber()
  calories?: number;

  /** 总蛋白质 */
  @IsOptional()
  @IsNumber()
  protein?: number;

  /** 总脂肪 */
  @IsOptional()
  @IsNumber()
  fat?: number;

  /** 总碳水 */
  @IsOptional()
  @IsNumber()
  carbs?: number;

  /** 总膳食纤维 */
  @IsOptional()
  @IsNumber()
  fiber?: number;

  /** 排序值 */
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}