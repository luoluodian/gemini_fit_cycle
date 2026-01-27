import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

/**
 * 更新食材请求 DTO。
 * 与 CreateFoodItemDto 字段相同，但所有字段均为可选。
 */
export class UpdateFoodItemDto {
  /** 食材名称 */
  @IsOptional()
  @IsString()
  name?: string;

  /** 食材描述 */
  @IsOptional()
  @IsString()
  description?: string;

  /** 单位 */
  @IsOptional()
  @IsString()
  unit?: string;

  /** 每单位能量 */
  @IsOptional()
  @IsNumber()
  caloriesPerUnit?: number;

  /** 每单位蛋白质 */
  @IsOptional()
  @IsNumber()
  proteinPerUnit?: number;

  /** 每单位脂肪 */
  @IsOptional()
  @IsNumber()
  fatPerUnit?: number;

  /** 每单位碳水化合物 */
  @IsOptional()
  @IsNumber()
  carbsPerUnit?: number;

  /** 每单位膳食纤维 */
  @IsOptional()
  @IsNumber()
  fiberPerUnit?: number;

  /** 是否公开 */
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}