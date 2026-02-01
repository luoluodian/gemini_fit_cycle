import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../../database/entity/user.entity';
import { HealthProfile } from '../../database/entity/health-profile.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHealthProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(HealthProfile),
          useValue: mockHealthProfileRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateHealthMetrics (logic test)', () => {
    it('should correctly calculate BMR and TDEE for male', () => {
      const profile = {
        gender: 'male',
        weight: 70,
        height: 175,
        birthday: '1990-01-01',
        activityLevel: 1.2,
      } as any;
      
      const currentYear = new Date().getFullYear();
      const age = currentYear - 1990;
      // Formula: 10*70 + 6.25*175 - 5*age + 5
      const expectedBmr = 10 * 70 + 6.25 * 175 - 5 * age + 5;
      const expectedTdee = expectedBmr * 1.2;

      (service as any).calculateHealthMetrics(profile);

      expect(profile.bmr).toBe(Math.round(expectedBmr));
      expect(profile.tdee).toBe(Math.round(expectedTdee));
    });

    it('should correctly calculate BMR and TDEE for female', () => {
      const profile = {
        gender: 'female',
        weight: 55,
        height: 165,
        birthday: '1995-01-01',
        activityLevel: 1.55,
      } as any;
      
      const currentYear = new Date().getFullYear();
      const age = currentYear - 1995;
      // Formula: 10*55 + 6.25*165 - 5*age - 161
      const expectedBmr = 10 * 55 + 6.25 * 165 - 5 * age - 161;
      const expectedTdee = expectedBmr * 1.55;

      (service as any).calculateHealthMetrics(profile);

      expect(profile.bmr).toBe(Math.round(expectedBmr));
      expect(profile.tdee).toBe(Math.round(expectedTdee));
    });
  });

  describe('findOrCreateByOpenid', () => {
    const openId = 'test-openid';

    it('should find an existing user', async () => {
      const existingUser = new User();
      existingUser.id = 1;
      existingUser.openId = openId;
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.findOrCreateByOpenid(openId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ 
        where: { openId },
        relations: ['healthProfile']
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });

    it('should create a new user if not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined); // User not found
      const newUser = new User();
      newUser.openId = openId;
      mockUserRepository.create.mockReturnValue(newUser); // Return a new user instance
      mockUserRepository.save.mockResolvedValue(newUser); // Save returns the new user
      mockHealthProfileRepository.create.mockReturnValue({});

      const result = await service.findOrCreateByOpenid(openId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ 
        where: { openId },
        relations: ['healthProfile']
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({ openId });
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });
});
