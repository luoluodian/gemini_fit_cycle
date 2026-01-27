import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/database/entity/user.entity';
import { DietPlan } from '@/database/entity/diet-plan.entity';
import { PlanDay } from '@/database/entity/plan-day.entity';
import { PlanMeal } from '@/database/entity/plan-meal.entity';
import { PlanMealItem } from '@/database/entity/plan-meal-item.entity';
import { CreateDietPlanDto } from '@/dtos/create-diet-plan.dto';
import { UpdateDietPlanDto } from '@/dtos/update-diet-plan.dto';
import { CreatePlanDayDto } from '@/dtos/create-plan-day.dto';
import { UpdatePlanDayDto } from '@/dtos/update-plan-day.dto';
import { CreatePlanMealDto } from '@/dtos/create-plan-meal.dto';
import { UpdatePlanMealDto } from '@/dtos/update-plan-meal.dto';
import { CreatePlanMealItemDto } from '@/dtos/create-plan-meal-item.dto';
import { UpdatePlanMealItemDto } from '@/dtos/update-plan-meal-item.dto';

/**
 * DietPlansService 管理饮食计划以及关联的计划日、餐次和食材明细的 CRUD 操作。
 *
 * 每个方法都会根据提供的 `userId` 验证资源归属，确保用户只能操作自己的计划数据。
 * 同时在创建计划日时会检查 dayIndex 是否重复，以避免数据混乱。
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
  ) {}

  /**
   * 获取用户的所有饮食计划。
   *
   * @param userId 当前用户 ID
   * @returns 该用户创建的所有饮食计划列表
   */
  async findAllByUser(userId: number) {
    return this.planRepo.find({ where: { user: { id: userId } } });
  }

  /**
   * 创建新的饮食计划，并关联到用户。
   *
   * @param userId 当前用户 ID
   * @param dto 创建计划所需的字段（名称、描述、目标、周期等）
   * @returns 创建后的计划实体
   */
  async createPlan(userId: number, dto: CreateDietPlanDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    // 优化
    // const plan = this.planRepo.create({ ...dto, user });
    // return this.planRepo.save(plan);
    return dto;
  }

  /**
   * 根据 ID 获取计划详情（包含层级关系）。
   *
   * 可选地传入 `userId`，若传入则会校验计划是否属于该用户。
   * 加载的层级包括：planDays、planMeals 和 mealItems。
   *
   * @param planId 计划主键
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 完整的计划实体
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
    if (userId && plan.user.id !== userId)
      throw new NotFoundException('无权限访问该计划');
    return plan;
  }

  /**
   * 更新计划信息。
   *
   * @param id 计划主键
   * @param dto 更新字段对象
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 更新后的计划实体
   */
  async updatePlan(id: number, dto: UpdateDietPlanDto, userId?: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('计划不存在');
    if (userId && plan.user.id !== userId)
      throw new NotFoundException('无权限更新该计划');
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  /**
   * 删除计划（逻辑删除可自定义，此处直接删除）。
   *
   * @param id 计划主键
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 删除操作结果标识
   */
  async removePlan(id: number, userId?: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('计划不存在');
    if (userId && plan.user.id !== userId)
      throw new NotFoundException('无权限删除该计划');
    await this.planRepo.remove(plan);
    return { success: true };
  }

  /**
   * 将某个计划设为当前激活计划，其他计划自动取消激活。
   *
   * @param userId 当前用户 ID
   * @param planId 需要激活的计划 ID
   * @returns 执行结果标识对象
   */
  async activatePlan(userId: number, planId: number) {
    // 确认计划属于当前用户
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan || plan.user.id !== userId)
      throw new NotFoundException('无权限激活该计划');
    const plans = await this.planRepo.find({ where: { user: { id: userId } } });
    for (const p of plans) {
      p.isActive = p.id === planId;
      await this.planRepo.save(p);
    }
    return { success: true };
  }

  /**
   * 为计划创建一个新的计划日。
   *
   * 在创建计划日时，会检测是否存在相同的 `dayIndex` 以避免冲突。
   *
   * @param planId 计划 ID
   * @param dto 创建计划日的参数
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 新建的计划日实体
   */
  async createPlanDay(planId: number, dto: CreatePlanDayDto, userId?: number) {
    const plan = await this.planRepo.findOne({
      where: { id: planId },
      relations: { user: true, planDays: true },
    });
    if (!plan) throw new NotFoundException('计划不存在');
    if (userId && plan.user.id !== userId)
      throw new NotFoundException('无权限操作该计划');
    // 避免重复 dayIndex
    if (
      dto.dayIndex &&
      plan.planDays &&
      plan.planDays.some((d) => d.dayIndex === dto.dayIndex)
    ) {
      throw new NotFoundException('该日序号已存在');
    }
    // 优化
    // const day = this.planDayRepo.create({ ...dto, plan });
    // return this.planDayRepo.save(day);

    return 'a';
  }

  /**
   * 更新计划日。
   *
   * @param dayId 计划日主键
   * @param dto 更新字段
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 更新后的计划日实体
   */
  async updatePlanDay(dayId: number, dto: UpdatePlanDayDto, userId?: number) {
    const day = await this.planDayRepo.findOne({
      where: { id: dayId },
      relations: { plan: { user: true, planDays: true } },
    });
    if (!day) throw new NotFoundException('计划日不存在');
    if (userId && day.plan.user.id !== userId)
      throw new NotFoundException('无权限操作');
    Object.assign(day, dto);
    return this.planDayRepo.save(day);
  }

  /**
   * 为计划日添加餐次。
   *
   * @param dayId 计划日主键
   * @param dto 创建餐次的参数
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 新建的餐次实体
   */
  async createPlanMeal(dayId: number, dto: CreatePlanMealDto, userId?: number) {
    const day = await this.planDayRepo.findOne({
      where: { id: dayId },
      relations: { plan: { user: true } },
    });
    if (!day) throw new NotFoundException('计划日不存在');
    if (userId && day.plan.user.id !== userId)
      throw new NotFoundException('无权限操作');
    const meal = this.planMealRepo.create({ ...dto, planDay: day });
    return this.planMealRepo.save(meal);
  }

  /**
   * 更新计划餐次。
   *
   * @param mealId 计划餐次主键
   * @param dto 更新字段
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 更新后的餐次实体
   */
  async updatePlanMeal(
    mealId: number,
    dto: UpdatePlanMealDto,
    userId?: number,
  ) {
    const meal = await this.planMealRepo.findOne({
      where: { id: mealId },
      relations: { planDay: { plan: { user: true } } },
    });
    if (!meal) throw new NotFoundException('计划餐次不存在');
    if (userId && meal.planDay.plan.user.id !== userId)
      throw new NotFoundException('无权限操作');
    Object.assign(meal, dto);
    return this.planMealRepo.save(meal);
  }

  /**
   * 为餐次添加食材明细。
   *
   * @param mealId 计划餐次主键
   * @param dto 明细创建数据
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 创建后的食材明细实体
   */
  async createPlanMealItem(
    mealId: number,
    dto: CreatePlanMealItemDto,
    userId?: number,
  ) {
    const meal = await this.planMealRepo.findOne({
      where: { id: mealId },
      relations: { planDay: { plan: { user: true } } },
    });
    if (!meal) throw new NotFoundException('计划餐次不存在');
    if (userId && meal.planDay.plan.user.id !== userId)
      throw new NotFoundException('无权限操作');
    // 优化
    // const item = this.planMealItemRepo.create({ ...dto, planMeal: meal });
    // return this.planMealItemRepo.save(item);
    return 'a';
  }

  /**
   * 更新餐次食材明细。
   *
   * @param itemId 食材明细主键
   * @param dto 更新字段
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 更新后的食材明细实体
   */
  async updatePlanMealItem(
    itemId: number,
    dto: UpdatePlanMealItemDto,
    userId?: number,
  ) {
    const item = await this.planMealItemRepo.findOne({
      where: { id: itemId },
      relations: { planMeal: { planDay: { plan: { user: true } } } },
    });
    if (!item) throw new NotFoundException('餐次食材明细不存在');
    if (userId && item.planMeal.planDay.plan.user.id !== userId)
      throw new NotFoundException('无权限操作');
    Object.assign(item, dto);
    return this.planMealItemRepo.save(item);
  }

  /**
   * 删除计划日 / 餐次 / 明细。
   * 删除计划日 / 餐次 / 明细。
   *
   * 删除操作只在当前用户拥有权限的情况下才能进行；若尝试删除他人计划的子数据则会抛出 404。
   *
   * @param id 子对象主键
   * @param userId 当前用户 ID（可选），用于权限校验
   * @returns 删除操作结果标识对象
   */
  async removePlanDay(id: number, userId?: number) {
    const day = await this.planDayRepo.findOne({
      where: { id },
      relations: { plan: { user: true } },
    });
    if (!day) throw new NotFoundException('计划日不存在');
    if (userId && day.plan.user.id !== userId)
      throw new NotFoundException('无权限操作');
    await this.planDayRepo.remove(day);
    return { success: true };
  }

  async removePlanMeal(id: number, userId?: number) {
    const meal = await this.planMealRepo.findOne({
      where: { id },
      relations: { planDay: { plan: { user: true } } },
    });
    if (!meal) throw new NotFoundException('计划餐次不存在');
    if (userId && meal.planDay.plan.user.id !== userId)
      throw new NotFoundException('无权限操作');
    await this.planMealRepo.remove(meal);
    return { success: true };
  }

  async removePlanMealItem(id: number, userId?: number) {
    const item = await this.planMealItemRepo.findOne({
      where: { id },
      relations: { planMeal: { planDay: { plan: { user: true } } } },
    });
    if (!item) throw new NotFoundException('餐次明细不存在');
    if (userId && item.planMeal.planDay.plan.user.id !== userId)
      throw new NotFoundException('无权限操作');
    await this.planMealItemRepo.remove(item);
    return { success: true };
  }
}
