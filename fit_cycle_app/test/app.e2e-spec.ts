import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../src/config/config.module';
import { DatabaseModule } from '../src/database/database.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideModule(AppConfigModule)
    .useModule(ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [
        () => ({
          JWT_SECRET: 'test_jwt_secret',
          JWT_REFRESH_SECRET: 'test_jwt_refresh_secret',
          WECHAT_APPID: 'test_wechat_appid',
          WECHAT_SECRET: 'test_wechat_secret',
          WECHAT_API: 'http://test-wechat-api.com',
          DB_TYPE: 'sqlite',
          DB_DATABASE: ':memory:', // In-memory sqlite
          DB_SYNC: 'true',
          NODE_ENV: 'test',
        }),
      ],
    }))
    .overrideModule(DatabaseModule)
    .useModule(TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to use ConfigService
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite', // Use sqlite for testing
        database: ':memory:', // In-memory database
        synchronize: true, // Auto-create schema for testing
        autoLoadEntities: true, // Let TypeORM auto-load entities from EntitiesModule
      }),
    }))
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => { // Add afterEach to close app
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
