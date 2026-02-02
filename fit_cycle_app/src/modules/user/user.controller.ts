import { Controller, Put, Body, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt.guard';
import { UpdateUserDto } from '@/dtos/user.dto';
import { UserService } from './user.service';
import { UserTransformer } from '@/common/transformers/user.transformer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 更新当前用户资料 (通用)
   */
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateMe(@Body() dto: UpdateUserDto, @Req() req) {
    const uid = req.user.userId;
    return this.userService.updateMe(uid, dto);
  }

  /**
   * 更新健康档案 (契约对齐)
   */
  @UseGuards(JwtAuthGuard)
  @Put('health-profile')
  async updateHealth(@Body() dto: UpdateUserDto, @Req() req) {
    const uid = req.user.userId;
    const user = await this.userService.updateMe(uid, dto);
    // 契约要求返回 bmr, tdee
    return {
      bmr: user.healthProfile?.bmr,
      tdee: user.healthProfile?.tdee,
    };
  }

  /**
   * 获取当前用户完整档案
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getMe(@Req() req) {
    const userId = req.user.userId;
    const user = await this.userService.findById(userId);
    return UserTransformer.toResponse(user);
  }
}
