// src/modules/auth/jwt-refresh.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    const secretOrKey = config.get<string>('JWT_REFRESH_SECRET');
    if (!secretOrKey) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // 关键！
      secretOrKey, // 关键！
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    return { userId: payload.uid };
  }
}
