import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { TemplateDay } from './template-day.entity';
import { DataDictionary } from './data-dictionary.entity';
import { TemplateMealItem } from './template-meal-item.entity';

/**
 * 模板餐次表：定义模板中的餐次。
 */
@Entity({ name: 'template_meals' })
export class TemplateMeal {
  @PrimaryGeneratedColumn()
  id: number; // 模板餐次ID

  @ManyToOne(() => TemplateDay, (day) => day.templateMeals)
  @JoinColumn({ name: 'template_day_id' })
  templateDay: TemplateDay; // 所属模板日

  @ManyToOne(() => DataDictionary)
  @JoinColumn({ name: 'meal_type_id' })
  mealType: DataDictionary; // 餐次类型

  @Column({ name: 'scheduled_time', type: 'time', nullable: true })
  scheduledTime?: string; // 预定用餐时间

  @Column({ length: 255, nullable: true })
  note?: string; // 备注

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间

  @OneToMany(() => TemplateMealItem, (item) => item.templateMeal)
  mealItems: TemplateMealItem[]; // 餐次明细
}
