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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SubscriptionController = (() => {
    let _classDecorators = [(0, common_1.Controller)('subscription')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSubscription_decorators;
    let _getTrialStatus_decorators;
    let _getExpirationStatus_decorators;
    let _getNextPaymentInfo_decorators;
    let _getUsageStats_decorators;
    let _getBillingHistory_decorators;
    let _cancelSubscription_decorators;
    let _exportBillingHistory_decorators;
    let _getPaymentMethodUpdateUrl_decorators;
    let _getInvoice_decorators;
    var SubscriptionController = _classThis = class {
        constructor(subscriptionService) {
            this.subscriptionService = (__runInitializers(this, _instanceExtraInitializers), subscriptionService);
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
    __setFunctionName(_classThis, "SubscriptionController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getSubscription_decorators = [(0, common_1.Get)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getTrialStatus_decorators = [(0, common_1.Get)('trial-status'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getExpirationStatus_decorators = [(0, common_1.Get)('expiration-status'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getNextPaymentInfo_decorators = [(0, common_1.Get)('next-payment'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getUsageStats_decorators = [(0, common_1.Get)('usage'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getBillingHistory_decorators = [(0, common_1.Get)('billing-history'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _cancelSubscription_decorators = [(0, common_1.Post)('cancel'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _exportBillingHistory_decorators = [(0, common_1.Get)('billing-history/export'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getPaymentMethodUpdateUrl_decorators = [(0, common_1.Get)('payment-method-update-url'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getInvoice_decorators = [(0, common_1.Get)('invoice/:invoiceId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        __esDecorate(_classThis, null, _getSubscription_decorators, { kind: "method", name: "getSubscription", static: false, private: false, access: { has: obj => "getSubscription" in obj, get: obj => obj.getSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTrialStatus_decorators, { kind: "method", name: "getTrialStatus", static: false, private: false, access: { has: obj => "getTrialStatus" in obj, get: obj => obj.getTrialStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getExpirationStatus_decorators, { kind: "method", name: "getExpirationStatus", static: false, private: false, access: { has: obj => "getExpirationStatus" in obj, get: obj => obj.getExpirationStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getNextPaymentInfo_decorators, { kind: "method", name: "getNextPaymentInfo", static: false, private: false, access: { has: obj => "getNextPaymentInfo" in obj, get: obj => obj.getNextPaymentInfo }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUsageStats_decorators, { kind: "method", name: "getUsageStats", static: false, private: false, access: { has: obj => "getUsageStats" in obj, get: obj => obj.getUsageStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBillingHistory_decorators, { kind: "method", name: "getBillingHistory", static: false, private: false, access: { has: obj => "getBillingHistory" in obj, get: obj => obj.getBillingHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancelSubscription_decorators, { kind: "method", name: "cancelSubscription", static: false, private: false, access: { has: obj => "cancelSubscription" in obj, get: obj => obj.cancelSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportBillingHistory_decorators, { kind: "method", name: "exportBillingHistory", static: false, private: false, access: { has: obj => "exportBillingHistory" in obj, get: obj => obj.exportBillingHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPaymentMethodUpdateUrl_decorators, { kind: "method", name: "getPaymentMethodUpdateUrl", static: false, private: false, access: { has: obj => "getPaymentMethodUpdateUrl" in obj, get: obj => obj.getPaymentMethodUpdateUrl }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInvoice_decorators, { kind: "method", name: "getInvoice", static: false, private: false, access: { has: obj => "getInvoice" in obj, get: obj => obj.getInvoice }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SubscriptionController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SubscriptionController = _classThis;
})();
exports.SubscriptionController = SubscriptionController;
