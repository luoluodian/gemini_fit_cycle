import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { DailyRecord } from '@/database/entity/daily-record.entity';
import { MealLog, MealType } from '@/database/entity/meal-log.entity';
import { FoodItem } from '@/database/entity/food-item.entity';
import { DietPlan } from '@/database/entity/diet-plan.entity';
import { DataDictionary } from '@/database/entity/data-dictionary.entity';
import { DietPlansService } from '../diet-plans/diet-plans.service';
import { FoodItemsService } from '../food-items/food-items.service';
import { UserService } from '../user/user.service';
import { CreateMealLogDto } from '@/dtos/create-meal-log.dto';
import { UpdateMealLogDto } from '@/dtos/update-meal-log.dto';
import { SyncMealDto } from '@/dtos/sync-meal.dto';
import { NutritionUtil } from '@/common/utils/nutrition.util';

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
    private readonly foodItemsService: FoodItemsService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async getDailyRecordView(userId: number, date: string): Promise<RecordInfoResponse> {
    let record = await this.dailyRecordRepo.findOne({
      where: { userId, date },
      relations: ['meals', 'plan', 'meals.foodItem'],
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

  /**
   * 🚀 审计修复：物理维度校验
   * 确保录入单位与食材定义维度一致（如不能用毫升量鸡蛋）
   */
  private async validateUnitDimension(food: FoodItem, inputUnitCode: string) {
    // 1. 获取原材单位维度
    const baseUnit = await this.dailyRecordRepo.manager.findOne(DataDictionary, {
      where: { category: 'unit', code: food.unit }
    });
    // 2. 获取输入单位维度
    const inputUnit = await this.dailyRecordRepo.manager.findOne(DataDictionary, {
      where: { category: 'unit', code: inputUnitCode }
    });

    if (baseUnit && inputUnit) {
      const baseDim = baseUnit.extInfo?.dimension;
      const inputDim = inputUnit.extInfo?.dimension;
      if (baseDim && inputDim && baseDim !== inputDim) {
        throw new BadRequestException(`单位维度不匹配: 食材定义为 ${baseDim}, 录入为 ${inputDim}`);
      }
    }
  }

  async addMealLog(userId: number, dto: CreateMealLogDto) {
    const { date, foodId, quantity, mealType, isPlanned } = dto;
    
    let foodData: any = {};
    
    if (foodId) {
      const food = await this.foodItemRepo.findOne({ where: { id: foodId } });
      if (!food) throw new BadRequestException(`食材不存在`);
      
      // 🚀 执行维度校验
      if (dto.unit) {
        await this.validateUnitDimension(food, dto.unit);
      }

      const bc = food.baseCount || NutritionUtil.DEFAULT_BASE_COUNT;
      foodData = {
        foodId,
        foodName: food.name,
        unit: food.unit || 'g',
        baseCount: bc,
        calories: Math.round(NutritionUtil.calculate(food.calories, quantity, bc)),
        protein: NutritionUtil.format(NutritionUtil.calculate(food.protein, quantity, bc)),
        fat: NutritionUtil.format(NutritionUtil.calculate(food.fat, quantity, bc)),
        carbs: NutritionUtil.format(NutritionUtil.calculate(food.carbs, quantity, bc)),
        baseCalories: food.calories,
        baseProtein: food.protein,
        baseFat: food.fat,
        baseCarbs: food.carbs,
        sourceUpdatedAt: food.updatedAt,
      };
    } else {
      // 如果没有 foodId，则使用传入的快照数据 (针对计划项或手动输入)
      // 🚀 审计修复：对手动输入的自定义记录执行物理守恒与热量校验
      const bc = dto.baseCount || NutritionUtil.DEFAULT_BASE_COUNT;
      const p = Number(dto.protein || 0);
      const f = Number(dto.fat || 0);
      const c = Number(dto.carbs || 0);
      const cal = Number(dto.calories || 0);

      if (p + f + c > bc) {
        throw new BadRequestException(`自定义记录物理数值不合理: 三大营养素之和(${p+f+c}g)超过了基准量(${bc}g)`);
      }

      const theoretical = NutritionUtil.calculateTheoreticalCalories(p, f, c);
      const threshold = Math.max(theoretical * 0.2, 30);
      if (cal < theoretical - threshold || cal > theoretical + threshold) {
        throw new BadRequestException(
          `自定义记录热量数值不合理: 录入 ${cal}kcal, 理论计算约 ${Math.round(theoretical)}kcal.`
        );
      }

      foodData = {
        foodId: null,
        foodName: dto.foodName || '自定义食材',
        unit: dto.unit || 'g',
        baseCount: bc,
        calories: cal,
        protein: p,
        fat: f,
        carbs: c,
        baseCalories: cal, // 对于自定义，基准设为当前
        baseProtein: p,
        baseFat: f,
        baseCarbs: c,
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

      if (foodId) {
        await this.foodItemsService.adjustReferenceCount(manager, foodId, 1);
      }

      const newId = result.identifiers[0].id;
      return await manager.findOne(MealLog, { where: { id: newId } });
    });
  }

  async syncMealFromPlan(userId: number, dto: SyncMealDto) {
    const { date, mealType } = dto;
    const activePlan = await this.planRepo.findOne({
      where: { userId, status: 'active' as any },
      relations: { planDays: { planMeals: { mealType: true, mealItems: { foodItem: true } } } }
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

      const logs = filteredItems.map(item => {
        const bc = item.foodItem?.baseCount || NutritionUtil.DEFAULT_BASE_COUNT;
        const qty = Number(item.quantity);
        const cal = Number(item.calories) || 0;
        const p = Number(item.protein) || 0;
        const f = Number(item.fat) || 0;
        const c = Number(item.carbs) || 0;

        return {
          userId,
          recordId: record.id,
          mealType: mealType as any,
          foodId: item.foodItemId,
          foodName: item.customName || '计划食物',
          quantity: qty,
          unit: item.unit || 'g',
          calories: Math.round(cal),
          protein: p,
          fat: f,
          carbs: c,
          // 逆向计算基准营养单价并快照
          baseCalories: Math.round(NutritionUtil.calculate(cal, bc, qty)),
          baseProtein: NutritionUtil.format(NutritionUtil.calculate(p, bc, qty)),
          baseFat: NutritionUtil.format(NutritionUtil.calculate(f, bc, qty)),
          baseCarbs: NutritionUtil.format(NutritionUtil.calculate(c, bc, qty)),
          baseCount: bc,
          isPlanned: true,
          isRecorded: true,
          sourceUpdatedAt: item.foodItem?.updatedAt
        };
      });

      // Increment reference counts
      for (const log of logs) {
        if (log.foodId) {
          await this.foodItemsService.adjustReferenceCount(manager, log.foodId, 1);
        }
      }

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
    
    if (dto.baseCalories !== undefined) log.baseCalories = dto.baseCalories;
    if (dto.baseProtein !== undefined) log.baseProtein = dto.baseProtein;
    if (dto.baseFat !== undefined) log.baseFat = dto.baseFat;
    if (dto.baseCarbs !== undefined) log.baseCarbs = dto.baseCarbs;
    if (dto.sourceUpdatedAt !== undefined) log.sourceUpdatedAt = dto.sourceUpdatedAt;

    if (dto.quantity !== undefined || dto.baseCalories !== undefined) {
      const targetQty = dto.quantity ?? log.quantity;
      const bc = log.baseCount || NutritionUtil.DEFAULT_BASE_COUNT;
      
      log.quantity = targetQty;
      log.calories = Math.round(NutritionUtil.calculate(log.baseCalories, targetQty, bc));
      log.protein = NutritionUtil.format(NutritionUtil.calculate(log.baseProtein, targetQty, bc));
      log.fat = NutritionUtil.format(NutritionUtil.calculate(log.baseFat, targetQty, bc));
      log.carbs = NutritionUtil.format(NutritionUtil.calculate(log.baseCarbs, targetQty, bc));
      
      // 策略：人工修改或同步后，默认回滚为未记录状态（除非明确指定）
      if (dto.isRecorded === undefined) {
        log.isRecorded = false;
      }
    }

    // 🚀 核心补全：允许显式通过打卡动作恢复状态
    if (dto.isRecorded !== undefined) {
      log.isRecorded = dto.isRecorded;
    }

    return await this.mealLogRepo.save(log);
  }

  async removeMealLog(userId: number, id: number | string) {
    const log = await this.mealLogRepo.findOne({ where: { id: id as any, userId } });
    if (!log) throw new NotFoundException('记录不存在');

    return await this.dataSource.transaction(async (manager) => {
      if (log.foodId) {
        await this.foodItemsService.adjustReferenceCount(manager, log.foodId, -1);
      }
      await manager.remove(log);
      return { success: true };
    });
  }

  private async calculateDefaultRecord(userId: number, date: string): Promise<RecordInfoResponse> {
    const activePlan = await this.planRepo.findOne({
      where: { userId, status: 'active' as any },
      relations: { planDays: { planMeals: { mealType: true, mealItems: { foodItem: true } } } }
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