import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseLog } from './exercise-log.entity';

/**
 * 运动类型表：定义不同的运动及其代谢当量(MET)数值。
 */
@Entity({ name: 'exercise_types' })
export class ExerciseType {
  @PrimaryGeneratedColumn()
  id: number; // 运动类型ID

  @Column({ length: 100 })
  name: string; // 运动名称

  @Column({ name: 'met_value', type: 'decimal', precision: 5, scale: 2 })
  metValue: string; // MET值，用于计算消耗

  @Column({ type: 'text', nullable: true })
  description?: string; // 运动描述

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间

  @OneToMany(() => ExerciseLog, (log) => log.exerciseType)
  exerciseLogs: ExerciseLog[]; // 关联的运动记录
}
