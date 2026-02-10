import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { DailyRecord } from '@/database/entity/daily-record.entity';
import { MealLog, MealType } from '@/database/entity/meal-log.entity';
import { FoodItem } from '@/database/entity/food-item.entity';
import { DietPlan } from '@/database/entity/diet-plan.entity';
import { DietPlansService } from '../diet-plans/diet-plans.service';
import { UserService } from '../user/user.service';
import { CreateMealLogDto } from '@/dtos/create-meal-log.dto';
import { UpdateMealLogDto } from '@/dtos/update-meal-log.dto';
import { SyncMealDto } from '@/dtos/sync-meal.dto';

export interface RecordInfoResponse {
  record: Partial<DailyRecord>;
  meals: MealLog[];
}

@Injectable()
export class DietRecordsService {
  constructor(
    @InjectRepository(DailyRecord)
    private readonly dailyRecordRepo: Repository<DailyRecord>,
    @InjectRepository(MealLog)
    private readonly mealLogRepo: Repository<MealLog>,
    @InjectRepository(FoodItem)
    private readonly foodItemRepo: Repository<FoodItem>,
    @InjectRepository(DietPlan)
    private readonly planRepo: Repository<DietPlan>,
    private readonly dietPlansService: DietPlansService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async getDailyRecordView(userId: number, date: string): Promise<RecordInfoResponse> {
    const record = await this.dailyRecordRepo.findOne({
      where: { userId, date },
      relations: ['meals'],
    });
    if (record) return { record, meals: record.meals };
    return this.calculateDefaultRecord(userId, date);
  }

  /**
   * 最终加固：使用原生 QueryBuilder 插入，彻底封堵 user_id 丢失问题
   */
  async addMealLog(userId: number, dto: CreateMealLogDto) {
    const { date, foodId, quantity, mealType } = dto;
    const food = await this.foodItemRepo.findOne({ where: { id: foodId } });
    if (!food) throw new BadRequestException(`食材不存在`);

    return await this.dataSource.transaction(async (manager) => {
      const record = await this.getOrCreateDailyRecord(manager, userId, date);
      const ratio = quantity / 100;
      
      // 🚀 核心修复：原生 SQL 插入
      const result = await manager.createQueryBuilder()
        .insert()
        .into(MealLog)
        .values({
          userId: userId, // 显式匹配字段名
          recordId: record.id,
          mealType: mealType,
          foodId: foodId,
          foodName: food.name,
          quantity: quantity,
          unit: food.unit || 'g',
          calories: Math.round(food.calories * ratio),
          protein: Number((food.protein * ratio).toFixed(4)),
          fat: Number((food.fat * ratio).toFixed(4)),
          carbs: Number((food.carbs * ratio).toFixed(4)),
          baseCalories: food.calories,
          baseProtein: food.protein,
          baseFat: food.fat,
          baseCarbs: food.carbs,
          isPlanned: false
        })
        .execute();

      const newId = result.identifiers[0].id;
      return await manager.findOne(MealLog, { where: { id: newId } });
    });
  }

  async syncMealFromPlan(userId: number, dto: SyncMealDto) {
    const { date, mealType } = dto;
    const activePlan = await this.planRepo.findOne({
      where: { userId, status: 'active' as any },
      relations: { planDays: { planMeals: { mealType: true, mealItems: true } } }
    });

    if (!activePlan || !activePlan.startDate) throw new BadRequestException('无激活计划');
    const dayOffset = this.getDateDiff(activePlan.startDate, date);
    const targetDayNum = (dayOffset % activePlan.cycleDays) + 1;
    const planDay = activePlan.planDays?.find(d => d.dayNumber === targetDayNum);
    const planMeal = planDay?.planMeals?.find(m => m.mealType?.code === mealType);
    const items = planMeal?.mealItems || [];

    if (items.length === 0) return [];

    return await this.dataSource.transaction(async (manager) => {
      const record = await this.getOrCreateDailyRecord(manager, userId, date);
      const logs = items.map(item => ({
        userId,
        recordId: record.id,
        mealType: mealType as MealType,
        foodName: item.customName || '计划食物',
        quantity: Number(item.quantity),
        unit: item.unit || 'g',
        calories: Math.round(Number(item.calories) || 0),
        protein: Number(item.protein) || 0,
        fat: Number(item.fat) || 0,
        carbs: Number(item.carbs) || 0,
        baseCalories: Math.round((Number(item.calories) || 0) / (Number(item.quantity) / 100)),
        baseProtein: item.protein, // 简化处理
        baseFat: item.fat,
        baseCarbs: item.carbs,
        isPlanned: true
      }));

      const res = await manager.createQueryBuilder().insert().into(MealLog).values(logs).execute();
      return await manager.find(MealLog, { where: { id: In(res.identifiers.map(i => i.id)) } });
    });
  }

  private async getOrCreateDailyRecord(manager: any, userId: number, date: string): Promise<DailyRecord> {
    let record = await manager.findOne(DailyRecord, { where: { userId, date } });
    if (!record) {
      const preview = await this.calculateDefaultRecord(userId, date);
      const res = await manager.createQueryBuilder().insert().into(DailyRecord).values({
        userId, date, 
        targetCalories: preview.record.targetCalories,
        targetProtein: preview.record.targetProtein,
        targetFat: preview.record.targetFat,
        targetCarbs: preview.record.targetCarbs,
        planId: preview.record.planId
      }).execute();
      record = await manager.findOne(DailyRecord, { where: { id: res.identifiers[0].id } });
    }
    return record;
  }

  async updateMealLog(userId: number, id: number, dto: UpdateMealLogDto) {
    const log = await this.mealLogRepo.findOne({ where: { id, userId } });
    if (!log) throw new NotFoundException('记录不存在');
    if (dto.quantity !== undefined) {
      const ratio = dto.quantity / 100;
      log.quantity = dto.quantity;
      log.calories = Math.round(log.baseCalories * ratio);
    }
    return await this.mealLogRepo.save(log);
  }

  async removeMealLog(userId: number, id: number) {
    // 采用原生删除，确保鉴权与物理物理 ID 匹配
    const result = await this.mealLogRepo
      .createQueryBuilder()
      .delete()
      .from(MealLog)
      .where("id = :id AND user_id = :userId", { id, userId })
      .execute();

    if (result.affected === 0) throw new NotFoundException('记录不存在');
    return { success: true };
  }

  private async calculateDefaultRecord(userId: number, date: string): Promise<RecordInfoResponse> {
    const activePlan = await this.dietPlansService.findActivePlan(userId);
    // 初始值全为 0，不再猜测用户目标
    const defaultData: RecordInfoResponse = {
      record: { id: undefined, userId, date, targetCalories: 0, targetProtein: 0, targetFat: 0, targetCarbs: 0, planId: undefined },
      meals: [],
    };

    if (activePlan && activePlan.startDate && date >= activePlan.startDate) {
      const dayOffset = this.getDateDiff(activePlan.startDate, date);
      const targetDayNum = (dayOffset % activePlan.cycleDays) + 1;
      const planDay = activePlan.planDays?.find(d => d.dayNumber === targetDayNum);
      if (planDay) {
        Object.assign(defaultData.record, {
          targetCalories: planDay.targetCalories,
          targetProtein: planDay.targetProtein,
          targetFat: planDay.targetFat,
          targetCarbs: planDay.targetCarbs,
          planId: activePlan.id
        });
        return defaultData;
      }
    }

    // 若无计划，尝试从个人档案获取 BMR/TDEE
    const user = await this.userService.findUserById(userId);
    if (user && user.healthProfile) {
      const profile = user.healthProfile;
      const tdee = profile.tdee || (profile.bmr ? Math.round(profile.bmr * 1.2) : 0);
      if (tdee > 0) {
        defaultData.record.targetCalories = tdee;
        defaultData.record.targetProtein = Number((tdee * 0.25 / 4).toFixed(1));
        defaultData.record.targetFat = Number((tdee * 0.25 / 9).toFixed(1));
        defaultData.record.targetCarbs = Number((tdee * 0.5 / 4).toFixed(1));
      }
    }
    return defaultData;
  }

  private getDateDiff(start: string, end: string): number {
    const s = new Date(start); const e = new Date(end);
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  }
}
