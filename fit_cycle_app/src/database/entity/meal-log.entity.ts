import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { DailyRecord } from './daily-record.entity';
import { FoodItem } from './food-item.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACKS = 'snacks',
}

@Entity({ name: 'meal_logs', comment: '餐食记录明细表' })
@Index(['userId', 'recordId'])
export class MealLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, default: 0 })
  userId: number;

  @Column({ name: 'record_id', type: 'bigint', unsigned: true })
  recordId: number;

  @ManyToOne(() => DailyRecord, (record) => record.meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'record_id' })
  dailyRecord: DailyRecord;

  @Column({ name: 'meal_type', length: 50, comment: '餐次类型标识 (对应字典 code)' })
  mealType: string;

  @Column({ name: 'food_id', type: 'bigint', unsigned: true, nullable: true })
  foodId: number;

  @ManyToOne(() => FoodItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'food_id' })
  foodItem: FoodItem;

  @Column({ name: 'food_name', length: 100 })
  foodName: string;

  @Column({ name: 'custom_name', length: 255, nullable: true })
  customName: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ name: 'base_count', type: 'int', default: 100, comment: '营养计算基准克数' })
  baseCount: number;

  @Column({ type: 'int', default: 0 })
  calories: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  protein: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  fat: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  carbs: number;

  @Column({ name: 'base_calories', type: 'int', default: 0 })
  baseCalories: number;

  @Column({ name: 'base_protein', type: 'decimal', precision: 10, scale: 4, default: 0, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  baseProtein: number;

  @Column({ name: 'base_fat', type: 'decimal', precision: 10, scale: 4, default: 0, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  baseFat: number;

  @Column({ name: 'base_carbs', type: 'decimal', precision: 10, scale: 4, default: 0, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  baseCarbs: number;

  @Column({ name: 'is_planned', type: 'boolean', default: false })
  isPlanned: boolean;

  // 🚀 新增业务字段：是否已正式记录（驱动颜色与统计）
  @Column({ name: 'is_recorded', type: 'boolean', default: true })
  isRecorded: boolean;

  @Column({ name: 'source_updated_at', type: 'datetime', nullable: true, comment: '快照时原食材最后更新时间' })
  sourceUpdatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
