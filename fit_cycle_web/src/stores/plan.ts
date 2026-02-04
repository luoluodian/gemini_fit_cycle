import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePlanStore = defineStore('plan', () => {
  // 正在创建的计划草稿
  const draft = ref({
    name: "",
    type: "custom",
    setActive: true,
    cycleDays: 7,
    cycleCount: 3,
    templates: [] as any[],
    carbCycleConfig: {
      weight: 70,
      baseRatios: { protein: 2.0, carbs: 3.0, fat: 0.8 },
      phases: {
        high: { days: 2, proteinRatio: 1.0, carbRatio: 1.5, fatRatio: 0.7 },
        medium: { days: 3, proteinRatio: 1.0, carbRatio: 1.0, fatRatio: 1.0 },
        low: { days: 2, proteinRatio: 1.0, carbRatio: 0.5, fatRatio: 1.3 },
      },
    },
  });

  const currentDayIndex = ref(0);
  const currentMealType = ref("");

  const resetDraft = () => {
    draft.value = {
      name: "",
      type: "custom",
      setActive: true,
      cycleDays: 7,
      cycleCount: 3,
      templates: [],
      carbCycleConfig: {
        weight: 70,
        baseRatios: { protein: 2.0, carbs: 3.0, fat: 0.8 },
        phases: {
          high: { days: 2, proteinRatio: 1.0, carbRatio: 1.5, fatRatio: 0.7 },
          medium: { days: 3, proteinRatio: 1.0, carbRatio: 1.0, fatRatio: 1.0 },
          low: { days: 2, proteinRatio: 1.0, carbRatio: 0.5, fatRatio: 1.3 },
        },
      },
    };
    currentDayIndex.value = 0;
    currentMealType.value = "";
  };

  const initTemplates = () => {
    const list = [];
    const defaultCals = draft.value.type === "carb-cycle" ? 1800 : 2000;
    
    // 如果是常规计划，只初始化第一天，让用户手动添加/复制到 cycleDays
    // 如果是碳循环，通常需要完整初始化（后续由 P-8 算法覆盖）
    const initialCount = draft.value.type === "carb-cycle" ? draft.value.cycleDays : 1;

    for (let i = 0; i < initialCount; i++) {
      list.push({
        tempId: "temp_" + Date.now() + i,
        targetCalories: defaultCals,
        protein: 120,
        fat: 50,
        carbs: 180,
        isConfigured: false,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        },
        carbType:
          draft.value.type === "carb-cycle"
            ? i < 2
              ? "high"
              : i < 5
                ? "medium"
                : "low"
            : "medium",
      });
    }
    draft.value.templates = list;
  };

  const batchUpdateTargets = (targets: { calories: number, protein: number, fat: number, carbs: number }) => {
    draft.value.templates.forEach(temp => {
      temp.targetCalories = targets.calories;
      temp.protein = targets.protein;
      temp.fat = targets.fat;
      temp.carbs = targets.carbs;
      temp.isConfigured = true;
    });
  };

  const addTemplate = () => {
    draft.value.templates.push({
      tempId: 'temp_' + Date.now(),
      targetCalories: 2000,
      protein: 120,
      fat: 50,
      carbs: 180,
      isConfigured: false,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      carbType: 'medium'
    });
  };

  const copyTemplate = (index: number) => {
    const source = JSON.parse(JSON.stringify(draft.value.templates[index]));
    source.tempId = "temp_" + Date.now();
    // 优化命名：如果已有名称，增加(复)后缀且不重复叠加；如果没有名称则保持空
    if (source.name) {
      if (!source.name.includes("(复)")) {
        source.name = source.name.substring(0, 4) + "(复)";
      }
    } else {
      source.name = "";
    }
    draft.value.templates.push(source);
  };

  const deleteTemplate = (index: number) => {
    draft.value.templates.splice(index, 1);
  };

  return { draft, resetDraft, initTemplates, batchUpdateTargets, addTemplate, copyTemplate, deleteTemplate };
});
