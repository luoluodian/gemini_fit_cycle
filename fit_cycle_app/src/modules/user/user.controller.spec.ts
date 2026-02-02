import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from '@/dtos/user.dto';
import { NotFoundException } from '@nestjs/common';
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
    healthProfile: {
      gender: 'male',
      height: 175,
      weight: 70,
      birthday: '1990-01-01',
      activityLevel: 1.2,
      bmr: 1600,
      tdee: 2000,
    }
  };

  const mockTransformedUser = {
    user: {
      nickname: 'Test User',
      avatarUrl: 'http://test.com/avatar.jpg',
      isCompleted: true,
    },
    health: {
      genderId: 1,
      genderText: '男',
      heightCm: 175,
      weightKg: 70,
      dateOfBirth: '1990-01-01',
      activityLevelId: 1,
      activityLevelText: '1.2',
      bmr: 1600,
      tdee: 2000,
    },
    stats: {
      totalDays: 0,
      completedPlans: 0,
    }
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateMe', () => {
    const validUpdateDto: UpdateUserDto = {
      nickname: 'Updated User',
    };

    it('should update user profile successfully', async () => {
      mockUserService.updateMe.mockResolvedValue(mockUser);

      const result = await controller.updateMe(validUpdateDto, mockReq as any);

      expect(result).toEqual(mockUser);
      expect(userService.updateMe).toHaveBeenCalledWith(1, validUpdateDto);
    });
  });

  describe('getMe', () => {
    it('should get user profile successfully', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);
      jest.spyOn(UserTransformer, 'toResponse').mockReturnValue(mockTransformedUser as any);

      const result = await controller.getMe(mockReq as any);

      expect(result).toEqual(mockTransformedUser);
      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(UserTransformer.toResponse).toHaveBeenCalledWith(mockUser);
    });

    it('should handle user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);
      jest.spyOn(UserTransformer, 'toResponse').mockReturnValue(null);

      const result = await controller.getMe(mockReq as any);
      expect(result).toBeNull();
    });
  });

  describe('updateHealth', () => {
    it('should return bmr and tdee after health update', async () => {
      mockUserService.updateMe.mockResolvedValue(mockUser);
      
      const result = await controller.updateHealth({ heightCm: 180 } as any, mockReq as any);
      
      expect(result).toEqual({
        bmr: 1600,
        tdee: 2000
      });
    });
  });
});
