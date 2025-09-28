import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
export declare class MarketplaceErrorGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
    private setupMarketplaceErrorHandling;
}
export declare class MarketplaceExceptionFilter {
    static handle(error: any, request: Request, response: Response): Response<any, Record<string, any>>;
    private static isMarketplaceRequest;
    private static handleMarketplaceError;
    private static handleRegularError;
}
export declare class MarketplaceValidationPipe {
    static transform(value: any, metadata: any): any;
    private static validateMarketplaceBody;
}
export declare class MarketplaceLoggingInterceptor {
    static intercept(context: ExecutionContext, next: any): any;
    private static isMarketplaceRequest;
}
