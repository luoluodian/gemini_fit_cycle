/**
 * 食材域公共类型定义
 */

export type FoodCategoryKey = 
  | 'all' 
  | 'protein' 
  | 'vegetables' 
  | 'fruits' 
  | 'grains' 
  | 'dairy' 
  | 'nuts' 
  | 'oils' 
  | 'snacks' 
  | 'custom';

export interface FoodCategoryItem {
  key: FoodCategoryKey;
  label: string;
  emoji: string;
}

export interface Nutrients {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

export interface FoodItem extends Nutrients {
  id: number | string;
  name: string;
  category: FoodCategoryKey;
  unit: string;
  baseCount: number; // 基础份量 (e.g. 100g)
  isCustom?: boolean;
  isPublic?: boolean;
  tags?: string[];
  description?: string;
}

export interface SelectedFoodItem extends FoodItem {
  quantity: number; // 用户选择的数量
}

// 用于组件 Props 的简化展示接口
export interface FoodDisplayProps {
  name: string;
  unit: string;
  baseCount?: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  tags?: string[];
}
