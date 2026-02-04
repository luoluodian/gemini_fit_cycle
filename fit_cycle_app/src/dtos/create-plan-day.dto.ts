import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 新增计划日请求 DTO。
 */
export class CreatePlanDayDto {
  /** 在计划周期中的天数序号（1 ~ cycleDays） */
  @IsNumber()
  readonly dayNumber: number;

  /** 碳循环日类型标识 (high/medium/low) */
  @IsOptional()
  @IsString()
  readonly carbType?: string;

  /** 当日能量目标，千卡 */
  @IsOptional()
  @IsNumber()
  readonly targetCalories?: number;

  /** 当日蛋白质目标，克 */
  @IsOptional()
  @IsNumber()
  readonly targetProtein?: number;

  /** 当日脂肪目标，克 */
  @IsOptional()
  @IsNumber()
  readonly targetFat?: number;

  /** 当日碳水目标，克 */
  @IsOptional()
  @IsNumber()
  readonly targetCarbs?: number;
}
