"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RazorpayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const Razorpay = require('razorpay');
let RazorpayService = RazorpayService_1 = class RazorpayService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RazorpayService_1.name);
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        if (!keyId || !keySecret) {
            throw new Error('Razorpay credentials not found in environment variables');
        }
        this.razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
        this.logger.log('Razorpay service initialized');
    }
    async createCustomer(customerData) {
        try {
            this.logger.log(`Creating Razorpay customer for email: ${customerData.email}`);
            const customer = await this.razorpay.customers.create({
                name: customerData.name,
                email: customerData.email,
                contact: customerData.contact,
                notes: customerData.notes || {},
            });
            this.logger.log(`Customer created successfully: ${customer.id}`);
            return customer;
        }
        catch (error) {
            this.logger.error(`Failed to create customer: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to create customer');
        }
    }
    async getCustomer(customerId) {
        try {
            const customer = await this.razorpay.customers.fetch(customerId);
            return customer;
        }
        catch (error) {
            this.logger.error(`Failed to fetch customer ${customerId}: ${error.message}`);
            throw new common_1.BadRequestException('Customer not found');
        }
    }
    async updateCustomer(customerId, updateData) {
        try {
            const customer = await this.razorpay.customers.edit(customerId, updateData);
            this.logger.log(`Customer updated successfully: ${customerId}`);
            return customer;
        }
        catch (error) {
            this.logger.error(`Failed to update customer ${customerId}: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to update customer');
        }
    }
    async createSubscription(subscriptionData) {
        try {
            this.logger.log(`Creating subscription for plan: ${subscriptionData.planId}`);
            const subscription = await this.razorpay.subscriptions.create({
                plan_id: subscriptionData.planId,
                customer_id: subscriptionData.customerId,
                total_count: subscriptionData.totalCount,
                customer_notify: subscriptionData.customerNotify ?? true,
                notes: subscriptionData.notes || {},
                addons: subscriptionData.addons || [],
            });
            this.logger.log(`Subscription created successfully: ${subscription.id}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to create subscription');
        }
    }
    async getSubscription(subscriptionId) {
        try {
            const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to fetch subscription ${subscriptionId}: ${error.message}`);
            throw new common_1.BadRequestException('Subscription not found');
        }
    }
    async cancelSubscription(subscriptionId, cancelAtCycleEnd = false) {
        try {
            this.logger.log(`Cancelling subscription: ${subscriptionId}`);
            const subscription = await this.razorpay.subscriptions.cancel(subscriptionId, {
                cancel_at_cycle_end: cancelAtCycleEnd,
            });
            this.logger.log(`Subscription cancelled successfully: ${subscriptionId}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to cancel subscription ${subscriptionId}: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to cancel subscription');
        }
    }
    async pauseSubscription(subscriptionId, pauseAt) {
        try {
            this.logger.log(`Pausing subscription: ${subscriptionId}`);
            const subscription = await this.razorpay.subscriptions.pause(subscriptionId, {
                pause_at: pauseAt,
            });
            this.logger.log(`Subscription paused successfully: ${subscriptionId}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to pause subscription ${subscriptionId}: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to pause subscription');
        }
    }
    async resumeSubscription(subscriptionId, resumeAt) {
        try {
            this.logger.log(`Resuming subscription: ${subscriptionId}`);
            const subscription = await this.razorpay.subscriptions.resume(subscriptionId, {
                resume_at: resumeAt,
            });
            this.logger.log(`Subscription resumed successfully: ${subscriptionId}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to resume subscription ${subscriptionId}: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to resume subscription');
        }
    }
    async getPayments(subscriptionId, count = 100, skip = 0) {
        try {
            const options = { count, skip };
            if (subscriptionId) {
                options.subscription_id = subscriptionId;
            }
            const payments = await this.razorpay.payments.all(options);
            return payments;
        }
        catch (error) {
            this.logger.error(`Failed to fetch payments: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to fetch payments');
        }
    }
    async getPayment(paymentId) {
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);
            return payment;
        }
        catch (error) {
            this.logger.error(`Failed to fetch payment ${paymentId}: ${error.message}`);
            throw new common_1.BadRequestException('Payment not found');
        }
    }
    async getPlan(planId) {
        try {
            const plan = await this.razorpay.plans.fetch(planId);
            return plan;
        }
        catch (error) {
            this.logger.error(`Failed to fetch plan ${planId}: ${error.message}`);
            throw new common_1.BadRequestException('Plan not found');
        }
    }
    async getAllPlans() {
        try {
            const plans = await this.razorpay.plans.all();
            return plans;
        }
        catch (error) {
            this.logger.error(`Failed to fetch plans: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to fetch plans');
        }
    }
    verifyWebhookSignature(body, signature) {
        try {
            const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
            if (!webhookSecret) {
                this.logger.warn('Webhook secret not configured');
                return false;
            }
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        }
        catch (error) {
            this.logger.error(`Webhook signature verification failed: ${error.message}`);
            return false;
        }
    }
    getPlanIdForSubscription(planType, currency = 'INR') {
        const envKey = `RAZORPAY_PLAN_ID_${planType.toUpperCase()}_${currency}`;
        const planId = this.configService.get(envKey);
        if (!planId) {
            this.logger.warn(`Plan ID not found for ${planType} in ${currency}, falling back to INR`);
            const fallbackKey = `RAZORPAY_PLAN_ID_${planType.toUpperCase()}_INR`;
            const fallbackPlanId = this.configService.get(fallbackKey);
            if (!fallbackPlanId) {
                throw new common_1.BadRequestException(`No plan ID found for ${planType} in any currency`);
            }
            return fallbackPlanId;
        }
        return planId;
    }
    getAvailableCurrencies() {
        return ['INR', 'USD', 'GBP', 'EUR', 'CAD'];
    }
    isCurrencySupported(currency) {
        return this.getAvailableCurrencies().includes(currency.toUpperCase());
    }
    formatAmount(amount) {
        return Math.round(amount * 100);
    }
    formatAmountFromPaise(amountInPaise) {
        return amountInPaise / 100;
    }
    async getSubscriptionsByCustomer(customerId) {
        try {
            const subscriptions = await this.razorpay.subscriptions.all({
                customer_id: customerId,
            });
            return subscriptions;
        }
        catch (error) {
            this.logger.error(`Failed to fetch subscriptions for customer ${customerId}: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to fetch customer subscriptions');
        }
    }
    async createOrder(amount, currency = 'INR', notes) {
        try {
            const order = await this.razorpay.orders.create({
                amount: this.formatAmount(amount),
                currency,
                notes: notes || {},
            });
            this.logger.log(`Order created: ${order.id}`);
            return order;
        }
        catch (error) {
            this.logger.error(`Failed to create order: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to create order');
        }
    }
    verifyPaymentSignature(orderId, paymentId, signature) {
        try {
            const body = orderId + '|' + paymentId;
            const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
            if (!keySecret) {
                this.logger.error('RAZORPAY_KEY_SECRET not configured');
                return false;
            }
            const expectedSignature = crypto
                .createHmac('sha256', keySecret)
                .update(body.toString())
                .digest('hex');
            return expectedSignature === signature;
        }
        catch (error) {
            this.logger.error(`Payment signature verification failed: ${error.message}`);
            return false;
        }
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = RazorpayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayService);
//# sourceMappingURL=razorpay.service.js.map