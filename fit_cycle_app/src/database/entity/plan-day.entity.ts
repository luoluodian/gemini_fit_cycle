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
import { PlanMeal } from './plan-meal.entity';

/**
 * 计划日表：记录饮食计划中周期内每一天的模板设置。
 */
@Entity({ name: 'plan_days', comment: '计划日表 - 饮食计划周期内的每日模板' })
export class PlanDay {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'plan_id', type: 'bigint', unsigned: true, comment: '所属计划ID' })
  planId: number;

  @ManyToOne(() => DietPlan, (plan) => plan.planDays, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: DietPlan;

  @Column({ name: 'day_number', type: 'int', comment: '在计划周期中的天数序号（1 ~ cycleDays）' })
  dayNumber: number;

  @Column({
    name: 'target_calories',
    type: 'int',
    default: 0,
    comment: '当天目标能量',
  })
  targetCalories: number;

  @Column({
    name: 'target_protein',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '当天目标蛋白质',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  targetProtein: number;

  @Column({
    name: 'target_fat',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '当天目标脂肪',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  targetFat: number;

  @Column({
    name: 'target_carbs',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '当天目标碳水',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  targetCarbs: number;

  @Column({ name: 'carb_type', length: 20, nullable: true, comment: '碳循环类型标识 (high/medium/low)' })
  carbType: string;

  @Column({ name: 'is_configured', type: 'boolean', default: false, comment: '是否已配置完成' })
  isConfigured: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PlanMeal, (meal) => meal.planDay, { cascade: true })
  planMeals: PlanMeal[];
}