import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DietPlan, PlanStatus } from '@/database/entity/diet-plan.entity';
import { User } from '@/database/entity/user.entity';
import { PlanDay } from '@/database/entity/plan-day.entity';
import { PlanMeal } from '@/database/entity/plan-meal.entity';
import { PlanMealItem } from '@/database/entity/plan-meal-item.entity';
import { ImportPlanDto } from '@/dtos/import-plan.dto';

/**
 * ShareService 实现饮食计划的分享与导入功能。
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
   * 分享计划
   */
  async sharePlan(userId: number, planId: number) {
    const plan = await this.planRepo.findOne({
      where: { id: planId, userId },
    });
    if (!plan) throw new NotFoundException('计划不存在');
    const shareCode = planId.toString(36);
    const shareUrl = `https://example.com/share/${shareCode}`;
    return { shareCode, shareUrl };
  }

  /**
   * 导入计划
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
      type: original.type,
      cycleDays: original.cycleDays,
      cycleCount: original.cycleCount,
      targetCalories: original.targetCalories,
      targetProtein: original.targetProtein,
      targetFat: original.targetFat,
      targetCarbs: original.targetCarbs,
      status: PlanStatus.DRAFT,
      userId,
    });
    const savedPlan = await this.planRepo.save(newPlan);

    // 克隆子表
    for (const day of original.planDays || []) {
      const newDay = this.dayRepo.create({
        plan: savedPlan,
        dayNumber: day.dayNumber,
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
