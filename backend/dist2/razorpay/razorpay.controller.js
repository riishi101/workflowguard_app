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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RazorpayController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const razorpay_service_1 = require("./razorpay.service");
const subscription_service_1 = require("../subscription/subscription.service");
let RazorpayController = RazorpayController_1 = class RazorpayController {
    constructor(razorpayService, subscriptionService) {
        this.razorpayService = razorpayService;
        this.subscriptionService = subscriptionService;
        this.logger = new common_1.Logger(RazorpayController_1.name);
    }
    async createCustomer(customerData, user) {
        this.logger.log(`Creating Razorpay customer for user: ${user.id}`);
        return await this.razorpayService.createCustomer(customerData);
    }
    async getCustomer(customerId) {
        return await this.razorpayService.getCustomer(customerId);
    }
    async updateCustomer(customerId, updateData) {
        return await this.razorpayService.updateCustomer(customerId, updateData);
    }
    async createSubscription(subscriptionData, user) {
        this.logger.log(`Creating subscription for user: ${user.id}`);
        const razorpaySubscription = await this.razorpayService.createSubscription(subscriptionData);
        await this.subscriptionService.updateSubscriptionFromRazorpay(user.id, razorpaySubscription);
        return razorpaySubscription;
    }
    async getSubscription(subscriptionId) {
        return await this.razorpayService.getSubscription(subscriptionId);
    }
    async cancelSubscription(subscriptionId, body, user) {
        this.logger.log(`Cancelling subscription: ${subscriptionId} for user: ${user.id}`);
        const cancelledSubscription = await this.razorpayService.cancelSubscription(subscriptionId, body.cancelAtCycleEnd);
        await this.subscriptionService.handleSubscriptionCancellation(user.id, subscriptionId);
        return cancelledSubscription;
    }
    async pauseSubscription(subscriptionId, body) {
        return await this.razorpayService.pauseSubscription(subscriptionId, body.pauseAt);
    }
    async resumeSubscription(subscriptionId, body) {
        return await this.razorpayService.resumeSubscription(subscriptionId, body.resumeAt);
    }
    async upgradeSubscription(subscriptionId, body, user) {
        this.logger.log(`Upgrading subscription: ${subscriptionId} to ${body.newPlanType} for user: ${user.id}`);
        await this.razorpayService.cancelSubscription(subscriptionId, false);
        const userSubscription = await this.subscriptionService.getUserSubscription(user.id);
        if (!userSubscription?.razorpayCustomerId) {
            throw new common_1.BadRequestException('User does not have a Razorpay customer ID');
        }
        const currency = body.currency || 'USD';
        const newPlanId = this.razorpayService.getPlanIdForSubscription(body.newPlanType, currency);
        const newSubscription = await this.razorpayService.createSubscription({
            planId: newPlanId,
            customerId: userSubscription.razorpayCustomerId,
            notes: {
                upgrade_from: subscriptionId,
                previous_plan: userSubscription.planId,
                user_id: user.id,
                currency: currency,
            },
        });
        await this.subscriptionService.updateSubscriptionFromRazorpay(user.id, newSubscription);
        return newSubscription;
    }
    async getPayments(subscriptionId, count = 100, skip = 0) {
        return await this.razorpayService.getPayments(subscriptionId, count, skip);
    }
    async getPayment(paymentId) {
        return await this.razorpayService.getPayment(paymentId);
    }
    async getBillingHistory(user) {
        this.logger.log(`Fetching billing history for user: ${user.id}`);
        const userSubscription = await this.subscriptionService.getUserSubscription(user.id);
        if (!userSubscription?.razorpaySubscriptionId) {
            return { payments: [], subscription: null };
        }
        const [payments, subscription] = await Promise.all([
            this.razorpayService.getPayments(userSubscription.razorpaySubscriptionId),
            this.razorpayService.getSubscription(userSubscription.razorpaySubscriptionId),
        ]);
        return {
            payments: payments.items || [],
            subscription,
            localSubscription: userSubscription,
        };
    }
    async getPlans() {
        return await this.razorpayService.getAllPlans();
    }
    async getPlan(planId) {
        return await this.razorpayService.getPlan(planId);
    }
    async createRazorpayOrder(body, user) {
        this.logger.log(`Creating Razorpay order for plan upgrade: ${body.planId}, user: ${user.id}`);
        const currency = body.currency || 'USD';
        const planPricing = {
            starter: {
                USD: 19,
                GBP: 15,
                EUR: 17,
                CAD: 27,
                INR: 19,
            },
            professional: {
                USD: 49,
                GBP: 39,
                EUR: 44,
                CAD: 69,
                INR: 49,
            },
            enterprise: {
                USD: 99,
                GBP: 79,
                EUR: 89,
                CAD: 139,
                INR: 99,
            },
        };
        const amount = planPricing[body.planId]?.[currency] || 19;
        const order = await this.razorpayService.createOrder(amount, currency, {
            plan_id: body.planId,
            user_id: user.id,
            type: 'subscription_upgrade',
            currency: currency,
        });
        return {
            success: true,
            data: order,
        };
    }
    async confirmRazorpayPayment(body, user) {
        this.logger.log(`Confirming Razorpay payment: ${body.paymentId}, user: ${user.id}`);
        try {
            const isValid = this.razorpayService.verifyPaymentSignature(body.orderId, body.paymentId, body.signature);
            if (!isValid) {
                throw new common_1.BadRequestException('Invalid payment signature');
            }
            const payment = await this.razorpayService.getPayment(body.paymentId);
            if (payment.status !== 'captured') {
                throw new common_1.BadRequestException('Payment not captured');
            }
            await this.subscriptionService.upgradeUserPlan(user.id, body.planId, {
                razorpayPaymentId: body.paymentId,
                razorpayOrderId: body.orderId,
            });
            return {
                success: true,
                message: 'Payment confirmed and subscription updated',
                data: { paymentId: body.paymentId, planId: body.planId },
            };
        }
        catch (error) {
            this.logger.error(`Payment confirmation failed: ${error.message}`);
            throw error;
        }
    }
    async createOrder(body, user) {
        this.logger.log(`Creating order for user: ${user.id}, amount: ${body.amount}`);
        return await this.razorpayService.createOrder(body.amount, body.currency, {
            ...body.notes,
            user_id: user.id,
        });
    }
    async handleWebhook(body, signature) {
        this.logger.log('Received Razorpay webhook');
        const bodyString = body.toString();
        const isValid = this.razorpayService.verifyWebhookSignature(bodyString, signature);
        if (!isValid) {
            this.logger.error('Invalid webhook signature');
            throw new common_1.BadRequestException('Invalid signature');
        }
        const event = JSON.parse(bodyString);
        this.logger.log(`Processing webhook event: ${event.event}`);
        await this.handleWebhookEvent(event);
        return { status: 'ok' };
    }
    async handleWebhookEvent(event) {
        const { event: eventType, payload } = event;
        try {
            switch (eventType) {
                case 'subscription.activated':
                    await this.handleSubscriptionActivated(payload.subscription.entity);
                    break;
                case 'subscription.charged':
                    await this.handleSubscriptionCharged(payload.payment.entity, payload.subscription.entity);
                    break;
                case 'subscription.completed':
                    await this.handleSubscriptionCompleted(payload.subscription.entity);
                    break;
                case 'subscription.cancelled':
                    await this.handleSubscriptionCancelled(payload.subscription.entity);
                    break;
                case 'subscription.paused':
                    await this.handleSubscriptionPaused(payload.subscription.entity);
                    break;
                case 'subscription.resumed':
                    await this.handleSubscriptionResumed(payload.subscription.entity);
                    break;
                case 'payment.failed':
                    await this.handlePaymentFailed(payload.payment.entity);
                    break;
                default:
                    this.logger.log(`Unhandled webhook event: ${eventType}`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing webhook event ${eventType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleSubscriptionActivated(subscription) {
        this.logger.log(`Subscription activated: ${subscription.id}`);
        await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'active');
    }
    async handleSubscriptionCharged(payment, subscription) {
        this.logger.log(`Subscription charged: ${subscription.id}, payment: ${payment.id}`);
        await this.subscriptionService.recordPayment(subscription.id, payment);
    }
    async handleSubscriptionCompleted(subscription) {
        this.logger.log(`Subscription completed: ${subscription.id}`);
        await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'completed');
    }
    async handleSubscriptionCancelled(subscription) {
        this.logger.log(`Subscription cancelled: ${subscription.id}`);
        await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'cancelled');
    }
    async handleSubscriptionPaused(subscription) {
        this.logger.log(`Subscription paused: ${subscription.id}`);
        await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'paused');
    }
    async handleSubscriptionResumed(subscription) {
        this.logger.log(`Subscription resumed: ${subscription.id}`);
        await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'active');
    }
    async handlePaymentFailed(payment) {
        this.logger.log(`Payment failed: ${payment.id}`);
        await this.subscriptionService.handleFailedPayment(payment);
    }
};
exports.RazorpayController = RazorpayController;
__decorate([
    (0, common_1.Post)('customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Get)('customers/:customerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "getCustomer", null);
__decorate([
    (0, common_1.Put)('customers/:customerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Post)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Get)('subscriptions/:subscriptionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:subscriptionId/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:subscriptionId/pause'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "pauseSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:subscriptionId/resume'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "resumeSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:subscriptionId/upgrade'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "upgradeSubscription", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('subscriptionId')),
    __param(1, (0, common_1.Query)('count')),
    __param(2, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)('payments/:paymentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Get)('billing-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "getBillingHistory", null);
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('plans/:planId'),
    __param(0, (0, common_1.Param)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Post)('create-order'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "createRazorpayOrder", null);
__decorate([
    (0, common_1.Post)('confirm-payment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "confirmRazorpayPayment", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('webhooks'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.RawBody)()),
    __param(1, (0, common_1.Headers)('x-razorpay-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Buffer, String]),
    __metadata("design:returntype", Promise)
], RazorpayController.prototype, "handleWebhook", null);
exports.RazorpayController = RazorpayController = RazorpayController_1 = __decorate([
    (0, common_1.Controller)('razorpay'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => subscription_service_1.SubscriptionService))),
    __metadata("design:paramtypes", [razorpay_service_1.RazorpayService,
        subscription_service_1.SubscriptionService])
], RazorpayController);
//# sourceMappingURL=razorpay.controller.js.map