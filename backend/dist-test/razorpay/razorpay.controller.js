"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RazorpayController = (() => {
    let _classDecorators = [(0, common_1.Controller)('razorpay')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createCustomer_decorators;
    let _getCustomer_decorators;
    let _updateCustomer_decorators;
    let _createSubscription_decorators;
    let _getSubscription_decorators;
    let _cancelSubscription_decorators;
    let _pauseSubscription_decorators;
    let _resumeSubscription_decorators;
    let _upgradeSubscription_decorators;
    let _getPayments_decorators;
    let _getPayment_decorators;
    let _getBillingHistory_decorators;
    let _getPlans_decorators;
    let _getPlan_decorators;
    let _createRazorpayOrder_decorators;
    let _confirmRazorpayPayment_decorators;
    let _createOrder_decorators;
    let _handleWebhook_decorators;
    var RazorpayController = _classThis = class {
        constructor(razorpayService, subscriptionService) {
            this.razorpayService = (__runInitializers(this, _instanceExtraInitializers), razorpayService);
            this.subscriptionService = subscriptionService;
            this.logger = new common_1.Logger(RazorpayController.name);
        }
        // Customer Management
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
        // Subscription Management
        async createSubscription(subscriptionData, user) {
            this.logger.log(`Creating subscription for user: ${user.id}`);
            // Create Razorpay subscription
            const razorpaySubscription = await this.razorpayService.createSubscription(subscriptionData);
            // Update local subscription record
            await this.subscriptionService.updateSubscriptionFromRazorpay(user.id, razorpaySubscription);
            return razorpaySubscription;
        }
        async getSubscription(subscriptionId) {
            return await this.razorpayService.getSubscription(subscriptionId);
        }
        async cancelSubscription(subscriptionId, body, user) {
            this.logger.log(`Cancelling subscription: ${subscriptionId} for user: ${user.id}`);
            const cancelledSubscription = await this.razorpayService.cancelSubscription(subscriptionId, body.cancelAtCycleEnd);
            // Update local subscription status
            await this.subscriptionService.handleSubscriptionCancellation(user.id, subscriptionId);
            return cancelledSubscription;
        }
        async pauseSubscription(subscriptionId, body) {
            return await this.razorpayService.pauseSubscription(subscriptionId, body.pauseAt);
        }
        async resumeSubscription(subscriptionId, body) {
            return await this.razorpayService.resumeSubscription(subscriptionId, body.resumeAt);
        }
        // Plan Upgrade/Downgrade
        async upgradeSubscription(subscriptionId, body, user) {
            this.logger.log(`Upgrading subscription: ${subscriptionId} to ${body.newPlanType} for user: ${user.id}`);
            // Cancel current subscription
            await this.razorpayService.cancelSubscription(subscriptionId, false);
            // Get user's Razorpay customer ID
            const userSubscription = await this.subscriptionService.getUserSubscription(user.id);
            if (!userSubscription?.razorpayCustomerId) {
                throw new common_1.BadRequestException('User does not have a Razorpay customer ID');
            }
            // Get the correct plan ID for the currency
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
            // Update local subscription
            await this.subscriptionService.updateSubscriptionFromRazorpay(user.id, newSubscription);
            return newSubscription;
        }
        // Payment History
        async getPayments(subscriptionId, count = 100, skip = 0) {
            return await this.razorpayService.getPayments(subscriptionId, count, skip);
        }
        async getPayment(paymentId) {
            return await this.razorpayService.getPayment(paymentId);
        }
        // User's Billing History
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
        // Plans
        async getPlans() {
            return await this.razorpayService.getAllPlans();
        }
        async getPlan(planId) {
            return await this.razorpayService.getPlan(planId);
        }
        // Create Order for Plan Upgrade
        async createRazorpayOrder(body, user) {
            this.logger.log(`Creating Razorpay order for plan upgrade: ${body.planId}, user: ${user.id}`);
            // Detect user's currency (default to USD for international users)
            const currency = body.currency || 'USD';
            // Multi-currency pricing
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
        // Confirm Razorpay Payment
        async confirmRazorpayPayment(body, user) {
            this.logger.log(`Confirming Razorpay payment: ${body.paymentId}, user: ${user.id}`);
            try {
                // Verify payment signature
                const isValid = this.razorpayService.verifyPaymentSignature(body.orderId, body.paymentId, body.signature);
                if (!isValid) {
                    throw new common_1.BadRequestException('Invalid payment signature');
                }
                // Fetch payment details from Razorpay
                const payment = await this.razorpayService.getPayment(body.paymentId);
                if (payment.status !== 'captured') {
                    throw new common_1.BadRequestException('Payment not captured');
                }
                // Update user subscription
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
        // Create Order (for one-time payments)
        async createOrder(body, user) {
            this.logger.log(`Creating order for user: ${user.id}, amount: ${body.amount}`);
            return await this.razorpayService.createOrder(body.amount, body.currency, {
                ...body.notes,
                user_id: user.id,
            });
        }
        // Webhook Handler
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
            // Update local subscription status
            await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'active');
        }
        async handleSubscriptionCharged(payment, subscription) {
            this.logger.log(`Subscription charged: ${subscription.id}, payment: ${payment.id}`);
            // Record payment and update subscription
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
            // Handle failed payment - maybe send notification, update subscription status, etc.
            await this.subscriptionService.handleFailedPayment(payment);
        }
    };
    __setFunctionName(_classThis, "RazorpayController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createCustomer_decorators = [(0, common_1.Post)('customers'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getCustomer_decorators = [(0, common_1.Get)('customers/:customerId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _updateCustomer_decorators = [(0, common_1.Put)('customers/:customerId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _createSubscription_decorators = [(0, common_1.Post)('subscriptions'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getSubscription_decorators = [(0, common_1.Get)('subscriptions/:subscriptionId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _cancelSubscription_decorators = [(0, common_1.Post)('subscriptions/:subscriptionId/cancel'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _pauseSubscription_decorators = [(0, common_1.Post)('subscriptions/:subscriptionId/pause'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _resumeSubscription_decorators = [(0, common_1.Post)('subscriptions/:subscriptionId/resume'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _upgradeSubscription_decorators = [(0, common_1.Post)('subscriptions/:subscriptionId/upgrade'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getPayments_decorators = [(0, common_1.Get)('payments'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getPayment_decorators = [(0, common_1.Get)('payments/:paymentId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getBillingHistory_decorators = [(0, common_1.Get)('billing-history'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getPlans_decorators = [(0, common_1.Get)('plans')];
        _getPlan_decorators = [(0, common_1.Get)('plans/:planId')];
        _createRazorpayOrder_decorators = [(0, common_1.Post)('create-order'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _confirmRazorpayPayment_decorators = [(0, common_1.Post)('confirm-payment'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _createOrder_decorators = [(0, common_1.Post)('orders'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _handleWebhook_decorators = [(0, common_1.Post)('webhooks'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        __esDecorate(_classThis, null, _createCustomer_decorators, { kind: "method", name: "createCustomer", static: false, private: false, access: { has: obj => "createCustomer" in obj, get: obj => obj.createCustomer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomer_decorators, { kind: "method", name: "getCustomer", static: false, private: false, access: { has: obj => "getCustomer" in obj, get: obj => obj.getCustomer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateCustomer_decorators, { kind: "method", name: "updateCustomer", static: false, private: false, access: { has: obj => "updateCustomer" in obj, get: obj => obj.updateCustomer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createSubscription_decorators, { kind: "method", name: "createSubscription", static: false, private: false, access: { has: obj => "createSubscription" in obj, get: obj => obj.createSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSubscription_decorators, { kind: "method", name: "getSubscription", static: false, private: false, access: { has: obj => "getSubscription" in obj, get: obj => obj.getSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancelSubscription_decorators, { kind: "method", name: "cancelSubscription", static: false, private: false, access: { has: obj => "cancelSubscription" in obj, get: obj => obj.cancelSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _pauseSubscription_decorators, { kind: "method", name: "pauseSubscription", static: false, private: false, access: { has: obj => "pauseSubscription" in obj, get: obj => obj.pauseSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resumeSubscription_decorators, { kind: "method", name: "resumeSubscription", static: false, private: false, access: { has: obj => "resumeSubscription" in obj, get: obj => obj.resumeSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _upgradeSubscription_decorators, { kind: "method", name: "upgradeSubscription", static: false, private: false, access: { has: obj => "upgradeSubscription" in obj, get: obj => obj.upgradeSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPayments_decorators, { kind: "method", name: "getPayments", static: false, private: false, access: { has: obj => "getPayments" in obj, get: obj => obj.getPayments }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPayment_decorators, { kind: "method", name: "getPayment", static: false, private: false, access: { has: obj => "getPayment" in obj, get: obj => obj.getPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBillingHistory_decorators, { kind: "method", name: "getBillingHistory", static: false, private: false, access: { has: obj => "getBillingHistory" in obj, get: obj => obj.getBillingHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPlans_decorators, { kind: "method", name: "getPlans", static: false, private: false, access: { has: obj => "getPlans" in obj, get: obj => obj.getPlans }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPlan_decorators, { kind: "method", name: "getPlan", static: false, private: false, access: { has: obj => "getPlan" in obj, get: obj => obj.getPlan }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createRazorpayOrder_decorators, { kind: "method", name: "createRazorpayOrder", static: false, private: false, access: { has: obj => "createRazorpayOrder" in obj, get: obj => obj.createRazorpayOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _confirmRazorpayPayment_decorators, { kind: "method", name: "confirmRazorpayPayment", static: false, private: false, access: { has: obj => "confirmRazorpayPayment" in obj, get: obj => obj.confirmRazorpayPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createOrder_decorators, { kind: "method", name: "createOrder", static: false, private: false, access: { has: obj => "createOrder" in obj, get: obj => obj.createOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleWebhook_decorators, { kind: "method", name: "handleWebhook", static: false, private: false, access: { has: obj => "handleWebhook" in obj, get: obj => obj.handleWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RazorpayController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RazorpayController = _classThis;
})();
exports.RazorpayController = RazorpayController;
