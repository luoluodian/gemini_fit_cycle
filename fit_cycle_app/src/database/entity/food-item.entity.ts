import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum FoodType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

export enum FoodCategory {
  PROTEIN = 'protein',
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  GRAINS = 'grains',
  DAIRY = 'dairy',
  NUTS = 'nuts',
  OILS = 'oils',
  SNACKS = 'snacks',
  CUSTOM = 'custom',
}

@Index('idx_archived_name', ['isArchived', 'name'])
@Entity('food_items')
export class FoodItem {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index('idx_name')
  @Column({ length: 100, comment: '食材名称' })
  name: string;

  /**
   * 权限隔离核心字段
   * system: 官方录入，全员只读
   * custom: 用户自建，仅创建者可见/可操作
   */
  @Column({
    type: 'enum',
    enum: FoodType,
    default: FoodType.SYSTEM,
    comment: '类型:系统/自定义',
  })
  type: FoodType;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true, comment: '创建者ID(系统为NULL)' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index('idx_category')
  @Column({
    type: 'enum',
    enum: FoodCategory,
    default: FoodCategory.CUSTOM,
    comment: '分类',
  })
  category: FoodCategory;

  @Column({ length: 255, nullable: true, comment: '描述' })
  description: string;

  @Column({ name: 'image_url', length: 255, nullable: true, comment: '图片或Emoji' })
  imageUrl: string;

  @Column({ name: 'is_public', default: false, comment: '是否公开' })
  isPublic: boolean;

  /** 
   * 营养计算基准：
   * 指在 baseCount (如100g) 下的能量值 
   */
  @Column({ type: 'int', default: 0, comment: '热量(kcal/baseCount)' })
  calories: number;

  /** 精度保障：使用 decimal 规避 JS 浮点数计算尾差 */
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, comment: '蛋白质(g)', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  protein: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, comment: '脂肪(g)', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  fat: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, comment: '碳水(g)', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  carbs: number;

  /** 
   * 核心逻辑：定义营养素的基数。
   * 如单位为 "个" 时，baseCount 为 1；单位为 "g" 时，通常为 100 
   */
  @Column({ name: 'base_count', type: 'decimal', precision: 8, scale: 2, default: 100, comment: '营养成分基准数量', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  baseCount: number;

  @Column({ name: 'unit', length: 20, default: 'g', comment: '计量单位' })
  unit: string;

  /** 社交治理：记录被计划或打卡引用的次数 */
  @Column({ name: 'reference_count', type: 'int', default: 0, comment: '引用计数' })
  referenceCount: number;

  /** 逻辑下架：若计数 > 0 时执行删除，则标记为下架以保护存量引用不崩溃 */
  @Column({ name: 'is_archived', type: 'boolean', default: false, comment: '是否已下架' })
  isArchived: boolean;

  @Column({ type: 'json', nullable: true, comment: '标签' })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}