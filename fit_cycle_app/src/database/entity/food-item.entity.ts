import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@/database/entity/user.entity';

@Entity('food_items')
export class FoodItem {
  /** 主键ID */
  @PrimaryGeneratedColumn()
  id: number;

  /** 食材名称 */
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  /** 食材描述（可选） */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** 单位（如 g、ml、份） */
  @Column({ type: 'varchar', length: 20, nullable: false })
  unit: string;

  /** 每单位能量(kcal) */
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  caloriesPerUnit: number;

  /** 每单位蛋白质(g) */
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  proteinPerUnit: number;

  /** 每单位脂肪(g) */
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  fatPerUnit: number;

  /** 每单位碳水(g) */
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  carbsPerUnit: number;

  /** 每单位纤维(g) */
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  fiberPerUnit: number;

  /** 是否公开（默认 true） */
  @Column({ type: 'tinyint', default: 1 })
  isPublic: boolean;

  /** 升糖指数 GI（0–100） */
  @Column({
    type: 'tinyint',
    unsigned: true,
    nullable: true,
    comment: '升糖指数(GI)，0-100',
  })
  glycemicIndex: number | null;

  /** 每单位升糖负荷 GL */
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    comment: '每单位升糖负荷(GL)',
  })
  glycemicLoadPerUnit: number | null;

  /** 创建时间 */
  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date;

  /** 创建者（仅限用户自定义食材） */
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User | null;
}
