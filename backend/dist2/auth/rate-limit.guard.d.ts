import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}
export declare class RateLimitGuard implements CanActivate {
    private reflector;
    private requestCounts;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    private getClientId;
    private checkRateLimit;
    private cleanup;
}
export declare const RateLimit: (config: RateLimitConfig) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export {};
