import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

/**
 * 新增字典项 DTO
 */
export class CreateDictDto {
  /** 字典分类键，例如：food_category、gi_level */
  @IsString({ message: 'dict_key 格式不正确' })
  @IsNotEmpty({ message: 'dict_key 不能为空' })
  @MaxLength(100, { message: 'dict_key 最多 100 个字符' })
  dict_key: string;

  /** 字典项值（整数） */
  @IsInt({ message: 'dict_value 必须为整数' })
  @Min(0, { message: 'dict_value 不能为负数' })
  dict_value: number;

  /** 字典项中文名，例如：主食、水果、低GI */
  @IsString({ message: 'value_text 格式不正确' })
  @IsNotEmpty({ message: 'value_text 不能为空' })
  @MaxLength(100, { message: 'value_text 最多 100 个字符' })
  value_text: string;

  /** 排序号（可选） */
  @IsOptional()
  @IsInt({ message: 'sort 必须为整数' })
  sort?: number;

  /** 备注说明（可选） */
  @IsOptional()
  @IsString({ message: 'remark 格式不正确' })
  @MaxLength(255, { message: 'remark 最多 255 个字符' })
  remark?: string;
}

/**
 * 删除字典项 DTO
 */
export class DeleteDictDto {
  /** 主键 ID */
  @IsInt({ message: 'ID 必须为整数' })
  @Min(1, { message: 'ID 必须大于 0' })
  id: number;
}

/**
 * 查询字典项 DTO
 */
export class QueryDictDto {
  /** 字典分类键（可选） */
  @IsOptional()
  @IsString({ message: 'dict_key 格式不正确' })
  @MaxLength(100, { message: 'dict_key 最多 100 个字符' })
  dict_key?: string;

  /** 字典项值（可选） */
  @IsOptional()
  @IsString({ message: 'dict_value 格式不正确' })
  @MaxLength(100, { message: 'dict_value 最多 100 个字符' })
  dict_value?: string;

  /** 字典项中文名（可选） */
  @IsOptional()
  @IsString({ message: 'value_text 格式不正确' })
  @MaxLength(100, { message: 'value_text 最多 100 个字符' })
  value_text?: string;
}

/**
 * 返回给前端的数据字典精简信息
 */
export class DictResponseDto {
  /** 主键 ID */
  id: number;

  /** 字典分类 */
  category: string;

  /** 枚举代码 */
  value: number;

  /** 枚举显示名称 */
  text: string;

  /** 描述（可选） */
  description?: string;
}
