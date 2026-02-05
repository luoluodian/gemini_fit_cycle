import { httpRequest } from "../http";
import { FoodCategory, FoodType } from "../../types/food-constants";
import type { FoodItem, QueryFoodItemParams } from "../../types/food-constants";

export { FoodCategory, FoodType };
export type { FoodItem, QueryFoodItemParams };

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

/**
 * 获取热门食材
 */
export async function getPopularFoodItems(category?: string, type?: string): Promise<FoodItem[]> {
  const params: any = {};
  if (category) params.category = category;
  if (type) params.type = type;
  return httpRequest.get("/food-items/popular", params);
}

/**
 * 删除自定义食材
 */
export async function deleteFoodItem(id: number | string): Promise<void> {
  return httpRequest.delete(`/food-items/${id}`);
}

/**
 * 收藏食材
 */
export async function favoriteFood(id: number | string): Promise<void> {
  return httpRequest.post(`/food-items/${id}/favorite`);
}

/**
 * 取消收藏食材
 */
export async function unfavoriteFood(id: number | string): Promise<void> {
  return httpRequest.delete(`/food-items/${id}/favorite`);
}

