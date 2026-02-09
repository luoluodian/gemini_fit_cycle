import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
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
import { SavePlanTemplatesDto } from '@/dtos/save-plan-templates.dto';
import { InitPlanDaysDto } from '@/dtos/init-plan-days.dto';
import { UpdatePlanDayFullDto } from '@/dtos/update-plan-day-full.dto';
import { PlanStatus } from '@/database/entity/diet-plan.entity';
import { JwtAuthGuard } from '@/modules/auth/jwt.guard';

/**
 * DietPlansController 提供饮食计划管理相关接口。
 */
@Controller('diet-plans')
@UseGuards(JwtAuthGuard)
export class DietPlansController {
  constructor(private readonly dietPlansService: DietPlansService) {}

  /** 列出用户的所有饮食计划 */
  @Get()
  async listPlans(
    @Req() req: any,
    @Query('status') status?: PlanStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.findAllByUser(userId, status, page, limit);
  }

  /** 创建新的饮食计划 */
  @Post()
  async createPlan(@Req() req: any, @Body() dto: CreateDietPlanDto) {
    const userId = req.user.userId;
    return this.dietPlansService.createPlan(userId, dto);
  }

  /** 批量初始化计划天数 */
  @Post(':id/init-days')
  async initDays(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: InitPlanDaysDto
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.initDays(Number(id), userId, dto);
  }

  /** 获取单日全量详情 (包含餐次和食材) */
  @Get('days/:dayId/detail')
  async getDayDetail(
    @Req() req: any,
    @Param('dayId') dayId: string
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.findDayDetail(Number(dayId), userId);
  }

  /** 单日全量更新 */
  @Put('days/:dayId/full-update')
  async updateDayFull(
    @Req() req: any,
    @Param('dayId') dayId: string,
    @Body() dto: UpdatePlanDayFullDto
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.updateDayFull(Number(dayId), userId, dto);
  }

  /** 获取系统推荐计划 */
  @Get('recommended')
  async listRecommended() {
    return this.dietPlansService.findRecommended();
  }

  /** 批量保存计划模板 (日配置+餐单) */
  @Post(':id/templates')
  async saveTemplates(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: SavePlanTemplatesDto,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.saveTemplates(Number(id), userId, dto);
  }

  /** 获取计划详情 */
  @Get(':id')
  async getPlan(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dietPlansService.findDetail(Number(id), userId);
  }

  /** 更新计划信息 */
  @Put(':id')
  async updatePlan(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDietPlanDto,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.updatePlan(Number(id), dto, userId);
  }

  /** 删除计划 */
  @Delete(':id')
  async deletePlan(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dietPlansService.removePlan(Number(id), userId);
  }

  /** 激活指定计划 */
  @Post(':id/activate')
  async activate(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dietPlansService.activatePlan(userId, Number(id));
  }

  /** 暂停指定计划 */
  @Post(':id/pause')
  async pause(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dietPlansService.pausePlan(userId, Number(id));
  }

  /** 生成分享码 */
  @Post(':id/share')
  async share(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dietPlansService.sharePlan(Number(id), userId);
  }

  /** 通过分享码导入计划 */
  @Post('import')
  async import(@Req() req: any, @Body('code') code: string) {
    const userId = req.user.userId;
    return this.dietPlansService.importPlan(userId, code);
  }

  // --- Sub-resources (Standardized CRUD) ---

  /** 为计划新增计划日 */
  @Post(':planId/days')
  async createPlanDay(
    @Req() req: any,
    @Param('planId') planId: string,
    @Body() dto: CreatePlanDayDto,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.createPlanDay(Number(planId), dto, userId);
  }

  /** 更新计划日 */
  @Put('days/:id')
  async updatePlanDay(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlanDayDto,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.updatePlanDay(Number(id), dto, userId);
  }

  /** 为计划日添加餐次 */
  @Post('days/:dayId/meals')
  async createPlanMeal(
    @Req() req: any,
    @Param('dayId') dayId: string,
    @Body() dto: CreatePlanMealDto,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.createPlanMeal(Number(dayId), dto, userId);
  }

  /** 更新计划餐次 */
  @Put('meals/:id')
  async updatePlanMeal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlanMealDto,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.updatePlanMeal(Number(id), dto, userId);
  }

  /** 为餐次添加食材明细 */
  @Post('meals/:mealId/items')
  async createPlanMealItem(
    @Req() req: any,
    @Param('mealId') mealId: string,
    @Body() dto: CreatePlanMealItemDto,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.createPlanMealItem(Number(mealId), dto, userId);
  }

  /** 更新食材明细 */
  @Put('meal-items/:id')
  async updatePlanMealItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlanMealItemDto,
  ) {
    const userId = req.user.userId;
    return this.dietPlansService.updatePlanMealItem(Number(id), dto, userId);
  }

  /** 删除计划日 */
  @Delete('days/:id')
  async removePlanDay(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dietPlansService.removePlanDay(Number(id), userId);
  }

  /** 删除计划餐次 */
  @Delete('meals/:id')
  async removePlanMeal(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dietPlansService.removePlanMeal(Number(id), userId);
  }

  /** 删除餐次食材明细 */
  @Delete('meal-items/:id')
  async removePlanMealItem(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dietPlansService.removePlanMealItem(Number(id), userId);
  }
}