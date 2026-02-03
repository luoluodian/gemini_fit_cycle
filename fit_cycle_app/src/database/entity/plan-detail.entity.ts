import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { DietPlan } from './diet-plan.entity';
import { FoodItem } from './food-item.entity';

/**
 * 计划详情表：饮食计划的每日详细食物安排
 */
@Entity({
  name: 'plan_details',
  comment: '计划详情表 - 饮食计划的每日详细食物安排',
})
@Index(['planId', 'dayNumber'])
@Unique(['planId', 'dayNumber', 'mealType', 'foodId'])
export class PlanDetail {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'plan_id', type: 'bigint', unsigned: true })
  planId: number;

  @ManyToOne(() => DietPlan, (plan) => plan.planDays, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: DietPlan;

  @Column({ name: 'day_number', type: 'int' })
  dayNumber: number;

  @Column({ name: 'meal_type', length: 20 })
  mealType: string;

  @Column({ name: 'food_id', type: 'bigint', unsigned: true })
  foodId: number;

  @ManyToOne(() => FoodItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'food_id' })
  food: FoodItem;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  quantity: number;

  @Column({ length: 20, default: 'g' })
  unit: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}