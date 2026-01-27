import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DietPlan } from '@/database/entity/diet-plan.entity';
import { User } from '@/database/entity/user.entity';
import { PlanDay } from '@/database/entity/plan-day.entity';
import { PlanMeal } from '@/database/entity/plan-meal.entity';
import { PlanMealItem } from '@/database/entity/plan-meal-item.entity';
import { ImportPlanDto } from '@/dtos/import-plan.dto';

/**
 * ShareService 实现饮食计划的分享与导入功能。
 *
 * 用户可以分享自己的计划给他人，分享码采用计划 ID 的 36 进制表示。
 * 接收者通过分享码克隆计划以及所有层级子表，成为自己的计划副本。
 */
@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(DietPlan)
    private readonly planRepo: Repository<DietPlan>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PlanDay)
    private readonly dayRepo: Repository<PlanDay>,
    @InjectRepository(PlanMeal)
    private readonly mealRepo: Repository<PlanMeal>,
    @InjectRepository(PlanMealItem)
    private readonly mealItemRepo: Repository<PlanMealItem>,
  ) {}

  /**
   * 根据计划 ID 生成分享码和链接。
   * 此处简化处理，直接使用计划 ID 的 36 进制表示。
   *
   * @param userId 当前用户 ID，只有计划的创建者才能分享
   * @param planId 计划主键
   * @returns 包含分享码和分享链接的对象
   */
  async sharePlan(userId: number, planId: number) {
    // 校验计划归属
    const plan = await this.planRepo.findOne({
      where: { id: planId, user: { id: userId } },
    });
    if (!plan) throw new NotFoundException('计划不存在');
    const shareCode = planId.toString(36);
    const shareUrl = `https://example.com/share/${shareCode}`;
    return { shareCode, shareUrl };
  }

  /**
   * 导入他人分享的计划：克隆原计划及其所有层级数据。
   *
   * 该方法会根据分享码解析出原计划的 ID，然后读取原计划及其计划日、餐次和食材明细，
   * 创建新的计划并复制所有相关数据到新计划下，最后返回新计划。
   *
   * @param userId 当前用户 ID，作为新计划的拥有者
   * @param dto 包含分享码的导入参数
   * @returns 新创建的计划实体
   */
  async importPlan(userId: number, dto: ImportPlanDto) {
    const planId = parseInt(dto.shareCode, 36);
    const original = await this.planRepo.findOne({
      where: { id: planId },
      relations: { planDays: { planMeals: { mealItems: true } } },
    });
    if (!original) throw new NotFoundException('分享的计划不存在');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    // 克隆 DietPlan
    const newPlan = this.planRepo.create({
      name: original.name,
      goalType: original.goalType,
      durationDays: original.durationDays,
      targetCalories: original.targetCalories,
      targetProtein: original.targetProtein,
      targetFat: original.targetFat,
      targetCarbs: original.targetCarbs,
      status: 'draft',
      isActive: false,
      user,
    });
    const savedPlan = await this.planRepo.save(newPlan);
    // 克隆子表
    for (const day of original.planDays || []) {
      const newDay = this.dayRepo.create({
        plan: savedPlan,
        dayIndex: day.dayIndex,
        date: day.date,
        carbType: day.carbType,
        targetCalories: day.targetCalories,
        targetProtein: day.targetProtein,
        targetFat: day.targetFat,
        targetCarbs: day.targetCarbs,
      });
      const savedDay = await this.dayRepo.save(newDay);
      for (const meal of day.planMeals || []) {
        const newMeal = this.mealRepo.create({
          planDay: savedDay,
          mealType: meal.mealType,
          scheduledTime: meal.scheduledTime,
          note: meal.note,
        });
        const savedMeal = await this.mealRepo.save(newMeal);
        for (const item of meal.mealItems || []) {
          const newItem = this.mealItemRepo.create({
            planMeal: savedMeal,
            // foodItem: item.foodItem,
            customName: item.customName,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            fat: item.fat,
            carbs: item.carbs,
            fiber: item.fiber,
            sortOrder: item.sortOrder,
          });
          await this.mealItemRepo.save(newItem);
        }
      }
    }
    return savedPlan;
  }
}
