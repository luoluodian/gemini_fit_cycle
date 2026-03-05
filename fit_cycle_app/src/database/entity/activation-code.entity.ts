import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('activation_codes')
export class ActivationCode {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ unique: true, length: 32, comment: '唯一激活码' })
  code: string;

  @Column({ type: 'varchar', length: 20, default: 'VIP', comment: '激活类型' })
  type: string;

  @Column({ name: 'member_level', type: 'int', default: 1, comment: '激活后对应的会员等级' })
  memberLevel: number;

  @Column({ name: 'duration_days', type: 'int', default: 30, comment: '激活后赋予的会员时长(天)' })
  durationDays: number;

  @Column({ name: 'expired_at', type: 'datetime', comment: '兑换截止日期' })
  expiredAt: Date;

  @Column({ name: 'is_used', type: 'boolean', default: false, comment: '是否已使用' })
  isUsed: boolean;

  @Column({ name: 'used_by', type: 'bigint', unsigned: true, nullable: true, comment: '使用人ID' })
  usedBy?: number;

  @Column({ name: 'used_at', type: 'datetime', nullable: true, comment: '使用时间' })
  usedAt?: Date;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true, nullable: true, comment: '创建人ID(管理员)' })
  createdBy?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relations ---
  @ManyToOne(() => User)
  @JoinColumn({ name: 'used_by' })
  user?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  admin?: User;
}
