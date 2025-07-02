import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    this.logger.error('Unhandled exception', exception as any);

    response.status(status).json({
      statusCode: status,
      message: status === 500 ? 'Internal server error' : (exception as any).message,
    });
  }
} 