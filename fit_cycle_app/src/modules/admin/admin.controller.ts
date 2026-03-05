import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 批量生成激活码
   */
  @Post('activation-codes/batch-generate')
  @Roles('admin')
  async batchGenerate(@Req() req: any, @Body() dto: {
    count: number;
    memberLevel: number;
    durationDays: number;
    expiredAt: string;
    type?: string;
  }) {
    const adminId = req.user.id;
    return this.adminService.batchGenerate(adminId, dto);
  }
}
