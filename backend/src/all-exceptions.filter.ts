import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Sentry } from './config/sentry.config';
import { logger } from './config/logger.config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Extract request context for logging
    const requestContext = {
      method: request?.method,
      url: request?.url,
      userAgent: request?.headers?.['user-agent'],
      ip: request?.ip,
      userId: request?.user?.id,
      timestamp: new Date().toISOString()
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Log HTTP exceptions with context
      logger.warn('HTTP Exception', {
        ...requestContext,
        status,
        exception: exceptionResponse,
        stack: exception.stack
      });

      // Don't send to Sentry for client errors (4xx)
      if (status >= 500) {
        Sentry.captureException(exception, {
          tags: {
            type: 'http_exception',
            status: status.toString()
          },
          extra: requestContext
        });
      }

      response
        .status(status)
        .json(
          typeof exceptionResponse === 'string'
            ? { message: exceptionResponse }
            : exceptionResponse,
        );
      return;
    }

    // Handle unhandled exceptions
    const error = exception as Error;
    
    logger.error('Unhandled Exception', {
      ...requestContext,
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Send to Sentry for monitoring
    Sentry.captureException(exception, {
      tags: {
        type: 'unhandled_exception'
      },
      extra: requestContext
    });

    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message;

    response.status(500).json({
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request?.url,
      message: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
}
