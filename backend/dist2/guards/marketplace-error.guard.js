"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceLoggingInterceptor = exports.MarketplaceValidationPipe = exports.MarketplaceExceptionFilter = exports.MarketplaceErrorGuard = void 0;
const common_1 = require("@nestjs/common");
let MarketplaceErrorGuard = class MarketplaceErrorGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        this.setupMarketplaceErrorHandling(request, response);
        return true;
    }
    setupMarketplaceErrorHandling(request, response) {
        const originalJson = response.json;
        const originalStatus = response.status;
        response.json = function (data) {
            if (data && typeof data === 'object') {
                response.setHeader('X-Marketplace-App', 'WorkflowGuard');
                response.setHeader('X-Marketplace-Version', '1.0.0');
                if (data.error || data.message) {
                    return originalJson.call(this, {
                        success: false,
                        error: data.error || data.message,
                        code: data.code || 'MARKETPLACE_ERROR',
                        timestamp: new Date().toISOString(),
                        marketplace: {
                            app: 'WorkflowGuard',
                            version: '1.0.0',
                        },
                    });
                }
            }
            return originalJson.call(this, data);
        };
        response.status = function (code) {
            if (code >= 400) {
                console.log('HubSpot Marketplace - Error response:', {
                    status: code,
                    url: request.url,
                    method: request.method,
                    userAgent: request.headers['user-agent'],
                });
            }
            return originalStatus.call(this, code);
        };
    }
};
exports.MarketplaceErrorGuard = MarketplaceErrorGuard;
exports.MarketplaceErrorGuard = MarketplaceErrorGuard = __decorate([
    (0, common_1.Injectable)()
], MarketplaceErrorGuard);
class MarketplaceExceptionFilter {
    static handle(error, request, response) {
        console.error('HubSpot Marketplace - Exception caught:', {
            error: error.message,
            stack: error.stack,
            url: request.url,
            method: request.method,
            headers: request.headers,
        });
        const isMarketplaceRequest = this.isMarketplaceRequest(request);
        if (isMarketplaceRequest) {
            return this.handleMarketplaceError(error, response);
        }
        return this.handleRegularError(error, response);
    }
    static isMarketplaceRequest(request) {
        const marketplaceHeaders = [
            'x-hubspot-signature',
            'x-hubspot-request-timestamp',
            'x-hubspot-portal-id',
        ];
        return (marketplaceHeaders.some((header) => request.headers[header]) ||
            request.url.includes('/hubspot-marketplace') ||
            request.url.includes('/marketplace'));
    }
    static handleMarketplaceError(error, response) {
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'MARKETPLACE_ERROR';
        let message = 'An error occurred while processing your request';
        if (error instanceof common_1.HttpException) {
            statusCode = error.getStatus();
            switch (statusCode) {
                case common_1.HttpStatus.UNAUTHORIZED:
                    errorCode = 'MARKETPLACE_AUTH_ERROR';
                    message = 'Authentication required for marketplace access';
                    break;
                case common_1.HttpStatus.FORBIDDEN:
                    errorCode = 'MARKETPLACE_PERMISSION_ERROR';
                    message = 'Insufficient permissions for marketplace operation';
                    break;
                case common_1.HttpStatus.BAD_REQUEST:
                    errorCode = 'MARKETPLACE_VALIDATION_ERROR';
                    message = 'Invalid request parameters for marketplace';
                    break;
                case common_1.HttpStatus.NOT_FOUND:
                    errorCode = 'MARKETPLACE_RESOURCE_ERROR';
                    message = 'Requested marketplace resource not found';
                    break;
                case common_1.HttpStatus.TOO_MANY_REQUESTS:
                    errorCode = 'MARKETPLACE_RATE_LIMIT_ERROR';
                    message = 'Rate limit exceeded for marketplace requests';
                    break;
                default:
                    errorCode = 'MARKETPLACE_SERVER_ERROR';
                    message = 'Marketplace service temporarily unavailable';
            }
        }
        return response.status(statusCode).json({
            success: false,
            error: message,
            code: errorCode,
            timestamp: new Date().toISOString(),
            marketplace: {
                app: 'WorkflowGuard',
                version: '1.0.0',
                support: 'support@workflowguard.pro',
            },
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
    static handleRegularError(error, response) {
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (error instanceof common_1.HttpException) {
            statusCode = error.getStatus();
            message = error.message;
        }
        return response.status(statusCode).json({
            success: false,
            error: message,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.MarketplaceExceptionFilter = MarketplaceExceptionFilter;
class MarketplaceValidationPipe {
    static transform(value, metadata) {
        if (metadata.type === 'body') {
            return this.validateMarketplaceBody(value);
        }
        return value;
    }
    static validateMarketplaceBody(body) {
        if (body.portalId && typeof body.portalId !== 'string') {
            throw new common_1.HttpException('Portal ID must be a string', common_1.HttpStatus.BAD_REQUEST);
        }
        if (body.planId &&
            !['starter', 'professional', 'enterprise'].includes(body.planId)) {
            throw new common_1.HttpException('Invalid plan ID', common_1.HttpStatus.BAD_REQUEST);
        }
        return body;
    }
}
exports.MarketplaceValidationPipe = MarketplaceValidationPipe;
class MarketplaceLoggingInterceptor {
    static intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const isMarketplaceRequest = this.isMarketplaceRequest(request);
        if (isMarketplaceRequest) {
            console.log('HubSpot Marketplace - Request:', {
                method: request.method,
                url: request.url,
                portalId: request.headers['x-hubspot-portal-id'],
                timestamp: new Date().toISOString(),
            });
        }
        return next.handle();
    }
    static isMarketplaceRequest(request) {
        return (request.url.includes('/hubspot-marketplace') ||
            !!request.headers['x-hubspot-signature'] ||
            !!request.headers['x-hubspot-portal-id']);
    }
}
exports.MarketplaceLoggingInterceptor = MarketplaceLoggingInterceptor;
//# sourceMappingURL=marketplace-error.guard.js.map