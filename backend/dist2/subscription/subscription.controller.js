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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async getSubscription(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const subscription = await this.subscriptionService.getUserSubscription(userId);
            return {
                success: true,
                data: subscription,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get subscription: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTrialStatus(req) {
        try {
            const userId = req.user.sub || req.user.id || req.user.userId;
            const trialStatus = await this.subscriptionService.getTrialStatus(userId);
            return {
                success: true,
                data: trialStatus,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to get trial status: ${error.message}`,
                error: error.message,
            };
        }
    }
    async getExpirationStatus(req) {
        try {
            const userId = req.user.sub || req.user.id || req.user.userId;
            const expirationStatus = await this.subscriptionService.checkSubscriptionExpiration(userId);
            return {
                success: true,
                data: expirationStatus,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to get expiration status: ${error.message}`,
                error: error.message,
            };
        }
    }
    async getNextPaymentInfo(req) {
        try {
            const userId = req.user.sub || req.user.id || req.user.userId;
            const paymentInfo = await this.subscriptionService.getNextPaymentInfo(userId);
            return {
                success: true,
                data: paymentInfo,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to get payment info: ${error.message}`,
                error: error.message,
            };
        }
    }
    async getUsageStats(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const usageStats = await this.subscriptionService.getUsageStats(userId);
            return {
                success: true,
                data: usageStats,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get usage stats: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBillingHistory(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const billingHistory = await this.subscriptionService.getBillingHistory(userId);
            return {
                success: true,
                data: billingHistory,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get billing history: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cancelSubscription(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.subscriptionService.cancelSubscription(userId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to cancel subscription: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async exportBillingHistory(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const csvData = await this.subscriptionService.exportBillingHistoryCSV(userId);
            return {
                success: true,
                data: csvData,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to export billing history: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPaymentMethodUpdateUrl(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const updateUrl = await this.subscriptionService.getPaymentMethodUpdateUrl(userId);
            return {
                success: true,
                data: { updateUrl },
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get payment method update URL: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getInvoice(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const invoiceId = req.params.invoiceId;
            const invoiceUrl = await this.subscriptionService.getInvoice(userId, invoiceId);
            return {
                success: true,
                data: { invoiceUrl },
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get invoice: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Get)('trial-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getTrialStatus", null);
__decorate([
    (0, common_1.Get)('expiration-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getExpirationStatus", null);
__decorate([
    (0, common_1.Get)('next-payment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getNextPaymentInfo", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUsageStats", null);
__decorate([
    (0, common_1.Get)('billing-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getBillingHistory", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('billing-history/export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "exportBillingHistory", null);
__decorate([
    (0, common_1.Get)('payment-method-update-url'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getPaymentMethodUpdateUrl", null);
__decorate([
    (0, common_1.Get)('invoice/:invoiceId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getInvoice", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscription'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map