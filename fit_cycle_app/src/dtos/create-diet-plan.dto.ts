import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsObject, Max, Min, MaxLength, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PlanType } from '@/database/entity/diet-plan.entity';

/**
 * 碳循环内部阶段配置 DTO
 */
class CarbCyclePhaseDto {
  @IsNumber()
  @Min(1)
  @Max(7)
  days: number;

  @IsNumber()
  @Min(0.1)
  @Max(10)
  ratio: number;
}

/**
 * 碳循环配置 DTO
 */
export class CarbCycleConfigDto {
  @IsNumber()
  @Min(30)
  @Max(250)
  weight: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CarbCyclePhaseDto)
  high: CarbCyclePhaseDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CarbCyclePhaseDto)
  medium: CarbCyclePhaseDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CarbCyclePhaseDto)
  low: CarbCyclePhaseDto;
}

/**
 * 创建饮食计划请求 DTO。
 * 安全加固版：包含 XSS 过滤、值域边界检查与嵌套结构校验。
 */
export class CreateDietPlanDto {
  /** 计划名称 */
  @IsString()
  @IsNotEmpty({ message: '计划名称不能为空' })
  @MaxLength(100, { message: '计划名称最长 100 字符' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/<[^>]*>?/gm, '') : value))
  readonly name: string;

  /** 计划描述 */
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '计划描述最长 500 字符' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/<[^>]*>?/gm, '') : value))
  readonly description?: string;

  /** 计划类型 */
  @IsEnum(PlanType, { message: '非法的计划类型' })
  readonly type: PlanType;

  /** 一个循环的天数 (通常为 7) */
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '循环天数至少为 1' })
  @Max(31, { message: '循环天数最多为 31' })
  @Type(() => Number)
  readonly cycleDays?: number;

  /** 循环次数 (例如 4 次表示一个月) */
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '循环次数至少为 1' })
  @Max(52, { message: '循环次数最多为 52' })
  @Type(() => Number)
  readonly cycleCount?: number;

  /** 计划开始日期 */
  @IsOptional()
  @IsDateString({}, { message: '非法的开始日期格式' })
  readonly startDate?: string;

  /** 碳循环高/中/低碳配置快照 (JSON) */
  @IsOptional()
  @IsObject({ message: '非法的配置格式' })
  @ValidateNested()
  @Type(() => CarbCycleConfigDto)
  readonly carbCycleConfig?: CarbCycleConfigDto;

  /** 默认每日能量目标 (kcal) */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '热量目标不能为负数' })
  @Max(10000, { message: '热量目标超出合理范围' })
  @Type(() => Number)
  readonly targetCalories?: number;

  /** 默认每日蛋白质目标 (g) */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '蛋白质目标不能为负数' })
  @Max(1000, { message: '蛋白质目标超出合理范围' })
  @Type(() => Number)
  readonly targetProtein?: number;

  /** 默认每日脂肪目标 (g) */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '脂肪目标不能为负数' })
  @Max(1000, { message: '脂肪目标超出合理范围' })
  @Type(() => Number)
  readonly targetFat?: number;

  /** 默认每日碳水化合物目标 (g) */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '碳水化合物目标不能为负数' })
  @Max(2000, { message: '碳水化合物目标超出合理范围' })
  @Type(() => Number)
  readonly targetCarbs?: number;
}
