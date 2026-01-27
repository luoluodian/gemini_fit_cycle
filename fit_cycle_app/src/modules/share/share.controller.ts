import { Controller, Post, Param, Req, Body } from '@nestjs/common';
import { ShareService } from './share.service';
import { ImportPlanDto } from '@/dtos/import-plan.dto';

/**
 * ShareController 提供饮食计划分享相关的接口。
 *
 * 包含生成分享码/链接和通过分享码导入计划两个操作。
 */
@Controller()
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  /**
   * 生成计划分享码/链接。
   *
   * POST /diet-plans/:id/share
   *
   * 只有计划拥有者才能生成分享链接。返回的分享码可供他人导入。
   */
  @Post('diet-plans/:id/share')
  async share(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.shareService.sharePlan(userId, Number(id));
  }

  /**
   * 导入他人分享的计划。
   *
   * POST /diet-plans/import
   *
   * 接收一个包含分享码的请求体，复制分享计划的全部内容到当前用户名下。
   */
  @Post('diet-plans/import')
  async import(@Req() req: any, @Body() dto: ImportPlanDto) {
    const userId = req.user?.id;
    return this.shareService.importPlan(userId, dto);
  }
}
