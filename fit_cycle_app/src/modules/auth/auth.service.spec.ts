import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

import { AuthService } from './auth.service';
import { User } from '@/database/entity/user.entity';
import { WechatAuthDto } from '@/dtos/user.dto';
import { UserTransformer } from '@/common/transformers/user.transformer';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let jwtService: JwtService;
  let axiosMock: jest.Mocked<typeof axios>;

  const mockUser = {
    id: 1,
    openId: 'test-openid',
    nickname: 'Test User',
    avatarUrl: 'http://test.com/avatar.jpg',
    email: null,
    phone: null,
    dateOfBirth: null,
    heightCm: null,
    weightKg: null,
    targetWeightKg: null,
    goalRate: null,
    genderId: null,
    activityLevelId: null,
    goalTypeId: null,
    isCompleted: false,
  };

  const mockWechatSession = {
    openid: 'test-openid',
    session_key: 'test-session-key',
    unionid: 'test-unionid',
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    axiosMock = axios as jest.Mocked<typeof axios>;
    axiosMock.get = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    // Mock configuration
    configService.get.mockImplementation((key: string) => {
      const config = {
        WECHAT_APPID: 'test-appid',
        WECHAT_SECRET: 'test-secret',
        WECHAT_API: 'https://api.weixin.qq.com',
      };
      return config[key];
    });

    // Mock JWT service
    jwtService.sign.mockReturnValue('test-jwt-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should throw error if WeChat configuration is missing', () => {
      configService.get.mockReturnValue(undefined);
      
      expect(() => new AuthService(
        userRepository as any,
        configService,
        jwtService,
      )).toThrow('Missing required WeChat configuration');
    });
  });

  describe('wechatAuth', () => {
    const validDto: WechatAuthDto = {
      code: 'test-code',
      rawData: JSON.stringify({
        nickName: 'Test User',
        avatarUrl: 'http://test.com/avatar.jpg',
      }),
    };

    it('should authenticate user successfully with new user', async () => {
      // Mock code2Session
      jest.spyOn(service, 'code2Session' as any).mockResolvedValue(mockWechatSession);
      
      // Mock user not found
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Mock transformer
      const transformedUser = { ...mockUser, id: 1 };
      jest.spyOn(UserTransformer, 'toResponse').mockReturnValue(transformedUser);

      const result = await service.wechatAuth(validDto);

      expect(result).toEqual({
        user: transformedUser,
        token: 'test-jwt-token',
      });
      expect(userRepository.create).toHaveBeenCalledWith({ openId: 'test-openid' });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should authenticate user successfully with existing user', async () => {
      // Mock code2Session
      jest.spyOn(service, 'code2Session' as any).mockResolvedValue(mockWechatSession);
      
      // Mock existing user
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Mock transformer
      const transformedUser = { ...mockUser, id: 1 };
      jest.spyOn(UserTransformer, 'toResponse').mockReturnValue(transformedUser);

      const result = await service.wechatAuth(validDto);

      expect(result).toEqual({
        user: transformedUser,
        token: 'test-jwt-token',
      });
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should handle missing code', async () => {
      const invalidDto = { ...validDto, code: '' };

      await expect(service.wechatAuth(invalidDto)).rejects.toThrow(
        new HttpException('Code is required', HttpStatus.BAD_REQUEST)
      );
    });

    it('should handle invalid rawData gracefully', async () => {
      const invalidDto = {
        code: 'test-code',
        rawData: 'invalid-json',
      };

      jest.spyOn(service, 'code2Session' as any).mockResolvedValue(mockWechatSession);
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(UserTransformer, 'toResponse').mockReturnValue(mockUser);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.wechatAuth(invalidDto);

      expect(result).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith('parse rawData error', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'code2Session' as any).mockRejectedValue(error);

      await expect(service.wechatAuth(validDto)).rejects.toThrow(
        new HttpException('Authentication process failed', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should handle HttpException from code2Session', async () => {
      const httpError = new HttpException('WeChat API error', HttpStatus.BAD_REQUEST);
      jest.spyOn(service, 'code2Session' as any).mockRejectedValue(httpError);

      await expect(service.wechatAuth(validDto)).rejects.toThrow(httpError);
    });
  });

  describe('code2Session', () => {
    const validCode = 'test-code';

    it('should exchange code for session successfully', async () => {
      const mockResponse = {
        data: mockWechatSession,
      };

      axiosMock.get.mockResolvedValue(mockResponse);

      const result = await service['code2Session'](validCode);

      expect(result).toEqual(mockWechatSession);
      expect(axiosMock.get).toHaveBeenCalledWith(
        'https://api.weixin.qq.com/sns/jscode2session?appid=test-appid&secret=test-secret&js_code=test-code&grant_type=authorization_code',
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should handle missing code', async () => {
      await expect(service['code2Session']('')).rejects.toThrow(
        new HttpException('Code is required', HttpStatus.BAD_REQUEST)
      );
    });

    it('should handle WeChat API error response', async () => {
      const errorResponse = {
        data: {
          errcode: 40013,
          errmsg: 'invalid appid',
        },
      };

      axiosMock.get.mockResolvedValue(errorResponse);

      await expect(service['code2Session'](validCode)).rejects.toThrow(
        new HttpException(
          'code2Session failed: {"errcode":40013,"errmsg":"invalid appid"}',
          HttpStatus.BAD_REQUEST
        )
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      axiosMock.get.mockRejectedValue(networkError);

      await expect(service['code2Session'](validCode)).rejects.toThrow(
        new HttpException(
          'WeChat API request failed: Network error',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded');
      axiosMock.get.mockRejectedValue(timeoutError);

      await expect(service['code2Session'](validCode)).rejects.toThrow(
        new HttpException(
          'WeChat API request failed: timeout of 10000ms exceeded',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});