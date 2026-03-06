import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsObject, Max, Min, MaxLength, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PlanType, PlanStatus } from '@/database/entity/diet-plan.entity';
import { CarbCycleConfigDto } from './create-diet-plan.dto';

/**
 * 更新饮食计划请求 DTO。
 * 安全加固版：同步创建时的校验标准，防止绕过。
 */
export class UpdateDietPlanDto {
  /** 计划名称 */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '计划名称最长 100 字符' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/<[^>]*>?/gm, '') : value))
  readonly name?: string;

  /** 计划描述 */
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '计划描述最长 500 字符' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/<[^>]*>?/gm, '') : value))
  readonly description?: string;

  /** 计划类型 */
  @IsOptional()
  @IsEnum(PlanType, { message: '非法的计划类型' })
  readonly type?: PlanType;

  /** 计划状态 */
  @IsOptional()
  @IsEnum(PlanStatus, { message: '非法的状态' })
  readonly status?: PlanStatus;

  /** 一个循环的天数 */
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '循环天数至少为 1' })
  @Max(31, { message: '循环天数最多为 31' })
  @Type(() => Number)
  readonly cycleDays?: number;

  /** 循环次数 */
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

  /** 碳循环配置 */
  @IsOptional()
  @IsObject({ message: '非法的配置格式' })
  @ValidateNested()
  @Type(() => CarbCycleConfigDto)
  readonly carbCycleConfig?: CarbCycleConfigDto;

  /** 能量目标 */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '热量目标不能为负数' })
  @Max(10000, { message: '热量目标超出合理范围' })
  @Type(() => Number)
  readonly targetCalories?: number;

  /** 蛋白质目标 */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '蛋白质目标不能为负数' })
  @Max(1000, { message: '蛋白质目标超出合理范围' })
  @Type(() => Number)
  readonly targetProtein?: number;

  /** 脂肪目标 */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '脂肪目标不能为负数' })
  @Max(1000, { message: '脂肪目标超出合理范围' })
  @Type(() => Number)
  readonly targetFat?: number;

  /** 碳水目标 */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '碳水化合物目标不能为负数' })
  @Max(2000, { message: '碳水化合物目标超出合理范围' })
  @Type(() => Number)
  readonly targetCarbs?: number;
}
