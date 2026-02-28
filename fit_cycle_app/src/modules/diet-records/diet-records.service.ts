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
  plannedDay?: any; // 🚀 新增：当日匹配的计划模板
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
    let record = await this.dailyRecordRepo.findOne({
      where: { userId, date },
      relations: ['meals', 'plan'],
    });

    // 🚀 核心优化：如果已有记录但关联计划与当前激活计划不一致 (针对"今天")
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    if (record && date === today) {
      const activePlan = await this.dietPlansService.findActivePlan(userId);
      // 使用字符串比较兼容 bigint
      if (activePlan && String(record.planId) !== String(activePlan.id)) {
        const updatedPreview = await this.calculateDefaultRecord(userId, date);
        if (updatedPreview.record.planId && String(updatedPreview.record.planId) === String(activePlan.id)) {
          // 更新现有记录的目标快照
          await this.dailyRecordRepo.update(record.id, {
            targetCalories: updatedPreview.record.targetCalories,
            targetProtein: updatedPreview.record.targetProtein,
            targetFat: updatedPreview.record.targetFat,
            targetCarbs: updatedPreview.record.targetCarbs,
            planId: activePlan.id
          });
          // 重新查询以获得最新数据
          record = await this.dailyRecordRepo.findOne({
            where: { id: record.id },
            relations: ['meals', 'plan']
          });
        }
      }
    }

    if (record) {
      const res: RecordInfoResponse = { record, meals: record.meals };
      // 即使已有记录，也要根据 planId 补全当日模板信息
      if (record.planId && record.plan?.startDate && date >= record.plan.startDate) {
        const plan = await this.planRepo.findOne({
          where: { id: record.planId },
          relations: { planDays: { planMeals: { mealType: true, mealItems: true } } }
        });
        if (plan) {
          const dayOffset = this.getDateDiff(plan.startDate, date);
          const totalDays = plan.cycleDays * plan.cycleCount;
          // 🚀 核心修复：只有在计划有效期内才下发模板建议
          if (dayOffset < totalDays) {
            const targetDayNum = (dayOffset % plan.cycleDays) + 1;
            res.plannedDay = plan.planDays?.find(d => d.dayNumber === targetDayNum);
          }
        }
      }
      return res;
    }
    
    return this.calculateDefaultRecord(userId, date);
  }

  async addMealLog(userId: number, dto: CreateMealLogDto) {
    const { date, foodId, quantity, mealType, isPlanned } = dto;
    
    let foodData: any = {};
    
    if (foodId) {
      const food = await this.foodItemRepo.findOne({ where: { id: foodId } });
      if (!food) throw new BadRequestException(`食材不存在`);
      const ratio = quantity / (food.baseCount || 100);
      foodData = {
        foodId,
        foodName: food.name,
        unit: food.unit || 'g',
        baseCount: food.baseCount || 100,
        calories: Math.round(food.calories * ratio),
        protein: Number((food.protein * ratio).toFixed(4)),
        fat: Number((food.fat * ratio).toFixed(4)),
        carbs: Number((food.carbs * ratio).toFixed(4)),
        baseCalories: food.calories,
        baseProtein: food.protein,
        baseFat: food.fat,
        baseCarbs: food.carbs,
      };
    } else {
      // 如果没有 foodId，则使用传入的快照数据 (针对计划项)
      foodData = {
        foodId: null,
        foodName: dto.foodName || '自定义食材',
        unit: dto.unit || 'g',
        baseCount: dto.baseCount || 100,
        calories: Number(dto.calories) || 0,
        protein: Number(dto.protein) || 0,
        fat: Number(dto.fat) || 0,
        carbs: Number(dto.carbs) || 0,
        baseCalories: Number(dto.calories) || 0, // 对于自定义，基准设为当前
        baseProtein: Number(dto.protein) || 0,
        baseFat: Number(dto.fat) || 0,
        baseCarbs: Number(dto.carbs) || 0,
      };
    }

    return await this.dataSource.transaction(async (manager) => {
      const record = await this.getOrCreateDailyRecord(manager, userId, date);
      
      const result = await manager.createQueryBuilder()
        .insert()
        .into(MealLog)
        .values({
          userId: userId,
          recordId: record.id,
          mealType: mealType,
          isPlanned: isPlanned ?? false,
          isRecorded: true,
          ...foodData,
          quantity: quantity,
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

    // 🚀 核心优化：同时支持标准 code 和自定义 ID 查找
    const planMeal = planDay?.planMeals?.find(m => {
      const code = m.mealType?.code;
      const customId = `custom_${m.id}`;
      return code === mealType || customId === mealType;
    });
    
    const items = planMeal?.mealItems || [];

    if (items.length === 0) return [];

    return await this.dataSource.transaction(async (manager) => {
      const record = await this.getOrCreateDailyRecord(manager, userId, date);
      
      // 🚀 核心纠偏：过滤掉该餐次已存在的记录（基于名称或 ID）
      const existingMeals = await manager.find(MealLog, { where: { recordId: record.id, mealType: mealType as any } });
      const filteredItems = items.filter(item => {
        const pName = item.customName || '计划食物';
        return !existingMeals.some(em => 
          em.foodName === pName
        );
      });

      if (filteredItems.length === 0) return [];

              const logs = filteredItems.map(item => ({
                userId,
                recordId: record.id,
                mealType: mealType as any,
                foodId: item.foodItemId,
                foodName: item.customName || '计划食物',
                quantity: Number(item.quantity),
                unit: item.unit || 'g',
                calories: Math.round(Number(item.calories) || 0),
                protein: Number(item.protein) || 0,
                fat: Number(item.fat) || 0,
                carbs: Number(item.carbs) || 0,
                baseCalories: Math.round((Number(item.calories) || 0) / (Number(item.quantity) / 100)),
                baseProtein: item.protein,
                baseFat: item.fat,
                baseCarbs: item.carbs,
                isPlanned: true,
                isRecorded: true
              }));
      const res = await manager.createQueryBuilder().insert().into(MealLog).values(logs).execute();
      return await manager.find(MealLog, { where: { id: In(res.identifiers.map(i => i.id)) } });
    });
  }

  private async getOrCreateDailyRecord(manager: any, userId: number, date: string): Promise<DailyRecord> {
    const record = await manager.findOne(DailyRecord, { where: { userId, date } });
    if (record) return record;

    const preview = await this.calculateDefaultRecord(userId, date);
    try {
      const res = await manager.createQueryBuilder().insert().into(DailyRecord).values({
        userId, date, 
        targetCalories: preview.record.targetCalories,
        targetProtein: preview.record.targetProtein,
        targetFat: preview.record.targetFat,
        targetCarbs: preview.record.targetCarbs,
        planId: preview.record.planId
      }).execute();
      return await manager.findOne(DailyRecord, { where: { id: res.identifiers[0].id } });
    } catch (e) {
      // 如果插入冲突（并发请求），则重新查询已存在的记录
      if (e.message.includes('Duplicate entry') || e.code === 'ER_DUP_ENTRY') {
        return await manager.findOne(DailyRecord, { where: { userId, date } });
      }
      throw e;
    }
  }

  async updateMealLog(userId: number, id: number | string, dto: UpdateMealLogDto) {
    const log = await this.mealLogRepo.findOne({ where: { id: id as any, userId } });
    if (!log) throw new NotFoundException('记录不存在');
    
    if (dto.quantity !== undefined) {
      const ratio = dto.quantity / (log.baseCount || 100);
      log.quantity = dto.quantity;
      log.calories = Math.round(log.baseCalories * ratio);
      log.protein = Number((log.baseProtein * ratio).toFixed(4));
      log.fat = Number((log.baseFat * ratio).toFixed(4));
      log.carbs = Number((log.baseCarbs * ratio).toFixed(4));
      
      // 策略：人工修改克数后，默认回滚为未记录状态
      log.isRecorded = false;
    }

    // 🚀 核心补全：允许显式通过打卡动作恢复状态
    if (dto.isRecorded !== undefined) {
      log.isRecorded = dto.isRecorded;
    }

    return await this.mealLogRepo.save(log);
  }

  async removeMealLog(userId: number, id: number | string) {
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
    const activePlan = await this.planRepo.findOne({
      where: { userId, status: 'active' as any },
      relations: { planDays: { planMeals: { mealType: true, mealItems: true } } }
    });

    const defaultData: RecordInfoResponse = {
      record: { id: undefined, userId, date, targetCalories: 0, targetProtein: 0, targetFat: 0, targetCarbs: 0, planId: undefined },
      meals: [],
    };

    if (activePlan && activePlan.startDate && date >= activePlan.startDate) {
      const dayOffset = this.getDateDiff(activePlan.startDate, date);
      const totalDays = activePlan.cycleDays * activePlan.cycleCount;

      if (dayOffset < totalDays) {
        const targetDayNum = (dayOffset % activePlan.cycleDays) + 1;
        const planDay = activePlan.planDays?.find(d => d.dayNumber === targetDayNum);
        if (planDay) {
          Object.assign(defaultData.record, {
            targetCalories: planDay.targetCalories,
            targetProtein: planDay.targetProtein,
            targetFat: planDay.targetFat,
            targetCarbs: planDay.targetCarbs,
            planId: activePlan.id,
            plan: activePlan
          });
          defaultData.plannedDay = planDay; // 🚀 补全模板
          return defaultData;
        }
      }
    }

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
    const s = new Date(start);
    const e = new Date(end);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  }
}