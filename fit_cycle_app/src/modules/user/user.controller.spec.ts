import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from '@/dtos/user.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { UserTransformer } from '@/common/transformers/user.transformer';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findById: jest.fn(),
    updateMe: jest.fn(),
  };

  const mockUser = {
    id: 1,
    nickname: 'Test User',
    avatarUrl: 'http://test.com/avatar.jpg',
    email: 'test@example.com',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    heightCm: 175,
    weightKg: 70,
    targetWeightKg: 65,
    goalRate: 0.5,
    genderId: 1,
    activityLevelId: 2,
    goalTypeId: 1,
    isCompleted: true,
  };

  const mockTransformedUser = {
    ...mockUser,
  };

  const mockReq = {
    user: {
      userId: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    // Mock UserTransformer
    jest.spyOn(UserTransformer, 'toResponse').mockReturnValue(mockTransformedUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateMe', () => {
    const validUpdateDto: UpdateUserDto = {
      nickname: 'Updated User',
      email: 'updated@example.com',
      heightCm: 180,
      weightKg: 75,
    };

    it('should update user profile successfully', async () => {
      mockUserService.updateMe.mockResolvedValue(mockTransformedUser);

      const result = await controller.updateMe(validUpdateDto, mockReq as any);

      expect(result).toEqual({
        success: true,
        message: 'User profile updated successfully',
        data: mockTransformedUser,
      });
      expect(userService.updateMe).toHaveBeenCalledWith(1, validUpdateDto);
    });

    it('should handle user not found', async () => {
      const error = new NotFoundException('User not found');
      mockUserService.updateMe.mockRejectedValue(error);

      await expect(controller.updateMe(validUpdateDto, mockReq as any)).rejects.toThrow(error);
      expect(userService.updateMe).toHaveBeenCalledWith(1, validUpdateDto);
    });

    it('should handle validation errors', async () => {
      const error = new HttpException('Validation failed', HttpStatus.BAD_REQUEST);
      mockUserService.updateMe.mockRejectedValue(error);

      await expect(controller.updateMe(validUpdateDto, mockReq as any)).rejects.toThrow(error);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockUserService.updateMe.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.updateMe(validUpdateDto, mockReq as any)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Failed to update user profile',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error in updateMe:', error);
      consoleSpy.mockRestore();
    });

    it('should handle partial updates', async () => {
      const partialDto: UpdateUserDto = {
        nickname: 'Partial Update',
      };

      mockUserService.updateMe.mockResolvedValue({ ...mockTransformedUser, nickname: partialDto.nickname });

      const result = await controller.updateMe(partialDto, mockReq as any);

      expect(result).toEqual({
        success: true,
        message: 'User profile updated successfully',
        data: { ...mockTransformedUser, nickname: partialDto.nickname },
      });
      expect(userService.updateMe).toHaveBeenCalledWith(1, partialDto);
    });

    it('should handle empty update DTO', async () => {
      const emptyDto: UpdateUserDto = {};

      mockUserService.updateMe.mockResolvedValue(mockTransformedUser);

      const result = await controller.updateMe(emptyDto, mockReq as any);

      expect(result).toEqual({
        success: true,
        message: 'User profile updated successfully',
        data: mockTransformedUser,
      });
      expect(userService.updateMe).toHaveBeenCalledWith(1, emptyDto);
    });
  });

  describe('getMe', () => {
    it('should get user profile successfully', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockReq as any);

      expect(result).toEqual({
        success: true,
        message: 'User profile retrieved successfully',
        data: mockTransformedUser,
      });
      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(UserTransformer.toResponse).toHaveBeenCalledWith(mockUser);
    });

    it('should handle user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(controller.getMe(mockReq as any)).rejects.toThrow(
        new NotFoundException('User not found')
      );
      expect(userService.findById).toHaveBeenCalledWith(1);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockUserService.findById.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.getMe(mockReq as any)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Failed to retrieve user profile',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error in getMe:', error);
      consoleSpy.mockRestore();
    });

    it('should handle service HttpException', async () => {
      const error = new HttpException('Service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      mockUserService.findById.mockRejectedValue(error);

      await expect(controller.getMe(mockReq as any)).rejects.toThrow(error);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing user in request', async () => {
      const reqWithoutUser = {
        user: null,
      };

      const error = new Error('Cannot read property \'userId\' of null');
      mockUserService.findById.mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.getMe(reqWithoutUser as any)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Failed to retrieve user profile',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid user ID in request', async () => {
      const reqWithInvalidId = {
        user: {
          userId: 'invalid-id',
        },
      };

      const error = new Error('Invalid user ID');
      mockUserService.findById.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.getMe(reqWithInvalidId as any)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Failed to retrieve user profile',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      consoleSpy.mockRestore();
    });

    it('should handle very large update payload', async () => {
      const largeDto: UpdateUserDto = {
        nickname: 'x'.repeat(1000),
        email: 'x'.repeat(500) + '@example.com',
      };

      mockUserService.updateMe.mockResolvedValue({ ...mockTransformedUser, ...largeDto });

      const result = await controller.updateMe(largeDto, mockReq as any);

      expect(result.data.nickname).toBe(largeDto.nickname);
      expect(result.data.email).toBe(largeDto.email);
    });

    it('should handle special characters in update', async () => {
      const specialCharDto: UpdateUserDto = {
        nickname: '🚀 User with émojis & sp€cial chars!',
      };

      mockUserService.updateMe.mockResolvedValue({ ...mockTransformedUser, nickname: specialCharDto.nickname });

      const result = await controller.updateMe(specialCharDto, mockReq as any);

      expect(result.data.nickname).toBe(specialCharDto.nickname);
    });

    it('should handle concurrent requests', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const promises = Array(10).fill(null).map(() => controller.getMe(mockReq as any));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockTransformedUser);
      });
    });
  });

  describe('environment-specific behavior', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should include error details in development environment', async () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Detailed error message');
      mockUserService.updateMe.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.updateMe({} as UpdateUserDto, mockReq as any)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Failed to update user profile',
            error: 'Detailed error message',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      consoleSpy.mockRestore();
    });

    it('should hide error details in production environment', async () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Detailed error message');
      mockUserService.updateMe.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.updateMe({} as UpdateUserDto, mockReq as any)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Failed to update user profile',
            error: undefined,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      consoleSpy.mockRestore();
    });
  });

  describe('response format consistency', () => {
    it('should always return consistent success response format', async () => {
      mockUserService.updateMe.mockResolvedValue(mockTransformedUser);

      const result = await controller.updateMe({} as UpdateUserDto, mockReq as any);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(typeof result.data).toBe('object');
    });

    it('should always return consistent error response format', async () => {
      const error = new Error('Test error');
      mockUserService.updateMe.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await controller.updateMe({} as UpdateUserDto, mockReq as any);
      } catch (exception) {
        expect(exception.response).toHaveProperty('success', false);
        expect(exception.response).toHaveProperty('message');
        expect(exception.response).toHaveProperty('error');
      }

      consoleSpy.mockRestore();
    });
  });
});