import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

/**
 * 更新饮食计划请求 DTO。
 * 与创建 DTO 字段相同，所有字段均为可选。
 */
export class UpdateDietPlanDto {
  /** 计划名称 */
  @IsOptional()
  @IsString()
  name?: string;

  /** 计划描述 */
  @IsOptional()
  @IsString()
  description?: string;

  /** 目标类型 ID */
  @IsOptional()
  @IsNumber()
  goalTypeId?: number;

  /** 默认能量目标 */
  @IsOptional()
  @IsNumber()
  targetCalories?: number;

  /** 默认蛋白质目标 */
  @IsOptional()
  @IsNumber()
  targetProtein?: number;

  /** 默认脂肪目标 */
  @IsOptional()
  @IsNumber()
  targetFat?: number;

  /** 默认碳水目标 */
  @IsOptional()
  @IsNumber()
  targetCarbs?: number;

  /** 周期类型 ID */
  @IsOptional()
  @IsNumber()
  cycleTypeId?: number;

  /** 是否启用 */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}