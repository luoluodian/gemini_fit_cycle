import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '@/database/entity/user.entity';
import { DietPlan, PlanStatus } from '@/database/entity/diet-plan.entity';
import { PlanDay } from '@/database/entity/plan-day.entity';
import { PlanMeal } from '@/database/entity/plan-meal.entity';
import { PlanMealItem } from '@/database/entity/plan-meal-item.entity';
import { DataDictionary } from '@/database/entity/data-dictionary.entity';
import { CreateDietPlanDto } from '@/dtos/create-diet-plan.dto';
import { UpdateDietPlanDto } from '@/dtos/update-diet-plan.dto';
import { CreatePlanDayDto } from '@/dtos/create-plan-day.dto';
import { UpdatePlanDayDto } from '@/dtos/update-plan-day.dto';
import { CreatePlanMealDto } from '@/dtos/create-plan-meal.dto';
import { UpdatePlanMealDto } from '@/dtos/update-plan-meal.dto';
import { CreatePlanMealItemDto } from '@/dtos/create-plan-meal-item.dto';
import { UpdatePlanMealItemDto } from '@/dtos/update-plan-meal-item.dto';
import { SavePlanTemplatesDto } from '@/dtos/save-plan-templates.dto';

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
    private readonly dataSource: DataSource,
  ) {}

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

      // 2. 循环插入新配置
      for (const dayDto of dto.templates) {
        // 创建日配置
        const day = queryRunner.manager.create(PlanDay, {
          planId,
          dayNumber: dayDto.dayNumber,
          carbType: dayDto.carbType,
          targetCalories: dayDto.targetCalories,
          targetProtein: dayDto.targetProtein,
          targetFat: dayDto.targetFat,
          targetCarbs: dayDto.targetCarbs,
        });
        const savedDay = await queryRunner.manager.save(day);

        for (const mealDto of dayDto.meals) {
          // 查找餐次字典
          const mealType = await this.dictRepo.findOne({ where: { id: mealDto.mealTypeId } });
          if (!mealType) throw new NotFoundException(`餐次类型 ID ${mealDto.mealTypeId} 不存在`);
          
          // 创建餐次
          const meal = queryRunner.manager.create(PlanMeal, {
            planDay: savedDay,
            mealType,
            scheduledTime: mealDto.scheduledTime,
            note: mealDto.note,
          });
          const savedMeal = await queryRunner.manager.save(meal);

          for (const itemDto of mealDto.items) {
            // 创建食材明细
            const item = queryRunner.manager.create(PlanMealItem, {
              planMeal: savedMeal,
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
            await queryRunner.manager.save(item);
          }
        }
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
  async findAllByUser(userId: number, status?: PlanStatus) {
    const where: any = { userId };
    if (status) where.status = status;
    return this.planRepo.find({ 
      where,
      order: { createdAt: 'DESC' }
    });
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
   * 删除计划。
   */
  async removePlan(id: number, userId?: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('计划不存在');
    if (userId && Number(plan.userId) !== Number(userId))
      throw new NotFoundException('无权限删除该计划');
    await this.planRepo.remove(plan);
    return { success: true };
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
}
