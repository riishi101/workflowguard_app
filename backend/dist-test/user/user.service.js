"use strict";
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const plan_config_1 = require("../plan-config");
let UserService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UserService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
        }
        async create(createUserDto) {
            return this.prisma.user.create({
                data: createUserDto,
            });
        }
        async findAll() {
            return this.prisma.user.findMany({
                include: {
                    subscription: true,
                    workflows: true,
                },
            });
        }
        async findOne(id) {
            return this.prisma.user.findUnique({
                where: { id },
                include: {
                    subscription: true,
                    workflows: true,
                },
            });
        }
        async findByEmail(email) {
            return this.prisma.user.findUnique({
                where: { email },
                include: {
                    subscription: true,
                    workflows: true,
                },
            });
        }
        async update(id, updateUserDto) {
            return this.prisma.user.update({
                where: { id },
                data: updateUserDto,
            });
        }
        async remove(id) {
            return this.prisma.user.delete({
                where: { id },
            });
        }
        async findOneWithSubscription(id) {
            return this.prisma.user.findUnique({
                where: { id },
                include: {
                    subscription: true,
                },
            });
        }
        async getPlanById(planId) {
            const plan = await this.prisma.plan.findUnique({
                where: { id: planId },
            });
            // If plan doesn't exist in DB, fallback to in-app PLAN_CONFIG
            if (!plan) {
                const fallback = plan_config_1.PLAN_CONFIG[planId];
                if (fallback) {
                    // Normalize feature slugs from PLAN_CONFIG (already slugs)
                    return {
                        id: planId,
                        name: planId,
                        price: 0,
                        interval: 'month',
                        features: [...fallback.features],
                    };
                }
                return null;
            }
            // Normalize DB features to consistent slug array
            let featuresNormalized = [];
            const rawFeatures = plan.features;
            if (typeof rawFeatures === 'string' && rawFeatures.length > 0) {
                try {
                    const parsed = JSON.parse(rawFeatures);
                    if (Array.isArray(parsed)) {
                        featuresNormalized = parsed.map((f) => String(f));
                    }
                    else {
                        // Fallback: treat as comma-separated list
                        featuresNormalized = rawFeatures.split(',');
                    }
                }
                catch {
                    // Not JSON, treat as comma-separated
                    featuresNormalized = rawFeatures.split(',');
                }
            }
            // Lowercase and trim
            featuresNormalized = featuresNormalized
                .map((f) => f.toLowerCase().trim())
                .filter((f) => f.length > 0);
            // Add semantic aliases to align with feature gates used in controllers
            // If any feature mentions audit trail(s), expose 'audit_logs' gate
            if (featuresNormalized.some((f) => f.includes('audit trail'))) {
                featuresNormalized.push('audit_logs');
            }
            // If any feature mentions api access, expose 'api_access' slug
            if (featuresNormalized.some((f) => f.includes('api access'))) {
                featuresNormalized.push('api_access');
            }
            // Deduplicate
            const uniqueFeatures = Array.from(new Set(featuresNormalized));
            return {
                ...plan,
                // Overwrite features with normalized slugs array so `includes('audit_logs')` works reliably
                features: uniqueFeatures,
            };
        }
        async getOverageStats(userId) {
            // Overages not implemented - return default values
            return {
                totalOverage: 0,
                unbilledOverage: 0,
                overageCount: 0,
                unbilledCount: 0,
            };
        }
        async createOverage(userId, amount, description) {
            // Overages not implemented
            throw new common_1.HttpException('Overage functionality not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
        }
        async getApiKeys(userId) {
            const apiKeys = await this.prisma.apiKey.findMany({
                where: {
                    userId,
                    isActive: true,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    lastUsed: true,
                    isActive: true,
                },
            });
            return apiKeys.map((key) => ({
                ...key,
                key: key.id.substring(0, 8) + '...' + key.id.substring(key.id.length - 4), // Mask the actual key
            }));
        }
        async createApiKey(userId, apiKeyData) {
            const { name, description } = apiKeyData;
            if (!name) {
                throw new common_1.HttpException('API key name is required', common_1.HttpStatus.BAD_REQUEST);
            }
            // Generate a secure API key
            const apiKeyValue = `wg_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
            const apiKey = await this.prisma.apiKey.create({
                data: {
                    userId,
                    name,
                    description: description || '',
                    key: apiKeyValue, // Store the actual key
                    isActive: true,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    key: true, // Return the actual key only on creation
                    createdAt: true,
                    isActive: true,
                },
            });
            return {
                ...apiKey,
                message: "Store this API key securely. You won't be able to see it again.",
            };
        }
        async revokeApiKey(userId, keyId) {
            return this.prisma.apiKey.updateMany({
                where: { userId, id: keyId },
                data: { isActive: false },
            });
        }
        async revokeAllApiKeys(userId) {
            return this.prisma.apiKey.updateMany({
                where: { userId },
                data: { isActive: false },
            });
        }
        // Add missing methods that UserController expects
        async createTrialSubscription(userId) {
            // Create a trial subscription for the user (21 days for HubSpot App Marketplace)
            const trialSubscription = await this.prisma.subscription.create({
                data: {
                    userId,
                    planId: 'professional', // Use professional plan for trial
                    status: 'trial',
                    trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days trial
                },
            });
            return trialSubscription;
        }
        async checkTrialAccess(userId) {
            const subscription = await this.prisma.subscription.findFirst({
                where: {
                    userId,
                    status: 'trial',
                    planId: 'professional',
                },
            });
            if (!subscription) {
                return { hasTrial: false, message: 'No trial subscription found' };
            }
            const now = new Date();
            const isExpired = subscription.trialEndDate && subscription.trialEndDate < now;
            return {
                hasTrial: !isExpired,
                isExpired,
                endDate: subscription.trialEndDate,
                daysRemaining: subscription.trialEndDate
                    ? Math.max(0, Math.ceil((subscription.trialEndDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)))
                    : 0,
            };
        }
        async upgradeSubscription(userId, planId) {
            // Cancel existing trial subscription
            await this.prisma.subscription.updateMany({
                where: {
                    userId,
                    planId: 'professional',
                    status: 'trial',
                },
                data: { status: 'cancelled' },
            });
            // Create new paid subscription
            const newSubscription = await this.prisma.subscription.create({
                data: {
                    userId,
                    planId,
                    status: 'active',
                    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                },
            });
            return newSubscription;
        }
        async getUserPlan(userId) {
            const subscription = await this.prisma.subscription.findFirst({
                where: {
                    userId,
                    status: 'active',
                },
            });
            return subscription || { plan: null, status: 'no_subscription' };
        }
        async getUserOverages(userId, startDate, endDate) {
            const whereClause = { userId };
            if (startDate && endDate) {
                whereClause.createdAt = {
                    gte: startDate,
                    lte: endDate,
                };
            }
            const overages = await this.prisma.overage.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
            });
            return {
                overages: [],
                totalAmount: 0,
                count: 0,
            };
        }
        async cancelMySubscription(userId) {
            const subscription = await this.prisma.subscription.findFirst({
                where: {
                    userId,
                    status: 'active',
                },
            });
            if (!subscription) {
                throw new common_1.HttpException('No active subscription found', common_1.HttpStatus.NOT_FOUND);
            }
            return this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: 'cancelled' },
            });
        }
        // Add remaining missing methods
        async getWorkflowCountByOwner(userId) {
            const count = await this.prisma.workflow.count({
                where: { ownerId: userId },
            });
            return count;
        }
        async getNotificationSettings(userId) {
            const settings = await this.prisma.notificationSettings.findUnique({
                where: { userId },
            });
            return (settings || {
                userId,
                enabled: true,
                email: '',
                workflowDeleted: true,
                enrollmentTriggerModified: true,
                workflowRolledBack: true,
                criticalActionModified: true,
            });
        }
        async updateNotificationSettings(userId, dto) {
            return this.prisma.notificationSettings.upsert({
                where: { userId },
                update: dto,
                create: {
                    userId,
                    ...dto,
                },
            });
        }
        async deleteApiKey(userId, keyId) {
            const result = await this.prisma.apiKey.updateMany({
                where: {
                    userId,
                    id: keyId,
                    isActive: true,
                },
                data: { isActive: false },
            });
            if (result.count === 0) {
                throw new common_1.HttpException('API key not found or already inactive', common_1.HttpStatus.NOT_FOUND);
            }
            return { success: true };
        }
        async getMe(userId) {
            return this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: true,
                    workflows: true,
                },
            });
        }
        async updateMe(userId, dto) {
            return this.prisma.user.update({
                where: { id: userId },
                data: dto,
            });
        }
        async deleteMe(userId) {
            return this.prisma.user.delete({
                where: { id: userId },
            });
        }
        async getMySubscription(userId) {
            const subscription = await this.prisma.subscription.findFirst({
                where: {
                    userId,
                    status: 'active',
                },
            });
            return subscription || { plan: null, status: 'no_subscription' };
        }
    };
    __setFunctionName(_classThis, "UserService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserService = _classThis;
})();
exports.UserService = UserService;
