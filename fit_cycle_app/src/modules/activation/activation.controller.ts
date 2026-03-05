import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ActivationService } from './activation.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('user/activate')
@UseGuards(JwtAuthGuard)
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  /**
   * 兑换激活码
   */
  @Post()
  async activate(@Req() req: any, @Body('code') code: string) {
    const userId = req.user.id;
    return this.activationService.activate(userId, code);
  }
}
