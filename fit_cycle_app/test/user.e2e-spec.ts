import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/database/entity/user.entity';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../src/database/database.module';

describe('User Entity (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideModule(DatabaseModule)
    .useModule(TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        autoLoadEntities: true,
      }),
    }))
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  }, 30000);

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
  });
});
