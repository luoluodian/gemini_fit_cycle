import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 新增计划餐次请求 DTO。
 * 每个计划日可包含多个餐次，定义餐次类型和时间。
 */
export class CreatePlanMealDto {
  /** 餐次类型 ID，例如早餐、午餐、加餐 */
  @IsNumber()
  readonly mealTypeId!: number;

  /** 预定时间，格式 HH:mm:ss，例如 07:30:00 */
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  /** 备注 */
  @IsOptional()
  @IsString()
  note?: string;
}