import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

/**
 * 体重记录表：记录用户体重及体脂率的变化。
 */
@Entity({ name: 'weight_records' })
@Unique('uk_user_date', ['user', 'recordDate'])
export class WeightRecord {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number; // 体重记录ID

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.weightRecords)
  @JoinColumn({ name: 'user_id' })
  user: User; // 所属用户

  @Column({ name: 'record_date', type: 'date' })
  recordDate: string; // 记录日期

  @Column({
    name: 'weight_kg',
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  weightKg: number; // 体重(kg)

  @Column({
    name: 'body_fat_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: { to: (v: number) => v, from: (v: string) => (v ? parseFloat(v) : undefined) }
  })
  bodyFatPercentage?: number; // 体脂率(%)

  @Column({ length: 255, nullable: true })
  note?: string; // 备注

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间
}
