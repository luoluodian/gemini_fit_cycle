import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WechatAuthDto, UpdateUserDto, UserResponseDto } from './user.dto';

describe('User DTOs', () => {
  describe('WechatAuthDto', () => {
    it('should validate with valid code', async () => {
      const dto = plainToInstance(WechatAuthDto, {
        code: 'valid-code',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing code', async () => {
      const dto = plainToInstance(WechatAuthDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateUserDto', () => {
    it('should validate with valid email', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        email: 'test@example.com',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid email', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        email: 'invalid-email',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UserResponseDto', () => {
    it('should create valid nested response DTO', () => {
      const transformedData = {
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
          bmr: 1600,
          tdee: 2000,
        },
        stats: {
          totalDays: 5,
          completedPlans: 1,
        }
      };

      const dto = plainToInstance(UserResponseDto, transformedData);

      expect(dto.user.nickname).toBe(transformedData.user.nickname);
      expect(dto.health.bmr).toBe(transformedData.health.bmr);
      expect(dto.stats.totalDays).toBe(transformedData.stats.totalDays);
    });
  });
});
