// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  TransformInterceptor,
  RequestLoggerInterceptor,
} from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { TrimInterceptor } from './common/interceptors/trim.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TraceMiddleware } from './common/logger/trace.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  // ✅ 让 Nest 自己的日志也走 winston（控制台 + 文件）
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // ✅ 用 DI 拿到带 logger 的拦截器实例
  const transformInterceptor = app.get(TransformInterceptor);
  const requestLoggerInterceptor = app.get(RequestLoggerInterceptor);
  const trimInterceptor = app.get(TrimInterceptor);

  // 全局拦截器（顺序：封装响应 -> 请求日志 -> trim）
  app.useGlobalInterceptors(
    transformInterceptor,
    requestLoggerInterceptor,
    trimInterceptor,
  );
  app.use(new TraceMiddleware().use);
  const httpExceptionFilter = app.get(HttpExceptionFilter);
  app.useGlobalFilters(httpExceptionFilter);

  // 全局 DTO 校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
