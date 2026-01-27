// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  // 统一响应格式拦截器
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 1. 拦截器处理业务失败：{ error: 'xxx' }
        if (
          data &&
          typeof data === 'object' &&
          'error' in data &&
          typeof (data as any).error === 'string'
        ) {
          return {
            code: 400,
            message: (data as any).error,
            data: null,
          };
        }

        // 2. 已经是包装好的格式（比如异常过滤器返回）
        if (data && typeof data === 'object' && 'code' in data) {
          return data;
        }

        // 3. 正常成功结果 → 统一包装
        const summary = {
          type: Array.isArray(data) ? 'array' : typeof data,
          size:
            typeof data === 'string'
              ? (data as string).length
              : Array.isArray(data)
                ? (data as any[]).length
                : data && typeof data === 'object'
                  ? Object.keys(data).length
                  : 0,
        };
        this.logger.log({ level: 'info', message: '响应成功', ...summary });

        return {
          code: 200,
          message: 'success',
          data,
        };
      }),
    );
  }
}

/**
 * 请求日志拦截器
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const { method, url, body } = req;
    const traceId = req.traceId || req.headers['x-trace-id'];
    const now = Date.now();
    const mask = (obj: any) => {
      if (!obj || typeof obj !== 'object') return obj;
      const sensitive = ['password', 'token', 'accessToken', 'refreshToken'];
      const out: any = Array.isArray(obj) ? [] : {};
      for (const k of Object.keys(obj)) {
        const v = (obj as any)[k];
        out[k] = sensitive.includes(k)
          ? '***'
          : typeof v === 'object'
            ? mask(v)
            : v;
      }
      return out;
    };

    this.logger.log({
      level: 'info',
      message: '收到请求',
      traceId,
      method,
      url,
      ip: req.ip,
      ua: req.headers['user-agent'],
      params: req.params,
      query: req.query,
      body: mask(body),
      userId: req.user?.userId,
    });

    return next.handle().pipe(
      tap((responseBody) => {
        const resultType = Array.isArray(responseBody)
          ? 'array'
          : typeof responseBody;
        const resultSize = Array.isArray(responseBody)
          ? (responseBody as any[]).length
          : typeof responseBody === 'string'
            ? (responseBody as string).length
            : responseBody && typeof responseBody === 'object'
              ? Object.keys(responseBody).length
              : 0;
        this.logger.log({
          level: 'info',
          message: '请求结束',
          traceId,
          method,
          url,
          statusCode: res.statusCode,
          durationMs: Date.now() - now,
          resultType,
          resultSize,
        });
      }),
      catchError((err) => {
        this.logger.log({
          level: 'error',
          message: '请求处理报错',
          traceId,
          method,
          url,
          statusCode: res.statusCode,
          error: err?.message || String(err),
        });
        throw err;
      }),
    );
  }
}
