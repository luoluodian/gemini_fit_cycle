// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secretOrKey = config.get<string>('JWT_SECRET');
    if (!secretOrKey) {
      throw new Error('JWT_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: any) {
    // 兼容多种 payload 格式 (uid 或 id)
    const userId = payload.uid || payload.id;
    
    // 核心安全防御：如果 Token 中没有有效的用户标识，直接拒绝
    if (!userId || isNaN(Number(userId))) {
      throw new UnauthorizedException('无效的令牌：缺少或非法的用户标识');
    }

    return { 
      id: Number(userId),
      userId: Number(userId), // 兼容旧代码
      role: payload.role || 'user'
    };
  }
}
