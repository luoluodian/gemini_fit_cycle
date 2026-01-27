/**
 * 记录服务
 * 提供饮食记录相关的API接口调用
 */

import { httpRequest } from "../http";

/**
 * 计划信息
 */
export interface PlanInfo {
  planId: string;
  planName: string;
  currentDay: number;
  cycleDays: number;
  recordId: string;
}

/**
 * 营养目标
 */
export interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/**
 * 餐次食物详情
 */
export interface MealFoodDetail {
  mealFoodId: string;
  foodId: string;
  foodName: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  consumedAmount: number;
  baseUnit: string;
  baseCount?: number;
  isRecorded: number;
  isPlanned: number;
}

/**
 * 餐次记录
 */
export interface MealRecord {
  meal_type: string;
  meal_type_label: string;
  details: MealFoodDetail[];
}

/**
 * 记录信息响应
 */
export interface RecordInfoResponse {
  date: string;
  plan: PlanInfo;
  nutritionGoals: NutritionGoals;
  mealRecords: MealRecord[];
}

/**
 * 获取记录信息
 */
export async function getRecordInfo(date?: string): Promise<RecordInfoResponse> {
  return httpRequest.get("/api/record/getInfo", { date });
}


