"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimit = exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let RateLimitGuard = class RateLimitGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.requestCounts = new Map();
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const clientId = this.getClientId(request);
        const rateLimitConfig = this.reflector.get('rateLimit', context.getHandler()) || {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100,
        };
        return this.checkRateLimit(clientId, rateLimitConfig);
    }
    getClientId(request) {
        const userId = request.user?.id || request.user?.sub;
        if (userId) {
            return `user:${userId}`;
        }
        const ip = request.ip || request.connection.remoteAddress || 'unknown';
        return `ip:${ip}`;
    }
    checkRateLimit(clientId, config) {
        const now = Date.now();
        const clientData = this.requestCounts.get(clientId);
        if (!clientData || now > clientData.resetTime) {
            this.requestCounts.set(clientId, {
                count: 1,
                resetTime: now + config.windowMs,
            });
            return true;
        }
        if (clientData.count >= config.maxRequests) {
            throw new common_1.HttpException('Rate limit exceeded. Please try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        clientData.count++;
        return true;
    }
    cleanup() {
        const now = Date.now();
        for (const [clientId, data] of this.requestCounts.entries()) {
            if (now > data.resetTime) {
                this.requestCounts.delete(clientId);
            }
        }
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RateLimitGuard);
const RateLimit = (config) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('rateLimit', config, descriptor.value);
        return descriptor;
    };
};
exports.RateLimit = RateLimit;
//# sourceMappingURL=rate-limit.guard.js.map