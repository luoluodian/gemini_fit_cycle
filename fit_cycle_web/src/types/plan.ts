export type PlanStatus = 'active' | 'paused' | 'completed' | 'archived' | 'draft' | 'configured';
export type PlanType = 'fat-loss' | 'muscle-gain' | 'maintenance' | 'custom' | 'carb-cycle';

export interface DietPlan {
  id: number;
  userId: number;
  name: string;
  description?: string;
  type: PlanType;
  status: PlanStatus;
  isTemplate: boolean;
  cycleDays: number;
  cycleCount: number;
  startDate?: string;
  carbCycleConfig?: any;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  planDays?: PlanDay[];
  
  // UI related fields (computed or optional)
  progress?: number;
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
}

export interface PlanDay {
  id: number;
  planId: number;
  dayNumber: number;
  name?: string;
  carbType?: 'high' | 'medium' | 'low';
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
  isConfigured: boolean;
  planMeals?: PlanMeal[];
}

export interface PlanMeal {
  id: number;
  planDayId: number;
  mealTypeId: number;
  mealType?: {
    id: number;
    name: string;
    code: string;
  };
  scheduledTime?: string;
  note?: string;
  mealItems?: PlanMealItem[];
}

export interface PlanMealItem {
  id: number;
  planMealId: number;
  foodId?: number;
  customName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sortOrder: number;
}

export interface CreatePlanDto {
  name: string;
  type: PlanType;
  description?: string;
  cycleDays?: number;
  cycleCount?: number;
  startDate?: string;
}
