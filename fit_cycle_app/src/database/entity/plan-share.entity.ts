import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { DietPlan } from './diet-plan.entity';

@Entity('plan_shares')
export class PlanShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50, comment: '分享码 (如 PLAN-A1B2C3)' })
  @Index()
  code: string;

  @ManyToOne(() => DietPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: DietPlan;

  @Column({ name: 'plan_id' })
  planId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  creator: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamp', name: 'expire_at', nullable: true, comment: '过期时间' })
  expireAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
