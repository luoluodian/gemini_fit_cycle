import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FoodCategory } from '@/database/entity/food-item.entity';
import { IsPhysicsBalanced } from '@/common/validators/physics-balance.validator';

/**
 * ================================
 * CreateFoodItemDto
 * 新增食材 DTO
 * 校验点：集成物理守恒装饰器
 * ================================
 */
export class CreateFoodItemDto {
  /** 食材名称 */
  @IsPhysicsBalanced({ message: "食材成分(P+F+C)物理总量不能超过基准重量" })
  @IsString()
  name: string;

  /** 描述（可选） */
  @IsOptional()
  @IsString()
  description?: string;

  /** 分类 */
  @IsOptional()
  @IsEnum(FoodCategory)
  category?: FoodCategory;

  /** 图片或Emoji */
  @IsOptional()
  @IsString()
  imageUrl?: string;

  /** 单位（g / ml / 份 ...） */
  @IsString()
  unit: string;

  /** 营养成分基准数量 (如 100) */
  @IsNumber()
  @IsOptional()
  baseCount?: number;

  /** 热量 kcal/100g or per unit */
  @IsNumber()
  calories: number;

  /** 蛋白质 g */
  @IsNumber()
  protein: number;

  /** 脂肪 g */
  @IsNumber()
  fat: number;

  /** 碳水 g */
  @IsNumber()
  carbs: number;

  /** 是否公开 */
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  /** 标签 */
  @IsOptional()
  tags?: string[];
}

/**
 * ================================
 * UpdateFoodItemDto
 * 更新食材 DTO（全部可选）
 * ================================
 */
export class UpdateFoodItemDto {
  /** 食材名称 */
  @IsPhysicsBalanced()
  @IsOptional()
  @IsString()
  name?: string;

  /** 描述 */
  @IsOptional()
  @IsString()
  description?: string;

  /** 分类 */
  @IsOptional()
  @IsEnum(FoodCategory)
  category?: FoodCategory;

  /** 图片或Emoji */
  @IsOptional()
  @IsString()
  imageUrl?: string;

  /** 单位 */
  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  baseCount?: number;

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
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  tags?: string[];
}

/**
 * ================================
 * Query DTO（用于分页查询参数）
 * ================================
 */
export class QueryFoodItemDto {
  /** 搜索关键字 */
  @IsOptional()
  @IsString()
  q?: string;

  /** 分类筛选 */
  @IsOptional()
  @IsEnum(FoodCategory)
  category?: FoodCategory;

  /** 页码 */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  /** 每页数量 */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;
}