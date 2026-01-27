import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from '@/database/entity/food.entity';
import { CreateFoodDto } from '@/dtos/food.dto';
import { applyPagination } from '@/common/utils/pagination.helper';
import { applySorting } from '@/common/utils/sort.helper';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private readonly foodRepo: Repository<Food>,
  ) {}

  /** 查询全部食物 */

  async findFood(query: any) {
    const qb = this.foodRepo.createQueryBuilder('food');
    /** 条件过滤 */
    if (query.name) {
      qb.andWhere('food.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.category && query.category !== 'undefined') {
      console.log(query.category);
      qb.andWhere('food.category = :category', { category: query.category });
    }
    if (query.minCalorie) {
      qb.andWhere('food.calorie >= :minCalorie', {
        minCalorie: Number(query.minCalorie),
      });
    }
    if (query.maxCalorie) {
      qb.andWhere('food.calorie <= :maxCalorie', {
        maxCalorie: Number(query.maxCalorie),
      });
    }
    /** 排序（抽离） */
    applySorting(qb, query, [
      'id',
      'name',
      'calorie',
      'protein',
      'fat',
      'carbohydrate',
    ]);
    /** 分页（抽离） */
    const { page, pageSize } = applyPagination(qb, query);
    /** 执行查询 */
    const [list, total] = await qb.getManyAndCount();
    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /** 添加食物 */
  /** 添加食物 */
  async addFood(dto: CreateFoodDto) {
    const exist = await this.foodRepo.findOne({
      where: { name: dto.name },
    });

    if (exist) {
      return { error: '该食物已存在' };
    }

    // 使用 save 自动返回插入后的实体
    const food = await this.foodRepo.save(dto);

    return food;
  }

  /** 删除食物 */
  async delFood(id: number) {
    const res = await this.foodRepo.delete(id);

    if (!res.affected) {
      return { error: '删除失败，食物不存在' };
    }

    return res;
  }

  /** 更新食物 */
  async updateFood(id: number, dto: Partial<CreateFoodDto>) {
    const food = await this.foodRepo.findOne({ where: { id } });

    if (!food) {
      return { error: '更新失败，食物不存在' };
    }

    const res = await this.foodRepo.update(id, dto);
    return res;
  }
}
