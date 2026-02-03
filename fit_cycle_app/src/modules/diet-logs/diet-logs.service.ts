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
   */
  async create(userId: number, dto: CreateDietLogDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    const log = this.logRepo.create({
      date: dto.date,
      quantity: dto.quantity,
      unit: dto.unit,
      userId,
    });
    
    if (dto.mealTypeId) {
      const mealType = await this.dictRepo.findOne({
        where: { id: dto.mealTypeId },
      });
      log.mealType = mealType || undefined;
    }
    
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
   */
  async findByDate(userId: number, date?: string) {
    const where: any = { userId };
    if (date) where.date = date;
    return this.logRepo.find({ where });
  }

  /**
   * 更新饮食记录。
   */
  async update(id: number, dto: UpdateDietLogDto, userId?: number) {
    const log = await this.logRepo.findOne({
      where: { id },
    });
    if (!log) throw new NotFoundException('记录不存在');
    if (userId && Number(log.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    
    if (dto.date) log.date = dto.date;
    if (dto.quantity !== undefined) log.quantity = dto.quantity;
    if (dto.unit) log.unit = dto.unit;
    if (dto.customName) log.customName = dto.customName;
    
    if (dto.mealTypeId) {
      const mealType = await this.dictRepo.findOne({
        where: { id: dto.mealTypeId },
      });
      log.mealType = mealType || undefined;
    }
    
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
   */
  async remove(id: number, userId?: number) {
    const log = await this.logRepo.findOne({
      where: { id },
    });
    if (!log) throw new NotFoundException('记录不存在');
    if (userId && Number(log.userId) !== Number(userId))
      throw new NotFoundException('无权限操作');
    await this.logRepo.remove(log);
    return { success: true };
  }
}
