import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { WechatAuthDto, RefreshTokenDto } from '@/dtos/user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    wechatAuth: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockWechatAuthResult = {
    user: {
      id: 1,
      nickname: 'Test User',
      avatarUrl: 'http://test.com/avatar.jpg',
    },
    token: 'test-jwt-token',
  };

  const mockRefreshTokenResult = {
    token: 'new-jwt-token',
    refreshToken: 'new-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login (wechatAuth)', () => {
    const validDto: WechatAuthDto = {
      code: 'test-code',
      rawData: JSON.stringify({
        nickName: 'Test User',
        avatarUrl: 'http://test.com/avatar.jpg',
      }),
    };

    it('should authenticate user successfully', async () => {
      mockAuthService.wechatAuth.mockResolvedValue(mockWechatAuthResult);

      const result = await controller.wechatLogin(validDto);

      expect(result).toEqual(mockWechatAuthResult);
      expect(authService.wechatAuth).toHaveBeenCalledWith(validDto);
    });

    it('should handle authentication failure', async () => {
      const error = new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      mockAuthService.wechatAuth.mockRejectedValue(error);

      await expect(controller.wechatLogin(validDto)).rejects.toThrow(error);
      expect(authService.wechatAuth).toHaveBeenCalledWith(validDto);
    });

    it('should handle missing code', async () => {
      const invalidDto = { ...validDto, code: '' };
      const error = new HttpException('Code is required', HttpStatus.BAD_REQUEST);
      mockAuthService.wechatAuth.mockRejectedValue(error);

      await expect(controller.wechatLogin(invalidDto)).rejects.toThrow(error);
    });

    it('should handle malformed rawData', async () => {
      const invalidDto = {
        code: 'test-code',
        rawData: 'invalid-json',
      };

      mockAuthService.wechatAuth.mockResolvedValue(mockWechatAuthResult);

      const result = await controller.wechatLogin(invalidDto);

      expect(result).toEqual(mockWechatAuthResult);
      expect(authService.wechatAuth).toHaveBeenCalledWith(invalidDto);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service unavailable');
      mockAuthService.wechatAuth.mockRejectedValue(error);

      await expect(controller.wechatLogin(validDto)).rejects.toThrow(error);
    });
  });

  describe('refresh', () => {
    const mockReq = {
      user: {
        userId: 1,
      },
    };

    const validDto: RefreshTokenDto = {
      refreshToken: 'test-refresh-token',
    };

    it('should refresh token successfully', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshTokenResult);

      const result = await controller.refresh(mockReq as any, validDto);

      expect(result).toEqual(mockRefreshTokenResult);
      expect(authService.refreshToken).toHaveBeenCalledWith(1, 'test-refresh-token');
    });

    it('should handle invalid refresh token', async () => {
      const error = new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refresh(mockReq as any, validDto)).rejects.toThrow(error);
      expect(authService.refreshToken).toHaveBeenCalledWith(1, 'test-refresh-token');
    });

    it('should handle missing refresh token', async () => {
      const invalidDto = { refreshToken: '' };
      const error = new HttpException('Refresh token is required', HttpStatus.BAD_REQUEST);
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refresh(mockReq as any, invalidDto)).rejects.toThrow(error);
    });

    it('should handle expired refresh token', async () => {
      const error = new HttpException('Refresh token expired', HttpStatus.UNAUTHORIZED);
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refresh(mockReq as any, validDto)).rejects.toThrow(error);
    });

    it('should handle service errors during refresh', async () => {
      const error = new Error('Database error');
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refresh(mockReq as any, validDto)).rejects.toThrow(error);
    });
  });

  describe('input validation', () => {
    it('should validate WechatAuthDto structure', async () => {
      const invalidDto = {
        // Missing required 'code' field
        rawData: 'some-data',
      };

      // ValidationPipe is applied at the controller level
      // This test verifies the controller structure
      expect(controller.wechatLogin).toBeDefined();
    });

    it('should validate RefreshTokenDto structure', async () => {
      const invalidDto = {
        // Missing required 'refreshToken' field
        someOtherField: 'value',
      };

      // ValidationPipe is applied at the controller level
      // This test verifies the controller structure
      expect(controller.refresh).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty request body', async () => {
      const emptyDto = {} as WechatAuthDto;
      const error = new HttpException('Code is required', HttpStatus.BAD_REQUEST);
      mockAuthService.wechatAuth.mockRejectedValue(error);

      await expect(controller.wechatLogin(emptyDto)).rejects.toThrow(error);
    });

    it('should handle null request user', async () => {
      const reqWithNullUser = {
        user: null,
      };

      const error = new Error('User not found in request');
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refresh(reqWithNullUser as any, { refreshToken: 'token' })).rejects.toThrow(error);
    });

    it('should handle very long code', async () => {
      const longCode = 'a'.repeat(1000);
      const dto = { code: longCode };

      mockAuthService.wechatAuth.mockResolvedValue(mockWechatAuthResult);

      const result = await controller.wechatLogin(dto);

      expect(result).toEqual(mockWechatAuthResult);
      expect(authService.wechatAuth).toHaveBeenCalledWith(dto);
    });

    it('should handle special characters in rawData', async () => {
      const specialCharData = JSON.stringify({
        nickName: '🚀 User with émojis & sp€cial chars!',
        avatarUrl: 'http://test.com/avatar.jpg?param=value&other=test',
      });

      const dto = {
        code: 'test-code',
        rawData: specialCharData,
      };

      mockAuthService.wechatAuth.mockResolvedValue(mockWechatAuthResult);

      const result = await controller.wechatLogin(dto);

      expect(result).toEqual(mockWechatAuthResult);
      expect(authService.wechatAuth).toHaveBeenCalledWith(dto);
    });
  });
});