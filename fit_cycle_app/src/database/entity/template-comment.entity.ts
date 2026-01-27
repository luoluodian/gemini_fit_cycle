import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PlanTemplate } from './plan-template.entity';
import { User } from './user.entity';

/**
 * 模板评论表：记录用户对模板的评论。
 */
@Entity({ name: 'template_comments' })
export class TemplateComment {
  @PrimaryGeneratedColumn()
  id: number; // 评论ID

  @ManyToOne(() => PlanTemplate, (template) => template.comments)
  @JoinColumn({ name: 'template_id' })
  template: PlanTemplate; // 评论的模板

  @ManyToOne(() => User, (user) => user.templateComments)
  @JoinColumn({ name: 'user_id' })
  user: User; // 评论者

  @Column({ type: 'text' })
  content: string; // 评论内容

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间
}
