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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
// Use require for razorpay since it doesn't have proper TypeScript support
const Razorpay = require('razorpay');
let RazorpayService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RazorpayService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new common_1.Logger(RazorpayService.name);
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
        // Customer Management
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
        // Subscription Management
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
        // Payment Management
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
        // Plan Management
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
        // Webhook Verification
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
        // Utility Methods
        getPlanIdForSubscription(planType, currency = 'INR') {
            const envKey = `RAZORPAY_PLAN_ID_${planType.toUpperCase()}_${currency}`;
            const planId = this.configService.get(envKey);
            if (!planId) {
                this.logger.warn(`Plan ID not found for ${planType} in ${currency}, falling back to INR`);
                // Fallback to INR if currency-specific plan not found
                const fallbackKey = `RAZORPAY_PLAN_ID_${planType.toUpperCase()}_INR`;
                const fallbackPlanId = this.configService.get(fallbackKey);
                if (!fallbackPlanId) {
                    throw new common_1.BadRequestException(`No plan ID found for ${planType} in any currency`);
                }
                return fallbackPlanId;
            }
            return planId;
        }
        /**
         * Get all available currencies for plans
         */
        getAvailableCurrencies() {
            return ['INR', 'USD', 'GBP', 'EUR', 'CAD'];
        }
        /**
         * Check if a currency is supported
         */
        isCurrencySupported(currency) {
            return this.getAvailableCurrencies().includes(currency.toUpperCase());
        }
        formatAmount(amount) {
            // Razorpay expects amount in paise (smallest currency unit)
            return Math.round(amount * 100);
        }
        formatAmountFromPaise(amountInPaise) {
            // Convert from paise to rupees
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
    __setFunctionName(_classThis, "RazorpayService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RazorpayService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RazorpayService = _classThis;
})();
exports.RazorpayService = RazorpayService;
