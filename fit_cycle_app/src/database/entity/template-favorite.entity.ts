import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { PlanTemplate } from './plan-template.entity';
import { User } from './user.entity';

/**
 * 模板收藏表：记录用户收藏的模板。
 */
@Entity({ name: 'template_favorites' })
@Unique('uk_template_favorite', ['template', 'user'])
export class TemplateFavorite {
  @PrimaryGeneratedColumn()
  id: number; // 收藏记录ID

  @ManyToOne(() => PlanTemplate, (template) => template.favorites)
  @JoinColumn({ name: 'template_id' })
  template: PlanTemplate; // 收藏的模板

  @ManyToOne(() => User, (user) => user.templateFavorites)
  @JoinColumn({ name: 'user_id' })
  user: User; // 收藏用户

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 收藏时间
}
