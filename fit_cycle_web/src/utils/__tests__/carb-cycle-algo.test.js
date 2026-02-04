/**
 * Test Suite for Carb Cycle Algorithm
 * This script validates the mathematical integrity and business rules of the distribution logic.
 */

function calculateCarbCycleDistribution(input) {
  const { weight, cycleDays, baseRatios, phases } = input;
  const CALORIES_PER_GRAM = { PROTEIN: 4, CARBS: 4, FAT: 9 };

  const totalProtein = weight * baseRatios.protein * cycleDays;
  const totalCarbs = weight * baseRatios.carbs * cycleDays;
  const totalFat = weight * baseRatios.fat * cycleDays;

  const getSum = (key) => phases.high[key] + phases.medium[key] + phases.low[key];
  const pRatioSum = getSum('proteinRatio');
  const cRatioSum = getSum('carbRatio');
  const fRatioSum = getSum('fatRatio');

  const totalAllocatedDays = phases.high.days + phases.medium.days + phases.low.days;
  const isBalanced = totalAllocatedDays === cycleDays;

  const result = {
    isBalanced,
    summary: {
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat)
    },
    phaseResults: {},
    sequence: []
  };

  ['high', 'medium', 'low'].forEach(phaseKey => {
    const config = phases[phaseKey];
    if (config.days === 0) {
        result.phaseResults[phaseKey] = { type: phaseKey, protein: 0, carbs: 0, fat: 0, calories: 0 };
        return;
    }
    const p = pRatioSum > 0 ? Math.round((totalProtein / pRatioSum) * config.proteinRatio / config.days) : 0;
    const c = cRatioSum > 0 ? Math.round((totalCarbs / cRatioSum) * config.carbRatio / config.days) : 0;
    const f = fRatioSum > 0 ? Math.round((totalFat / fRatioSum) * config.fatRatio / config.days) : 0;
    const cal = p * CALORIES_PER_GRAM.PROTEIN + c * CALORIES_PER_GRAM.CARBS + f * CALORIES_PER_GRAM.FAT;
    result.phaseResults[phaseKey] = { type: phaseKey, protein: p, carbs: c, fat: f, calories: cal };
  });

  ['high', 'medium', 'low'].forEach(phaseKey => {
    for (let i = 0; i < phases[phaseKey].days; i++) {
      result.sequence.push({ ...result.phaseResults[phaseKey] });
    }
  });

  return result;
}

const tests = [
  {
    name: "Standard 7-day Cycle",
    input: {
      weight: 70,
      cycleDays: 7,
      baseRatios: { protein: 2.0, carbs: 3.0, fat: 0.8 },
      phases: {
        high: { days: 2, proteinRatio: 1.0, carbRatio: 1.5, fatRatio: 0.7 },
        medium: { days: 3, proteinRatio: 1.0, carbRatio: 1.0, fatRatio: 1.0 },
        low: { days: 2, proteinRatio: 1.0, carbRatio: 0.5, fatRatio: 1.3 }
      }
    },
    expected: (res) => res.isBalanced === true && res.sequence.length === 7
  },
  {
    name: "Imbalanced Days Check",
    input: {
      weight: 70,
      cycleDays: 7,
      baseRatios: { protein: 2.0, carbs: 3.0, fat: 0.8 },
      phases: {
        high: { days: 1, proteinRatio: 1.0, carbRatio: 1.5, fatRatio: 0.7 },
        medium: { days: 1, proteinRatio: 1.0, carbRatio: 1.0, fatRatio: 1.0 },
        low: { days: 1, proteinRatio: 1.0, carbRatio: 0.5, fatRatio: 1.3 }
      }
    },
    expected: (res) => res.isBalanced === false
  },
  {
    name: "Zero Weight Handling",
    input: {
      weight: 0,
      cycleDays: 7,
      baseRatios: { protein: 2.0, carbs: 3.0, fat: 0.8 },
      phases: {
        high: { days: 2, proteinRatio: 1.0, carbRatio: 1.5, fatRatio: 0.7 },
        medium: { days: 3, proteinRatio: 1.0, carbRatio: 1.0, fatRatio: 1.0 },
        low: { days: 2, proteinRatio: 1.0, carbRatio: 0.5, fatRatio: 1.3 }
      }
    },
    expected: (res) => res.phaseResults.high.calories === 0
  },
  {
    name: "Integrity Check: Calories Math",
    input: {
      weight: 85.5,
      cycleDays: 5,
      baseRatios: { protein: 2.2, carbs: 4.0, fat: 1.0 },
      phases: {
        high: { days: 1, proteinRatio: 1.0, carbRatio: 2.0, fatRatio: 0.5 },
        medium: { days: 2, proteinRatio: 1.0, carbRatio: 1.0, fatRatio: 1.0 },
        low: { days: 2, proteinRatio: 1.0, carbRatio: 0.5, fatRatio: 1.5 }
      }
    },
    expected: (res) => {
      const h = res.phaseResults.high;
      return h.calories === (h.protein * 4 + h.carbs * 4 + h.fat * 9);
    }
  }
];

console.log("--- STARTING P-7 ALGORITHM AUDIT ---");
let passed = 0;
tests.forEach(t => {
  const res = calculateCarbCycleDistribution(t.input);
  const ok = t.expected(res);
  console.log(`${ok ? '✅' : '❌'} ${t.name}`);
  if (ok) passed++;
});

console.log(`\nRESULT: ${passed}/${tests.length} PASSED`);
if (passed !== tests.length) process.exit(1);
