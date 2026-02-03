import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { DietPlan } from './diet-plan.entity';

/**
 * 每日目标表：用户的每日营养目标
 */
@Entity({ name: 'daily_goals', comment: '每日目标表 - 用户的每日营养目标' })
@Unique(['userId', 'targetDate'])
export class DailyGoal {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.dietPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'target_date', type: 'date' })
  targetDate: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  calories: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  protein: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  fat: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  carbs: number;

  @Column({ name: 'plan_id', type: 'bigint', unsigned: true, nullable: true })
  planId?: number;

  @ManyToOne(() => DietPlan, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan?: DietPlan;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
