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
import { DietPlan } from './diet-plan.entity';
import { User } from './user.entity';
import { DataDictionary } from './data-dictionary.entity';
import { TemplateDay } from './template-day.entity';
import { TemplateLike } from './template-like.entity';
import { TemplateComment } from './template-comment.entity';
import { TemplateFavorite } from './template-favorite.entity';

/**
 * 计划模板表：用于分享和复用饮食计划的模版。
 */
@Entity({ name: 'plan_templates' })
export class PlanTemplate {
  @PrimaryGeneratedColumn()
  id: number; // 模板ID

  @ManyToOne(() => DietPlan, (plan) => plan.planTemplates, { nullable: true })
  @JoinColumn({ name: 'original_plan_id' })
  originalPlan?: DietPlan; // 所基于的原计划

  @ManyToOne(() => User, (user) => user.planTemplates)
  @JoinColumn({ name: 'creator_user_id' })
  creatorUser: User; // 创建者

  @Column({ length: 255 })
  name: string; // 模板名称

  @Column({ type: 'text', nullable: true })
  description?: string; // 模板描述

  @ManyToOne(() => DataDictionary, { nullable: true })
  @JoinColumn({ name: 'goal_type_id' })
  goalType?: DataDictionary; // 模板适用的目标类型

  @Column({
    name: 'total_calories',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  totalCalories?: string; // 总能量(kcal)

  @Column({
    name: 'total_protein',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  totalProtein?: string; // 总蛋白质(g)

  @Column({
    name: 'total_fat',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  totalFat?: string; // 总脂肪(g)

  @Column({
    name: 'total_carbs',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  totalCarbs?: string; // 总碳水(g)

  @ManyToOne(() => DataDictionary)
  @JoinColumn({ name: 'share_scope_id' })
  shareScope: DataDictionary; // 分享范围(字典)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间

  @OneToMany(() => TemplateDay, (day) => day.template)
  templateDays: TemplateDay[]; // 模板的每日设置

  @OneToMany(() => TemplateLike, (like) => like.template)
  likes: TemplateLike[]; // 模板收到的点赞

  @OneToMany(() => TemplateComment, (comment) => comment.template)
  comments: TemplateComment[]; // 模板的评论列表

  @OneToMany(() => TemplateFavorite, (fav) => fav.template)
  favorites: TemplateFavorite[]; // 模板的收藏记录
}
