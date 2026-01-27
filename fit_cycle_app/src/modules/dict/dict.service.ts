import { Injectable, HttpException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataDictionary } from '@/database/entity/data-dictionary.entity';
import { CreateDictDto } from '@/dtos/dict.dto';
import { RedisService } from '@/redis/redis.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DictTransformer } from '@/common/transformers/dict.transformer';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DataDictionary)
    private readonly dictRepo: Repository<DataDictionary>,
    private readonly redis: RedisService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  /** 新增字典项 */
  async create(dto: CreateDictDto) {
    this.logger.log({ level: 'info', message: '创建字典项开始', category: dto.dict_key, value: dto.dict_value });
    // category = dict_key, code = dict_value
    const item = this.dictRepo.create({
      category: dto.dict_key,
      value: dto.dict_value,
      text: dto.value_text,
      sortOrder: dto.sort ?? 0,
      description: dto.remark,
    });
    try {
      await this.dictRepo.save(item);
    } catch (e) {
      // 违反唯一约束（category,value）
      if ((e as any).code === 'ER_DUP_ENTRY') {
        throw new ConflictException('字典项重复');
      }
      throw e;
    }
    // 清理缓存
    await this.redis.set(`dict:${item.category}`, '', 1); // 1秒占位，避免缓存穿透
    this.logger.log({ level: 'info', message: '创建字典项完成', id: item.id });
    return DictTransformer.toResponse(item);
  }

  /** 按 category 查询全部 */
  async getByCategory(category: string) {
    const cacheKey = `dict:${category}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        this.logger.log({ level: 'info', message: '字典项命中缓存', category });
        return parsed;
      } catch {}
    }

    const items = await this.dictRepo.find({
      where: { category },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    const result = DictTransformer.toResponseList(items);
    await this.redis.set(cacheKey, JSON.stringify(result), 3600);
    this.logger.log({ level: 'info', message: '字典项缓存写入', category, count: result.length });
    return result;
  }

  /** 删除字典项 */
  async remove(id: number) {
    const exist = await this.dictRepo.findOne({ where: { id } });
    if (!exist) {
      throw new HttpException('字典项不存在', 404);
    }
    await this.dictRepo.delete(id);
    // 清理对应分类缓存
    if (exist.category) {
      await this.redis.set(`dict:${exist.category}`, '', 1);
    }
    this.logger.log({ level: 'info', message: '删除字典项完成', id });
    return { message: '删除成功' };
  }
}
