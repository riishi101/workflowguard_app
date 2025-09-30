import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

// Production imports
import { initializeSentry, Sentry } from './config/sentry.config';
import { logger } from './config/logger.config';
import { 
  helmetConfig, 
  compressionConfig, 
  createRateLimiter, 
  createApiRateLimiter,
  requestLogger 
} from './middleware/security.middleware';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { createProductionConfig, validateProductionConfig } from './config/production.config';

// Polyfill for crypto.randomUUID if not available
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => randomUUID(),
  } as any;
}

async function bootstrap() {
  // Initialize error monitoring first
  if (process.env.NODE_ENV === 'production') {
    initializeSentry();
    logger.info('Sentry initialized for production monitoring');
  }

  logger.info('Starting WorkflowGuard backend application', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    version: process.env.APP_VERSION || '1.0.0'
  });

  try {
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [
              'https://www.workflowguard.pro',
              'https://workflowguard.pro',
              'https://workflowguard-frontend-248924108278.us-central1.run.app'
            ]
          : [
              'http://localhost:3000',
              'http://localhost:5173',
              'https://www.workflowguard.pro'
            ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      },
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'debug', 'log', 'verbose'],
    });

    // Get configuration
    const configService = app.get(ConfigService);
    const config = createProductionConfig(configService);
    
    // Validate configuration
    validateProductionConfig(config);
    logger.info('Configuration validated successfully');

    // Trust proxy for correct client IP (important for Cloud Run)
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter.getType && httpAdapter.getType() === 'express') {
      const instance = httpAdapter.getInstance();
      if (instance && typeof instance.set === 'function') {
        instance.set('trust proxy', 1);
      }
    }

    // Security middleware
    app.use(helmetConfig);
    app.use(compressionConfig);
    
    // Request logging
    app.use(requestLogger);

    // Rate limiting
    const generalLimiter = createRateLimiter();
    const apiLimiter = createApiRateLimiter();
    
    app.use(generalLimiter);
    app.use('/api/workflows', apiLimiter);
    app.use('/api/auth', apiLimiter);
    app.use('/api/payments', apiLimiter);

    // Global prefix
    app.setGlobalPrefix('api');

    // Validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
      }),
    );

    // Global exception filter with Sentry integration
    app.useGlobalFilters(new AllExceptionsFilter());

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, starting graceful shutdown');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, starting graceful shutdown');
      await app.close();
      process.exit(0);
    });

    // Unhandled rejection and exception handling
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(reason);
      }
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error);
      }
      process.exit(1);
    });

    const port = config.port;
    await app.listen(port, '0.0.0.0');
    
    logger.info('🚀 WorkflowGuard backend started successfully', {
      port,
      environment: config.nodeEnv,
      version: config.appVersion,
      healthCheck: `http://localhost:${port}/api/health`,
      detailedHealth: `http://localhost:${port}/api/health/detailed`
    });

  } catch (error) {
    logger.error('Failed to start application:', error);
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
    }
    process.exit(1);
  }
}

bootstrap();
