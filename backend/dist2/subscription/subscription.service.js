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
var SubscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionService = SubscriptionService_1 = class SubscriptionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SubscriptionService_1.name);
    }
    async getUserSubscription(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                    workflows: true,
                },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const planId = user.subscription?.planId || 'starter';
            let planName = 'Starter Plan';
            let price = 19;
            let limits = { workflows: 5, versionHistory: 30 };
            let features = [
                'workflow_selection',
                'dashboard_overview',
                'basic_version_history',
                'manual_backups',
                'basic_rollback',
            ];
            if (planId === 'professional') {
                planName = 'Professional Plan';
                price = 49;
                limits = { workflows: 25, versionHistory: 90 };
                features = [
                    'workflow_selection',
                    'dashboard_overview',
                    'complete_version_history',
                    'automated_backups',
                    'change_notifications',
                    'advanced_rollback',
                    'side_by_side_comparisons',
                    'compliance_reporting',
                    'audit_trails',
                    'priority_whatsapp_support',
                ];
            }
            else if (planId === 'enterprise') {
                planName = 'Enterprise Plan';
                price = 99;
                limits = { workflows: 9999, versionHistory: 365 };
                features = [
                    'unlimited_workflows',
                    'real_time_change_notifications',
                    'approval_workflows',
                    'advanced_compliance_reporting',
                    'complete_audit_trails',
                    'custom_retention_policies',
                    'advanced_security_features',
                    'advanced_analytics',
                    'white_label_options',
                    '24_7_whatsapp_support',
                ];
            }
            const workflowsUsed = user.workflows ? user.workflows.length : 0;
            return {
                id: user.subscription?.id || 'mock-subscription-id',
                planId,
                planName,
                price,
                status: user.subscription?.status || 'active',
                currentPeriodStart: user.subscription?.createdAt?.toISOString() ||
                    new Date().toISOString(),
                currentPeriodEnd: user.subscription?.trialEndDate?.toISOString() ||
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                trialEndDate: user.subscription?.trialEndDate?.toISOString(),
                nextBillingDate: user.subscription?.nextBillingDate?.toISOString(),
                razorpayCustomerId: user.subscription?.razorpayCustomerId || undefined,
                razorpaySubscriptionId: user.subscription?.razorpaySubscriptionId || undefined,
                features,
                limits,
                usage: {
                    workflows: workflowsUsed,
                    versionHistory: 0,
                },
                email: user.email,
                paymentMethod: {
                    brand: 'Visa',
                    last4: '4242',
                    exp: '12/25',
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get user subscription: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTrialStatus(userId) {
        try {
            let user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!user.subscription) {
                try {
                    await this.prisma.subscription.create({
                        data: {
                            userId: user.id,
                            planId: 'professional',
                            status: 'trial',
                            trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                        },
                    });
                    console.log('Trial subscription created for user:', user.id);
                    user = await this.prisma.user.findUnique({
                        where: { id: userId },
                        include: {
                            subscription: true,
                        },
                    });
                    if (!user) {
                        return {
                            isTrialActive: true,
                            isTrialExpired: false,
                            trialDaysRemaining: 21,
                            trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                        };
                    }
                }
                catch (subscriptionError) {
                    console.warn('Failed to create trial subscription:', subscriptionError.message);
                    return {
                        isTrialActive: true,
                        isTrialExpired: false,
                        trialDaysRemaining: 21,
                        trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                    };
                }
            }
            const now = new Date();
            const trialEndDate = user.subscription?.trialEndDate;
            const isTrialActive = trialEndDate && trialEndDate > now;
            const isTrialExpired = trialEndDate && trialEndDate <= now;
            let trialDaysRemaining = 0;
            if (isTrialActive && trialEndDate) {
                const diffTime = trialEndDate.getTime() - now.getTime();
                trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            return {
                isTrialActive,
                isTrialExpired,
                trialDaysRemaining,
                trialEndDate: trialEndDate?.toISOString(),
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get trial status: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUsageStats(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                    workflows: true,
                },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const planId = user.subscription?.planId || 'professional';
            let workflowLimit = 5;
            let versionHistoryLimit = 30;
            if (planId === 'professional') {
                workflowLimit = 25;
                versionHistoryLimit = 90;
            }
            else if (planId === 'enterprise') {
                workflowLimit = 9999;
                versionHistoryLimit = 365;
            }
            const workflowsUsed = user.workflows?.length || 0;
            return {
                workflows: {
                    used: workflowsUsed,
                    limit: workflowLimit,
                    percentage: Math.min((workflowsUsed / workflowLimit) * 100, 100),
                },
                versionHistory: {
                    used: 0,
                    limit: versionHistoryLimit,
                    percentage: 0,
                },
                storage: {
                    used: 0,
                    limit: 1000,
                    percentage: 0,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get usage stats: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkSubscriptionExpiration(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                },
            });
            if (!user?.subscription) {
                return { isExpired: false, message: 'No subscription found' };
            }
            const now = new Date();
            const subscription = user.subscription;
            if (subscription.nextBillingDate && now > subscription.nextBillingDate) {
                await this.prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { status: 'expired' },
                });
                return {
                    isExpired: true,
                    message: 'Subscription has expired',
                    expiredDate: subscription.nextBillingDate,
                };
            }
            return { isExpired: false };
        }
        catch (error) {
            console.error('Error checking subscription expiration:', error);
            return { isExpired: false, error: error.message };
        }
    }
    async getNextPaymentInfo(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                },
            });
            if (!user?.subscription) {
                return { hasSubscription: false };
            }
            const subscription = user.subscription;
            const now = new Date();
            if (!subscription.nextBillingDate) {
                return { hasSubscription: true, nextPayment: null };
            }
            const daysUntilPayment = Math.ceil((subscription.nextBillingDate.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24));
            return {
                hasSubscription: true,
                nextPayment: {
                    date: subscription.nextBillingDate,
                    daysUntil: daysUntilPayment,
                    isOverdue: daysUntilPayment < 0,
                    amount: this.getPlanPrice(subscription.planId, 'INR'),
                    currency: 'INR',
                },
            };
        }
        catch (error) {
            console.error('Error getting next payment info:', error);
            return { hasSubscription: false, error: error.message };
        }
    }
    getPlanPrice(planId, currency = 'INR') {
        const prices = {
            starter: {
                INR: 19,
                USD: 19,
                GBP: 15,
                EUR: 17,
                CAD: 27,
            },
            professional: {
                INR: 49,
                USD: 49,
                GBP: 39,
                EUR: 44,
                CAD: 69,
            },
            enterprise: {
                INR: 99,
                USD: 99,
                GBP: 79,
                EUR: 89,
                CAD: 139,
            },
        };
        return prices[planId]?.[currency] || prices[planId]?.['INR'] || 0;
    }
    async updateSubscriptionFromRazorpay(userId, razorpaySubscription) {
        try {
            this.logger.log(`Updating subscription from Razorpay for user: ${userId}`);
            const subscription = await this.prisma.subscription.upsert({
                where: { userId },
                update: {
                    ...(razorpaySubscription.id &&
                        { razorpaySubscriptionId: razorpaySubscription.id }),
                    status: this.mapRazorpayStatus(razorpaySubscription.status),
                    nextBillingDate: new Date(razorpaySubscription.current_end * 1000),
                },
                create: {
                    userId,
                    planId: this.mapRazorpayPlanToLocal(razorpaySubscription.plan_id),
                    status: this.mapRazorpayStatus(razorpaySubscription.status),
                    ...(razorpaySubscription.id &&
                        { razorpaySubscriptionId: razorpaySubscription.id }),
                    nextBillingDate: new Date(razorpaySubscription.current_end * 1000),
                },
            });
            this.logger.log(`Subscription updated successfully: ${subscription.id}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to update subscription from Razorpay: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to update subscription', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleSubscriptionCancellation(userId, razorpaySubscriptionId) {
        try {
            this.logger.log(`Handling subscription cancellation for user: ${userId}`);
            const subscription = await this.prisma.subscription.update({
                where: { userId },
                data: {
                    status: 'cancelled',
                },
            });
            this.logger.log(`Subscription cancelled successfully: ${subscription.id}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to handle subscription cancellation: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to cancel subscription', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateSubscriptionStatus(razorpaySubscriptionId, status) {
        try {
            this.logger.log(`Updating subscription status: ${razorpaySubscriptionId} to ${status}`);
            const subscription = await this.prisma.subscription.findFirst({
                where: { razorpaySubscriptionId },
            });
            if (!subscription) {
                throw new common_1.HttpException('Subscription not found', common_1.HttpStatus.NOT_FOUND);
            }
            const updatedSubscription = await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: this.mapRazorpayStatus(status),
                },
            });
            this.logger.log(`Subscription status updated successfully: ${updatedSubscription.id}`);
            return updatedSubscription;
        }
        catch (error) {
            this.logger.error(`Failed to update subscription status: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to update subscription status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async recordPayment(razorpaySubscriptionId, paymentData) {
        try {
            this.logger.log(`Recording payment for subscription: ${razorpaySubscriptionId}`);
            const subscription = await this.prisma.subscription.findFirst({
                where: { razorpaySubscriptionId },
            });
            if (!subscription) {
                throw new common_1.HttpException('Subscription not found', common_1.HttpStatus.NOT_FOUND);
            }
            const payment = await this.prisma.payment.create({
                data: {
                    subscriptionId: subscription.id,
                    razorpayPaymentId: paymentData.id,
                    amount: paymentData.amount / 100,
                    currency: paymentData.currency,
                    status: paymentData.status,
                    method: paymentData.method,
                    description: paymentData.description,
                },
            });
            this.logger.log(`Payment recorded successfully: ${payment.id}`);
            return payment;
        }
        catch (error) {
            this.logger.error(`Failed to record payment: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to record payment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleFailedPayment(paymentData) {
        try {
            this.logger.log(`Handling failed payment: ${paymentData.id}`);
            this.logger.warn(`Payment failed: ${paymentData.id}, reason: ${paymentData.error_description}`);
            return { success: true, message: 'Failed payment handled' };
        }
        catch (error) {
            this.logger.error(`Failed to handle failed payment: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to handle failed payment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async upgradeUserPlan(userId, planId, paymentDetails) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const planConfig = {
            starter: { name: 'Starter', price: 19, workflowLimit: 10 },
            professional: { name: 'Professional', price: 49, workflowLimit: 25 },
            enterprise: { name: 'Enterprise', price: 99, workflowLimit: -1 },
        };
        const plan = planConfig[planId];
        if (!plan) {
            throw new common_1.BadRequestException('Invalid plan ID');
        }
        if (user.subscription) {
            await this.prisma.subscription.update({
                where: { id: user.subscription.id },
                data: {
                    planId,
                    price: plan.price,
                    status: 'active',
                    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
        }
        else {
            await this.prisma.subscription.create({
                data: {
                    userId,
                    planId,
                    price: plan.price,
                    status: 'active',
                    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
        }
        this.logger.log(`User plan upgraded: ${userId} to ${planId}`);
    }
    mapRazorpayStatus(razorpayStatus) {
        const statusMap = {
            created: 'pending',
            authenticated: 'active',
            active: 'active',
            pending: 'pending',
            halted: 'paused',
            cancelled: 'cancelled',
            completed: 'completed',
            expired: 'expired',
        };
        return statusMap[razorpayStatus] || 'pending';
    }
    mapRazorpayPlanToLocal(razorpayPlanId) {
        const planMap = {
            plan_R6RI02CsUCUlDz: 'starter',
            plan_R6RKEg5mqJK6Ky: 'professional',
            plan_R6RKnjqXu0BZsH: 'enterprise',
            plan_RBDqWapKHZfPU7: 'starter',
            plan_RBDrKWI81HS1FZ: 'professional',
            plan_RBDrX9dGapWrTe: 'enterprise',
            plan_RBFxk81S3ySXxj: 'starter',
            plan_RBFy8LsuW36jIj: 'professional',
            plan_RBFyJlB5jxwxB9: 'enterprise',
            plan_RBFjbYhAtD3snL: 'starter',
            plan_RBFjqo5wE0d4jz: 'professional',
            plan_RBFovOUIUXISBE: 'enterprise',
            plan_RBFrtufmxmxwi8: 'starter',
            plan_RBFsD6U2rQb4B6: 'professional',
            plan_RBFscXaosRIzEc: 'enterprise',
        };
        return planMap[razorpayPlanId] || 'starter';
    }
    getCurrencyFromPlanId(razorpayPlanId) {
        const currencyMap = {
            plan_RBDqWapKHZfPU7: 'USD',
            plan_RBDrKWI81HS1FZ: 'USD',
            plan_RBDrX9dGapWrTe: 'USD',
            plan_RBFxk81S3ySXxj: 'GBP',
            plan_RBFy8LsuW36jIj: 'GBP',
            plan_RBFyJlB5jxwxB9: 'GBP',
            plan_RBFjbYhAtD3snL: 'EUR',
            plan_RBFjqo5wE0d4jz: 'EUR',
            plan_RBFovOUIUXISBE: 'EUR',
            plan_RBFrtufmxmxwi8: 'CAD',
            plan_RBFsD6U2rQb4B6: 'CAD',
            plan_RBFscXaosRIzEc: 'CAD',
            plan_R6RI02CsUCUlDz: 'INR',
            plan_R6RKEg5mqJK6Ky: 'INR',
            plan_R6RKnjqXu0BZsH: 'INR',
        };
        return currencyMap[razorpayPlanId] || 'INR';
    }
    async getBillingHistory(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const mockBillingHistory = [
                {
                    id: 'pay_1',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    amount: user.subscription?.planId === 'professional'
                        ? 49
                        : user.subscription?.planId === 'enterprise'
                            ? 99
                            : 19,
                    currency: 'USD',
                    status: 'paid',
                    planName: user.subscription?.planId === 'professional'
                        ? 'Professional Plan'
                        : user.subscription?.planId === 'enterprise'
                            ? 'Enterprise Plan'
                            : 'Starter Plan',
                    description: 'Monthly subscription payment',
                },
                {
                    id: 'pay_2',
                    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    amount: user.subscription?.planId === 'professional'
                        ? 49
                        : user.subscription?.planId === 'enterprise'
                            ? 99
                            : 19,
                    currency: 'USD',
                    status: 'paid',
                    planName: user.subscription?.planId === 'professional'
                        ? 'Professional Plan'
                        : user.subscription?.planId === 'enterprise'
                            ? 'Enterprise Plan'
                            : 'Starter Plan',
                    description: 'Monthly subscription payment',
                },
            ];
            return mockBillingHistory;
        }
        catch (error) {
            this.logger.error(`Failed to get billing history for user ${userId}:`, error);
            throw new common_1.HttpException('Failed to retrieve billing history', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cancelSubscription(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!user.subscription) {
                throw new common_1.HttpException('No active subscription found', common_1.HttpStatus.NOT_FOUND);
            }
            const updatedSubscription = await this.prisma.subscription.update({
                where: { userId },
                data: {
                    status: 'cancelled',
                },
            });
            return {
                message: 'Subscription cancelled successfully',
                subscription: updatedSubscription,
            };
        }
        catch (error) {
            this.logger.error(`Failed to cancel subscription for user ${userId}:`, error);
            throw new common_1.HttpException('Failed to cancel subscription', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async exportBillingHistoryCSV(userId) {
        try {
            const billingHistory = await this.getBillingHistory(userId);
            const csvHeader = 'Date,Amount,Currency,Status,Plan Name,Description\n';
            const csvRows = billingHistory
                .map((item) => `${item.date},${item.amount},${item.currency},${item.status},"${item.planName}","${item.description}"`)
                .join('\n');
            return csvHeader + csvRows;
        }
        catch (error) {
            this.logger.error(`Failed to export billing history for user ${userId}:`, error);
            throw new common_1.HttpException('Failed to export billing history', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPaymentMethodUpdateUrl(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!user.subscription?.razorpayCustomerId) {
                throw new common_1.BadRequestException('No active subscription found');
            }
            const updateUrl = `${process.env.RAZORPAY_DASHBOARD_URL || 'https://dashboard.razorpay.com'}/app/subscriptions/${user.subscription.razorpayCustomerId}/update-payment-method`;
            return updateUrl;
        }
        catch (error) {
            this.logger.error(`Failed to get payment method update URL for user ${userId}:`, error);
            throw new common_1.HttpException('Failed to get payment method update URL', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getInvoice(userId, invoiceId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const invoiceUrl = `${process.env.RAZORPAY_DASHBOARD_URL || 'https://dashboard.razorpay.com'}/app/invoices/${invoiceId}/download`;
            return invoiceUrl;
        }
        catch (error) {
            this.logger.error(`Failed to get invoice for user ${userId}, invoice ${invoiceId}:`, error);
            throw new common_1.HttpException('Failed to get invoice', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getRazorpayPlanId(planType, currency = 'INR') {
        const envKey = `RAZORPAY_PLAN_ID_${planType.toUpperCase()}_${currency}`;
        const planId = process.env[envKey];
        if (!planId) {
            this.logger.warn(`No Razorpay plan ID found for ${planType} in ${currency}, falling back to INR`);
            return (process.env[`RAZORPAY_PLAN_ID_${planType.toUpperCase()}_INR`] || '');
        }
        return planId;
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = SubscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map