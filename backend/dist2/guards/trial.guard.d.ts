import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SubscriptionService } from '../subscription/subscription.service';
export declare class TrialGuard implements CanActivate {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
