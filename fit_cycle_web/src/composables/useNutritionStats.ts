import { storeToRefs } from "pinia";
import { useRecordStore } from "@/stores/record";

/**
 * 营养统计逻辑组合式函数
 * 提供跨页面的统一计算门面
 */
export function useNutritionStats() {
  const store = useRecordStore();
  const { 
    currentRecord, 
    mealLogs, 
    isLoading, 
    displaySummary, 
    achievementRatios 
  } = storeToRefs(store);

  /**
   * 按餐次过滤明细
   */
  const getMealsByType = (type: string) => {
    return mealLogs.value.filter(m => m.mealType === type);
  };

  /**
   * 获取特定营养素的展示文本 (如 "120.5 / 200g")
   */
  const getNutritionText = (key: 'protein' | 'fat' | 'carbs') => {
    const consumed = displaySummary.value[key];
    const targetKey = `target${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof currentRecord.value;
    const target = currentRecord.value ? currentRecord.value[targetKey] : 0;
    return `${consumed} / ${target}g`;
  };

  return {
    // 状态
    currentRecord,
    mealLogs,
    isLoading,
    
    // 计算结果
    summary: displaySummary,
    ratios: achievementRatios,
    
    // 工具方法
    getMealsByType,
    getNutritionText,
    fetchRecord: store.fetchRecord,
    clearRecord: store.clearRecord
  };
}
