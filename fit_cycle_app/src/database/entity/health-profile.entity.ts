import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('health_profiles')
export class HealthProfile {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @OneToOne(() => User, (user) => user.healthProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'male',
    comment: '性别',
  })
  gender: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '身高(cm)', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '体重(kg)', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  weight: number;

  @Column({ type: 'date', nullable: true, comment: '出生日期' })
  birthday: string;

  @Column({
    name: 'activity_level',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 1.2,
    comment: '活动系数(1.2-1.9)',
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  activityLevel: number;

  @Column({ type: 'int', nullable: true, comment: '基础代谢率' })
  bmr: number;

  @Column({ type: 'int', nullable: true, comment: '每日总消耗' })
  tdee: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
