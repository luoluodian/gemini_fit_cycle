import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

/**
 * 新增食材请求 DTO。
 * 用户可以通过该接口向个人或公共食材库添加自定义食材。
 */
export class CreateFoodItemDto {
  /** 食材名称 */
  @IsString()
  readonly name!: string;

  /** 食材描述，可不填 */
  @IsOptional()
  @IsString()
  description?: string;

  /** 单位，如 g/ml/份 */
  @IsString()
  readonly unit!: string;

  /** 每单位能量，单位：千卡 */
  @IsNumber()
  readonly caloriesPerUnit!: number;

  /** 每单位蛋白质，单位：克 */
  @IsNumber()
  readonly proteinPerUnit!: number;

  /** 每单位脂肪，单位：克 */
  @IsNumber()
  readonly fatPerUnit!: number;

  /** 每单位碳水化合物，单位：克 */
  @IsNumber()
  readonly carbsPerUnit!: number;

  /** 每单位膳食纤维，单位：克 */
  @IsNumber()
  readonly fiberPerUnit!: number;

  /** 是否公开给其他用户，默认 true */
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}