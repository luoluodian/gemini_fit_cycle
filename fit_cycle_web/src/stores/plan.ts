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
    templates: [] as any[]
  });

  const currentDayIndex = ref(0);
  const currentMealType = ref('');

  const resetDraft = () => {
    draft.value = {
      name: "",
      type: "custom",
      setActive: true,
      cycleDays: 7,
      cycleCount: 3,
      templates: []
    };
    currentDayIndex.value = 0;
    currentMealType.value = '';
  };

  const initTemplates = () => {
    const list = [];
    const defaultCals = draft.value.type === 'carb-cycle' ? 1800 : 2000;
    for (let i = 0; i < draft.value.cycleDays; i++) {
      list.push({
        tempId: 'temp_' + Date.now() + i,
        targetCalories: defaultCals,
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
        carbType: draft.value.type === 'carb-cycle' ? (i < 2 ? 'high' : i < 5 ? 'medium' : 'low') : 'medium'
      });
    }
    draft.value.templates = list;
  };

  return { draft, resetDraft, initTemplates };
});
