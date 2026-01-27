import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PlanMeal } from './plan-meal.entity';
// import { FoodItem } from './food-item.entity';

/**
 * 计划餐次食材明细表。
 * 一个餐次可以由多个食材组成，用于计算计划中的营养目标。
 */
@Entity({ name: 'plan_meal_items' })
export class PlanMealItem {
  @PrimaryGeneratedColumn()
  id: number; // 餐次食材明细ID

  @ManyToOne(() => PlanMeal, (meal) => meal.mealItems)
  @JoinColumn({ name: 'plan_meal_id' })
  planMeal: PlanMeal; // 所属餐次

  // @ManyToOne(() => FoodItem, (food) => food.planMealItems, { nullable: true })
  // @JoinColumn({ name: 'food_item_id' })
  // foodItem?: FoodItem; // 引用的食材

  @Column({ name: 'custom_name', length: 255, nullable: true })
  customName?: string; // 自定义食材名称（当没有引用食材时）

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity: string; // 食材数量

  @Column({ length: 20 })
  unit: string; // 计量单位

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  calories?: string; // 总能量(kcal)

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  protein?: string; // 总蛋白质

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  fat?: string; // 总脂肪

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  carbs?: string; // 总碳水

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  fiber?: string; // 总膳食纤维

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number; // 排序值

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间
}
