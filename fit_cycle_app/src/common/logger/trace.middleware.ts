import { Injectable, NestMiddleware } from '@nestjs/common';
import { TraceUtil } from '../utils/trace.util';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const incoming = req.headers['x-trace-id'];
    req.traceId = incoming || TraceUtil.createTraceId();
    res.setHeader('X-Trace-Id', req.traceId);
    next();
  }
}
