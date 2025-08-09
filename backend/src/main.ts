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
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  // Trust proxy for correct client IP and rate limiting behind Render/Cloudflare
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.getType && httpAdapter.getType() === 'express') {
    const instance = httpAdapter.getInstance();
    if (instance && typeof instance.set === 'function') {
      instance.set('trust proxy', 1);
    }
  }
  
  // Enhanced security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://app.hubspot.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          connectSrc: ["'self'", "https://api.workflowguard.pro", "https://app.hubspot.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'none'"],
          frameSrc: ["'self'", "https://app.hubspot.com"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );
  app.use(compression());

  // Production-grade rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 300 : 1000, // Stricter limit for production
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count successful requests against the limit
    keyGenerator: (req) => {
      // Use X-Forwarded-For header if behind proxy, otherwise use IP
      const forwardedFor = req.headers['x-forwarded-for'];
      return (typeof forwardedFor === 'string' ? forwardedFor : req.ip) || '0.0.0.0';
    },
  });
  app.use(limiter);

  // Specific rate limit for OAuth endpoints
  const oauthLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 1, // Only allow 1 request per 10 seconds
    message: 'Please wait before retrying the authentication process.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    keyGenerator: (req) => {
      const forwardedFor = req.headers['x-forwarded-for'];
      return ((typeof forwardedFor === 'string' ? forwardedFor : req.ip) || '0.0.0.0') + ':oauth';
    },
  });
  app.use('/api/auth/hubspot', oauthLimiter);

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
  ].concat(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []);

  // Global middleware to handle CORS preflight
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin === 'https://www.workflowguard.pro' || 
        origin === 'https://workflowguard.pro' ||
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:3000') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-hubspot-signature, x-hubspot-request-timestamp, x-hubspot-portal-id, Accept, Origin, X-Requested-With');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-Requested-With, X-Marketplace-App, X-Marketplace-Version');
    }
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Keep CORS middleware as backup
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://www.workflowguard.pro',
        'https://workflowguard.pro',
        'http://localhost:5173',
        'http://localhost:3000'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
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
      'X-Requested-With'
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
    const referrer = req.headers.referer || 'no-referrer';
    
    console.log(`${timestamp} - ${req.method} ${req.url} - Origin: ${origin} - Referrer: ${referrer}${isMarketplaceRequest ? ' [MARKETPLACE]' : ''}`);
    
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
