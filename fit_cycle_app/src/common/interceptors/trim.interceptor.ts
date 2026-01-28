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
      if (typeof req.body === 'object') {
        this.trimInPlace(req.body);
      } else if (typeof req.body === 'string') {
        // req.body is usually writable, try to trim if string
        try {
          req.body = req.body.trim();
        } catch (e) {
          // ignore if read-only
        }
      }
    }

    if (req.query && typeof req.query === 'object') {
      this.trimInPlace(req.query);
    }

    if (req.params && typeof req.params === 'object') {
      this.trimInPlace(req.params);
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }

  private trimInPlace(value: any): void {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string') {
          value[i] = value[i].trim();
        } else if (typeof value[i] === 'object') {
          this.trimInPlace(value[i]);
        }
      }
      return;
    }

    for (const key of Object.keys(value)) {
      const prop = value[key];
      if (typeof prop === 'string') {
        value[key] = prop.trim();
      } else if (typeof prop === 'object') {
        this.trimInPlace(prop);
      }
    }
  }
}
