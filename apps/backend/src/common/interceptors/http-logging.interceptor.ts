/**
 * HTTP Logging Interceptor
 * Logs all HTTP requests and responses
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const timestamp = Date.now();

    return next.handle().pipe(
      tap((_data) => {
        const duration = Date.now() - timestamp;
        const response = context.switchToHttp().getResponse();

        this.logger.debug(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            userId: user?.sub || 'anonymous',
            userType: user?.userType || null,
            userRoles: user?.roles || [],
          }),
        );
      }),
    );
  }
}
