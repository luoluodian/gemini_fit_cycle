import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { WechatAuthDto, RefreshTokenDto } from '@/dtos/user.dto';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Controller('auth')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 微信登录（必须） */
  @Post('wechatAuth')
  login(@Body() dto: WechatAuthDto) {
    return this.authService.wechatAuth(dto);
  }

  /** refresh token（自动续期） */
  @UseGuards(JwtRefreshGuard)
  @Post('refreshToken')
  refresh(@Req() req: Request & { user?: { userId: number } }, @Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(req.user?.userId || 0, dto.refreshToken);
  }
}
