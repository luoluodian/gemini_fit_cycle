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
import { DataDictionary } from './data-dictionary.entity';

/**
 * 提醒设置表：用户自定义的提醒配置。
 */
@Entity({ name: 'reminders' })
export class Reminder {
  @PrimaryGeneratedColumn()
  id: number; // 提醒ID

  @ManyToOne(() => User, (user) => user.reminders)
  @JoinColumn({ name: 'user_id' })
  user: User; // 所属用户

  @ManyToOne(() => DataDictionary)
  @JoinColumn({ name: 'reminder_type_id' })
  reminderType: DataDictionary; // 提醒类型(字典)

  @ManyToOne(() => DataDictionary)
  @JoinColumn({ name: 'frequency_id' })
  frequency: DataDictionary; // 提醒频率(字典)

  @Column({ name: 'days_of_week', length: 20, nullable: true })
  daysOfWeek?: string; // 提醒的星期设置

  @Column({ name: 'time_of_day', type: 'time' })
  timeOfDay: string; // 提醒时间

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean; // 是否启用

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间
}
