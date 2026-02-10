import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { DailyCheckin } from './daily-checkin.entity';
import { DietPlan } from './diet-plan.entity';
import { DietLog } from './diet-log.entity';
import { ExerciseLog } from './exercise-log.entity';
import { PlanTemplate } from './plan-template.entity';
import { Reminder } from './reminder.entity';
import { TemplateComment } from './template-comment.entity';
import { TemplateFavorite } from './template-favorite.entity';
import { TemplateLike } from './template-like.entity';
import { UserBadge } from './user-badge.entity';
import { WeightRecord } from './weight-record.entity';
import { DailyGoal } from './daily-goal.entity';
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relations ---
  @OneToOne(() => HealthProfile, (profile) => profile.user, { cascade: true })
  healthProfile: HealthProfile;

  @OneToMany(() => DailyCheckin, (dailyCheckin) => dailyCheckin.user)
  dailyCheckins: DailyCheckin[];

  @OneToMany(() => DietPlan, (dietPlan) => dietPlan.user)
  dietPlans: DietPlan[];

  @OneToMany(() => ExerciseLog, (exerciseLog) => exerciseLog.user)
  exerciseLogs: ExerciseLog[];

  @OneToMany(() => PlanTemplate, (planTemplate) => planTemplate.creatorUser)
  planTemplates: PlanTemplate[];

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];

  @OneToMany(() => TemplateComment, (comment) => comment.user)
  templateComments: TemplateComment[];

  @OneToMany(() => TemplateFavorite, (favorite) => favorite.user)
  templateFavorites: TemplateFavorite[];

  @OneToMany(() => TemplateLike, (like) => like.user)
  templateLikes: TemplateLike[];

  @OneToMany(() => UserBadge, (userBadge) => userBadge.user)
  userBadges: UserBadge[];

  @OneToMany(() => WeightRecord, (weightRecord) => weightRecord.user)
  weightRecords: WeightRecord[];

  @OneToMany(() => DailyGoal, (dailyGoal) => dailyGoal.user)
  dailyGoals: DailyGoal[];

  @OneToMany(() => DailyRecord, (dailyRecord) => dailyRecord.user)
  dailyRecords: DailyRecord[];
}
