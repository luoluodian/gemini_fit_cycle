import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Badge } from './badge.entity';

/**
 * 用户徽章表：记录用户已获得的徽章。
 */
@Entity({ name: 'user_badges' })
@Unique('uk_user_badge', ['user', 'badge'])
export class UserBadge {
  @PrimaryGeneratedColumn()
  id: number; // 用户徽章记录ID

  @ManyToOne(() => User, (user) => user.userBadges)
  @JoinColumn({ name: 'user_id' })
  user: User; // 用户

  @ManyToOne(() => Badge, (badge) => badge.userBadges)
  @JoinColumn({ name: 'badge_id' })
  badge: Badge; // 徽章

  @CreateDateColumn({ name: 'achieved_at' })
  achievedAt: Date; // 获得时间
}
