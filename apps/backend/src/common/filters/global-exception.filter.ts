/**
 * Global Exception Filter
 * Catches all exceptions and formats them consistently
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).error;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof TypeError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;

      // Handle TypeORM specific errors
      if (exception.constructor.name === 'QueryFailedError') {
        const dbError = exception as any;
        if (dbError.code === '23505') {
          // Unique constraint violation
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
        } else if (dbError.code === '23503') {
          // Foreign key violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference';
        } else {
          status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
      }
    }

    // Log error
    this.logger.error({
      message,
      status,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Send response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(errors && { errors }),
    });
  }
}
