// src/modules/food-items/food-items.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';

import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { FoodItem } from '@/database/entity/food-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateFoodItemDto, UpdateFoodItemDto } from '@/dtos/food-item.dto';

@Injectable()
export class FoodItemsService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodRepo: Repository<FoodItem>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  /**
   * ========================================
   * 🔍 分页搜索
   * ========================================
   */
  async list(q: string, page = 1, pageSize = 20) {
    this.logger.log({
      level: 'info',
      message: '食材分页查询开始',
      q,
      page,
      pageSize,
    });
    const where = q
      ? [{ name: Like(`%${q}%`) }, { description: Like(`%${q}%`) }]
      : {};

    const [items, total] = await this.foodRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });

    this.logger.log({ level: 'info', message: '食材分页查询完成', total });
    return {
      total,
      page,
      pageSize,
      items,
    };
  }

  /**
   * ➕ 创建食材（新增：名称不能重复）
   */
  async create(userId: number, dto: CreateFoodItemDto) {
    this.logger.log({
      level: 'info',
      message: '创建食材开始',
      userId,
      name: dto.name,
    });
    if (!dto.name?.trim()) {
      throw new BadRequestException('食材名称不能为空');
    }
    const exists = await this.foodRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException('食材名称已存在，请更换一个名称');
    }

    // ② 创建数据
    const item = this.foodRepo.create({
      ...dto,
      createdByUser: { id: userId },
    });

    await this.foodRepo.save(item);
    this.logger.log({ level: 'info', message: '创建食材完成', id: item.id });
    return item;
  }
  /**
   * ========================================
   * 🔎 食材详情
   * ========================================
   */
  async detail(id: number) {
    const item = await this.foodRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('食材不存在');

    return item;
  }

  /**
   * ========================================
   * ✏️ 更新食材（仅限创建者）
   * ========================================
   */
  async update(id: number, userId: number, dto: UpdateFoodItemDto) {
    this.logger.log({
      level: 'info',
      message: '更新食材开始',
      id,
      userId,
      fields: Object.keys(dto || {}),
    });
    const item = await this.foodRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('食材不存在');

    if (dto.name) {
      const exists = await this.foodRepo.findOne({ where: { name: dto.name } });
      if (exists && exists.id !== item.id) {
        throw new ConflictException('食材名称已存在，请更换一个名称');
      }
    }
    if (item.createdByUser?.id !== userId) {
      throw new ForbiddenException('无权修改此食材');
    }

    Object.assign(item, dto);
    await this.foodRepo.save(item);
    this.logger.log({ level: 'info', message: '更新食材完成', id });
    return item;
  }

  /**
   * ========================================
   * ❌ 删除食材（仅限创建者）
   * ========================================
   */
  async delete(id: number, userId: number) {
    this.logger.log({ level: 'info', message: '删除食材开始', id, userId });
    const item = await this.foodRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('食材不存在');

    if (item.createdByUser?.id !== userId) {
      throw new ForbiddenException('无权删除此食材');
    }

    await this.foodRepo.remove(item);
    this.logger.log({ level: 'info', message: '删除食材完成', id });
    return { success: true };
  }

  async checkNameExists(name: string) {
    // 只查 name 是否已存在（大小写不敏感）
    const exists = await this.foodRepo.exists({
      where: { name },
    });

    return { exists };
  }
}
