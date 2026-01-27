import { randomUUID } from 'crypto';

export class TraceUtil {
  static createTraceId(): string {
    // 16位更适合日志，可自定义
    return randomUUID().replace(/-/g, '').slice(0, 16);
  }
}
