import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from '@/database/entity/food.entity';
import { CreateFoodDto, UpdateFoodDto } from '@/dtos/food.dto';
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
      qb.andWhere('food.category = :category', { category: query.category });
    }
    if (query.minCalorie) {
      qb.andWhere('food.calories_per_100g >= :minCalorie', {
        minCalorie: Number(query.minCalorie),
      });
    }
    if (query.maxCalorie) {
      qb.andWhere('food.calories_per_100g <= :maxCalorie', {
        maxCalorie: Number(query.maxCalorie),
      });
    }
    /** 排序 */
    applySorting(qb, query, [
      'id',
      'name',
      'calories_per_100g',
      'protein_per_100g',
      'fat_per_100g',
      'carbs_per_100g',
    ]);
    /** 分页 */
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
  async addFood(dto: CreateFoodDto) {
    const exist = await this.foodRepo.findOne({
      where: { name: dto.name },
    });

    if (exist) {
      return { error: '该食物已存在' };
    }

    // 创建实体并保存
    const food = this.foodRepo.create(dto);
    return await this.foodRepo.save(food);
  }

  /** 删除食物 */
  async delFood(id: number) {
    const res = await this.foodRepo.delete(id);

    if (!res.affected) {
      throw new NotFoundException(`删除失败：ID为 ${id} 的食物不存在`);
    }

    return res;
  }

  /** 更新食物 */
  async updateFood(id: number, dto: UpdateFoodDto) {
    const food = await this.foodRepo.findOne({ where: { id } });

    if (!food) {
      throw new NotFoundException(`更新失败：ID为 ${id} 的食物不存在`);
    }

    await this.foodRepo.update(id, dto);
    return await this.foodRepo.findOne({ where: { id } });
  }

  /** 获取食物详情 */
  async findById(id: number) {
    const food = await this.foodRepo.findOne({ where: { id } });
    if (!food) {
      throw new NotFoundException(`ID为 ${id} 的食物不存在`);
    }
    return food;
  }
}