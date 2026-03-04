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
import { NutritionUtil } from "@/common/utils/nutrition.util";

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
   * 性能点：使用 Set 进行 O(1) 复杂度的收藏状态注入
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
    // 🚀 审计修复：默认过滤下架项，但允许用户看到：1. 自己的下架项；2. 自己收藏的下架项
    if (userId) {
      queryBuilder.leftJoin(UserFavoriteFood, "fav_filter", "fav_filter.foodId = food.id AND fav_filter.userId = :userId", { userId })
                  .where("(food.isArchived = :isArchived OR food.userId = :userId OR fav_filter.id IS NOT NULL)", { 
                    isArchived: false,
                    userId 
                  });
    } else {
      queryBuilder.where("food.isArchived = :isArchived", { isArchived: false });
    }

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

    this.logger.log({ level: "info", message: "食材分页查询完成", total });
    return {
      total,
      page,
      pageSize,
      items: await this.injectFavoriteStatus(items, userId),
    };
  }

  /**
   * ➕ 创建食材
   * 自动化点：集成关键字 Emoji 推荐
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
      imageUrl: dto.imageUrl || this.getRecommendedEmoji(dto.category),
    });

    await this.foodRepo.save(item);
    this.logger.log({ level: "info", message: "创建食材完成", id: item.id });
    return item;
  }

  /**
   * 🔍 检查相似食材
   * 业务动机：减少用户冗余自建，引导使用标准化官方库
   */
  async checkSimilarity(name: string) {
    if (!name) return [];
    // 简单的模糊查询，返回前3个最相似的系统食材或高频食材
    return await this.foodRepo.find({
      where: [
        { name: Like(`%${name}%`), type: FoodType.SYSTEM },
        { name: Like(`%${name}%`), isPublic: true },
      ],
      take: 3,
    });
  }

  /**
   * 🎨 根据分类推荐 Emoji（简化版：仅按分类兜底）
   */
  private getRecommendedEmoji(category?: FoodCategory): string {
    // 根据分类兜底渲染逻辑
    const categoryMap: Record<string, string> = {
      [FoodCategory.PROTEIN]: '🥩',
      [FoodCategory.VEGETABLES]: '🥬',
      [FoodCategory.FRUITS]: '🍎',
      [FoodCategory.GRAINS]: '🍚',
      [FoodCategory.DAIRY]: '🥛',
      [FoodCategory.NUTS]: '🥜',
      [FoodCategory.OILS]: '🫒',
      [FoodCategory.SNACKS]: '🍪',
    };

    return (category && categoryMap[category]) || '🥗';
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
   * 防御点：Patch 请求下的物理守恒二次校验
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

    // 合并 Partial DTO
    Object.assign(item, dto);

    // 🚀 核心审计点：合并后进行物理守恒二次校验
    // 解决 NestJS 装饰器无法在局部更新中获取原始数据进行对比的问题
    const p = Number(item.protein || 0);
    const f = Number(item.fat || 0);
    const c = Number(item.carbs || 0);
    const bc = Number(item.baseCount || 100);
    if (p + f + c > bc) {
      throw new BadRequestException("营养成分总和(P+F+C)不能超过基准重量(baseCount)");
    }

    await this.foodRepo.save(item);
    this.logger.log({ level: "info", message: "更新食材完成", id });
    return item;
  }

  /**
   * ========================================
   * ❌ 删除食材（仅限创建者）
   * 治理逻辑：引用不崩溃原则
   * ========================================
   */
  async delete(id: number, userId: number) {
    this.logger.log({ level: "info", message: "删除食材开始", id, userId });
    const item = await this.foodRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("食材不存在");

    if (item.userId && Number(item.userId) !== Number(userId)) {
      throw new ForbiddenException("无权删除此食材");
    }

    // 🚀 逻辑下架机制：
    // 若该食材已被其他计划或记录引用，则禁止物理删除，仅设为 Archived。
    // 这保证了历史统计数据的完整性。
    if (item.referenceCount > 0) {
      item.isArchived = true;
      await this.foodRepo.save(item);
      this.logger.log({ level: "info", message: "食材已逻辑下架(引用计数>0)", id });
      return { success: true, archived: true };
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
    await this.dataSource.transaction(async (manager) => {
      await manager.save(fav);
      await this.adjustReferenceCount(manager, foodId, 1);
    });
    return { success: true };
  }

  /**
   * 💔 取消收藏
   */
  async unfavorite(userId: number, foodId: number) {
    const exists = await this.favoriteRepo.findOne({
      where: { userId, foodId },
    });
    if (!exists) return { success: true };

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(UserFavoriteFood, { userId, foodId });
      await this.adjustReferenceCount(manager, foodId, -1);
    });
    return { success: true };
  }

  /**
   * 🚀 审计修复：统一引用计数调整逻辑
   */
  async adjustReferenceCount(manager: any, foodId: number, delta: number) {
    if (!foodId) return;
    
    // 仅执行增减，物理清理逻辑移至离线维护任务，遵循最小必要原则
    if (delta > 0) {
      await manager.increment(FoodItem, { id: foodId }, "referenceCount", delta);
    } else {
      await manager.decrement(FoodItem, { id: foodId }, "referenceCount", Math.abs(delta));
    }
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
      .where("food.isArchived = :isArchived", { isArchived: false })
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

    const result = await this.injectFavoriteStatus(items, userId);

    this.logger.log({
      level: "info",
      message: "获取热门食材完成",
      count: result.length,
    });
    return result;
  }

  /**
   * 🚀 核心纠偏：克隆食材
   * 场景：分享计划导入时，如果原食材是私有的，为导入者克隆一份，确保其计划独立可编辑。
   */
  async cloneFoodItem(manager: any, originalFoodId: number, targetUserId: number): Promise<number> {
    const original = await manager.findOne(FoodItem, { where: { id: originalFoodId } });
    if (!original) return originalFoodId;

    // 如果是公共食材或系统食材，直接返回原 ID
    if (original.isPublic || original.type === FoodType.SYSTEM) {
      await this.adjustReferenceCount(manager, originalFoodId, 1);
      return originalFoodId;
    }

    // 如果该私有食材已经属于目标用户（虽然概率低，但需兼容），直接返回
    if (Number(original.userId) === Number(targetUserId)) {
      await this.adjustReferenceCount(manager, originalFoodId, 1);
      return originalFoodId;
    }

    // 检查是否已经克隆过该食材（基于名称、分类和用户 ID 的简单判断，防止重复克隆）
    const existingClone = await manager.findOne(FoodItem, {
      where: {
        name: original.name,
        userId: targetUserId,
        category: original.category,
        type: FoodType.CUSTOM
      }
    });

    if (existingClone) {
      await this.adjustReferenceCount(manager, existingClone.id, 1);
      return Number(existingClone.id);
    }

    // 执行克隆
    const clone = manager.create(FoodItem, {
      ...original,
      id: undefined, // 关键：移除旧 ID
      userId: targetUserId,
      referenceCount: 1, // 初始引用
      isArchived: false,
      isPublic: false, // 导入后的私有食材默认仍为私有
      createdAt: undefined,
      updatedAt: undefined
    });

    const saved = await manager.save(FoodItem, clone);
    this.logger.log({ level: "info", message: "食材克隆完成", originalId: originalFoodId, newId: saved.id, userId: targetUserId });
    return Number(saved.id);
  }

  /**
   * 🔄 同步系统食材
   * 🚀 审计修复：改为基于名称的 Upsert 逻辑
   * 目的：保留 ID 稳定性，防止打卡记录与计划中的外键关联失效。
   */
  async syncSystemFoods(foodData: any[]) {
    return await this.dataSource.transaction(async (manager) => {
      let updatedCount = 0;
      let createdCount = 0;
      const syncedIds: number[] = [];

      for (const f of foodData) {
        // 1. 尝试按名称和类型查找现有官方食材
        let item = await manager.findOne(FoodItem, {
          where: { name: f.name, type: FoodType.SYSTEM },
        });

        const data = {
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
          baseCount: 100,
        };

        if (item) {
          Object.assign(item, data);
          await manager.save(FoodItem, item);
          updatedCount++;
          syncedIds.push(Number(item.id));
        } else {
          item = manager.create(FoodItem, data);
          const saved = await manager.save(FoodItem, item);
          createdCount++;
          syncedIds.push(Number(saved.id));
        }
      }

      // 🚀 审计修复：清理“幽灵官方数据”
      // 将所有不在本次同步列表内的 SYSTEM 食材执行下架或删除
      const obsoleteItems = await manager.find(FoodItem, {
        where: { type: FoodType.SYSTEM },
      });

      for (const obs of obsoleteItems) {
        if (!syncedIds.includes(Number(obs.id))) {
          if (obs.referenceCount > 0) {
            obs.isArchived = true;
            await manager.save(FoodItem, obs);
          } else {
            await manager.remove(FoodItem, obs);
          }
        }
      }

      this.logger.log({
        level: "info",
        message: "系统食材同步完成",
        updated: updatedCount,
        created: createdCount,
        obsolete_cleaned: obsoleteItems.length - syncedIds.length
      });
      return { updated: updatedCount, created: createdCount };
    });
  }

  /**
   * 🚀 审计点：状态注入工具
   * 业务动机：解耦业务查询与收藏状态，通过内存 Set 注入实现高性能展示。
   */
  private async injectFavoriteStatus(items: FoodItem[], userId?: number) {
    if (!userId || items.length === 0) {
      return items.map(item => ({ ...item, isFavorite: false }));
    }

    const favorites = await this.favoriteRepo.find({
      where: { userId },
      select: ["foodId"],
    });
    const favoriteIds = new Set(favorites.map((f) => Number(f.foodId)));

    return items.map((item) => ({
      ...item,
      isFavorite: favoriteIds.has(Number(item.id)),
    }));
  }
}
