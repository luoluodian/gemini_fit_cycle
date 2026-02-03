import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanDay } from './plan-day.entity';
import { DataDictionary } from './data-dictionary.entity';
import { PlanMealItem } from './plan-meal-item.entity';

/**
 * 计划餐次表：定义计划中每天的餐次安排。
 */
@Entity({ name: 'plan_meals' })
export class PlanMeal {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number; // 计划餐次主键ID

  @Column({ name: 'plan_day_id', type: 'bigint', unsigned: true })
  planDayId: number;

  @ManyToOne(() => PlanDay, (day) => day.planMeals)
  @JoinColumn({ name: 'plan_day_id' })
  planDay: PlanDay; // 所属计划日

  @ManyToOne(() => DataDictionary)
  @JoinColumn({ name: 'meal_type_id' })
  mealType: DataDictionary; // 餐次类型（早餐/午餐等）

  @Column({ name: 'scheduled_time', type: 'time', nullable: true })
  scheduledTime?: string; // 预定用餐时间

  @Column({ length: 255, nullable: true })
  note?: string; // 备注信息

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间

  @OneToMany(() => PlanMealItem, (item) => item.planMeal)
  mealItems: PlanMealItem[]; // 餐次包含的食材明细
}
