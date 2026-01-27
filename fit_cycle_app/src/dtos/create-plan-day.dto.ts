import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 新增计划日请求 DTO。
 * 在一个饮食计划中添加一天的设置，可定义序号、日期和营养目标。
 */
export class CreatePlanDayDto {
  /** 在计划周期中的序号，从 1 开始 */
  @IsNumber()
  readonly dayIndex!: number;

  /** 具体日期，可为空表示模板周期 */
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD

  /** 碳日类型字典 ID，如高碳日、低碳日 */
  @IsOptional()
  @IsNumber()
  carbTypeId?: number;

  /** 当日能量目标，千卡 */
  @IsOptional()
  @IsNumber()
  targetCalories?: number;

  /** 当日蛋白质目标，克 */
  @IsOptional()
  @IsNumber()
  targetProtein?: number;

  /** 当日脂肪目标，克 */
  @IsOptional()
  @IsNumber()
  targetFat?: number;

  /** 当日碳水目标，克 */
  @IsOptional()
  @IsNumber()
  targetCarbs?: number;
}