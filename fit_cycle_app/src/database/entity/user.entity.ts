import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { DietPlan } from './diet-plan.entity';
import { ExerciseLog } from './exercise-log.entity';
import { WeightRecord } from './weight-record.entity';
import { HealthProfile } from './health-profile.entity';
import { DailyRecord } from './daily-record.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'open_id', unique: true })
  openId: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ name: 'member_level', type: 'int', default: 0, comment: '会员等级: 0-普通用户, 1-VIP' })
  memberLevel: number;

  @Column({ name: 'member_expires_at', type: 'datetime', nullable: true, comment: '会员到期时间' })
  memberExpiresAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'user', comment: '用户角色: user-普通用户, admin-管理员' })
  role: 'user' | 'admin';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relations ---
  @OneToOne(() => HealthProfile, (profile) => profile.user, { cascade: true })
  healthProfile: HealthProfile;

  @OneToMany(() => DietPlan, (dietPlan) => dietPlan.user)
  dietPlans: DietPlan[];

  @OneToMany(() => ExerciseLog, (exerciseLog) => exerciseLog.user)
  exerciseLogs: ExerciseLog[];

  @OneToMany(() => WeightRecord, (weightRecord) => weightRecord.user)
  weightRecords: WeightRecord[];

  @OneToMany(() => DailyRecord, (dailyRecord) => dailyRecord.user)
  dailyRecords: DailyRecord[];
}
