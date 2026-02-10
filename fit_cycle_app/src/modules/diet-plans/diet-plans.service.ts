import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '@/database/entity/user.entity';
import { DietPlan, PlanStatus } from '@/database/entity/diet-plan.entity';
import { PlanDay } from '@/database/entity/plan-day.entity';
import { PlanMeal } from '@/database/entity/plan-meal.entity';
import { PlanMealItem } from '@/database/entity/plan-meal-item.entity';
import { DataDictionary } from '@/database/entity/data-dictionary.entity';
import { PlanShare } from '@/database/entity/plan-share.entity';
import { CreateDietPlanDto } from '@/dtos/create-diet-plan.dto';
import { UpdateDietPlanDto } from '@/dtos/update-diet-plan.dto';
import { CreatePlanDayDto } from '@/dtos/create-plan-day.dto';
import { UpdatePlanDayDto } from '@/dtos/update-plan-day.dto';
import { CreatePlanMealDto } from '@/dtos/create-plan-meal.dto';
import { UpdatePlanMealDto } from '@/dtos/update-plan-meal.dto';
import { CreatePlanMealItemDto } from '@/dtos/create-plan-meal-item.dto';
import { UpdatePlanMealItemDto } from '@/dtos/update-plan-meal-item.dto';
import { SavePlanTemplatesDto } from '@/dtos/save-plan-templates.dto';
import { InitPlanDaysDto } from '@/dtos/init-plan-days.dto';
import { UpdatePlanDayFullDto } from '@/dtos/update-plan-day-full.dto';

/**
 * DietPlansService 管理饮食计划以及关联的计划日、餐次和食材明细的 CRUD 操作。
 */
@Injectable()
export class DietPlansService {
  constructor(
    @InjectRepository(DietPlan)
    private readonly planRepo: Repository<DietPlan>,
    @InjectRepository(PlanDay)
    private readonly planDayRepo: Repository<PlanDay>,
    @InjectRepository(PlanMeal)
    private readonly planMealRepo: Repository<PlanMeal>,
    @InjectRepository(PlanMealItem)
    private readonly planMealItemRepo: Repository<PlanMealItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DataDictionary)
    private readonly dictRepo: Repository<DataDictionary>,
    @InjectRepository(PlanShare)
    private readonly shareRepo: Repository<PlanShare>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 批量初始化天数结构
   */
  async initDays(planId: number, userId: number, dto: InitPlanDaysDto) {
    const plan = await this.planRepo.findOne({ 
      where: { id: planId, userId },
      relations: { planDays: true } 
    });
    if (!plan) throw new NotFoundException('计划不存在或无权限');

    // 如果未强制覆盖，检查是否有已配置的天
    if (!dto.force) {
      const configuredDays = plan.planDays.filter(d => d.isConfigured);
      if (configuredDays.length > 0) {
        throw new ForbiddenException({
          code: 'OVERWRITE_RISK',
          message: `已有 ${configuredDays.length} 天配置过内容，重新初始化将清空它们。`,
          details: configuredDays.map(d => d.dayNumber)
        });
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 清理该计划下的所有旧天
      await queryRunner.manager.delete(PlanDay, { planId });

      // 2. 批量生成新天
      const dayEntities = dto.days.map(d => {
        const day = new PlanDay();
        day.planId = planId;
        day.dayNumber = d.dayNumber;
        day.carbType = d.carbType ?? null;
        day.targetCalories = d.targetCalories || 0;
        day.targetProtein = d.targetProtein || 0;
        day.targetFat = d.targetFat || 0;
        day.targetCarbs = d.targetCarbs || 0;
        day.isConfigured = false;
        return day;
      });

      await queryRunner.manager.save(PlanDay, dayEntities);
      await queryRunner.commitTransaction();
      return { success: true, count: dayEntities.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('初始化天数失败: ' + err.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取单日全量详情
   */
  async findDayDetail(dayId: number, userId: number) {
    const day = await this.planDayRepo.findOne({
      where: { id: dayId },
      relations: {
        plan: true,
        planMeals: {
          mealType: true,
          mealItems: true
        }
      }
    });

    if (!day) throw new NotFoundException('计划日不存在');
    // 使用字符串比较，这是最稳健的跨类型 bigint 校验方案
    if (String(day.plan.userId) !== String(userId)) {
      throw new ForbiddenException(`无权限访问: 计划属于 ${day.plan.userId}, 当前用户 ${userId}`);
    }

    return day;
  }

  /**
   * 单日全量更新 (差量级联更新)
   */
  async updateDayFull(dayId: number, userId: number, dto: UpdatePlanDayFullDto) {
    const day = await this.planDayRepo.findOne({
      where: { id: dayId },
      relations: { plan: true }
    });
    if (!day) throw new NotFoundException('计划日不存在');
    if (String(day.plan.userId) !== String(userId)) throw new ForbiddenException('无权限更新');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 更新 PlanDay 基础属性
      const updateData: Partial<PlanDay> = {};
      if (dto.carbType !== undefined) updateData.carbType = dto.carbType;
      if (dto.targetCalories !== undefined) updateData.targetCalories = dto.targetCalories;
      if (dto.targetProtein !== undefined) updateData.targetProtein = dto.targetProtein;
      if (dto.targetFat !== undefined) updateData.targetFat = dto.targetFat;
      if (dto.targetCarbs !== undefined) updateData.targetCarbs = dto.targetCarbs;
      if (dto.isConfigured !== undefined) updateData.isConfigured = dto.isConfigured;
      
      await queryRunner.manager.update(PlanDay, dayId, updateData);

      // 2. 清理旧的餐次和食材 (简单方案：物理删除再重建该天的)
      // 更加严谨方案是做 Map 对比 ID 差量更新，但鉴于“单日模板”数据量极小（通常 3-5 餐，每餐 2-5 个食材），
      // 物理重建性能可控且逻辑最清晰。
      await queryRunner.manager.delete(PlanMeal, { planDayId: dayId });

      // 3. 重建树状结构
      const mealTypes = await this.dictRepo.find({ where: { category: 'MealType' } });
      const mealTypeMap = new Map(mealTypes.map(m => [Number(m.id), m]));

      const newMeals: PlanMeal[] = [];
      for (const mealDto of dto.meals) {
        const mealType = mealTypeMap.get(Number(mealDto.mealTypeId));
        if (!mealType) continue;

        const meal = this.planMealRepo.create({
          planDayId: dayId,
          mealType,
          scheduledTime: mealDto.scheduledTime,
          note: mealDto.note,
          mealItems: mealDto.items.map(itemDto => this.planMealItemRepo.create({
            customName: itemDto.customName,
            quantity: itemDto.quantity,
            unit: itemDto.unit,
            calories: itemDto.calories,
            protein: itemDto.protein,
            fat: itemDto.fat,
            carbs: itemDto.carbs,
            fiber: itemDto.fiber,
            sortOrder: itemDto.sortOrder,
          }))
        });
        newMeals.push(meal);
      }

      if (newMeals.length > 0) {
        await queryRunner.manager.save(PlanMeal, newMeals);
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('更新失败: ' + err.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 批量保存计划模板 (覆盖式)
   */
  async saveTemplates(planId: number, userId: number, dto: SavePlanTemplatesDto) {
    const plan = await this.planRepo.findOne({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('计划不存在或无权限');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 清理现有配置 (物理删除 plan_days，会级联删除 meals 和 items)
      await queryRunner.manager.delete(PlanDay, { planId });

      // 2. 构建实体树
      const dayEntities: PlanDay[] = [];
      
      // 预加载所有需要的 MealType 字典，避免循环查询
      const mealTypes = await this.dictRepo.find({ where: { category: 'MealType' } });
      const mealTypeMap = new Map(mealTypes.map(m => [Number(m.id), m]));

      for (const dayDto of dto.templates) {
        const day = this.planDayRepo.create({
          planId, // 关联 ID
          dayNumber: dayDto.dayNumber,
          carbType: dayDto.carbType,
          targetCalories: dayDto.targetCalories,
          targetProtein: dayDto.targetProtein,
          targetFat: dayDto.targetFat,
          targetCarbs: dayDto.targetCarbs,
          planMeals: [] // 初始化数组
        });

        for (const mealDto of dayDto.meals) {
          const mealType = mealTypeMap.get(Number(mealDto.mealTypeId));
          // 如果找不到类型，跳过或报错？这里选择宽容跳过或使用默认，或报错
          if (!mealType) throw new NotFoundException(`餐次类型 ID ${mealDto.mealTypeId} 不存在`);

          const meal = this.planMealRepo.create({
            mealType,
            scheduledTime: mealDto.scheduledTime,
            note: mealDto.note,
            mealItems: []
          });

          for (const itemDto of mealDto.items) {
            const item = this.planMealItemRepo.create({
              customName: itemDto.customName,
              quantity: itemDto.quantity,
              unit: itemDto.unit,
              calories: itemDto.calories,
              protein: itemDto.protein,
              fat: itemDto.fat,
              carbs: itemDto.carbs,
              fiber: itemDto.fiber,
              sortOrder: itemDto.sortOrder,
            });
            meal.mealItems.push(item);
          }
          day.planMeals.push(meal);
        }
        dayEntities.push(day);
      }

      // 3. 批量保存 (依赖 cascade: true)
      if (dayEntities.length > 0) {
        await queryRunner.manager.save(PlanDay, dayEntities);
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('批量保存失败: ' + err.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户的所有饮食计划。
   */
  async findAllByUser(
    userId: number,
    status?: PlanStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    const where: any = { userId };
    if (status) where.status = status;
    
    // 显式确保 page/limit 是数字 (针对某些框架透传字符串的情况)
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [items, total] = await this.planRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { items, total };
  }

  /**
   * 获取官方推荐计划模板
   */
  async findRecommended() {
    return this.planRepo.find({ 
      where: { isTemplate: true },
      order: { createdAt: 'ASC' }
    });
  }

  /**
   * 获取用户当前激活的计划 (含日模板)
   */
  async findActivePlan(userId: number): Promise<DietPlan | null> {
    return this.planRepo.findOne({
      where: { userId, status: PlanStatus.ACTIVE },
      relations: { planDays: true }
    });
  }

  /**
   * 创建新的饮食计划。
   */
  async createPlan(userId: number, dto: CreateDietPlanDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    
    const plan = this.planRepo.create({ 
      ...dto, 
      userId,
      status: PlanStatus.DRAFT,
      isTemplate: false
    });
    return this.planRepo.save(plan);
  }

  /**
   * 获取计划详情。
   */
  async findDetail(planId: number, userId?: number) {
    const plan = await this.planRepo.findOne({
      where: { id: planId },
      relations: {
        planDays: {
          planMeals: {
            mealItems: true,
          },
        },
      },
    });
    
    if (!plan) throw new NotFoundException('计划不存在');
    
    // 如果是用户私有计划，检查归属
    if (!plan.isTemplate && userId && Number(plan.userId) !== Number(userId)) {
      throw new NotFoundException('无权限访问该计划');
    }
    
    return plan;
  }

  /**
   * 更新计划信息。
   */
  async updatePlan(id: number, dto: UpdateDietPlanDto, userId?: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('计划不存在');
    if (userId && Number(plan.userId) !== Number(userId))
      throw new NotFoundException('无权限更新该计划');
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  /**
   * 激活计划。
   */
  async activatePlan(userId: number, planId: number) {
    const plan = await this.planRepo.findOne({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('计划不存在或无权限');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 将该用户所有 ACTIVE 计划设为 PAUSED
      await queryRunner.manager.update(
        DietPlan, 
        { userId, status: PlanStatus.ACTIVE }, 
        { status: PlanStatus.PAUSED }
      );

      // 2. 激活目标计划
      // 如果没有开始日期，默认设为今天
      const updateData: any = { status: PlanStatus.ACTIVE };
      if (!plan.startDate) {
        updateData.startDate = new Date().toISOString().split('T')[0];
      }

      await queryRunner.manager.update(DietPlan, { id: planId }, updateData);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('激活计划失败: ' + err.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 暂停计划
   */
  async pausePlan(userId: number, planId: number) {
    const plan = await this.planRepo.findOne({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('计划不存在或无权限');

    await this.planRepo.update({ id: planId }, { status: PlanStatus.PAUSED });
    return { success: true };
  }

  /**
   * 创建计划日。
   */
  async createPlanDay(planId: number, dto: any, userId?: number) {
    const plan = await this.planRepo.findOne({
      where: { id: planId },
      relations: { planDays: true },
    });
    if (!plan) throw new NotFoundException('计划不存在');
    if (userId && Number(plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作该计划');

    if (
      dto.dayNumber &&
      plan.planDays &&
      plan.planDays.some((d) => d.dayNumber === dto.dayNumber)
    ) {
      throw new NotFoundException('该日序号已存在');
    }
    
    const day = this.planDayRepo.create({ ...dto, plan });
    return this.planDayRepo.save(day);
  }

  /**
   * 更新计划日。
   */
  async updatePlanDay(dayId: number, dto: UpdatePlanDayDto, userId?: number) {
    const day = await this.planDayRepo.findOne({
      where: { id: dayId },
      relations: { plan: true },
    });
    if (!day) throw new NotFoundException('计划日不存在');
    if (userId && Number(day.plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    Object.assign(day, dto);
    return this.planDayRepo.save(day);
  }

  /**
   * 为计划日添加餐次。
   */
  async createPlanMeal(dayId: number, dto: CreatePlanMealDto, userId?: number) {
    const day = await this.planDayRepo.findOne({
      where: { id: dayId },
      relations: { plan: true },
    });
    if (!day) throw new NotFoundException('计划日不存在');
    if (userId && Number(day.plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    const meal = this.planMealRepo.create({ ...dto, planDay: day });
    return this.planMealRepo.save(meal);
  }

  /**
   * 更新计划餐次。
   */
  async updatePlanMeal(
    mealId: number,
    dto: UpdatePlanMealDto,
    userId?: number,
  ) {
    const meal = await this.planMealRepo.findOne({
      where: { id: mealId },
      relations: { planDay: { plan: true } },
    });
    if (!meal) throw new NotFoundException('计划餐次不存在');
    if (userId && Number(meal.planDay.plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    Object.assign(meal, dto);
    return this.planMealRepo.save(meal);
  }

  /**
   * 添加食材明细。
   */
  async createPlanMealItem(
    mealId: number,
    dto: CreatePlanMealItemDto,
    userId?: number,
  ) {
    const meal = await this.planMealRepo.findOne({
      where: { id: mealId },
      relations: { planDay: { plan: true } },
    });
    if (!meal) throw new NotFoundException('计划餐次不存在');
    if (userId && Number(meal.planDay.plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    
    const item = this.planMealItemRepo.create({ ...dto, planMeal: meal });
    return this.planMealItemRepo.save(item);
  }

  /**
   * 更新餐次食材明细。
   */
  async updatePlanMealItem(
    itemId: number,
    dto: UpdatePlanMealItemDto,
    userId?: number,
  ) {
    const item = await this.planMealItemRepo.findOne({
      where: { id: itemId },
      relations: { planMeal: { planDay: { plan: true } } },
    });
    if (!item) throw new NotFoundException('餐次食材明细不存在');
    if (userId && Number(item.planMeal.planDay.plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    Object.assign(item, dto);
    return this.planMealItemRepo.save(item);
  }

  /**
   * 删除计划日 / 餐次 / 明细。
   */
  async removePlanDay(id: number, userId?: number) {
    const day = await this.planDayRepo.findOne({
      where: { id },
      relations: { plan: true },
    });
    if (!day) throw new NotFoundException('计划日不存在');
    if (userId && Number(day.plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    await this.planDayRepo.remove(day);
    return { success: true };
  }

  async removePlanMeal(id: number, userId?: number) {
    const meal = await this.planMealRepo.findOne({
      where: { id },
      relations: { planDay: { plan: true } },
    });
    if (!meal) throw new NotFoundException('计划餐次不存在');
    if (userId && Number(meal.planDay.plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    await this.planMealRepo.remove(meal);
    return { success: true };
  }

  async removePlanMealItem(id: number, userId?: number) {
    const item = await this.planMealItemRepo.findOne({
      where: { id },
      relations: { planMeal: { planDay: { plan: true } } },
    });
    if (!item) throw new NotFoundException('餐次明细不存在');
    if (userId && Number(item.planMeal.planDay.plan.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    await this.planMealItemRepo.remove(item);
    return { success: true };
  }

  /**
   * 生成分享码并存储
   */
  async sharePlan(planId: number, userId: number) {
    const plan = await this.planRepo.findOne({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('计划不存在或无权限');

    // 检查是否已存在有效期内的分享码
    let share = await this.shareRepo.findOne({ 
      where: { planId, userId },
      order: { createdAt: 'DESC' }
    });

    if (share && (!share.expireAt || share.expireAt > new Date())) {
      return { code: share.code, expireAt: share.expireAt };
    }

    // 生成新码
    const code = 'PLAN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 有效期 30 天
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 30);

    share = this.shareRepo.create({
      code,
      planId,
      userId,
      expireAt
    });

    await this.shareRepo.save(share);
    return { code, expireAt };
  }

  // 简单的内存限流 (生产环境应使用 Redis)
  private importAttempts = new Map<number, { count: number; lastTime: number }>();

  /**
   * 通过分享码导入计划 (深拷贝)
   */
  async importPlan(userId: number, code: string) {
    // 1. 安全检查：防止暴力枚举
    this.checkRateLimit(userId);

    const share = await this.shareRepo.findOne({ 
      where: { code },
      relations: { plan: true }
    });

    if (!share) {
      this.recordFailedAttempt(userId);
      throw new NotFoundException('分享码不存在');
    }
    if (share.expireAt && share.expireAt < new Date()) {
      throw new NotFoundException('分享码已过期');
    }

    const originalPlan = await this.findDetail(share.planId);
    
    // 2. 优化名称截断逻辑
    let newName = `${originalPlan.name} (导入)`;
    if (newName.length > 100) {
      // 保留后缀，截断前缀
      const suffix = " (导入)";
      newName = originalPlan.name.substring(0, 100 - suffix.length) + suffix;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. 复制计划主体
      const newPlan = queryRunner.manager.create(DietPlan, {
        name: newName,
        type: originalPlan.type,
        cycleDays: originalPlan.cycleDays,
        cycleCount: originalPlan.cycleCount,
        carbCycleConfig: originalPlan.carbCycleConfig,
        targetCalories: originalPlan.targetCalories,
        targetProtein: originalPlan.targetProtein,
        targetFat: originalPlan.targetFat,
        targetCarbs: originalPlan.targetCarbs,
        userId,
        status: PlanStatus.DRAFT,
        isTemplate: false
      });
      const savedPlan = await queryRunner.manager.save(newPlan);

      // 4. 循环复制日、餐次、食材
      for (const oldDay of originalPlan.planDays) {
        const newDay = queryRunner.manager.create(PlanDay, {
          plan: savedPlan,
          dayNumber: oldDay.dayNumber,
          carbType: oldDay.carbType,
          targetCalories: oldDay.targetCalories,
          targetProtein: oldDay.targetProtein,
          targetFat: oldDay.targetFat,
          targetCarbs: oldDay.targetCarbs,
        });
        const savedDay = await queryRunner.manager.save(newDay);

        for (const oldMeal of oldDay.planMeals) {
          const newMeal = queryRunner.manager.create(PlanMeal, {
            planDay: savedDay,
            mealType: oldMeal.mealType,
            scheduledTime: oldMeal.scheduledTime,
            note: oldMeal.note,
          });
          const savedMeal = await queryRunner.manager.save(newMeal);

          for (const oldItem of oldMeal.mealItems) {
            const newItem = queryRunner.manager.create(PlanMealItem, {
              planMeal: savedMeal,
              customName: oldItem.customName,
              quantity: oldItem.quantity,
              unit: oldItem.unit,
              calories: oldItem.calories,
              protein: oldItem.protein,
              fat: oldItem.fat,
              carbs: oldItem.carbs,
              fiber: oldItem.fiber,
              sortOrder: oldItem.sortOrder,
            });
            await queryRunner.manager.save(newItem);
          }
        }
      }

      // 成功后清除计数
      this.importAttempts.delete(userId);

      await queryRunner.commitTransaction();
      return { id: savedPlan.id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('导入计划失败: ' + err.message);
    } finally {
      await queryRunner.release();
    }
  }

  private checkRateLimit(userId: number) {
    const record = this.importAttempts.get(userId);
    if (record) {
      if (Date.now() - record.lastTime > 60 * 1000) {
        // 超过1分钟重置
        this.importAttempts.delete(userId);
      } else if (record.count >= 5) {
        throw new ForbiddenException('尝试次数过多，请稍后再试');
      }
    }
  }

  private recordFailedAttempt(userId: number) {
    const record = this.importAttempts.get(userId) || { count: 0, lastTime: Date.now() };
    record.count++;
    record.lastTime = Date.now();
    this.importAttempts.set(userId, record);
  }

  /**
   * 删除计划 (软删除)
   */
  async removePlan(id: number, userId?: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('计划不存在');
    if (userId && Number(plan.userId) !== Number(userId))
      throw new NotFoundException('无权限删除该计划');
    
    // 使用 softRemove
    await this.planRepo.softRemove(plan);
    return { success: true };
  }
}
