/**
 * 营养学核心计算工具
 */
export class NutritionUtil {
  /** 营养系数：1g蛋白质 = 4kcal, 1g脂肪 = 9kcal, 1g碳水 = 4kcal */
  static readonly COEFFICIENTS = {
    PROTEIN: 4,
    FAT: 9,
    CARBS: 4,
  };

  /** 默认基准重量 */
  static readonly DEFAULT_BASE_COUNT = 100;

  /**
   * 根据摄入量计算最终营养素
   * 公式：(当前量 / 基准量) * 基准营养素
   */
  static calculate(
    baseValue: number,
    quantity: number,
    baseCount: number = this.DEFAULT_BASE_COUNT,
  ): number {
    if (!baseCount || baseCount <= 0) return 0;
    return (quantity / baseCount) * (baseValue || 0);
  }

  /**
   * 计算理论热量
   * 公式：P*4 + F*9 + C*4
   */
  static calculateTheoreticalCalories(
    protein: number,
    fat: number,
    carbs: number,
  ): number {
    return (
      (protein || 0) * this.COEFFICIENTS.PROTEIN +
      (fat || 0) * this.COEFFICIENTS.FAT +
      (carbs || 0) * this.COEFFICIENTS.CARBS
    );
  }

  /**
   * 格式化保留位（通常用于蛋白质/脂肪/碳水）
   */
  static format(val: number, decimals: number = 4): number {
    return Number(Number(val || 0).toFixed(decimals));
  }
}
