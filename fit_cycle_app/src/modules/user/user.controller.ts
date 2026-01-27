import { Controller, Put, Body, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt.guard';
import { UpdateUserDto } from '@/dtos/user.dto';
import { UserService } from './user.service';
import { UserTransformer } from '@/common/transformers/user.transformer';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 更新当前用户资料
   */
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Body() dto: UpdateUserDto, @Req() req) {
    const uid = req.user.userId; // JwtStrategy 返回 { userId: xxx }
    return this.userService.updateMe(uid, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user.userId; // JwtStrategy 返回的 { userId }
    const user = await this.userService.findById(userId);
    return UserTransformer.toResponse(user);
  }
}
