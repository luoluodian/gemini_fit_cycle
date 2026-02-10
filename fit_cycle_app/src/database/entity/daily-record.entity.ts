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
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { DietPlan } from './diet-plan.entity';
import { MealLog } from './meal-log.entity';

/**
 * 每日饮食记录总表：记录用户每日的目标快照及完成情况。
 */
@Entity({ name: 'daily_records', comment: '每日饮食记录总表 - 包含目标快照' })
@Index(['userId', 'date'], { unique: true })
export class DailyRecord {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, default: 0 })
  userId: number;

  @ManyToOne(() => User, (user) => user.dailyRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', comment: '记录日期' })
  date: string;

  @Column({
    name: 'target_calories',
    type: 'int',
    default: 0,
    comment: '当日目标能量快照(kcal)',
  })
  targetCalories: number;

  @Column({
    name: 'target_protein',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '当日目标蛋白质快照(g)',
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  targetProtein: number;

  @Column({
    name: 'target_fat',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '当日目标脂肪快照(g)',
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  targetFat: number;

  @Column({
    name: 'target_carbs',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '当日目标碳水快照(g)',
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  targetCarbs: number;

  @Column({ name: 'plan_id', type: 'bigint', unsigned: true, nullable: true, comment: '关联计划ID' })
  planId: number;

  @ManyToOne(() => DietPlan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plan_id' })
  plan: DietPlan;

  @OneToMany(() => MealLog, (log) => log.dailyRecord, { cascade: true })
  meals: MealLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
