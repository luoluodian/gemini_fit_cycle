import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    
    // Apply production interceptors and filters
    const transformInterceptor = app.get(TransformInterceptor);
    const httpExceptionFilter = app.get(HttpExceptionFilter);
    app.useGlobalInterceptors(transformInterceptor);
    app.useGlobalFilters(httpExceptionFilter);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/wechatAuth (POST) - Success', async () => {
    const mockOpenid = 'test-openid-' + Date.now();
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: {
        openid: mockOpenid,
      },
    });

    const loginDto = {
      code: 'valid-code',
      rawData: JSON.stringify({
        nickName: 'TestUser',
        avatarUrl: 'http://test.com/avatar.png',
      }),
    };

    const response = await request(app.getHttpServer())
      .post('/auth/wechatAuth')
      .send(loginDto)
      .expect(201); // Standard POST status

    expect(response.body.code).toBe(200); // Wrapped by TransformInterceptor
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.nickname).toBe('TestUser');
  });

  it('/auth/wechatAuth (POST) - Failure (Missing code)', async () => {
    return request(app.getHttpServer())
      .post('/auth/wechatAuth')
      .send({})
      .expect(400);
  });

  it('/auth/wechatAuth (POST) - Failure (WeChat API Error)', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: {
        errcode: 40029,
        errmsg: 'invalid code',
      },
    });

    const loginDto = {
      code: 'invalid-code',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/wechatAuth')
      .send(loginDto)
      .expect(401);

    expect(response.body.code).toBe(401);
  });
});
