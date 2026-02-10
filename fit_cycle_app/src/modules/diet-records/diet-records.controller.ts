import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DietRecordsService } from './diet-records.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateMealLogDto } from '@/dtos/create-meal-log.dto';
import { UpdateMealLogDto } from '@/dtos/update-meal-log.dto';
import { SyncMealDto } from '@/dtos/sync-meal.dto';

@Controller('records')
@UseGuards(JwtAuthGuard)
export class DietRecordsController {
  constructor(private readonly dietRecordsService: DietRecordsService) {}

  /**
   * 获取指定日期的饮食记录视图 (R-2)
   */
  @Get(':date')
  async getRecord(@Req() req: any, @Param('date') date: string) {
    const userId = req.user.id;
    return this.dietRecordsService.getDailyRecordView(userId, date);
  }

  /**
   * 添加餐食记录 (R-3)
   */
  @Post('meal')
  async addMeal(@Req() req: any, @Body() dto: CreateMealLogDto) {
    const userId = req.user.id;
    return this.dietRecordsService.addMealLog(userId, dto);
  }

  /**
   * 按计划同步餐食记录 (R-6)
   */
  @Post('meal/sync')
  async syncFromPlan(@Req() req: any, @Body() dto: SyncMealDto) {
    const userId = req.user.id;
    return this.dietRecordsService.syncMealFromPlan(userId, dto);
  }

  /**
   * 更新餐食记录 (R-3)
   */
  @Put('meal/:id')
  async updateMeal(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMealLogDto,
  ) {
    const userId = req.user.id;
    return this.dietRecordsService.updateMealLog(userId, id, dto);
  }

  /**
   * 删除餐食记录 (R-3)
   */
  @Delete('meal/:id')
  async removeMeal(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.id;
    return this.dietRecordsService.removeMealLog(userId, id);
  }
}