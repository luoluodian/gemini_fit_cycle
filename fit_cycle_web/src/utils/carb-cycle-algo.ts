/**
 * 碳循环核心算法工具
 */

export interface CarbPhaseConfig {
  days: number;
  proteinRatio: number;
  carbRatio: number;
  fatRatio: number;
}

export interface CarbCycleConfig {
  weight: number;
  cycleDays: number;
  baseRatios: {
    protein: number;
    carbs: number;
    fat: number;
  };
  phases: {
    high: CarbPhaseConfig;
    medium: CarbPhaseConfig;
    low: CarbPhaseConfig;
  };
}

export const CALORIES_PER_GRAM = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
};

/**
 * 计算碳循环每日分配结果
 */
export function calculateCarbCycle(config: CarbCycleConfig) {
  const { weight, cycleDays, baseRatios, phases } = config;

  // 1. 计算周期总营养素预算
  const totalProtein = weight * baseRatios.protein * cycleDays;
  const totalCarbs = weight * baseRatios.carbs * cycleDays;
  const totalFat = weight * baseRatios.fat * cycleDays;

  // 2. 计算加权系数总和
  const getWeightedSum = (ratioKey: keyof CarbPhaseConfig) => {
    return (
      (phases.high[ratioKey] || 0) * (phases.high.days || 0) +
      (phases.medium[ratioKey] || 0) * (phases.medium.days || 0) +
      (phases.low[ratioKey] || 0) * (phases.low.days || 0)
    );
  };

  const pWeightedSum = getWeightedSum('proteinRatio');
  const cWeightedSum = getWeightedSum('carbRatio');
  const fWeightedSum = getWeightedSum('fatRatio');

  const totalAllocatedDays = phases.high.days + phases.medium.days + phases.low.days;
  const isBalanced = totalAllocatedDays === cycleDays;

  const phaseResults: Record<string, any> = {};
  const sequence: any[] = [];

  // 3. 计算各阶段每日具体值
  (['high', 'medium', 'low'] as const).forEach(phaseKey => {
    const pConfig = phases[phaseKey];
    const days = pConfig.days || 0;

    if (days > 0) {
      const p = pWeightedSum > 0 ? Math.round((totalProtein / pWeightedSum) * pConfig.proteinRatio) : 0;
      const c = cWeightedSum > 0 ? Math.round((totalCarbs / cWeightedSum) * pConfig.carbRatio) : 0;
      const f = fWeightedSum > 0 ? Math.round((totalFat / fWeightedSum) * pConfig.fatRatio) : 0;
      const cal = p * CALORIES_PER_GRAM.PROTEIN + c * CALORIES_PER_GRAM.CARBS + f * CALORIES_PER_GRAM.FAT;

      phaseResults[phaseKey] = {
        type: phaseKey,
        protein: p,
        carbs: c,
        fat: f,
        calories: cal,
        days
      };

      for (let i = 0; i < days; i++) {
        sequence.push({ ...phaseResults[phaseKey] });
      }
    } else {
      phaseResults[phaseKey] = { type: phaseKey, protein: 0, carbs: 0, fat: 0, calories: 0, days: 0 };
    }
  });

  return {
    isBalanced,
    summary: {
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      totalCalories: Math.round(
        totalProtein * CALORIES_PER_GRAM.PROTEIN + 
        totalCarbs * CALORIES_PER_GRAM.CARBS + 
        totalFat * CALORIES_PER_GRAM.FAT
      )
    },
    phaseResults,
    sequence
  };
}
