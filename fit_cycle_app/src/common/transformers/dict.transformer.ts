import { DataDictionary } from '@/database/entity/data-dictionary.entity';
import { DictResponseDto } from '@/dtos/dict.dto';

export class DictTransformer {
  /** 单个转换 */
  static toResponse(item: DataDictionary): DictResponseDto {
    return {
      id: item.id,
      category: item.category,
      value: item.value,
      text: item.text,
      description: item.description ?? undefined,
    };
  }

  /** 数组转换 */
  static toResponseList(items: DataDictionary[]): DictResponseDto[] {
    return items.map((i) => this.toResponse(i));
  }
}
