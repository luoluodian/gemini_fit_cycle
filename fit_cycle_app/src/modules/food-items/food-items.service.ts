// src/modules/food-items/food-items.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
} from "@nestjs/common";

import { Repository, Like, DataSource } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import {
  FoodItem,
  FoodType,
  FoodCategory,
} from "@/database/entity/food-item.entity";
import { UserFavoriteFood } from "@/database/entity/user-favorite-food.entity";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import {
  CreateFoodItemDto,
  UpdateFoodItemDto,
  QueryFoodItemDto,
} from "@/dtos/food-item.dto";

@Injectable()
export class FoodItemsService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodRepo: Repository<FoodItem>,
    @InjectRepository(UserFavoriteFood)
    private readonly favoriteRepo: Repository<UserFavoriteFood>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * ========================================
   * 🔍 分页搜索
   * ========================================
   */
  async list(dto: QueryFoodItemDto, userId?: number) {
    const { q, category, page = 1, pageSize = 20 } = dto;
    this.logger.log({
      level: "info",
      message: "食材分页查询开始",
      q,
      category,
      page,
      pageSize,
      userId,
    });

    const queryBuilder = this.foodRepo.createQueryBuilder("food");

    if (q) {
      queryBuilder.andWhere("(food.name LIKE :q OR food.description LIKE :q)", {
        q: `%${q}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere("food.category = :category", { category });
    }

    // REMOVED: Redundant join causing 'Duplicate column name' error
    // if (userId) { ... }

    const [items, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy("food.id", "DESC")
      .getManyAndCount();

    // 转换结果，增加 isFavorite 布尔值
    let favoriteIds: Set<number> = new Set();
    if (userId) {
      const favorites = await this.favoriteRepo.find({
        where: { userId },
        select: ["foodId"],
      });
      favoriteIds = new Set(favorites.map((f) => Number(f.foodId)));
    }

    const itemsWithFav = items.map((item) => ({
      ...item,
      isFavorite: favoriteIds.has(Number(item.id)),
    }));

    this.logger.log({ level: "info", message: "食材分页查询完成", total });
    return {
      total,
      page,
      pageSize,
      items: itemsWithFav,
    };
  }

  /**
   * ➕ 创建食材
   */
  async create(userId: number, dto: CreateFoodItemDto) {
    this.logger.log({
      level: "info",
      message: "创建食材开始",
      userId,
      name: dto.name,
    });
    if (!dto.name?.trim()) {
      throw new BadRequestException("食材名称不能为空");
    }
    const exists = await this.foodRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException("食材名称已存在，请更换一个名称");
    }

    const item = this.foodRepo.create({
      ...dto,
      type: FoodType.CUSTOM,
      userId,
    });

    await this.foodRepo.save(item);
    this.logger.log({ level: "info", message: "创建食材完成", id: item.id });
    return item;
  }

  /**
   * ========================================
   * 🔎 食材详情
   * ========================================
   */
  async detail(id: number, userId?: number) {
    const item = await this.foodRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("食材不存在");

    let isFavorite = false;
    if (userId) {
      const fav = await this.favoriteRepo.findOne({
        where: { userId, foodId: id },
      });
      isFavorite = !!fav;
    }

    return {
      ...item,
      isFavorite,
    };
  }

  /**
   * ========================================
   * ✏️ 更新食材（仅限创建者）
   * ========================================
   */
  async update(id: number, userId: number, dto: UpdateFoodItemDto) {
    this.logger.log({
      level: "info",
      message: "更新食材开始",
      id,
      userId,
      fields: Object.keys(dto || {}),
    });
    const item = await this.foodRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("食材不存在");

    if (dto.name) {
      const exists = await this.foodRepo.findOne({ where: { name: dto.name } });
      if (exists && Number(exists.id) !== Number(item.id)) {
        throw new ConflictException("食材名称已存在，请更换一个名称");
      }
    }
    if (item.userId && Number(item.userId) !== Number(userId)) {
      throw new ForbiddenException("无权修改此食材");
    }

    Object.assign(item, dto);
    await this.foodRepo.save(item);
    this.logger.log({ level: "info", message: "更新食材完成", id });
    return item;
  }

  /**
   * ========================================
   * ❌ 删除食材（仅限创建者）
   * ========================================
   */
  async delete(id: number, userId: number) {
    this.logger.log({ level: "info", message: "删除食材开始", id, userId });
    const item = await this.foodRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("食材不存在");

    if (item.userId && Number(item.userId) !== Number(userId)) {
      throw new ForbiddenException("无权删除此食材");
    }

    await this.foodRepo.remove(item);
    this.logger.log({ level: "info", message: "删除食材完成", id });
    return { success: true };
  }

  async checkNameExists(name: string) {
    const exists = await this.foodRepo.exists({
      where: { name },
    });

    return { exists };
  }

  /**
   * ❤️ 收藏食材
   */
  async favorite(userId: number, foodId: number) {
    const food = await this.foodRepo.findOne({ where: { id: foodId } });
    if (!food) throw new NotFoundException("食材不存在");

    const exists = await this.favoriteRepo.findOne({
      where: { userId, foodId },
    });
    if (exists) return { success: true };

    const fav = this.favoriteRepo.create({ userId, foodId });
    await this.favoriteRepo.save(fav);
    return { success: true };
  }

  /**
   * 💔 取消收藏
   */
  async unfavorite(userId: number, foodId: number) {
    await this.favoriteRepo.delete({ userId, foodId });
    return { success: true };
  }

  /**
   * 🌟 获取热门食材
   * 按收藏量排序取前10
   */
  async getPopular(userId?: number, category?: string, type?: string) {
    this.logger.log({
      level: "info",
      message: "获取热门食材开始",
      userId,
      category,
      type,
    });

    // 1. 聚合查询收藏量
    // 使用 getRawAndEntities 以确保 OrderBy 别名在分页和聚合场景下生效
    const queryBuilder = this.foodRepo
      .createQueryBuilder("food")
      .leftJoin(UserFavoriteFood, "fav", "fav.foodId = food.id")
      .select([
        "food.id",
        "food.name",
        "food.type",
        "food.userId",
        "food.category",
        "food.imageUrl",
        "food.calories",
        "food.protein",
        "food.fat",
        "food.carbs",
        "food.baseCount",
        "food.unit",
        "food.description",
      ])
      .addSelect("COUNT(fav.id)", "favorite_count")
      .groupBy("food.id")
      .orderBy("favorite_count", "DESC")
      .addOrderBy("food.id", "DESC")
      .limit(10); // 使用 limit 而非 take，因为 groupBy 已经保证了 ID 唯一性

    // 严格过滤
    if (category) {
      queryBuilder.andWhere("food.category = :category", { category });
    }
    if (type) {
      queryBuilder.andWhere("food.type = :type", { type });
    }

    const { entities, raw } = await queryBuilder.getRawAndEntities();
    let items = entities;

    // 降级策略：如果没有热门数据（例如所有收藏量都为0，或者过滤后为空）
    // 其实上面的 SQL 在收藏量为0时也会返回数据，但如果我们需要确保有数据填充：
    if (items.length === 0) {
      this.logger.log({ level: "info", message: "热门食材为空，执行降级策略" });
      items = await this.foodRepo.find({
        where: { type: type as any || FoodType.SYSTEM, category: category as any },
        order: { id: "DESC" },
        take: 10,
      });
    }

    // 2. 增强 isFavorite 状态
    let favoriteIds: Set<number> = new Set();
    if (userId) {
      const favorites = await this.favoriteRepo.find({
        where: { userId },
        select: ["foodId"],
      });
      favoriteIds = new Set(favorites.map((f) => Number(f.foodId)));
    }

    const result = items.map((item) => ({
      ...item,
      isFavorite: favoriteIds.has(Number(item.id)),
    }));

    this.logger.log({
      level: "info",
      message: "获取热门食材完成",
      count: result.length,
    });
    return result;
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
      const items = foodData.map((f) => {
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
      this.logger.log({
        level: "info",
        message: "系统食材同步完成",
        count: result.length,
      });
      return { count: result.length };
    });
  }
}
