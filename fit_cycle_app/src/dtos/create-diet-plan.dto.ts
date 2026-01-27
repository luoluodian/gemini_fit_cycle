import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

/**
 * 创建饮食计划请求 DTO。
 * 包含计划的基本信息和默认目标，支持碳循环等高级配置。
 */
export class CreateDietPlanDto {
  /** 计划名称 */
  @IsString()
  readonly name!: string;

  /** 计划描述，可选 */
  @IsOptional()
  @IsString()
  description?: string;

  /** 目标类型字典 ID，例如减脂、增肌 */
  @IsNumber()
  readonly goalTypeId!: number;

  /** 默认每日能量目标，单位：千卡 */
  @IsOptional()
  @IsNumber()
  targetCalories?: number;

  /** 默认每日蛋白质目标，单位：克 */
  @IsOptional()
  @IsNumber()
  targetProtein?: number;

  /** 默认每日脂肪目标，单位：克 */
  @IsOptional()
  @IsNumber()
  targetFat?: number;

  /** 默认每日碳水化合物目标，单位：克 */
  @IsOptional()
  @IsNumber()
  targetCarbs?: number;

  /** 周期类型字典 ID，可用于碳循环等（非必填） */
  @IsOptional()
  @IsNumber()
  cycleTypeId?: number;

  /** 是否立即启用该计划 */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}