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
// import { FoodItem } from './food-item.entity';
import { DietPlan } from './diet-plan.entity';
import { PlanMealItem } from './plan-meal-item.entity';

/**
 * 饮食日志表：记录用户每日实际摄入的食物信息。
 * 与计划比较，可以评估执行情况。
 */
@Entity({ name: 'diet_logs' })
export class DietLog {
  @PrimaryGeneratedColumn()
  id: number; // 饮食记录ID

  @ManyToOne(() => User, (user) => user.dietLogs)
  @JoinColumn({ name: 'user_id' })
  user: User; // 记录所属用户

  @Column({ type: 'date' })
  date: string; // 记录日期

  @ManyToOne(() => DataDictionary, { nullable: true })
  @JoinColumn({ name: 'meal_type_id' })
  mealType?: DataDictionary; // 餐次类型

  // @ManyToOne(() => FoodItem, (food) => food.dietLogs, { nullable: true })
  // @JoinColumn({ name: 'food_item_id' })
  // foodItem?: FoodItem; // 引用的食材

  @Column({ name: 'custom_name', length: 255, nullable: true })
  customName?: string; // 自定义食物名称

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity: string; // 摄入量

  @Column({ length: 20 })
  unit: string; // 单位

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  calories?: string; // 能量(kcal)

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  protein?: string; // 蛋白质(g)

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  fat?: string; // 脂肪(g)

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  carbs?: string; // 碳水(g)

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  fiber?: string; // 纤维(g)

  @ManyToOne(() => DietPlan, (plan) => plan.dietLogs, { nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan?: DietPlan; // 关联计划

  @ManyToOne(() => PlanMealItem, { nullable: true })
  @JoinColumn({ name: 'plan_meal_item_id' })
  planMealItem?: PlanMealItem; // 关联的计划餐次食材明细

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间
}
