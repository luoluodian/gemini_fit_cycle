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
import { DietPlan } from './diet-plan.entity';
import { DataDictionary } from './data-dictionary.entity';
import { PlanMeal } from './plan-meal.entity';

/**
 * 计划日表：记录饮食计划中每一天的设置。
 */
@Entity({ name: 'plan_days' })
export class PlanDay {
  @PrimaryGeneratedColumn()
  id: number; // 计划日主键ID

  @ManyToOne(() => DietPlan, (plan) => plan.planDays)
  @JoinColumn({ name: 'plan_id' })
  plan: DietPlan; // 所属的饮食计划

  @Column({ name: 'day_index', type: 'int' })
  dayIndex: number; // 在计划周期中的索引（从1开始）

  @Column({ type: 'date', nullable: true })
  date?: string; // 具体日期，可为空表示循环

  @ManyToOne(() => DataDictionary, { nullable: true })
  @JoinColumn({ name: 'carb_type_id' })
  carbType?: DataDictionary; // 碳循环日类型

  @Column({
    name: 'target_calories',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetCalories?: string; // 当天目标能量

  @Column({
    name: 'target_protein',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetProtein?: string; // 当天目标蛋白质

  @Column({
    name: 'target_fat',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetFat?: string; // 当天目标脂肪

  @Column({
    name: 'target_carbs',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetCarbs?: string; // 当天目标碳水

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间

  @OneToMany(() => PlanMeal, (meal) => meal.planDay)
  planMeals: PlanMeal[]; // 当日的餐次安排
}
