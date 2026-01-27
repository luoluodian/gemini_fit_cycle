import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MealRecord } from './meal-record.entity';
import { PlanDetail } from './plan-detail.entity';

/**
 * 食物能量表
 */
@Entity({ name: 'foods', comment: '食物表 - 存储食物营养成分信息' })
export class Food {
  /** 主键 ID */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 食物名称 */
  @Column({ type: 'varchar', length: 100, comment: '食物名称' })
  name: string;

  /** 食物类别 */
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '食物类别' })
  category?: string;

  /** 热量(kcal/100g) */
  @Column({
    name: 'calories_per_100g',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '热量(kcal/100g)',
  })
  caloriesPer100g: number;

  /** 蛋白质(g/100g) */
  @Column({
    name: 'protein_per_100g',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '蛋白质(g/100g)',
  })
  proteinPer100g: number;

  /** 脂肪(g/100g) */
  @Column({
    name: 'fat_per_100g',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '脂肪(g/100g)',
  })
  fatPer100g: number;

  /** 碳水(g/100g) */
  @Column({
    name: 'carbs_per_100g',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '碳水(g/100g)',
  })
  carbsPer100g: number;

  // 升糖指数(Glycemic Index)
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    default: null, // ✔ 正确（必须是 null，不是 'null'）
    comment: '升糖指数(GI)',
  })
  gi?: number;

  /** 默认单位 */
  @Column({
    name: 'default_unit',
    type: 'varchar',
    length: 20,
    default: 'g',
    comment: '默认单位',
  })
  defaultUnit: string;

  /** 图片地址 */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '图片地址',
  })
  image_url?: string;

  /** 备注 */
  @Column({
    type: 'text',
    nullable: true,
    comment: '备注',
  })
  description?: string;

  /** 创建时间 */
  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    comment: '创建时间',
  })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    comment: '更新时间',
  })
  updatedAt: Date;

  // 关系定义
  @OneToMany(() => MealRecord, (record) => record.food)
  mealRecords: MealRecord[]; // 食物被多次记录

  @OneToMany(() => PlanDetail, (detail) => detail.food)
  planDetails: PlanDetail[]; // 食物被多个计划引用
}
