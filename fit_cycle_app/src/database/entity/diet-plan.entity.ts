import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PlanDay } from './plan-day.entity';
import { DailyRecord } from './daily-record.entity';
import { DailyGoal } from './daily-goal.entity';
import { PlanTemplate } from './plan-template.entity';

export enum PlanType {
  FAT_LOSS = 'fat-loss',
  MUSCLE_GAIN = 'muscle-gain',
  MAINTENANCE = 'maintenance',
  CUSTOM = 'custom',
  CARB_CYCLE = 'carb-cycle',
}

export enum PlanStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
  CONFIGURED = 'configured',
}

/**
 * 饮食计划表：用户制定的长期饮食方案。
 */
@Entity({ name: 'diet_plans', comment: '饮食计划表 - 用户制定的长期饮食方案' })
export class DietPlan {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true, comment: '所属用户ID (模板为NULL)' })
  userId: number;

  @ManyToOne(() => User, (user) => user.dietPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100, comment: '计划名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '计划描述' })
  description: string;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.CUSTOM,
    comment: '计划类型',
  })
  type: PlanType;

  @Column({
    type: 'enum',
    enum: PlanStatus,
    default: PlanStatus.DRAFT,
    comment: '计划状态',
  })
  status: PlanStatus;

  @Column({ name: 'is_template', type: 'boolean', default: false, comment: '是否为官方模板' })
  isTemplate: boolean;

  @Column({ name: 'cycle_days', type: 'int', default: 7, comment: '一个循环的天数' })
  cycleDays: number;

  @Column({ name: 'cycle_count', type: 'int', default: 4, comment: '循环次数 (总天数 = cycleDays * cycleCount)' })
  cycleCount: number;

  @Column({ name: 'start_date', type: 'date', nullable: true, comment: '计划开始日期' })
  startDate: string;

  @Column({ name: 'carb_cycle_config', type: 'json', nullable: true, comment: '碳循环高/中/低碳配置快照' })
  carbCycleConfig: any;

  @Column({
    name: 'target_calories',
    type: 'int',
    default: 0,
    comment: '默认每日目标能量(kcal)',
  })
  targetCalories: number;

  @Column({
    name: 'target_protein',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '默认每日目标蛋白质(g)',
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
    comment: '默认每日目标脂肪(g)',
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
    comment: '默认每日目标碳水(g)',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  targetCarbs: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => PlanDay, (day) => day.plan, { cascade: true })
  planDays: PlanDay[];

  @OneToMany(() => DailyRecord, (record) => record.plan)
  dailyRecords: DailyRecord[];

  @OneToMany(() => DailyGoal, (goal) => goal.plan)
  dailyGoals: DailyGoal[];

  @OneToMany(() => PlanTemplate, (tpl) => tpl.originalPlan)
  planTemplates: PlanTemplate[];
}