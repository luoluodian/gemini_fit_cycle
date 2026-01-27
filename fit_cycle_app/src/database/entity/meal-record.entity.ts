import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Food } from './food.entity';

/**
 * 饮食记录表：记录用户每日实际摄入的食物信息
 */
@Entity({
  name: 'meal_records',
  comment: '饮食记录表 - 记录用户每日实际摄入的食物信息',
})
@Index(['userId', 'recordedDate'])
@Unique(['userId', 'foodId', 'recordedDate', 'mealType'])
export class MealRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.dietLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'food_id' })
  foodId: number;

  @ManyToOne(() => Food, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'food_id' })
  food: Food;

  @Column({ name: 'meal_type', length: 20 })
  mealType: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  quantity: number;

  @Column({ length: 20, default: 'g' })
  unit: string;

  @Column({ name: 'recorded_date', type: 'date' })
  recordedDate: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  calories?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  protein?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fat?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  carbs?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
