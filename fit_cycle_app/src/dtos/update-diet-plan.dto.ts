import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsObject, Max, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PlanType, PlanStatus } from '@/database/entity/diet-plan.entity';

/**
 * 更新饮食计划请求 DTO。
 */
export class UpdateDietPlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsEnum(PlanType)
  readonly type?: PlanType;

  @IsOptional()
  @IsEnum(PlanStatus)
  readonly status?: PlanStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  readonly cycleDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly cycleCount?: number;

  @IsOptional()
  @IsDateString()
  readonly startDate?: string;

  @IsOptional()
  @IsObject()
  readonly carbCycleConfig?: any;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly targetCalories?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly targetProtein?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly targetFat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly targetCarbs?: number;
}
