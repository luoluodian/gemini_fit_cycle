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
 * 模板点赞记录表。
 * 记录用户对某个模板的点赞行为。
 */
@Entity({ name: 'template_likes' })
@Unique('uk_template_user', ['template', 'user'])
export class TemplateLike {
  @PrimaryGeneratedColumn()
  id: number; // 点赞记录ID

  @ManyToOne(() => PlanTemplate, (template) => template.likes)
  @JoinColumn({ name: 'template_id' })
  template: PlanTemplate; // 被点赞的模板

  @ManyToOne(() => User, (user) => user.templateLikes)
  @JoinColumn({ name: 'user_id' })
  user: User; // 点赞用户

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 点赞时间
}
