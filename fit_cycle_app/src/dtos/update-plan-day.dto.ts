import { IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * 更新计划日请求 DTO。
 * 与 CreatePlanDayDto 相同，但所有字段可选。
 */
export class UpdatePlanDayDto {
  /** 周期序号 */
  @IsOptional()
  @IsNumber()
  dayIndex?: number;

  /** 日期 */
  @IsOptional()
  @IsString()
  date?: string;

  /** 碳日类型 */
  @IsOptional()
  @IsNumber()
  carbTypeId?: number;

  /** 能量目标 */
  @IsOptional()
  @IsNumber()
  targetCalories?: number;

  /** 蛋白质目标 */
  @IsOptional()
  @IsNumber()
  targetProtein?: number;

  /** 脂肪目标 */
  @IsOptional()
  @IsNumber()
  targetFat?: number;

  /** 碳水目标 */
  @IsOptional()
  @IsNumber()
  targetCarbs?: number;
}