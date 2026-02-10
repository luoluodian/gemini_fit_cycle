import { defineStore } from "pinia";
import { getDailyRecord, type DailyRecord, type MealLog } from "@/services/modules/record";

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
    // 当日记录总表快照
    currentRecord: null as DailyRecord | null,
    // 当日餐食明细列表
    mealLogs: [] as MealLog[],
    // 全局加载状态
    isLoading: false,
    // 当前正在查看的日期
    activeDate: "",
  }),

  getters: {
    /**
     * 基础汇总层：对明细进行单次 reduce 扫描
     * 保持 4 位小数精度，供内部计算使用
     */
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

    /**
     * 达成率百分比层：结合目标值计算
     * 包含除零防御
     */
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

    /**
     * 展示级汇总：取整处理
     */
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
     * 获取并设置记录数据
     * 执行数据洗净 (Data Sanitization)
     */
    async fetchRecord(date: string) {
      this.isLoading = true;
      this.activeDate = date;
      try {
        const res = await getDailyRecord(date);
        
        // 强制类型转换，防御后端可能的非法数据
        this.currentRecord = {
          ...res.record,
          targetCalories: Number(res.record.targetCalories) || 0,
          targetProtein: Number(res.record.targetProtein) || 0,
          targetFat: Number(res.record.targetFat) || 0,
          targetCarbs: Number(res.record.targetCarbs) || 0,
        };
        
        this.mealLogs = res.meals || [];
      } catch (error) {
        console.error("Fetch record error:", error);
        this.clearRecord();
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 重置状态
     */
    clearRecord() {
      this.currentRecord = null;
      this.mealLogs = [];
    },

    /**
     * 更新单条记录 (用于 R-3 后的乐观更新)
     */
    updateLocalLogs(newLogs: MealLog[]) {
      this.mealLogs = [...newLogs];
    }
  },
});
