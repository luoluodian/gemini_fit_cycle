import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../../database/entity/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreateByOpenid', () => {
    const openId = 'test-openid';

    it('should find an existing user', async () => {
      const existingUser = new User();
      existingUser.id = 1;
      existingUser.openId = openId;
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.findOrCreateByOpenid(openId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { openId } });
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

      const result = await service.findOrCreateByOpenid(openId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { openId } });
      expect(mockUserRepository.create).toHaveBeenCalledWith({ openId });
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });
});
