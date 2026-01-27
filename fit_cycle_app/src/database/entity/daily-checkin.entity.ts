import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { DataDictionary } from './data-dictionary.entity';

/**
 * 每日签到表：记录用户的日常打卡信息，例如饮食记录、运动记录等。
 */
@Entity({ name: 'daily_checkins' })
@Unique('uk_user_date_type', ['user', 'date', 'checkinType'])
export class DailyCheckin {
  @PrimaryGeneratedColumn()
  id: number; // 签到记录ID

  @ManyToOne(() => User, (user) => user.dailyCheckins)
  @JoinColumn({ name: 'user_id' })
  user: User; // 签到用户

  @Column({ type: 'date' })
  date: string; // 签到日期

  @ManyToOne(() => DataDictionary)
  @JoinColumn({ name: 'checkin_type_id' })
  checkinType: DataDictionary; // 签到类型(字典)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间
}
