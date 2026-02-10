import { defineStore } from "pinia";
import { 
  getDailyRecord, 
  addMealLog, 
  removeMealLog, 
  updateMealLog, 
  type DailyRecord, 
  type MealLog, 
  type RecordInfoResponse 
} from "@/services/modules/record";

export interface NutritionSummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const useRecordStore = defineStore("record", {
  state: () => ({
    currentRecord: null as DailyRecord | null,
    mealLogs: [] as MealLog[],
    isLoading: false,
    activeDate: "",
    recordsCache: new Map<string, RecordInfoResponse>(),
  }),

  getters: {
    /**
     * 基础数据加总 (带极致防御)
     */
    recordSummary(state): NutritionSummary {
      const logs = state.mealLogs || [];
      const res = { calories: 0, protein: 0, fat: 0, carbs: 0 };
      logs.forEach(log => {
        if (!log) return;
        res.calories += Number(log.calories) || 0;
        res.protein += Number(log.protein) || 0;
        res.fat += Number(log.fat) || 0;
        res.carbs += Number(log.carbs) || 0;
      });
      return res;
    },

    /**
     * 对外展示格式化数据
     */
    displaySummary(): NutritionSummary {
      const sum = this.recordSummary;
      return {
        calories: Math.round(sum.calories),
        protein: Number(sum.protein.toFixed(1)),
        fat: Number(sum.fat.toFixed(1)),
        carbs: Number(sum.carbs.toFixed(1)),
      };
    },

    /**
     * 达成率百分比
     */
    achievementRatios(state): NutritionSummary {
      const sum = this.recordSummary;
      const target = state.currentRecord;
      if (!target) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
      
      const calc = (cur: number, goal: number) => {
        if (!goal || goal <= 0) return 0;
        return Math.min(100, Math.round((cur / goal) * 100));
      };

      return {
        calories: calc(sum.calories, target.targetCalories),
        protein: calc(sum.protein, target.targetProtein),
        fat: calc(sum.fat, target.targetFat),
        carbs: calc(sum.carbs, target.targetCarbs),
      };
    }
  },

  actions: {
    async fetchRecord(date: string, options: { silent?: boolean } = {}) {
      console.log(`[Store] Fetching record for: ${date}`);
      this.activeDate = date;
      if (!options.silent) this.isLoading = true;
      try {
        const res = await getDailyRecord(date);
        this.currentRecord = res.record;
        this.mealLogs = res.meals || [];
        this.recordsCache.set(date, res);
      } catch (error) {
        console.error("[Store] Fetch Error", error);
      } finally {
        this.isLoading = false;
      }
    },

    async addMealLogAction(data: any) {
      console.log("[Store] Adding log...", data);
      const newLog = await addMealLog(data);
      if (this.mealLogs) {
        this.mealLogs = [...this.mealLogs, newLog];
      }
      return newLog;
    },

    async updateMealAction(id: string | number, data: { quantity: number }) {
      console.log(`[Store] Updating log ${id}...`, data);
      const updated = await updateMealLog(id, data);
      const idx = this.mealLogs.findIndex(m => String(m.id) === String(id));
      if (idx > -1) {
        this.mealLogs[idx] = updated;
        // 强制触发响应式更新
        this.mealLogs = [...this.mealLogs];
        console.log("[Store] Update Success");
      }
      return updated;
    },

    async removeMealAction(id: string | number) {
      console.log(`[Store] Removing log ${id}...`);
      await removeMealLog(id);
      this.mealLogs = this.mealLogs.filter(m => String(m.id) !== String(id));
      console.log("[Store] Remove Success");
    },

    clearRecord() {
      this.currentRecord = null;
      this.mealLogs = [];
      this.activeDate = "";
    }
  }
});
