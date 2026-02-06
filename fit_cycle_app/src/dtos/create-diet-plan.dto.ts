import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsObject, Max, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PlanType } from '@/database/entity/diet-plan.entity';

/**
 * 创建饮食计划请求 DTO。
 */
export class CreateDietPlanDto {
  /** 计划名称 */
  @IsString()
  @MaxLength(100)
  readonly name: string;

  /** 计划描述 */
  @IsOptional()
  @IsString()
  readonly description?: string;

  /** 计划类型 */
  @IsEnum(PlanType)
  readonly type: PlanType;

  /** 一个循环的天数 (通常为 7) */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  readonly cycleDays?: number;

  /** 循环次数 (例如 4 次表示一个月) */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly cycleCount?: number;

  /** 计划开始日期 */
  @IsOptional()
  @IsDateString()
  readonly startDate?: string;

  /** 碳循环高/中/低碳配置快照 (JSON) */
  @IsOptional()
  @IsObject()
  readonly carbCycleConfig?: any;

  /** 默认每日能量目标 (kcal) */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly targetCalories?: number;

  /** 默认每日蛋白质目标 (g) */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly targetProtein?: number;

  /** 默认每日脂肪目标 (g) */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly targetFat?: number;

  /** 默认每日碳水化合物目标 (g) */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly targetCarbs?: number;
}
