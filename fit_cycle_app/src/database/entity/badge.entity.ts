import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserBadge } from './user-badge.entity';

/**
 * 徽章表：定义系统奖励徽章。
 */
@Entity({ name: 'badges' })
export class Badge {
  @PrimaryGeneratedColumn()
  id: number; // 徽章ID

  @Column({ length: 100, unique: true })
  code: string; // 徽章代码

  @Column({ length: 255 })
  name: string; // 徽章名称

  @Column({ type: 'text', nullable: true })
  description?: string; // 描述

  @Column({ name: 'icon_url', length: 255, nullable: true })
  iconUrl?: string; // 图标URL

  @Column({ type: 'text', nullable: true })
  criteria?: string; // 获得条件说明

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间

  @OneToMany(() => UserBadge, (ub) => ub.badge)
  userBadges: UserBadge[]; // 获得该徽章的用户列表
}
