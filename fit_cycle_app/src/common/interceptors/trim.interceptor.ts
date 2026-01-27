import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TrimInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (req.body) {
      req.body = this.trimValues(req.body);
    }

    if (req.query) {
      req.query = this.trimValues(req.query);
    }

    if (req.params) {
      req.params = this.trimValues(req.params);
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }

  private trimValues(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value.map((v) => this.trimValues(v));
    }

    if (typeof value === 'object' && value !== null) {
      const obj: Record<string, any> = {};
      const keys = Object.keys(value);
      for (const key of keys) {
        obj[key] = this.trimValues((value as Record<string, any>)[key]);
      }
      return obj;
    }

    return value;
  }
}
