import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

/**
 * ================================
 * CreateFoodItemDto
 * 新增食材 DTO
 * ================================
 */
export class CreateFoodItemDto {
  /** 食材名称 */
  @IsString()
  name: string;

  /** 描述（可选） */
  @IsOptional()
  @IsString()
  description?: string;

  /** 单位（g / ml / 份 ...） */
  @IsString()
  unit: string;

  /** 每单位能量 kcal */
  @IsNumber()
  caloriesPerUnit: number;

  /** 每单位蛋白质 g */
  @IsNumber()
  proteinPerUnit: number;

  /** 每单位脂肪 g */
  @IsNumber()
  fatPerUnit: number;

  /** 每单位碳水 g */
  @IsNumber()
  carbsPerUnit: number;

  /** 每单位纤维 g */
  @IsNumber()
  fiberPerUnit: number;

  /** 是否公开 */
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  /** GI（0~100） */
  @IsOptional()
  @Min(0)
  @Max(100)
  glycemicIndex?: number;

  /** 每单位 GL */
  @IsOptional()
  @IsNumber()
  glycemicLoadPerUnit?: number;
}

/**
 * ================================
 * UpdateFoodItemDto
 * 更新食材 DTO（全部可选）
 * ================================
 */
export class UpdateFoodItemDto {
  /** 食材名称 */
  @IsOptional()
  @IsString()
  name?: string;

  /** 描述 */
  @IsOptional()
  @IsString()
  description?: string;

  /** 单位 */
  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  caloriesPerUnit?: number;

  @IsOptional()
  @IsNumber()
  proteinPerUnit?: number;

  @IsOptional()
  @IsNumber()
  fatPerUnit?: number;

  @IsOptional()
  @IsNumber()
  carbsPerUnit?: number;

  @IsOptional()
  @IsNumber()
  fiberPerUnit?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @Min(0)
  @Max(100)
  glycemicIndex?: number;

  @IsOptional()
  @IsNumber()
  glycemicLoadPerUnit?: number;
}

/**
 * ================================
 * Query DTO（用于分页查询参数）
 * /food-items?page=1&pageSize=20&q=鸡
 * ================================
 */
export class QueryFoodItemDto {
  /** 搜索关键字 */
  @IsOptional()
  @IsString()
  q?: string;

  /** 页码 */
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  /** 每页数量 */
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageSize?: number;
}
