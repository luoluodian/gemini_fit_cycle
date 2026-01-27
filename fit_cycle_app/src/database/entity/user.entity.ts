import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
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
import { DailyGoal } from './daily-goal.entity'; // Assuming this is also related

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'integer', primary: true })
  id: number;

  @Column({ unique: true })
  openId: string; // WeChat OpenID, standardized to 'openId'

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  avatarUrl: string; // Avatar URL, standardized to 'avatarUrl'

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: string;

  @Column({ type: 'int', nullable: true })
  genderId?: number; // From DataDictionary

  @Column({ type: 'int', nullable: true })
  activityLevelId?: number; // From DataDictionary

  @Column({ type: 'int', nullable: true })
  goalTypeId?: number; // From DataDictionary

  @Column({ type: 'int', nullable: true })
  heightCm?: number;

  @Column({ type: 'int', nullable: true })
  weightKg?: number;

  @Column({ nullable: true })
  refreshToken?: string; // From auth.service.ts

  @Column({ type: 'int', default: 0 })
  target_calories: number;

  @Column({ type: 'int', default: 0 })
  target_protein: number;

  @Column({ type: 'int', default: 0 })
  target_fat: number;

  @Column({ type: 'int', default: 0 })
  target_carbs: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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
  planTemplates: PlanTemplate[]; // Assuming creatorUser is the inverse side

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
