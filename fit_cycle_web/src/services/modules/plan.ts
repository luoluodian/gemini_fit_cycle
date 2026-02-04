import { httpRequest as http } from '@/services/http';
import { DietPlan, CreatePlanDto } from '@/types/plan';

export const planService = {
  /**
   * 获取计划列表
   */
  getPlans(params?: { status?: string }) {
    return http.get<DietPlan[]>('/diet-plans', { params });
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

     * 导入计划

     */

    importPlan(shareCode: string) {

      return http.post<{ id: number }>('/diet-plans/import', { shareCode });

    },

  

    /**

     * 批量保存计划模板

     */

    savePlanTemplates(id: number, data: { templates: any[] }) {

      return http.post<{ success: boolean }>(`/diet-plans/${id}/templates`, data);

    }

  };

  