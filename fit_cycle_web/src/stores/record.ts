import { defineStore } from "pinia";
import { getDailyRecord, addMealLog, removeMealLog, type DailyRecord, type MealLog, type RecordInfoResponse } from "@/services/modules/record";

/**
 * 营养统计汇总接口
 */
export interface NutritionSummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/**
 * 达成率百分比接口
 */
export interface NutritionRatios {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const useRecordStore = defineStore("record", {
  state: () => ({
    // 当前正在展示的数据
    currentRecord: null as DailyRecord | null,
    mealLogs: [] as MealLog[],
    isLoading: false,
    activeDate: "",
    
    // I-4.3: 内存缓存，提升回溯速度
    recordsCache: new Map<string, RecordInfoResponse>(),
  }),

  getters: {
    recordSummary(state): NutritionSummary {
      const logs = state.mealLogs || [];
      return logs.reduce(
        (acc, log) => {
          acc.calories += Number(log.calories) || 0;
          acc.protein += Number(log.protein) || 0;
          acc.fat += Number(log.fat) || 0;
          acc.carbs += Number(log.carbs) || 0;
          return acc;
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
      );
    },

    achievementRatios(state): NutritionRatios {
      const summary = this.recordSummary;
      const target = state.currentRecord;
      if (!target) return { calories: 0, protein: 0, fat: 0, carbs: 0 };

      const calcRatio = (consumed: number, goal: number) => {
        if (!goal || goal <= 0) return 0;
        return Math.min(100, Math.round((consumed / goal) * 100));
      };

      return {
        calories: calcRatio(summary.calories, target.targetCalories),
        protein: calcRatio(summary.protein, target.targetProtein),
        fat: calcRatio(summary.fat, target.targetFat),
        carbs: calcRatio(summary.carbs, target.targetCarbs),
      };
    },

    displaySummary(): NutritionSummary {
      const sum = this.recordSummary;
      return {
        calories: Math.round(sum.calories),
        protein: Number(sum.protein.toFixed(1)),
        fat: Number(sum.fat.toFixed(1)),
        carbs: Number(sum.carbs.toFixed(1)),
      };
    }
  },

  actions: {
    /**
     * I-4.3: 极速获取数据逻辑
     * 策略：本地缓存优先展示 -> 静默网络更新 -> 覆盖并存入缓存
     */
    async fetchRecord(date: string, options: { silent?: boolean } = {}) {
      const requestDate = date;
      this.activeDate = date;

      // 1. 检查缓存 (实现秒开)
      if (this.recordsCache.has(date)) {
        const cached = this.recordsCache.get(date)!;
        this.currentRecord = cached.record;
        this.mealLogs = cached.meals;
        // 如果已有缓存，强制转为静默模式，防止闪烁
        options.silent = true;
      }

      if (!options.silent) this.isLoading = true;

      try {
        const res = await getDailyRecord(date);
        
        // 时序校验：若返回时日期已切换，则丢弃
        if (requestDate !== this.activeDate) return;

        // 2. 数据洗净与状态同步
        const normalizedRecord = {
          ...res.record,
          targetCalories: Number(res.record.targetCalories) || 0,
          targetProtein: Number(res.record.targetProtein) || 0,
          targetFat: Number(res.record.targetFat) || 0,
          targetCarbs: Number(res.record.targetCarbs) || 0,
        };
        
        this.currentRecord = normalizedRecord;
        this.mealLogs = res.meals || [];

        // 3. 更新缓存
        this.recordsCache.set(date, { record: normalizedRecord, meals: res.meals || [] });

      } catch (error) {
        console.error("Fetch record error:", error);
        if (requestDate === this.activeDate && !options.silent) this.clearRecord();
        throw error;
      } finally {
        if (requestDate === this.activeDate) this.isLoading = false;
      }
    },

    /**
     * 更新操作后同步更新缓存 (I-4.2/I-4.3 并网)
     */
    syncToCache(date: string) {
      if (this.currentRecord) {
        this.recordsCache.set(date, { 
          record: this.currentRecord, 
          meals: [...this.mealLogs] 
        });
      }
    },

    async addMealLogAction(data: { date: string; mealType: string; foodId: number; quantity: number }) {
      try {
        const newLog = await addMealLog(data);
        if (this.currentRecord?.id) {
          this.mealLogs = [...this.mealLogs, newLog];
          this.syncToCache(data.date);
        } else {
          await this.fetchRecord(data.date, { silent: true });
        }
        return newLog;
      } catch (error) {
        throw error;
      }
    },

    async removeMealAction(id: number) {
      try {
        await removeMealLog(id);
        const date = this.activeDate;
        this.mealLogs = this.mealLogs.filter(m => m.id !== id);
        this.syncToCache(date);
      } catch (error) {
        throw error;
      }
    },

    /**
     * 计划变更时，必须清空所有缓存，防止预览目标过期 (I-4.3 重要对策)
     */
    invalidateAllCache() {
      this.recordsCache.clear();
      if (this.activeDate) {
        this.fetchRecord(this.activeDate, { silent: true });
      }
    },

    clearRecord() {
      this.currentRecord = null;
      this.mealLogs = [];
      this.activeDate = "";
    }
  },
});