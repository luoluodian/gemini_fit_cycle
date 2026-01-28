// src/modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { UserTransformer } from '@/common/transformers/user.transformer';
import { UserService } from '../user/user.service'; // ADDED: Import UserService
import { WechatAuthDto, UserResponseDto } from '@/dtos/user.dto';

@Injectable()
export class AuthService {
  private readonly appId: string;
  private readonly secret: string;
  private readonly api: string;

  constructor(
    // REMOVED: @InjectRepository(User) private readonly users: Repository<User>,
    private readonly userService: UserService, // ADDED: Inject UserService

    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {
    this.appId = this.config.get<string>('WECHAT_APPID') || '';
    this.secret = this.config.get<string>('WECHAT_SECRET') || '';
    this.api = this.config.get<string>('WECHAT_API') || '';
  }

  /**
   * ===============================
   * ⭐ 微信登录 + 静默登录
   * ===============================
   */
  async wechatAuth(dto: WechatAuthDto) {
    if (!dto.code) {
      throw new BadRequestException('缺少 code');
    }
    const session = await this.code2Session(dto.code);
    const { openid } = session;

    // MODIFIED: Use UserService to find or create user
    let user = await this.userService.findOrCreateByOpenid(openid);

    // 第一次授权：头像昵称
    if (dto.rawData) {
      try {
        const profile = JSON.parse(dto.rawData);
        user.nickname = profile.nickName;
        user.avatarUrl = profile.avatarUrl;
      } catch (e) {
        this.logger.log({ level: 'warn', message: 'rawData解析失败', error: String(e) });
      }
    }

    // 生成 Refresh Token
    const refreshToken = this.createRefreshToken(user.id);
    user.refreshToken = refreshToken;

    await this.userService.userRepository.save(user); // MODIFIED: Use userService's repository to save

    // accessToken
    const accessToken = this.createAccessToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: UserTransformer.toResponse(user) as UserResponseDto,
    };
  }

  /**
   * ===============================
   * ⭐ WeChat API：code2Session
   * ===============================
   */
  async code2Session(code: string) {
    // Mock bypass for testing
    if (code === 'mock_code') {
      return {
        openid: 'mock_openid_123456',
        session_key: 'mock_session_key',
      };
    }

    const url = `${this.api}/sns/jscode2session?appid=${this.appId}&secret=${this.secret}&js_code=${code}&grant_type=authorization_code`;

    try {
      const res = await axios.get(url, { timeout: 8000 });
      const data = res.data;

      if (!data.openid) {
        throw new UnauthorizedException(data.errmsg || '微信认证失败');
      }
      return data;
    } catch (e) {
      throw new UnauthorizedException(e.message || '微信认证失败');
    }
  }

  /**
   * ===============================
   * ⭐ 创建 Access Token（有效期短）
   * ===============================
   */
  createAccessToken(uid: number) {
    return this.jwtService.sign(
      { uid },
      {
        expiresIn: '7d',
        secret: this.config.get('JWT_SECRET'),
      },
    );
  }

  /**
   * ===============================
   * ⭐ 创建 Refresh Token（有效期长）
   * ===============================
   */
  createRefreshToken(uid: number) {
    return this.jwtService.sign(
      { uid, tokenType: 'refresh' },
      {
        expiresIn: '30d',
        secret: this.config.get('JWT_REFRESH_SECRET'),
      },
    );
  }

  /**
   * ===============================
   * ⭐ Refresh Token 刷新 accessToken
   * POST /auth/refresh
   * ===============================
   */
  async refreshToken(uid: number, refreshToken: string) {
    const user = await this.userService.findUserById(uid); // MODIFIED: Use userService
    if (!user) throw new UnauthorizedException('用户不存在');

    // 校验 refresh token 是否一致
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('RefreshToken 已失效');
    }

    // 生成新 token
    const accessToken = this.createAccessToken(uid);
    const newRefreshToken = this.createRefreshToken(uid);

    // 更新数据库
    user.refreshToken = newRefreshToken;
    await this.userService.userRepository.save(user); // MODIFIED: Use userService's repository to save

    return { accessToken, refreshToken: newRefreshToken };
  }
  /**
   * ===============================
   * ⭐ 后端验证 Access Token（静默登录）
   * ===============================
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
    } catch (e) {
      throw new UnauthorizedException(e.message || 'Token 失效');
    }
  }
}
