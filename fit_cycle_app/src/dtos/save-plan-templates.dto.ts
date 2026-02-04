import { IsArray, ValidateNested, IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class TemplateMealItemDto {
  @IsOptional()
  @IsNumber()
  foodItemId?: number;

  @IsOptional()
  @IsString()
  customName?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fiber?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class TemplateMealDto {
  @IsNumber()
  mealTypeId: number;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateMealItemDto)
  items: TemplateMealItemDto[];
}

export class PlanDayTemplateDto {
  @IsNumber()
  dayNumber: number;

  @IsOptional()
  @IsString()
  carbType?: string;

  @IsOptional()
  @IsNumber()
  targetCalories?: number;

  @IsOptional()
  @IsNumber()
  targetProtein?: number;

  @IsOptional()
  @IsNumber()
  targetFat?: number;

  @IsOptional()
  @IsNumber()
  targetCarbs?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateMealDto)
  meals: TemplateMealDto[];
}

export class SavePlanTemplatesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanDayTemplateDto)
  templates: PlanDayTemplateDto[];
}
