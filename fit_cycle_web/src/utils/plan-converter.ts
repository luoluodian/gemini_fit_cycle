/**
 * 计划数据转换工具
 * 负责将前端的响应式草稿结构转换为后端 DTO 格式
 */

export const MEAL_TYPE_MAP: Record<string, number> = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snacks: 4,
};

/**
 * 将前端 templates 转换为后端 PlanDayTemplateDto[]
 */
export function convertTemplatesToDto(templates: any[]) {
  return templates.map((temp, index) => {
    const mealsArray: any[] = [];

    // 处理标准餐次与自定义餐次
    // 前端 meals 结构: { breakfast: [], custom_123: [], ... }
    // 前端 mealOrder 结构: ['breakfast', 'lunch', ...]
    const order = temp.mealOrder || ['breakfast', 'lunch', 'dinner', 'snacks'];

    order.forEach((mealKey: string) => {
      const foods = temp.meals[mealKey] || [];
      if (foods.length === 0) return; // 过滤空餐次

      mealsArray.push({
        mealTypeId: MEAL_TYPE_MAP[mealKey] || 4, // 默认归类为“其他/加餐”
        note: temp.customLabels?.[mealKey] || "", // 将自定义名称存入备注，方便后端识别
        items: foods.map((f: any) => ({
          customName: f.name,
          quantity: f.quantity,
          unit: f.unit,
          calories: f.calories,
          protein: f.protein,
          fat: f.fat,
          carbs: f.carbs,
        })),
      });
    });

    return {
      dayNumber: index + 1,
      carbType: temp.carbType,
      targetCalories: temp.targetCalories,
      targetProtein: temp.protein,
      targetFat: temp.fat,
      targetCarbs: temp.carbs,
      meals: mealsArray,
    };
  });
}
