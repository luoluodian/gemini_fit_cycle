import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DailyRecord } from '@/database/entity/daily-record.entity';
import { MealLog, MealType } from '@/database/entity/meal-log.entity';
import { FoodItem } from '@/database/entity/food-item.entity';
import { DietPlansService } from '../diet-plans/diet-plans.service';
import { HealthProfileService } from '../user/health-profile.service';
import { CreateMealLogDto } from '@/dtos/create-meal-log.dto';
import { UpdateMealLogDto } from '@/dtos/update-meal-log.dto';
import { SyncMealDto } from '@/dtos/sync-meal.dto';

@Injectable()
export class DietRecordsService {
  constructor(
    @InjectRepository(DailyRecord)
    private readonly dailyRecordRepo: Repository<DailyRecord>,
    @InjectRepository(MealLog)
    private readonly mealLogRepo: Repository<MealLog>,
    @InjectRepository(FoodItem)
    private readonly foodItemRepo: Repository<FoodItem>,
    private readonly dietPlansService: DietPlansService,
    private readonly healthProfileService: HealthProfileService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取指定日期的饮食记录视图 (R-2)
   */
  async getDailyRecordView(userId: number, date: string) {
    const record = await this.dailyRecordRepo.findOne({
      where: { userId, date },
      relations: ['meals'],
    });

    if (record) {
      return { record, meals: record.meals };
    }

    return this.calculateDefaultRecord(userId, date);
  }

  /**
   * 添加餐食记录 (R-3)
   */
  async addMealLog(userId: number, dto: CreateMealLogDto) {
    const { date, foodId, quantity, mealType } = dto;
    const food = await this.foodItemRepo.findOne({ where: { id: foodId } });
    if (!food) throw new BadRequestException(`食材 (ID: ${foodId}) 不存在`);

    return await this.dataSource.transaction(async (manager) => {
      const record = await this.getOrCreateDailyRecord(manager, userId, date);
      const ratio = quantity / 100;
      const mealLog = manager.create(MealLog, {
        userId,
        recordId: record.id,
        mealType,
        foodId,
        foodName: food.name,
        quantity,
        unit: food.unit || 'g',
        calories: Math.round(food.calories * ratio),
        protein: Number((food.protein * ratio).toFixed(4)),
        fat: Number((food.fat * ratio).toFixed(4)),
        carbs: Number((food.carbs * ratio).toFixed(4)),
        baseCalories: food.calories,
        baseProtein: food.protein,
        baseFat: food.fat,
        baseCarbs: food.carbs,
      });
      return await manager.save(mealLog);
    });
  }

  /**
   * 按计划快捷同步记录 (R-6)
   */
  async syncMealFromPlan(userId: number, dto: SyncMealDto) {
    const { date, mealType } = dto;
    
    // 1. 获取激活计划
    const activePlan = await this.dietPlansService.findActivePlan(userId);
    if (!activePlan || !activePlan.startDate) {
      throw new BadRequestException('当前没有激活中的饮食计划');
    }

    // 2. 定位当日模板
    if (date < activePlan.startDate) {
      throw new BadRequestException('查询日期早于计划开始日期');
    }
    const dayOffset = this.getDateDiff(activePlan.startDate, date);
    const targetDayNum = (dayOffset % activePlan.cycleDays) + 1;
    
    const planDay = activePlan.planDays?.find(d => d.dayNumber === targetDayNum);
    const planMeal = planDay?.planMeals?.find(m => m.mealType === mealType);
    const items = planMeal?.mealItems || [];

    // 3. 前置校验：若计划中该餐次没配食物，直接返回空
    if (items.length === 0) return [];

    // 4. 执行批量转换与落库
    return await this.dataSource.transaction(async (manager) => {
      const record = await this.getOrCreateDailyRecord(manager, userId, date);
      
      const newLogs = items.map(item => manager.create(MealLog, {
        userId,
        recordId: record.id,
        mealType: mealType as any,
        foodId: item.foodId,
        foodName: item.foodName || item.customName,
        quantity: item.quantity,
        unit: item.unit || 'g',
        calories: item.calories,
        protein: item.protein,
        fat: item.fat,
        carbs: item.carbs,
        baseCalories: item.baseCalories,
        baseProtein: item.baseProtein,
        baseFat: item.baseFat,
        baseCarbs: item.baseCarbs,
      }));

      return await manager.save(newLogs);
    });
  }

  /**
   * 内部方法：获取或创建每日记录总表 (R-3/R-6 共用)
   */
  private async getOrCreateDailyRecord(manager: any, userId: number, date: string): Promise<DailyRecord> {
    let record = await manager.findOne(DailyRecord, { where: { userId, date } });
    if (!record) {
      const preview = await this.calculateDefaultRecord(userId, date);
      const newRecord = manager.create(DailyRecord, {
        ...preview.record,
        id: undefined,
      });
      try {
        record = await manager.save(newRecord);
      } catch (e) {
        record = await manager.findOne(DailyRecord, { where: { userId, date } });
        if (!record) throw e;
      }
    }
    return record;
  }

  async updateMealLog(userId: number, id: number, dto: UpdateMealLogDto) {
    const log = await this.mealLogRepo.findOne({ where: { id, userId } });
    if (!log) throw new NotFoundException('记录不存在');
    if (dto.mealType) log.mealType = dto.mealType;
    if (dto.quantity !== undefined) {
      log.quantity = dto.quantity;
      const ratio = log.quantity / 100;
      log.calories = Math.round(log.baseCalories * ratio);
      log.protein = Number((log.baseProtein * ratio).toFixed(4));
      log.fat = Number((log.baseFat * ratio).toFixed(4));
      log.carbs = Number((log.baseCarbs * ratio).toFixed(4));
    }
    return await this.mealLogRepo.save(log);
  }

  async removeMealLog(userId: number, id: number) {
    const result = await this.mealLogRepo.delete({ id, userId });
    if (result.affected === 0) throw new NotFoundException('记录不存在');
    return { success: true };
  }

  private async calculateDefaultRecord(userId: number, date: string) {
    const activePlan = await this.dietPlansService.findActivePlan(userId);
    const defaultData = {
      record: { id: null, userId, date, targetCalories: 2000, targetProtein: 100, targetFat: 60, targetCarbs: 250, planId: null },
      meals: [],
    };

    if (activePlan && activePlan.startDate && date >= activePlan.startDate) {
      const dayOffset = this.getDateDiff(activePlan.startDate, date);
      const targetDayNum = (dayOffset % activePlan.cycleDays) + 1;
      const planDay = activePlan.planDays?.find(d => d.dayNumber === targetDayNum);
      if (planDay) {
        defaultData.record.targetCalories = planDay.targetCalories;
        defaultData.record.targetProtein = planDay.targetProtein;
        defaultData.record.targetFat = planDay.targetFat;
        defaultData.record.targetCarbs = planDay.targetCarbs;
        defaultData.record.planId = activePlan.id;
        return defaultData;
      }
    }

    const healthProfile = await this.healthProfileService.findByUserId(userId);
    if (healthProfile) {
      const bmr = healthProfile.bmr || 1500;
      defaultData.record.targetCalories = healthProfile.tdee || Math.round(bmr * 1.2);
      defaultData.record.targetProtein = Number((defaultData.record.targetCalories * 0.25 / 4).toFixed(2));
      defaultData.record.targetFat = Number((defaultData.record.targetCalories * 0.25 / 9).toFixed(2));
      defaultData.record.targetCarbs = Number((defaultData.record.targetCalories * 0.5 / 4).toFixed(2));
    }
    return defaultData;
  }

  private getDateDiff(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  }
}