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
import { PlanTemplate } from './plan-template.entity';
import { DataDictionary } from './data-dictionary.entity';
import { TemplateMeal } from './template-meal.entity';

/**
 * 模板日表：定义模板的每日设置。
 */
@Entity({ name: 'template_days' })
export class TemplateDay {
  @PrimaryGeneratedColumn()
  id: number; // 模板日ID

  @ManyToOne(() => PlanTemplate, (tpl) => tpl.templateDays)
  @JoinColumn({ name: 'template_id' })
  template: PlanTemplate; // 所属模板

  @Column({ name: 'day_index', type: 'int' })
  dayIndex: number; // 索引(从1开始)

  @ManyToOne(() => DataDictionary, { nullable: true })
  @JoinColumn({ name: 'carb_type_id' })
  carbType?: DataDictionary; // 碳日类型

  @Column({
    name: 'target_calories',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetCalories?: string; // 当日能量目标

  @Column({
    name: 'target_protein',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetProtein?: string; // 当日蛋白质目标

  @Column({
    name: 'target_fat',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetFat?: string; // 当日脂肪目标

  @Column({
    name: 'target_carbs',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  targetCarbs?: string; // 当日碳水目标

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间

  @OneToMany(() => TemplateMeal, (meal) => meal.templateDay)
  templateMeals: TemplateMeal[]; // 模板日的餐次安排
}
