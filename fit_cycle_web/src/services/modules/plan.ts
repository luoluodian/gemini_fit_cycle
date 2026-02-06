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

    }

  };

  