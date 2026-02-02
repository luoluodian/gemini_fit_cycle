// src/modules/food-items/food-items.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
} from '@nestjs/common';

import { FoodItemsService } from './food-items.service';
import { CreateFoodItemDto, UpdateFoodItemDto, QueryFoodItemDto } from '@/dtos/food-item.dto';

import { JwtAuthGuard } from '@/modules/auth/jwt.guard';

@Controller('food-items')
@UseGuards(JwtAuthGuard) // 所有接口必须登录
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
)
export class FoodItemsController {
  constructor(private readonly service: FoodItemsService) {}

  /**
   * ========================================
   * 🔍 1. 分页搜索
   * GET /food-items?q=鸡&category=protein&page=1&pageSize=20
   * ========================================
   */
  @Get()
  async list(@Query() query: QueryFoodItemDto) {
    return this.service.list(query);
  }

  /**
   * ========================================
   * ➕ 2. 创建食材
   * POST /food-items
   * ========================================
   */
  @Post()
  async create(@Req() req, @Body() dto: CreateFoodItemDto) {
    const userId = req.user.userId; // JWTStrategy 注入的 user
    return this.service.create(userId, dto);
  }

  /**
   * ========================================
   * 🔎 3. 获取详情
   * GET /food-items/:id
   * ========================================
   */
  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  /**
   * ========================================
   * ✏️ 4. 更新食材（仅限创建人）
   * PUT /food-items/:id
   * ========================================
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateFoodItemDto,
  ) {
    return this.service.update(id, req.user.userId, dto);
  }

  /**
   * ========================================
   * ❌ 5. 删除食材（仅限创建人）
   * DELETE /food-items/:id
   * ========================================
   */
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.service.delete(id, req.user.userId);
  }

  @Get('check-name')
  async checkName(@Query('name') name: string) {
    if (!name) {
      return { error: 'name不能为空' };
    }

    return this.service.checkNameExists(name);
  }

  /**
   * ========================================
   * 🔄 6. 同步系统食材
   * POST /food-items/sync
   * ========================================
   */
  @Post('sync')
  async sync(@Body() foodData: any[]) {
    return this.service.syncSystemFoods(foodData);
  }
}
