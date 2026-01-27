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
import { User } from './user.entity';
import { PlanDay } from './plan-day.entity';
import { DietLog } from './diet-log.entity';
import { PlanDetail } from './plan-detail.entity';
import { DailyGoal } from './daily-goal.entity';
import { PlanTemplate } from './plan-template.entity';

/**
 * 饮食计划表：用户制定的长期饮食方案。
 * 包含计划目标、默认目标营养及碳循环设置等信息。
 */
@Entity({ name: 'diet_plans', comment: '饮食计划表 - 用户制定的长期饮食方案' })
export class DietPlan {
  @PrimaryGeneratedColumn()
  id: number; // 计划主键ID

  @ManyToOne(() => User, (user) => user.dietPlans)
  @JoinColumn({ name: 'user_id' })
  user: User; // 创建该计划的用户

  @Column({ length: 100 })
  name: string; // 计划名称

  @Column({ name: 'goal_type', length: 20 })
  goalType: string; // 计划目标类型，如减脂/增肌

  @Column({ name: 'duration_days', type: 'int' })
  durationDays: number; // 计划持续天数

  @Column({
    name: 'target_calories',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetCalories?: string; // 默认每日目标能量(kcal)

  @Column({
    name: 'target_protein',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetProtein?: string; // 默认每日目标蛋白质(g)

  @Column({
    name: 'target_fat',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetFat?: string; // 默认每日目标脂肪(g)

  @Column({
    name: 'target_carbs',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetCarbs?: string; // 默认每日目标碳水(g)

  @Column({ name: 'status', length: 20, default: 'draft' })
  status: string; // 计划状态

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean; // 是否当前启用

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间

  @OneToMany(() => PlanDay, (day) => day.plan)
  planDays: PlanDay[]; // 计划的每日设置

  @OneToMany(() => PlanDetail, (detail) => detail.plan)
  planDetails: PlanDetail[]; // 计划的详细食物安排

  @OneToMany(() => DietLog, (log) => log.plan)
  dietLogs: DietLog[]; // 该计划关联的饮食记录

  @OneToMany(() => DailyGoal, (goal) => goal.plan)
  dailyGoals: DailyGoal[]; // 该计划生成的每日目标

  @OneToMany(() => PlanTemplate, (tpl) => tpl.originalPlan)
  planTemplates: PlanTemplate[]; // 基于该计划生成的模板
}
