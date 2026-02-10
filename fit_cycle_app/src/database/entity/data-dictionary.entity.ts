import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 数据字典表：统一存放应用中的枚举值。
 * category 用来区分不同类型的枚举，例如 Gender、ActivityLevel 等。
 * code 用于程序内部逻辑标识，text 用于界面显示。
 */
@Index(['category', 'value'], { unique: true })
@Index(['category', 'code'], { unique: true })
@Entity({ name: 'data_dictionary' })
export class DataDictionary {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number; // 字典条目主键

  @Column({ length: 100 })
  category: string; // 枚举分类，例如 Gender、ActivityLevel

  @Column({ length: 50, nullable: true })
  code: string; // 程序内部逻辑标识，如 'breakfast', 'male'

  @Column({ type: 'int' })
  value: number; // 枚举数值代码 (可选)

  @Column({ length: 255 })
  text: string; // 枚举名称，显示给用户

  @Column({ type: 'text', nullable: true })
  description?: string; // 描述信息

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number; // 排序值

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date; // 更新时间
}