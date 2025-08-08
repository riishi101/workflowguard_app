import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { MarketplaceExceptionFilter } from './guards/marketplace-error.guard';

// Polyfill for crypto.randomUUID if not available
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => randomUUID()
  } as any;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Trust proxy for correct client IP and rate limiting behind Render/Cloudflare
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.getType && httpAdapter.getType() === 'express') {
    const instance = httpAdapter.getInstance();
    if (instance && typeof instance.set === 'function') {
      instance.set('trust proxy', 1);
    }
  }
  
  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Rate limiting - More permissive for development
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // CORS configuration - Allow frontend origins and HubSpot marketplace
  const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Alternative dev port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://www.workflowguard.pro', // Production frontend
    'https://workflowguard.pro', // Production frontend (without www)
    'https://app.hubspot.com', // HubSpot app interface
    'https://developers.hubspot.com', // HubSpot developer portal
    'https://marketplace.hubspot.com', // HubSpot marketplace
    process.env.FRONTEND_URL, // Environment-specific frontend URL
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For development, allow localhost with any port
      if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
        return callback(null, true);
      }
      
      // For production, allow workflowguard.pro domains
      if (origin.match(/^https:\/\/(www\.)?workflowguard\.pro$/)) {
        return callback(null, true);
      }

      // Allow HubSpot domains
      if (origin.match(/^https:\/\/(app|developers|marketplace)\.hubspot\.com$/)) {
        return callback(null, true);
      }
      
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'x-user-id',
      'x-hubspot-signature',
      'x-hubspot-request-timestamp',
      'x-hubspot-portal-id',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin'
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With', 'X-Marketplace-App', 'X-Marketplace-Version'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable ValidationPipe for production
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Register global exception filter with marketplace support
  app.useGlobalFilters(new AllExceptionsFilter());

  // Add request logging middleware with marketplace support
  app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const origin = req.headers.origin || 'no-origin';
    const isMarketplaceRequest = req.url.includes('/hubspot-marketplace') || 
                                req.headers['x-hubspot-signature'] ||
                                req.headers['x-hubspot-portal-id'];
    
    console.log(`${timestamp} - ${req.method} ${req.url} - Origin: ${origin}${isMarketplaceRequest ? ' [MARKETPLACE]' : ''}`);
    
    // Add CORS headers for preflight requests
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-user-id,x-hubspot-signature,x-hubspot-request-timestamp,x-hubspot-portal-id,Accept,Origin,X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.status(204).end();
    }
    
    next();
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api`);
  console.log(`🏪 HubSpot Marketplace endpoints: http://localhost:${port}/api/hubspot-marketplace`);
}

bootstrap();
