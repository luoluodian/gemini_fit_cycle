/**
 * 营养学计算工具
 */

/** 营养系数：1g蛋白质=4kcal, 1g脂肪=9kcal, 1g碳水=4kcal */
export const NUTRITION_COEFFICIENTS = {
  PROTEIN: 4,
  FAT: 9,
  CARBS: 4,
};

export interface MacroResult {
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
}

/**
 * 根据摄入量动态计算营养素比例
 * @param quantity 用户选择的量
 * @param base 基准量 (默认100)
 * @param baseValues 原始营养单价
 */
export function calculateMacros(
  quantity: number,
  base: number = 100,
  baseValues: { calories: number; protein: number; fat: number; carbs: number }
): MacroResult {
  const ratio = quantity / (base || 100);
  return {
    calories: Math.round(baseValues.calories * ratio),
    protein: (baseValues.protein * ratio).toFixed(1),
    fat: (baseValues.fat * ratio).toFixed(1),
    carbs: (baseValues.carbs * ratio).toFixed(1),
  };
}

/**
 * 计算理论热量
 */
export function getTheoreticalCalories(p: number, f: number, c: number): number {
  return Math.round(
    p * NUTRITION_COEFFICIENTS.PROTEIN +
    f * NUTRITION_COEFFICIENTS.FAT +
    c * NUTRITION_COEFFICIENTS.CARBS
  );
}
