import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { DictService } from './dict.service';
import { CreateDictDto } from '@/dtos/dict.dto';
import { JwtAuthGuard } from '@/modules/auth/jwt.guard';

@Controller('dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  /** 新增字典项 */
  @Post()
  create(@Body() dto: CreateDictDto) {
    return this.dictService.create(dto);
  }

  /** 查询字典项，可根据 category/代码 等筛选 */
  // @Get()
  // query(@Query() query: QueryDictDto) {
  //   return this.dictService.query(query);
  // }

  /** 获取某个分类下全部字典项 */
  @UseGuards(JwtAuthGuard)
  @Get(':category')
  findByCategory(@Param('category') category: string) {
    return this.dictService.getByCategory(category);
  }

  /** 删除字典项 */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.remove(id);
  }
}
