import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { DietLogsService } from './diet-logs.service';
import { CreateDietLogDto } from '@/dtos/create-diet-log.dto';
import { UpdateDietLogDto } from '@/dtos/update-diet-log.dto';

/**
 * DietLogsController 提供饮食记录的创建、查询、更新和删除接口。
 *
 * 所有接口均基于当前登录用户进行数据访问，避免跨用户操作。用户身份通过 request.user 注入。
 */
@Controller('diet-logs')
export class DietLogsController {
  constructor(private readonly dietLogsService: DietLogsService) {}

  /** 创建饮食记录 */
  @Post()
  async create(@Req() req: any, @Body() dto: CreateDietLogDto) {
    const userId = req.user?.id;
    return this.dietLogsService.create(userId, dto);
  }

  /** 查询饮食记录，可传递 date 参数按日期过滤 */
  @Get()
  async find(@Req() req: any, @Query('date') date?: string) {
    const userId = req.user?.id;
    return this.dietLogsService.findByDate(userId, date);
  }

  /** 更新饮食记录 */
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDietLogDto,
  ) {
    const userId = req.user?.id;
    return this.dietLogsService.update(Number(id), dto, userId);
  }

  /** 删除饮食记录 */
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.dietLogsService.remove(Number(id), userId);
  }
}
