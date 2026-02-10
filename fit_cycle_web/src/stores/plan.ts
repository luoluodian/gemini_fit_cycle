import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from './user';
import { useRecordStore } from './record';

export const usePlanStore = defineStore('plan', () => {
  const userStore = useUserStore();
  const recordStore = useRecordStore();

  // 当前激活的计划数据 (实际开发中由 getActivePlan 获取)
  const activePlan = ref<any>(null);

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
  const templates = ref<any[]>([]);

  const resetDraft = () => {
    draft.value = {
      name: "", type: "custom", setActive: true, cycleDays: 7, cycleCount: 3, templates: [],
      carbCycleConfig: {
        weight: 70, baseRatios: { protein: 2.0, carbs: 3.0, fat: 0.8 },
        phases: {
          high: { days: 2, proteinRatio: 1.0, carbRatio: 1.5, fatRatio: 0.7 },
          medium: { days: 3, proteinRatio: 1.0, carbRatio: 1.0, fatRatio: 1.0 },
          low: { days: 2, proteinRatio: 1.0, carbRatio: 0.5, fatRatio: 1.3 },
        },
      },
    };
    currentDayIndex.value = 0;
    currentMealType.value = "";
    templates.value = [];
    recordStore.invalidateAllCache();
  };

  /**
   * I-4.5: 根据日期获取匹配的日模板
   */
  const getTemplateByDate = (dateStr: string) => {
    if (!activePlan.value || !activePlan.value.startDate) return null;
    if (dateStr < activePlan.value.startDate) return null;

    const s = new Date(activePlan.value.startDate);
    const e = new Date(dateStr);
    const dayOffset = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    const targetDayNum = (dayOffset % activePlan.value.cycleDays) + 1;

    return activePlan.value.planDays?.find((d: any) => d.dayNumber === targetDayNum) || null;
  };

  const initTemplates = (sequence?: any[]) => {
    const list = [];
    const isCarbCycle = draft.value.type === "carb-cycle";
    
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

    const tdee = userStore.healthProfile?.tdee || 0;
    const initialTargets = tdee > 0 ? {
      calories: Math.round(tdee),
      protein: Math.round(tdee * 0.25 / 4),
      fat: Math.round(tdee * 0.25 / 9),
      carbs: Math.round(tdee * 0.5 / 4)
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

  const onPlanUpdated = () => {
    recordStore.invalidateAllCache();
  };

  return { 
    activePlan,
    draft, 
    resetDraft, 
    initTemplates, 
    onPlanUpdated,
    getTemplateByDate,
    templates, 
    currentDayIndex, 
    currentMealType 
  };
});
