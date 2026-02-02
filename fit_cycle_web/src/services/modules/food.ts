/**
 * 食材服务
 * 提供食材搜索、同步等相关API接口调用
 */

import { httpRequest } from "../http";
import { PageResponse } from "../http/types";

/**
 * 食材类型
 */
export enum FoodType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

/**
 * 食材分类
 */
export enum FoodCategory {
  PROTEIN = 'protein',
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  GRAINS = 'grains',
  DAIRY = 'dairy',
  NUTS = 'nuts',
  OILS = 'oils',
  SNACKS = 'snacks',
  CUSTOM = 'custom',
}

/**
 * 食材定义
 */
export interface FoodItem {
  id: number | string;
  name: string;
  type: FoodType;
  userId?: number | string;
  category: FoodCategory;
  description?: string;
  imageUrl?: string;
  isPublic: boolean;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  unit: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 食材查询参数
 */
export interface QueryFoodItemParams {
  q?: string;
  category?: FoodCategory;
  page?: number;
  pageSize?: number;
}

/**
 * 分页搜索食材
 */
export async function searchFoodItems(params: QueryFoodItemParams): Promise<{
  total: number;
  page: number;
  pageSize: number;
  items: FoodItem[];
}> {
  return httpRequest.get("/food-items", params);
}

/**
 * 获取食材详情
 */
export async function getFoodItemDetail(id: number | string): Promise<FoodItem> {
  return httpRequest.get(`/food-items/${id}`);
}

/**
 * 同步系统食材
 * @param foodData 
 */
export async function syncSystemFoods(foodData: any[]): Promise<{ count: number }> {
  return httpRequest.post("/food-items/sync", foodData);
}

/**
 * 创建自定义食材
 */
export async function createFoodItem(data: Partial<FoodItem>): Promise<FoodItem> {
  return httpRequest.post("/food-items", data);
}

/**
 * 更新自定义食材
 */
export async function updateFoodItem(id: number | string, data: Partial<FoodItem>): Promise<FoodItem> {
  return httpRequest.put(`/food-items/${id}`, data);
}

