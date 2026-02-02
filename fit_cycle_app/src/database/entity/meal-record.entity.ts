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
import { FoodItem } from './food-item.entity';

/**
 * 每日饮食单项记录
 */
@Entity({ name: 'meal_records' })
export class MealRecord {
  /** 主键 ID */
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FoodItem, { onDelete: 'RESTRICT' })
  food: FoodItem;

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
