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
      expect(errors[0].property).toBe('code');
    });

    it('should fail validation with empty code', async () => {
      const dto = plainToInstance(WechatAuthDto, {
        code: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate with all optional fields', async () => {
      const dto = plainToInstance(WechatAuthDto, {
        code: 'valid-code',
        rawData: JSON.stringify({ nickName: 'Test', avatarUrl: 'http://test.com' }),
        encryptedDataProfile: 'encrypted-data',
        ivProfile: 'iv-string',
        signature: 'signature-string',
        encryptedDataPhone: 'phone-data',
        ivPhone: 'phone-iv',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with partial optional fields', async () => {
      const dto = plainToInstance(WechatAuthDto, {
        code: 'valid-code',
        rawData: JSON.stringify({ nickName: 'Test' }),
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle very long code', async () => {
      const longCode = 'a'.repeat(1000);
      const dto = plainToInstance(WechatAuthDto, {
        code: longCode,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle special characters in code', async () => {
      const dto = plainToInstance(WechatAuthDto, {
        code: 'code-with-special-chars-!@#$%^&*()',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('UpdateUserDto', () => {
    it('should validate with empty DTO', async () => {
      const dto = plainToInstance(UpdateUserDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // All fields are optional
    });

    it('should validate with valid nickname', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        nickname: 'Valid Nickname',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

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
      expect(errors[0].property).toBe('email');
    });

    it('should validate with valid phone', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        phone: '+1234567890',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with valid date of birth', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        dateOfBirth: '1990-01-01',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with valid numeric fields', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        heightCm: 175,
        weightKg: 70,
        targetWeightKg: 65,
        goalRate: 0.5,
        genderId: 1,
        activityLevelId: 2,
        goalTypeId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with zero values', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        heightCm: 0,
        weightKg: 0,
        targetWeightKg: 0,
        goalRate: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with negative values', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        heightCm: -10,
        weightKg: -5,
        goalRate: -1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // Note: Business logic should validate ranges
    });

    it('should validate with decimal values', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        heightCm: 175.5,
        weightKg: 70.2,
        goalRate: 0.75,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with very long strings', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        nickname: 'a'.repeat(300),
        email: 'a'.repeat(100) + '@example.com',
        phone: '1' + 'a'.repeat(50),
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // Note: Length constraints should be added if needed
    });

    it('should validate with special characters', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        nickname: '🚀 User with émojis & sp€cial chars!',
        email: 'test+special@example.com',
        phone: '+1 (555) 123-4567',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should transform string numbers to numbers', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        heightCm: '175',
        weightKg: '70',
        targetWeightKg: '65',
        goalRate: '0.5',
        genderId: '1',
        activityLevelId: '2',
        goalTypeId: '1',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(typeof dto.heightCm).toBe('number');
      expect(typeof dto.weightKg).toBe('number');
      expect(typeof dto.targetWeightKg).toBe('number');
      expect(typeof dto.goalRate).toBe('number');
      expect(typeof dto.genderId).toBe('number');
      expect(typeof dto.activityLevelId).toBe('number');
      expect(typeof dto.goalTypeId).toBe('number');
    });

    it('should handle invalid date format', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        dateOfBirth: 'invalid-date',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // Date validation should be handled at business logic level
    });

    it('should validate with all fields', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        nickname: 'Complete User',
        avatarUrl: 'http://example.com/avatar.jpg',
        email: 'complete@example.com',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        heightCm: 175,
        weightKg: 70,
        targetWeightKg: 65,
        goalRate: 0.5,
        genderId: 1,
        activityLevelId: 2,
        goalTypeId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('UserResponseDto', () => {
    it('should create valid response DTO', () => {
      const userData = {
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

      const dto = plainToInstance(UserResponseDto, userData);

      expect(dto.id).toBe(userData.id);
      expect(dto.nickname).toBe(userData.nickname);
      expect(dto.avatarUrl).toBe(userData.avatarUrl);
      expect(dto.email).toBe(userData.email);
      expect(dto.phone).toBe(userData.phone);
      expect(dto.dateOfBirth).toBe(userData.dateOfBirth);
      expect(dto.heightCm).toBe(userData.heightCm);
      expect(dto.weightKg).toBe(userData.weightKg);
      expect(dto.targetWeightKg).toBe(userData.targetWeightKg);
      expect(dto.goalRate).toBe(userData.goalRate);
      expect(dto.genderId).toBe(userData.genderId);
      expect(dto.activityLevelId).toBe(userData.activityLevelId);
      expect(dto.goalTypeId).toBe(userData.goalTypeId);
      expect(dto.isCompleted).toBe(userData.isCompleted);
    });

    it('should handle null/optional fields', () => {
      const userData = {
        id: 1,
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

      const dto = plainToInstance(UserResponseDto, userData);

      expect(dto.email).toBeNull();
      expect(dto.phone).toBeNull();
      expect(dto.dateOfBirth).toBeNull();
      expect(dto.heightCm).toBeNull();
      expect(dto.weightKg).toBeNull();
      expect(dto.targetWeightKg).toBeNull();
      expect(dto.goalRate).toBeNull();
      expect(dto.genderId).toBeNull();
      expect(dto.activityLevelId).toBeNull();
      expect(dto.goalTypeId).toBeNull();
      expect(dto.isCompleted).toBe(false);
    });
  });

  describe('edge cases and type safety', () => {
    it('should handle undefined values', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        nickname: undefined,
        email: undefined,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle null values', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        nickname: null,
        email: null,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle empty strings', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        nickname: '',
        email: '',
        phone: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // Empty strings are valid unless explicitly forbidden
    });

    it('should handle whitespace-only strings', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        nickname: '   ',
        email: '   ',
        phone: '   ',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle numeric strings for numeric fields', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        heightCm: '175',
        weightKg: '70.5',
        goalRate: '0.5',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(typeof dto.heightCm).toBe('number');
      expect(typeof dto.weightKg).toBe('number');
      expect(typeof dto.goalRate).toBe('number');
    });

    it('should handle invalid numeric strings', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        heightCm: 'invalid-number',
        weightKg: 'also-invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // Type transformation will handle this
      expect(dto.heightCm).toBeNaN();
      expect(dto.weightKg).toBeNaN();
    });
  });
});