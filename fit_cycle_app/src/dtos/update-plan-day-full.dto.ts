import { IsArray, IsOptional, IsNumber, IsString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateMealDto } from './save-plan-templates.dto';

/**
 * 单日全量更新请求 DTO
 */
export class UpdatePlanDayFullDto {
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

  @IsOptional()
  @IsBoolean()
  isConfigured?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateMealDto)
  meals: TemplateMealDto[];
}
