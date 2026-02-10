/**
 * 饮食记录服务 (Record Domain)
 * 基于 V7 全链路持久化架构重构
 */

import { httpRequest } from "../http";

/**
 * 每日记录总表快照 (对齐后端 DailyRecord 实体)
 */
export interface DailyRecord {
  id: number | null;
  userId: number;
  date: string;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  planId: number | null;
}

/**
 * 餐食记录明细 (对齐后端 MealLog 实体)
 */
export interface MealLog {
  id: number;
  recordId: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  foodId: number | null;
  foodName: string;
  customName: string | null;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  isPlanned: boolean;
  isRecorded: boolean;
}

/**
 * 首页仪表盘聚合响应结构 (R-2)
 */
export interface RecordInfoResponse {
  record: DailyRecord;
  meals: MealLog[];
}

/**
 * 获取指定日期的饮食记录
 * 契约：GET /records/:date
 */
export async function getDailyRecord(date: string): Promise<RecordInfoResponse> {
  return httpRequest.get(`/records/${date}`);
}

/**
 * 添加餐食记录 (R-3)
 */
export async function addMealLog(data: {
  date: string;
  mealType: string;
  foodId: number;
  quantity: number;
}): Promise<MealLog> {
  return httpRequest.post('/records/meal', data);
}

/**
 * 按计划同步餐食记录 (R-6)
 */
export async function syncMealFromPlan(data: {
  date: string;
  mealType: string;
}): Promise<MealLog[]> {
  return httpRequest.post('/records/meal/sync', data);
}

/**
 * 更新餐食记录 (R-3)
 */
export async function updateMealLog(
  id: number | string,
  data: { quantity: number },
): Promise<MealLog> {
  return httpRequest.put(`/records/meal/${id}`, data);
}

/**
 * 删除餐食记录 (R-3)
 */
export async function removeMealLog(id: number): Promise<any> {
  return httpRequest.delete(`/records/meal/${id}`);
}