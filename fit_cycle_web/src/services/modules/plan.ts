import { httpRequest as http } from '@/services/http';
import { DietPlan, CreatePlanDto } from '@/types/plan';

export const planService = {
  /**
   * 获取计划列表
   */
  getPlans(params?: { status?: string; page?: number; limit?: number }) {
    return http.get<any>('/diet-plans', params);
  },

  /**
   * 获取推荐计划模板
   */
  getRecommendedPlans() {
    return http.get<DietPlan[]>('/diet-plans/recommended');
  },

  /**
   * 创建计划
   */
  createPlan(data: CreatePlanDto) {
    return http.post<{ id: number }>('/diet-plans', data);
  },

  /**
   * 获取计划详情
   */
  getPlanDetail(id: number) {
    return http.get<DietPlan>(`/diet-plans/${id}`);
  },

  /**
   * 更新计划
   */
  updatePlan(id: number, data: any) {
    return http.put(`/diet-plans/${id}`, data);
  },

  /**
   * 激活计划
   */
  activatePlan(id: number) {
    return http.post(`/diet-plans/${id}/activate`);
  },

  /**
   * 暂停计划
   */
  pausePlan(id: number) {
    return http.post(`/diet-plans/${id}/pause`);
  },

  /**
   * 删除计划
   */
  deletePlan(id: number) {
    return http.delete(`/diet-plans/${id}`);
  },

  /**
   * 分享计划 (生成分享码)
   */
  sharePlan(id: number) {
    return http.post<{ code: string; expireAt: string }>(`/diet-plans/${id}/share`);
  },

  /**
   * 导入计划
   */
  importPlan(code: string) {
    return http.post<{ id: number }>('/diet-plans/import', { code });
  },

  /**
   * 批量初始化计划天数
   */
  initPlanDays(id: number, data: { days: any[]; force?: boolean }) {
    return http.post<{ success: boolean; count: number }>(`/diet-plans/${id}/init-days`, data);
  },

  /**
   * 获取单日全量详情
   */
  getDayDetail(dayId: number) {
    return http.get<any>(`/diet-plans/days/${dayId}/detail`);
  },

  /**
   * 单日全量更新
   */
  updateDayFull(dayId: number, data: any) {
    return http.put<{ success: boolean }>(`/diet-plans/days/${dayId}/full-update`, data);
  },

  /**
   * 批量保存计划模板
   */
  savePlanTemplates(id: number, data: { templates: any[] }) {
    return http.post<{ success: boolean }>(`/diet-plans/${id}/templates`, data);
  },

  // --- 子资源管理 (Sub-resources) ---

  /**
   * 为计划新增计划日
   */
  createPlanDay(planId: number, data: any) {
    return http.post(`/diet-plans/${planId}/days`, data);
  },

  /**
   * 更新计划日
   */
  updatePlanDay(dayId: number, data: any) {
    return http.put(`/diet-plans/days/${dayId}`, data);
  },

  /**
   * 删除计划日
   */
  removePlanDay(dayId: number) {
    return http.delete(`/diet-plans/days/${dayId}`);
  },

  /**
   * 为计划日添加餐次
   */
  createPlanMeal(dayId: number, data: any) {
    return http.post(`/diet-plans/days/${dayId}/meals`, data);
  },

  /**
   * 更新计划餐次
   */
  updatePlanMeal(mealId: number, data: any) {
    return http.put(`/diet-plans/meals/${mealId}`, data);
  },

  /**
   * 删除计划餐次
   */
  removePlanMeal(mealId: number) {
    return http.delete(`/diet-plans/meals/${mealId}`);
  },

  /**
   * 为餐次添加食材明细
   */
  createPlanMealItem(mealId: number, data: any) {
    return http.post(`/diet-plans/meals/${mealId}/items`, data);
  },

  /**
   * 更新食材明细
   */
  updatePlanMealItem(itemId: number, data: any) {
    return http.put(`/diet-plans/meal-items/${itemId}`, data);
  },

  /**
   * 删除食材明细
   */
  removePlanMealItem(itemId: number) {
    return http.delete(`/diet-plans/meal-items/${itemId}`);
  },
};

  