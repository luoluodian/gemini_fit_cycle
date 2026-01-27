import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ExerciseType } from './exercise-type.entity';

/**
 * 运动日志表：记录用户的日常运动情况。
 */
@Entity({ name: 'exercise_logs' })
export class ExerciseLog {
  @PrimaryGeneratedColumn()
  id: number; // 运动记录ID

  @ManyToOne(() => User, (user) => user.exerciseLogs)
  @JoinColumn({ name: 'user_id' })
  user: User; // 用户

  @Column({ type: 'date' })
  date: string; // 日期

  @ManyToOne(() => ExerciseType, (type) => type.exerciseLogs)
  @JoinColumn({ name: 'exercise_type_id' })
  exerciseType: ExerciseType; // 运动类型

  @Column({ name: 'duration_minutes', type: 'decimal', precision: 8, scale: 2 })
  durationMinutes: string; // 运动时长(分钟)

  @Column({
    name: 'calories_burned',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  caloriesBurned?: string; // 消耗的能量

  @Column({ length: 255, nullable: true })
  note?: string; // 备注

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间
}
