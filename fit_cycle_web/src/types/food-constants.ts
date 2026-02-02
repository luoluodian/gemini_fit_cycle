/**
 * 食材相关类型定义
 */

export enum FoodType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

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
  baseCount: number;
  tags?: string[];
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryFoodItemParams {
  q?: string;
  category?: FoodCategory;
  page?: number;
  pageSize?: number;
}
