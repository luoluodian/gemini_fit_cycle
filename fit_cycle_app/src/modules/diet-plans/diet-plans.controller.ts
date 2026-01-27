import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { DietPlansService } from './diet-plans.service';
import { CreateDietPlanDto } from '@/dtos/create-diet-plan.dto';
import { UpdateDietPlanDto } from '@/dtos/update-diet-plan.dto';
import { CreatePlanDayDto } from '@/dtos/create-plan-day.dto';
import { UpdatePlanDayDto } from '@/dtos/update-plan-day.dto';
import { CreatePlanMealDto } from '@/dtos/create-plan-meal.dto';
import { UpdatePlanMealDto } from '@/dtos/update-plan-meal.dto';
import { CreatePlanMealItemDto } from '@/dtos/create-plan-meal-item.dto';
import { UpdatePlanMealItemDto } from '@/dtos/update-plan-meal-item.dto';

/**
 * DietPlansController 提供饮食计划管理相关接口。
 *
 * 每个接口都依赖请求对象中注入的当前用户信息，确保用户只能管理自己的计划数据。
 * 控制器与服务层解耦，负责解析请求参数和传递用户 ID。
 */
@Controller()
export class DietPlansController {
  constructor(private readonly dietPlansService: DietPlansService) {}

  /** 列出用户的所有饮食计划 */
  @Get('diet-plans')
  async listPlans(@Req() req: any) {
    const userId = req.user?.id;
    return this.dietPlansService.findAllByUser(userId);
  }

  /** 创建新的饮食计划 */
  @Post('diet-plans')
  async createPlan(@Req() req: any, @Body() dto: CreateDietPlanDto) {
    const userId = req.user?.id;
    return this.dietPlansService.createPlan(userId, dto);
  }

  /** 获取计划详情 */
  @Get('diet-plans/:id')
  async getPlan(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.dietPlansService.findDetail(Number(id), userId);
  }

  /** 更新计划信息 */
  @Put('diet-plans/:id')
  async updatePlan(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDietPlanDto,
  ) {
    const userId = req.user?.id;
    return this.dietPlansService.updatePlan(Number(id), dto, userId);
  }

  /** 删除计划 */
  @Delete('diet-plans/:id')
  async deletePlan(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.dietPlansService.removePlan(Number(id), userId);
  }

  /** 激活指定计划 */
  @Post('diet-plans/:id/activate')
  async activate(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.dietPlansService.activatePlan(userId, Number(id));
  }

  /** 为计划新增计划日 */
  @Post('diet-plans/:planId/days')
  async createPlanDay(
    @Req() req: any,
    @Param('planId') planId: string,
    @Body() dto: CreatePlanDayDto,
  ) {
    const userId = req.user?.id;
    return this.dietPlansService.createPlanDay(Number(planId), dto, userId);
  }

  /** 更新计划日 */
  @Put('plan-days/:id')
  async updatePlanDay(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlanDayDto,
  ) {
    const userId = req.user?.id;
    return this.dietPlansService.updatePlanDay(Number(id), dto, userId);
  }

  /** 为计划日添加餐次 */
  @Post('plan-days/:dayId/meals')
  async createPlanMeal(
    @Req() req: any,
    @Param('dayId') dayId: string,
    @Body() dto: CreatePlanMealDto,
  ) {
    const userId = req.user?.id;
    return this.dietPlansService.createPlanMeal(Number(dayId), dto, userId);
  }

  /** 更新计划餐次 */
  @Put('plan-meals/:id')
  async updatePlanMeal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlanMealDto,
  ) {
    const userId = req.user?.id;
    return this.dietPlansService.updatePlanMeal(Number(id), dto, userId);
  }

  /** 为餐次添加食材明细 */
  @Post('plan-meals/:mealId/items')
  async createPlanMealItem(
    @Req() req: any,
    @Param('mealId') mealId: string,
    @Body() dto: CreatePlanMealItemDto,
  ) {
    const userId = req.user?.id;
    return this.dietPlansService.createPlanMealItem(
      Number(mealId),
      dto,
      userId,
    );
  }

  /** 更新食材明细 */
  @Put('plan-meal-items/:id')
  async updatePlanMealItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlanMealItemDto,
  ) {
    const userId = req.user?.id;
    return this.dietPlansService.updatePlanMealItem(Number(id), dto, userId);
  }

  /** 删除计划日 */
  @Delete('plan-days/:id')
  async deletePlanDay(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.dietPlansService.removePlanDay(Number(id), userId);
  }

  /** 删除计划餐次 */
  @Delete('plan-meals/:id')
  async deletePlanMeal(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.dietPlansService.removePlanMeal(Number(id), userId);
  }

  /** 删除计划食材明细 */
  @Delete('plan-meal-items/:id')
  async deletePlanMealItem(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.dietPlansService.removePlanMealItem(Number(id), userId);
  }
}
