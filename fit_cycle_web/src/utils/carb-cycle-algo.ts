import { 
  PhaseConfig, 
  BaseRatios, 
  PhaseResult, 
  CarbCycleInput, 
  CarbCycleOutput 
} from '../../docs/pj_docs/P-7/P-7_分析报告.md'; // This import won't work in TS, I'll define interfaces locally

export interface AlgoPhaseConfig {
  days: number;
  proteinRatio: number;
  carbRatio: number;
  fatRatio: number;
}

export interface AlgoBaseRatios {
  protein: number;
  carbs: number;
  fat: number;
}

export interface AlgoPhaseResult {
  type: 'high' | 'medium' | 'low';
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface AlgoCarbCycleInput {
  weight: number;
  cycleDays: number;
  baseRatios: AlgoBaseRatios;
  phases: Record<'high' | 'medium' | 'low', AlgoPhaseConfig>;
}

export interface AlgoCarbCycleOutput {
  isBalanced: boolean;
  summary: {
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalCalories: number;
  };
  phaseResults: Record<'high' | 'medium' | 'low', AlgoPhaseResult>;
  sequence: AlgoPhaseResult[];
}

const CALORIES_PER_GRAM = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
};

/**
 * 碳循环核心分配算法
 * 
 * 公式说明：
 * 1. 周期总营养素 = 体重 * 基准比例 * 周期天数
 * 2. 某阶段每日克数 = (周期总营养素 / 系数总和) * 该阶段系数 / 阶段天数
 * 3. 热量 = 取整后的克数 * 能值换算系数
 */
export function calculateCarbCycleDistribution(input: AlgoCarbCycleInput): AlgoCarbCycleOutput {
  const { weight, cycleDays, baseRatios, phases } = input;

  // 1. 计算周期总营养素预算
  const totalProtein = weight * baseRatios.protein * cycleDays;
  const totalCarbs = weight * baseRatios.carbs * cycleDays;
  const totalFat = weight * baseRatios.fat * cycleDays;

  // 2. 计算各营养素的系数总和
  const sumProteinRatio = phases.high.proteinRatio + phases.medium.proteinRatio + phases.low.proteinRatio;
  const sumCarbRatio = phases.high.carbRatio + phases.medium.carbRatio + phases.low.lowCarbRatio !== undefined ? 0 : phases.low.carbRatio; // Just ensuring we have the correct keys
  // Actually, let's use the keys from the input directly
  const getSum = (key: keyof AlgoPhaseConfig) => 
    (phases.high[key] as number) + (phases.medium[key] as number) + (phases.low[key] as number);

  const pRatioSum = getSum('proteinRatio');
  const cRatioSum = getSum('carbRatio');
  const fRatioSum = getSum('fatRatio');

  const totalAllocatedDays = phases.high.days + phases.medium.days + phases.low.days;
  const isBalanced = totalAllocatedDays === cycleDays;

  const result: AlgoCarbCycleOutput = {
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
    phaseResults: {
      high: { type: 'high', protein: 0, carbs: 0, fat: 0, calories: 0 },
      medium: { type: 'medium', protein: 0, carbs: 0, fat: 0, calories: 0 },
      low: { type: 'low', protein: 0, carbs: 0, fat: 0, calories: 0 }
    },
    sequence: []
  };

  // 3. 计算各阶段每日具体值
  (['high', 'medium', 'low'] as const).forEach(phaseKey => {
    const config = phases[phaseKey];
    if (config.days === 0) return;

    // 计算克数并取整
    const p = pRatioSum > 0 ? Math.round((totalProtein / pRatioSum) * config.proteinRatio / config.days) : 0;
    const c = cRatioSum > 0 ? Math.round((totalCarbs / cRatioSum) * config.carbRatio / config.days) : 0;
    const f = fRatioSum > 0 ? Math.round((totalFat / fRatioSum) * config.fatRatio / config.days) : 0;
    
    // 根据取整后的克数计算热量
    const cal = p * CALORIES_PER_GRAM.PROTEIN + c * CALORIES_PER_GRAM.CARBS + f * CALORIES_PER_GRAM.FAT;

    result.phaseResults[phaseKey] = {
      type: phaseKey,
      protein: p,
      carbs: c,
      fat: f,
      calories: cal
    };
  });

  // 4. 生成序列
  (['high', 'medium', 'low'] as const).forEach(phaseKey => {
    const config = phases[phaseKey];
    for (let i = 0; i < config.days; i++) {
      result.sequence.push({ ...result.phaseResults[phaseKey] });
    }
  });

  return result;
}
