"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const all_exceptions_filter_1 = require("./all-exceptions.filter");
const crypto_1 = require("crypto");
// import { MarketplaceExceptionFilter } from './guards/marketplace-error.guard';
// Polyfill for crypto.randomUUID if not available
if (!global.crypto) {
    global.crypto = {
        randomUUID: () => (0, crypto_1.randomUUID)(),
    };
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: {
            origin: [
                'https://www.workflowguard.pro',
                'https://workflowguard-frontend-248924108278.us-central1.run.app',
                'http://localhost:3000', // for development
                'http://localhost:5173', // for Vite development
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        },
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
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    'https://app.hubspot.com',
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://fonts.googleapis.com',
                ],
                imgSrc: ["'self'", 'data:', 'https:', 'http:'],
                connectSrc: [
                    "'self'",
                    'https://api.workflowguard.pro',
                    'https://app.hubspot.com',
                ],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                objectSrc: ["'none'"],
                mediaSrc: ["'none'"],
                frameSrc: ["'self'", 'https://app.hubspot.com'],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }));
    app.use((0, compression_1.default)());
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Request limit
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: false, // Count successful requests against the limit
        keyGenerator: (req) => {
            // Use X-Forwarded-For header if behind proxy, otherwise use IP
            const forwardedFor = req.headers['x-forwarded-for'];
            return ((typeof forwardedFor === 'string' ? forwardedFor : req.ip) || '0.0.0.0');
        },
    });
    app.use(limiter);
    // Specific rate limit for OAuth endpoints
    const oauthLimiter = (0, express_rate_limit_1.default)({
        windowMs: 10 * 1000, // 10 seconds
        max: 1, // Only allow 1 request per 10 seconds
        message: 'Please wait before retrying the authentication process.',
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true, // Don't count successful requests
        keyGenerator: (req) => {
            const forwardedFor = req.headers['x-forwarded-for'];
            return (((typeof forwardedFor === 'string' ? forwardedFor : req.ip) ||
                '0.0.0.0') + ':oauth');
        },
    });
    app.use('/api/auth/hubspot', oauthLimiter);
    // Global prefix
    app.setGlobalPrefix('api');
    // Enable ValidationPipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    // Register global exception filter with marketplace support
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    // Add request logging middleware with marketplace support
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        const origin = req.headers.origin || 'no-origin';
        const isMarketplaceRequest = req.url.includes('/hubspot-marketplace') ||
            req.headers['x-hubspot-signature'] ||
            req.headers['x-hubspot-portal-id'];
        const referrer = req.headers.referer || 'no-referrer';
        console.log(`${timestamp} - ${req.method} ${req.url} - Origin: ${origin} - Referrer: ${referrer}${isMarketplaceRequest ? ' [MARKETPLACE]' : ''}`);
        next();
    });
    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api`);
    console.log(`🏪 HubSpot Marketplace endpoints: http://localhost:${port}/api/hubspot-marketplace`);
}
bootstrap();
