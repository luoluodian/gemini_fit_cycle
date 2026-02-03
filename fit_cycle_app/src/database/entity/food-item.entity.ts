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

@Entity('food_items')
export class FoodItem {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index('idx_name')
  @Column({ length: 100, comment: '食材名称' })
  name: string;

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

  @Column({ type: 'int', default: 0, comment: '热量(kcal/100g)' })
  calories: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, comment: '蛋白质(g)', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  protein: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, comment: '脂肪(g)', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  fat: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, comment: '碳水(g)', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  carbs: number;

  @Column({ name: 'base_count', type: 'decimal', precision: 8, scale: 2, default: 100, comment: '营养成分基准数量', transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  baseCount: number;

  @Column({ length: 20, default: 'g', comment: '计量单位' })
  unit: string;

  @Column({ type: 'json', nullable: true, comment: '标签' })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}