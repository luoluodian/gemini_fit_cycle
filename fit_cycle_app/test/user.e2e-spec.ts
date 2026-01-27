import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/database/entity/user.entity';

describe('User Entity (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    if (createdUserId) {
      await userRepository.delete(createdUserId);
    }
    await app.close();
  });

  it('should create, save, and find a user', async () => {
    // 1. Create a user object
    const openId = `test-openid-${Date.now()}`;
    const user = new User();
    user.openId = openId;
    user.nickname = 'test-user';
    user.avatarUrl = 'http://example.com/avatar.png';
    user.target_calories = 2000;
    user.target_protein = 150;
    user.target_fat = 50;
    user.target_carbs = 250;

    // 2. Save the user
    const savedUser = await userRepository.save(user);
    expect(savedUser).toBeDefined();
    expect(savedUser.id).toBeDefined();
    createdUserId = savedUser.id; // Store ID for cleanup

    // 3. Find the user
    const foundUser = await userRepository.findOne({ where: { id: savedUser.id } });
    expect(foundUser).not.toBeNull();
    expect(foundUser!.openId).toEqual(openId);
    expect(foundUser!.nickname).toEqual('test-user');
    expect(foundUser!.target_calories).toEqual(2000);
  });
});
