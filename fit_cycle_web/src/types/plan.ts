export type PlanStatus = 'active' | 'paused' | 'completed' | 'archived';
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
  
  // UI related fields (computed or optional)
  progress?: number;
}

export interface CreatePlanDto {
  name: string;
  type: PlanType;
  description?: string;
  cycleDays?: number;
  cycleCount?: number;
  startDate?: string;
}
