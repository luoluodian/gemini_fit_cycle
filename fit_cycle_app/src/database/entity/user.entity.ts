import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'open_id', unique: true })
  openId: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: string;

  @Column({ name: 'gender_id', type: 'int', nullable: true })
  genderId?: number;

  @Column({ name: 'activity_level_id', type: 'int', nullable: true })
  activityLevelId?: number;

  @Column({ name: 'goal_type_id', type: 'int', nullable: true })
  goalTypeId?: number;

  @Column({ name: 'height_cm', type: 'decimal', precision: 5, scale: 2, nullable: true })
  heightCm?: number;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightKg?: number;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Inverse Relations ---
  @OneToMany(() => DailyCheckin, (dailyCheckin) => dailyCheckin.user)
  dailyCheckins: DailyCheckin[];

  @OneToMany(() => DietPlan, (dietPlan) => dietPlan.user)
  dietPlans: DietPlan[];

  @OneToMany(() => DietLog, (dietLog) => dietLog.user)
  dietLogs: DietLog[];

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
}