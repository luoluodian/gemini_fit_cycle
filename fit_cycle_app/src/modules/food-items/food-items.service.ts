// src/modules/food-items/food-items.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';

import { Repository, Like, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { FoodItem, FoodType, FoodCategory } from '@/database/entity/food-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateFoodItemDto, UpdateFoodItemDto, QueryFoodItemDto } from '@/dtos/food-item.dto';

@Injectable()
export class FoodItemsService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodRepo: Repository<FoodItem>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * ========================================
   * 🔍 分页搜索
   * ========================================
   */
  async list(dto: QueryFoodItemDto) {
    const { q, category, page = 1, pageSize = 20 } = dto;
    this.logger.log({
      level: 'info',
      message: '食材分页查询开始',
      q,
      category,
      page,
      pageSize,
    });

    const queryBuilder = this.foodRepo.createQueryBuilder('food');

    if (q) {
      queryBuilder.andWhere('(food.name LIKE :q OR food.description LIKE :q)', {
        q: `%${q}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere('food.category = :category', { category });
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('food.id', 'DESC')
      .getManyAndCount();

    this.logger.log({ level: 'info', message: '食材分页查询完成', total });
    return {
      total,
      page,
      pageSize,
      items,
    };
  }

  /**
   * ➕ 创建食材
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

    const item = this.foodRepo.create({
      ...dto,
      type: FoodType.CUSTOM,
      userId,
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
      if (exists && Number(exists.id) !== Number(item.id)) {
        throw new ConflictException('食材名称已存在，请更换一个名称');
      }
    }
    if (item.userId && Number(item.userId) !== Number(userId)) {
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

    if (item.userId && Number(item.userId) !== Number(userId)) {
      throw new ForbiddenException('无权删除此食材');
    }

    await this.foodRepo.remove(item);
    this.logger.log({ level: 'info', message: '删除食材完成', id });
    return { success: true };
  }

  async checkNameExists(name: string) {
    const exists = await this.foodRepo.exists({
      where: { name },
    });

    return { exists };
  }

  /**
   * 🔄 同步系统食材
   * 源数据来自 html/food.js
   */
  async syncSystemFoods(foodData: any[]) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. 删除现有系统食材
      await manager.delete(FoodItem, { type: FoodType.SYSTEM });

      // 2. 构造并插入新食材
      const items = foodData.map(f => {
        return manager.create(FoodItem, {
          name: f.name,
          type: FoodType.SYSTEM,
          category: f.category as FoodCategory,
          description: f.description,
          imageUrl: f.emoji,
          isPublic: true,
          calories: f.calories,
          protein: f.protein,
          fat: f.fat,
          carbs: f.carbs,
          unit: f.unit,
        });
      });

      const result = await manager.save(FoodItem, items);
      this.logger.log({ level: 'info', message: '系统食材同步完成', count: result.length });
      return { count: result.length };
    });
  }
}