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

/**
 * 餐食记录明细表：记录具体的摄入食物。
 * 增加了冗余快照字段以支持历史数据溯源及高性能查询。
 */
@Entity({ name: 'meal_logs', comment: '餐食记录明细表 - 包含营养素快照' })
@Index(['userId', 'recordId'])
export class MealLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, comment: '冗余用户ID，用于高性能鉴权与统计' })
  userId: number;

  @Column({ name: 'record_id', type: 'bigint', unsigned: true })
  recordId: number;

  @ManyToOne(() => DailyRecord, (record) => record.meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'record_id' })
  dailyRecord: DailyRecord;

  @Column({
    type: 'enum',
    enum: MealType,
    name: 'meal_type',
    comment: '餐次类型',
  })
  mealType: MealType;

  @Column({ name: 'food_id', type: 'bigint', unsigned: true, nullable: true })
  foodId: number;

  @ManyToOne(() => FoodItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'food_id' })
  foodItem: FoodItem;

  @Column({ name: 'food_name', length: 100, comment: '食物名称快照' })
  foodName: string;

  @Column({ name: 'custom_name', length: 255, nullable: true, comment: '用户自定义备注名称' })
  customName: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
    comment: '摄入数量',
  })
  quantity: number;

  @Column({ length: 20, comment: '单位' })
  unit: string;

  // --- 摄入汇总快照 (计算后的值) ---
  @Column({ type: 'int', default: 0, comment: '计算后能量(kcal)' })
  calories: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
    comment: '计算后蛋白质(g)',
  })
  protein: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
    comment: '计算后脂肪(g)',
  })
  fat: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
    comment: '计算后碳水(g)',
  })
  carbs: number;

  // --- 基准营养素快照 (每100g/单位的值，用于溯源与极速重算) ---
  @Column({ name: 'base_calories', type: 'int', default: 0, comment: '基准能量快照' })
  baseCalories: number;

  @Column({
    name: 'base_protein',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  baseProtein: number;

  @Column({
    name: 'base_fat',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  baseFat: number;

  @Column({
    name: 'base_carbs',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  baseCarbs: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}