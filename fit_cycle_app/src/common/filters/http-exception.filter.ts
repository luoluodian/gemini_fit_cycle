// src/common/filter/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse();
    const request = http.getRequest();

    let status = 500;
    let message = '服务器错误';

    if (exception instanceof HttpException) {
      status = (exception as HttpException).getStatus();
      const res = (exception as HttpException).getResponse() as any;
      message = (res && res.message) || message;
    } else if (exception && exception.message) {
      message = exception.message;
    }
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

    const payload = {
      traceId: request?.traceId || request?.headers?.['x-trace-id'],
      method: request?.method,
      url: request?.url,
      params: request?.params,
      query: request?.query,
      body: mask(request?.body),
      status,
      errorMessage: message,
      error: exception?.name,
      stack: exception?.stack,
    };
    this.logger.log({ level: 'error', message: 'HTTP异常', ...payload });

    return response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}
