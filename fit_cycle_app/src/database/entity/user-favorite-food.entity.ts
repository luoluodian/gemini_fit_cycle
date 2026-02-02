import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { FoodItem } from './food-item.entity';

@Entity('user_favorite_foods')
@Unique(['userId', 'foodId'])
export class UserFavoriteFood {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index('idx_user_id')
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, comment: '用户ID' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index('idx_food_id')
  @Column({ name: 'food_id', type: 'bigint', unsigned: true, comment: '食材ID' })
  foodId: number;

  @ManyToOne(() => FoodItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'food_id' })
  food: FoodItem;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
