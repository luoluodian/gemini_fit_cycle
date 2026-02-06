import { IsArray, IsNumber, IsOptional, IsString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PlanDayInitItemDto {
  @IsNumber()
  dayNumber: number;

  @IsOptional()
  @IsString()
  carbType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetCalories?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetProtein?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetFat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetCarbs?: number;
}

export class InitPlanDaysDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanDayInitItemDto)
  days: PlanDayInitItemDto[];

  /** 是否强制覆盖已配置的天 */
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
