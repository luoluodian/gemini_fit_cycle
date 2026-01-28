// food.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 创建食物数据传输对象
 */
export class CreateFoodDto {
  /** 食物名称 */
  @IsString({ message: '食物名称格式不正确' })
  @IsNotEmpty({ message: '食物名称不能为空' })
  @MaxLength(100, { message: '食物名称最多100个字符' })
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
  caloriesPer100g: number;

  /** 蛋白质(g/100g) */
  @IsNumber({}, { message: '蛋白质格式不正确' })
  @Min(0, { message: '蛋白质不能为负数' })
  @Max(1000, { message: '蛋白质不能超过1000g' })
  @Transform(({ value }) => Number(value))
  proteinPer100g: number;

  /** 脂肪(g/100g) */
  @IsNumber({}, { message: '脂肪格式不正确' })
  @Min(0, { message: '脂肪不能为负数' })
  @Max(1000, { message: '脂肪不能超过1000g' })
  @Transform(({ value }) => Number(value))
  fatPer100g: number;

  /** 碳水化合物(g/100g) */
  @IsNumber({}, { message: '碳水化合物格式不正确' })
  @Min(0, { message: '碳水化合物不能为负数' })
  @Max(1000, { message: '碳水化合物不能超过1000g' })
  @Transform(({ value }) => Number(value))
  carbsPer100g: number;

  /** 升糖指数(GI) */
  @IsOptional()
  @IsNumber({}, { message: 'GI格式不正确' })
  @Min(0, { message: 'GI不能为负数' })
  @Max(120, { message: 'GI不能超过120' })
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  gi?: number;

  /** 默认单位 */
  @IsOptional()
  @IsString({ message: '单位格式不正确' })
  @MaxLength(20, { message: '单位最多20个字符' })
  defaultUnit?: string;

  /** 图片地址 */
  @IsOptional()
  @IsUrl({}, { message: '图片地址格式不正确' })
  @MaxLength(255, { message: '图片地址最多255个字符' })
  image_url?: string;

  /** 备注 */
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  description?: string;
}

/**
 * 更新食物数据传输对象
 */
export class UpdateFoodDto {
  /** 食物名称 */
  @IsOptional()
  @IsString({ message: '食物名称格式不正确' })
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
  caloriesPer100g?: number;

  /** 蛋白质(g/100g) */
  @IsOptional()
  @IsNumber({}, { message: '蛋白质格式不正确' })
  @Min(0, { message: '蛋白质不能为负数' })
  @Max(1000, { message: '蛋白质不能超过1000g' })
  proteinPer100g?: number;

  /** 脂肪(g/100g) */
  @IsOptional()
  @IsNumber({}, { message: '脂肪格式不正确' })
  @Min(0, { message: '脂肪不能为负数' })
  @Max(1000, { message: '脂肪不能超过1000g' })
  fatPer100g?: number;

  /** 碳水(g/100g) */
  @IsOptional()
  @IsNumber({}, { message: '碳水化合物格式不正确' })
  @Min(0, { message: '碳水化合物不能为负数' })
  @Max(1000, { message: '碳水化合物不能超过1000g' })
  carbsPer100g?: number;

  /** 升糖指数(GI) */
  @IsOptional()
  @IsNumber({}, { message: 'GI格式不正确' })
  @Min(0, { message: 'GI不能为负数' })
  @Max(120, { message: 'GI不能超过120' })
  gi?: number;

  /** 默认单位 */
  @IsOptional()
  @IsString({ message: '单位格式不正确' })
  @MaxLength(20, { message: '单位最多20个字符' })
  defaultUnit?: string;

  /** 图片地址 */
  @IsOptional()
  @IsUrl({}, { message: '图片地址格式不正确' })
  @MaxLength(255, { message: '图片地址最多255个字符' })
  image_url?: string;

  /** 备注 */
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  description?: string;
}