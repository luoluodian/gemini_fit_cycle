import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from './user';

export const usePlanStore = defineStore('plan', () => {
  const userStore = useUserStore();

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

  const initTemplates = (sequence?: any[]) => {
    const list = [];
    const isCarbCycle = draft.value.type === "carb-cycle";
    
    // 如果有算法生成的序列 (碳循环模式)，直接使用
    if (isCarbCycle && sequence && sequence.length > 0) {
      draft.value.templates = sequence.map((item, i) => ({
        tempId: "temp_" + Date.now() + i,
        targetCalories: item.calories,
        targetProtein: item.protein,
        targetFat: item.fat,
        targetCarbs: item.carbs,
        isConfigured: true,
        carbType: item.type,
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      }));
      return;
    }

    // 常规模式初始化：尝试基于用户 TDEE 计算，否则为 0
    const tdee = userStore.healthProfile?.tdee || 0;
    const initialTargets = tdee > 0 ? {
      calories: Math.round(tdee),
      protein: Math.round(tdee * 0.25 / 4), // 25% 蛋白
      fat: Math.round(tdee * 0.25 / 9),     // 25% 脂肪
      carbs: Math.round(tdee * 0.5 / 4)     // 50% 碳水
    } : { calories: 0, protein: 0, fat: 0, carbs: 0 };

    const initialCount = isCarbCycle ? draft.value.cycleDays : 1;

    for (let i = 0; i < initialCount; i++) {
      list.push({
        tempId: "temp_" + Date.now() + i,
        targetCalories: initialTargets.calories,
        targetProtein: initialTargets.protein,
        targetFat: initialTargets.fat,
        targetCarbs: initialTargets.carbs,
        isConfigured: tdee > 0,
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
        carbType: "medium",
      });
    }
    draft.value.templates = list;
  };

  const batchUpdateTargets = (targets: { calories: number, protein: number, fat: number, carbs: number }) => {
    draft.value.templates.forEach(temp => {
      temp.targetCalories = targets.calories;
      temp.targetProtein = targets.protein;
      temp.targetFat = targets.fat;
      temp.targetCarbs = targets.carbs;
      temp.isConfigured = true;
    });
  };

  const addTemplate = () => {
    // 复用 initTemplates 中的逻辑计算默认值
    const tdee = userStore.healthProfile?.tdee || 0;
    draft.value.templates.push({
      tempId: 'temp_' + Date.now(),
      targetCalories: tdee > 0 ? Math.round(tdee) : 0,
      targetProtein: tdee > 0 ? Math.round(tdee * 0.25 / 4) : 0,
      targetFat: tdee > 0 ? Math.round(tdee * 0.25 / 9) : 0,
      targetCarbs: tdee > 0 ? Math.round(tdee * 0.5 / 4) : 0,
      isConfigured: tdee > 0,
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

  const updateTemplate = (index: number, data: any) => {
    if (draft.value.templates[index]) {
      draft.value.templates[index] = { ...draft.value.templates[index], ...data };
    }
  };

  const reorderTemplate = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= draft.value.templates.length) return;
    const item = draft.value.templates.splice(fromIndex, 1)[0];
    draft.value.templates.splice(toIndex, 0, item);
  };

  return { draft, resetDraft, initTemplates, batchUpdateTargets, addTemplate, copyTemplate, deleteTemplate, updateTemplate, reorderTemplate };
});
