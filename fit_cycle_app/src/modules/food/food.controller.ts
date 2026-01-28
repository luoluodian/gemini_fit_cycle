import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto, UpdateFoodDto } from '@/dtos/food.dto';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  /**
   * GET /food?name=xxx&category=xxx
   */
  @Get()
  findAll(@Query() query: any) {
    return this.foodService.findFood(query);
  }
  /**
   * 创建食物
   * POST /food
   */
  @Post()
  create(@Body() dto: CreateFoodDto) {
    return this.foodService.addFood(dto);
  }

  /**
   * 删除食物
   * DELETE /food/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.foodService.delFood(id);
  }

  /**
   * 更新食物
   * PUT /food/:id
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFoodDto,
  ) {
    return this.foodService.updateFood(id, body);
  }
}
