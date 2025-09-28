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
exports.SubscriptionGuard = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("../subscription/subscription.service");
let SubscriptionGuard = class SubscriptionGuard {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.HttpException('Authentication required', common_1.HttpStatus.UNAUTHORIZED);
        }
        const userId = user.sub || user.id || user.userId;
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const subscription = await this.subscriptionService.getUserSubscription(userId);
            if (subscription.status === 'canceled') {
                throw new common_1.HttpException('Subscription cancelled. Please reactivate your subscription to continue using WorkflowGuard.', common_1.HttpStatus.FORBIDDEN);
            }
            if (subscription.status === 'past_due') {
                throw new common_1.HttpException('Payment failed. Please update your payment method to continue using WorkflowGuard.', common_1.HttpStatus.FORBIDDEN);
            }
            if (subscription.nextBillingDate &&
                new Date() > new Date(subscription.nextBillingDate)) {
                throw new common_1.HttpException('Subscription expired. Please renew your subscription to continue using WorkflowGuard.', common_1.HttpStatus.FORBIDDEN);
            }
            return true;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Subscription guard error:', error);
            throw new common_1.HttpException('Failed to verify subscription status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map