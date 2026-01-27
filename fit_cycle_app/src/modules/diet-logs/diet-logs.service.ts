import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DietLog } from '@/database/entity/diet-log.entity';
import { User } from '@/database/entity/user.entity';
import { DataDictionary } from '@/database/entity/data-dictionary.entity';
import { FoodItem } from '@/database/entity/food-item.entity';
import { DietPlan } from '@/database/entity/diet-plan.entity';
import { PlanMealItem } from '@/database/entity/plan-meal-item.entity';
import { CreateDietLogDto } from '@/dtos/create-diet-log.dto';
import { UpdateDietLogDto } from '@/dtos/update-diet-log.dto';

/**
 * DietLogsService 管理用户的日常饮食记录。
 *
 * 功能包括：
 *  - 创建饮食记录，并关联食材、计划和计划明细等信息；
 *  - 查询用户在某一天的所有记录；
 *  - 更新饮食记录，仅允许修改本人记录；
 *  - 删除饮食记录，仅允许删除本人记录。
 */
@Injectable()
export class DietLogsService {
  constructor(
    @InjectRepository(DietLog)
    private readonly logRepo: Repository<DietLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DataDictionary)
    private readonly dictRepo: Repository<DataDictionary>,
    @InjectRepository(FoodItem)
    private readonly foodRepo: Repository<FoodItem>,
    @InjectRepository(DietPlan)
    private readonly planRepo: Repository<DietPlan>,
    @InjectRepository(PlanMealItem)
    private readonly planMealItemRepo: Repository<PlanMealItem>,
  ) {}

  /**
   * 创建一条新的饮食记录。
   *
   * 会根据传入的食材 ID、计划 ID、计划明细 ID 等关联实体，将其与该记录关联。
   * 如果传入了自定义名称，则优先使用自定义名称。
   *
   * @param userId 当前登录用户 ID
   * @param dto 记录创建参数
   * @returns 创建后的 DietLog 实体
   */
  async create(userId: number, dto: CreateDietLogDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    const log = this.logRepo.create({
      date: dto.date,
      quantity: String(dto.quantity),
      unit: dto.unit,
    });
    log.user = user;
    if (dto.mealTypeId) {
      const mealType = await this.dictRepo.findOne({
        where: { id: dto.mealTypeId },
      });
      log.mealType = mealType || undefined;
    }
    // if (dto.foodItemId) {
    //   log.foodItem = await this.foodRepo.findOne({
    //     where: { id: dto.foodItemId },
    //   });
    // }
    if (dto.customName) log.customName = dto.customName;
    if (dto.planId) {
      const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
      log.plan = plan || undefined;
    }
    if (dto.planMealItemId) {
      const planMealItem = await this.planMealItemRepo.findOne({
        where: { id: dto.planMealItemId },
      });
      log.planMealItem = planMealItem || undefined;
    }
    return this.logRepo.save(log);
  }

  /**
   * 查询某一用户在指定日期的所有饮食记录。
   *
   * 若不传 date，则返回该用户的所有饮食记录。
   *
   * @param userId 用户 ID
   * @param date 日期字符串，格式 YYYY-MM-DD，可选
   * @returns 该日期下的记录数组
   */
  async findByDate(userId: number, date?: string) {
    const where: any = { user: { id: userId } };
    if (date) where.date = date;
    return this.logRepo.find({ where });
  }

  /**
   * 更新饮食记录。
   *
   * 只有记录所属的用户才能更新。如果提供了 foodItemId 等字段，则会重新关联对应的实体。
   * 未提供的字段将保持不变。
   *
   * @param id 记录主键
   * @param dto 更新字段
   * @param userId 当前用户 ID，用于权限校验
   * @returns 更新后的 DietLog 实体
   */
  async update(id: number, dto: UpdateDietLogDto, userId?: number) {
    const log = await this.logRepo.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!log) throw new NotFoundException('记录不存在');
    if (userId && log.user.id !== userId)
      throw new NotFoundException('无权限操作');
    if (dto.date) log.date = dto.date;
    if (dto.quantity) log.quantity = String(dto.quantity);
    if (dto.unit) log.unit = dto.unit;
    if (dto.customName) log.customName = dto.customName;
    if (dto.mealTypeId) {
      const mealType = await this.dictRepo.findOne({
        where: { id: dto.mealTypeId },
      });
      log.mealType = mealType || undefined;
    }
    // if (dto.foodItemId) {
    //   log.foodItem = await this.foodRepo.findOne({
    //     where: { id: dto.foodItemId },
    //   });
    // }
    if (dto.planId) {
      const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
      log.plan = plan || undefined;
    }
    if (dto.planMealItemId) {
      const planMealItem = await this.planMealItemRepo.findOne({
        where: { id: dto.planMealItemId },
      });
      log.planMealItem = planMealItem || undefined;
    }
    return this.logRepo.save(log);
  }

  /**
   * 删除饮食记录。
   *
   * 只有记录的创建者可以删除该记录。
   *
   * @param id 记录主键
   * @param userId 当前用户 ID，用于权限校验
   * @returns 操作结果标识对象
   */
  async remove(id: number, userId?: number) {
    const log = await this.logRepo.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!log) throw new NotFoundException('记录不存在');
    if (userId && log.user.id !== userId)
      throw new NotFoundException('无权限操作');
    await this.logRepo.remove(log);
    return { success: true };
  }
}
