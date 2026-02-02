import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import axios from 'axios';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { WechatAuthDto } from '@/dtos/user.dto';
import { UserTransformer } from '@/common/transformers/user.transformer';

jest.mock('axios');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let configService: ConfigService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    openId: 'test-openid',
    nickname: 'Test User',
    avatarUrl: 'http://test.com/avatar.jpg',
    healthProfile: {}
  };

  const mockTransformedUser = {
    user: { nickname: 'Test User' },
    health: {},
    stats: {}
  };

  const mockWechatSession = {
    openid: 'test-openid',
    session_key: 'test-session-key',
  };

  const mockUserService = {
    findOrCreateByOpenid: jest.fn(),
    findUserById: jest.fn(),
    userRepository: {
      save: jest.fn(),
    }
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        WECHAT_APPID: 'test-appid',
        WECHAT_SECRET: 'test-secret',
        WECHAT_API: 'https://api.weixin.qq.com',
        JWT_SECRET: 'secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
      };
      return config[key];
    }),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test-jwt-token'),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('wechatAuth', () => {
    const validDto: WechatAuthDto = {
      code: 'test-code',
      rawData: JSON.stringify({
        nickName: 'Test User',
        avatarUrl: 'http://test.com/avatar.jpg',
      }),
    };

    it('should authenticate user successfully', async () => {
      jest.spyOn(service, 'code2Session').mockResolvedValue(mockWechatSession);
      mockUserService.findOrCreateByOpenid.mockResolvedValue(mockUser);
      jest.spyOn(UserTransformer, 'toResponse').mockReturnValue(mockTransformedUser as any);

      const result = await service.wechatAuth(validDto);

      expect(result).toHaveProperty('accessToken', 'test-jwt-token');
      expect(result).toHaveProperty('refreshToken', 'test-jwt-token');
      expect(result.user).toEqual(mockTransformedUser);
    });
  });
});
