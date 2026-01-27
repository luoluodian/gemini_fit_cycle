// food.type.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  IsInt,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 食物实体基础接口
 */
export interface Food {
  /** 主键 ID */
  id: number;

  /** 食物名称 */
  name: string;

  /** 食物类别 */
  category?: string;

  /** 热量(kcal/100g) */
  calorie: number;

  /** 蛋白质(g/100g) */
  protein: number;

  /** 脂肪(g/100g) */
  fat: number;

  /** 碳水(g/100g) */
  carbohydrate: number;

  /** 单位（默认100g） */
  unit: string;

  /** 图片地址 */
  image_url?: string;

  /** 备注 */
  description?: string;

  /** 来源：1官方 2用户自建 */
  source_type: number;

  /** 升糖指数(Glycemic Index) */
  gi: number;

  /** 创建者ID */
  created_by?: number;

  /** 更新时间 */
  updated_at: Date;
}

/**
 * 创建食物数据传输对象
 */
export class CreateFoodDto {
  /** 食物名称 */
  @IsString({ message: '食物名称格式不正确' })
  @IsNotEmpty({ message: '食物名称不能为空' })
  @MaxLength(20, { message: '食物名称最多20个字符' })
  name: string;

  /** 食物类别 */
  @IsOptional()
  @IsString({ message: '食物类别格式不正确' })
  @MaxLength(50, { message: '食物类别最多50个字符' })
  category?: string;

  /** 热量(kcal/100g) */
  @IsNumber({}, { message: '热量格式不正确' })
  @Min(0, { message: '热量不能为负数' })
  @Max(10000, { message: '热量不能超过10000' })
  @Transform(({ value }) => Number(value))
  calorie: number;

  /** 蛋白质(g/100g) */
  @IsNumber({}, { message: '蛋白质格式不正确' })
  @Min(0, { message: '蛋白质不能为负数' })
  @Max(1000, { message: '蛋白质不能超过1000g' })
  @Transform(({ value }) => Number(value))
  protein: number;

  /** 脂肪(g/100g) */
  @IsNumber({}, { message: '脂肪格式不正确' })
  @Min(0, { message: '脂肪不能为负数' })
  @Max(1000, { message: '脂肪不能超过1000g' })
  @Transform(({ value }) => Number(value))
  fat: number;

  /** 碳水化合物(g/100g) */
  @IsNumber({}, { message: '碳水化合物格式不正确' })
  @Min(0, { message: '碳水化合物不能为负数' })
  @Max(1000, { message: '碳水化合物不能超过1000g' })
  @Transform(({ value }) => Number(value))
  carbohydrate: number;

  @IsOptional()
  @IsNumber({}, { message: 'GI格式不正确' })
  @Min(0, { message: 'GI不能为负数' })
  @Max(120, { message: 'GI不能超过120' })
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  gi?: number;
  /** 单位 */
  @IsOptional()
  @IsString({ message: '单位格式不正确' })
  @MaxLength(20, { message: '单位最多20个字符' })
  unit?: string;

  /** 图片地址 */
  @IsOptional()
  @IsUrl({}, { message: '图片地址格式不正确' })
  @MaxLength(255, { message: '图片地址最多255个字符' })
  image_url?: string;

  /** 备注 */
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  description?: string;

  /** 来源：1官方 2用户自建 */
  @IsOptional()
  @IsInt({ message: '来源类型格式不正确' })
  @Min(1, { message: '来源类型取值范围：1-2' })
  @Max(2, { message: '来源类型取值范围：1-2' })
  source_type?: number;

  /** 创建者ID */
  @IsOptional()
  @IsInt({ message: '创建者ID格式不正确' })
  @Min(1, { message: '创建者ID必须大于0' })
  created_by?: number;
}

/**
 * 更新食物数据传输对象
 */
export class UpdateFoodDto {
  /** id */
  @IsOptional()
  @IsNumber({}, { message: 'id格式不正确' })
  @IsNotEmpty({ message: 'ID不能为空' })
  id?: string;
  /** 食物名称 */
  @IsOptional()
  @IsString({ message: '食物名称格式不正确' })
  @IsNotEmpty({ message: '食物名称不能为空' })
  @MaxLength(100, { message: '食物名称最多100个字符' })
  name?: string;

  /** 食物类别 */
  @IsOptional()
  @IsString({ message: '食物类别格式不正确' })
  @MaxLength(50, { message: '食物类别最多50个字符' })
  category?: string;

  /** 热量(kcal/100g) */
  @IsOptional()
  @IsNumber({}, { message: '热量格式不正确' })
  @Min(0, { message: '热量不能为负数' })
  @Max(10000, { message: '热量不能超过10000' })
  calorie?: number;

  /** 蛋白质(g/100g) */
  @IsOptional()
  @IsNumber({}, { message: '蛋白质格式不正确' })
  @Min(0, { message: '蛋白质不能为负数' })
  @Max(1000, { message: '蛋白质不能超过1000g' })
  protein?: number;

  /** 脂肪(g/100g) */
  @IsOptional()
  @IsNumber({}, { message: '脂肪格式不正确' })
  @Min(0, { message: '脂肪不能为负数' })
  @Max(1000, { message: '脂肪不能超过1000g' })
  fat?: number;

  /** 碳水(g/100g) */
  @IsOptional()
  @IsNumber({}, { message: '碳水化合物格式不正确' })
  @Min(0, { message: '碳水化合物不能为负数' })
  @Max(1000, { message: '碳水化合物不能超过1000g' })
  carbohydrate?: number;

  /** 单位 */
  @IsOptional()
  @IsString({ message: '单位格式不正确' })
  @MaxLength(20, { message: '单位最多20个字符' })
  unit?: string;

  /** 图片地址 */
  @IsOptional()
  @IsUrl({}, { message: '图片地址格式不正确' })
  @MaxLength(255, { message: '图片地址最多255个字符' })
  image_url?: string;

  /** 备注 */
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  description?: string;

  /** 来源：1官方 2用户自建 */
  @IsOptional()
  @IsInt({ message: '来源类型格式不正确' })
  @Min(1, { message: '来源类型取值范围：1-2' })
  @Max(2, { message: '来源类型取值范围：1-2' })
  source_type?: number;
}
/**
 * 食物查询参数接口
 */
export interface FoodQueryParams {
  /** 食物名称（模糊查询） */
  name?: string;

  /** 食物类别（精确查询） */
  category?: string;

  /** 来源类型 */
  source_type?: number;

  /** 创建者ID */
  created_by?: number;

  /** 页码 */
  page?: number;

  /** 每页数量 */
  limit?: number;
}

/**
 * 食物列表响应接口
 */
export interface FoodListResponse {
  /** 食物数据列表 */
  data: Food[];

  /** 总记录数 */
  total: number;

  /** 当前页码 */
  page: number;

  /** 每页数量 */
  limit: number;

  /** 总页数 */
  totalPages: number;
}

/**
 * 食物来源类型常量
 */
export const FoodSourceType = {
  /** 官方食物 */
  OFFICIAL: 1,

  /** 用户自建食物 */
  USER_CREATED: 2,
} as const;

/** 食物来源类型 */
export type FoodSourceType =
  (typeof FoodSourceType)[keyof typeof FoodSourceType];

/**
 * 营养成分汇总接口
 */
export interface NutritionSummary {
  /** 总热量 */
  totalCalorie: number;

  /** 总蛋白质 */
  totalProtein: number;

  /** 总脂肪 */
  totalFat: number;

  /** 总碳水化合物 */
  totalCarbohydrate: number;
}

/**
 * 食物简要信息接口（用于列表展示）
 */
export interface FoodSimple {
  /** 主键 ID */
  id: number;

  /** 食物名称 */
  name: string;

  /** 食物类别 */
  category?: string;

  /** 热量(kcal/100g) */
  calorie: number;

  /** 单位 */
  unit: string;

  /** 图片地址 */
  image_url?: string;
}

/**
 * 食物营养成分接口（用于营养分析）
 */
export interface FoodNutrition {
  /** 食物ID */
  id: number;

  /** 食物名称 */
  name: string;

  /** 热量 */
  calorie: number;

  /** 蛋白质 */
  protein: number;

  /** 脂肪 */
  fat: number;

  /** 碳水化合物 */
  carbohydrate: number;

  /** 单位 */
  unit: string;
}
