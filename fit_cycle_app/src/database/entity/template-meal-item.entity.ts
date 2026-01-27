import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { TemplateMeal } from './template-meal.entity';
import { FoodItem } from './food-item.entity';

/**
 * 模板餐次食材明细表。
 */
@Entity({ name: 'template_meal_items' })
export class TemplateMealItem {
  @PrimaryGeneratedColumn()
  id: number; // 模板餐次食材ID

  @ManyToOne(() => TemplateMeal, (meal) => meal.mealItems)
  @JoinColumn({ name: 'template_meal_id' })
  templateMeal: TemplateMeal; // 所属模板餐次

  // @ManyToOne(() => FoodItem, (food) => food.templateMealItems, {
  //   nullable: true,
  // })
  @JoinColumn({ name: 'food_item_id' })
  foodItem?: FoodItem; // 引用的食材

  @Column({ name: 'custom_name', length: 255, nullable: true })
  customName?: string; // 自定义食材名称

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity: string; // 食材用量

  @Column({ length: 20 })
  unit: string; // 单位

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
