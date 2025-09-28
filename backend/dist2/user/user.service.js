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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const plan_config_1 = require("../plan-config");
let UserService = class UserService {
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
        if (!plan) {
            const fallback = plan_config_1.PLAN_CONFIG[planId];
            if (fallback) {
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
        let featuresNormalized = [];
        const rawFeatures = plan.features;
        if (typeof rawFeatures === 'string' && rawFeatures.length > 0) {
            try {
                const parsed = JSON.parse(rawFeatures);
                if (Array.isArray(parsed)) {
                    featuresNormalized = parsed.map((f) => String(f));
                }
                else {
                    featuresNormalized = rawFeatures.split(',');
                }
            }
            catch {
                featuresNormalized = rawFeatures.split(',');
            }
        }
        featuresNormalized = featuresNormalized
            .map((f) => f.toLowerCase().trim())
            .filter((f) => f.length > 0);
        if (featuresNormalized.some((f) => f.includes('audit trail'))) {
            featuresNormalized.push('audit_logs');
        }
        if (featuresNormalized.some((f) => f.includes('api access'))) {
            featuresNormalized.push('api_access');
        }
        const uniqueFeatures = Array.from(new Set(featuresNormalized));
        return {
            ...plan,
            features: uniqueFeatures,
        };
    }
    async getOverageStats(userId) {
        return {
            totalOverage: 0,
            unbilledOverage: 0,
            overageCount: 0,
            unbilledCount: 0,
        };
    }
    async createOverage(userId, amount, description) {
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
            key: key.id.substring(0, 8) + '...' + key.id.substring(key.id.length - 4),
        }));
    }
    async createApiKey(userId, apiKeyData) {
        const { name, description } = apiKeyData;
        if (!name) {
            throw new common_1.HttpException('API key name is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const apiKeyValue = `wg_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
        const apiKey = await this.prisma.apiKey.create({
            data: {
                userId,
                name,
                description: description || '',
                key: apiKeyValue,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                key: true,
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
    async createTrialSubscription(userId) {
        const trialSubscription = await this.prisma.subscription.create({
            data: {
                userId,
                planId: 'professional',
                status: 'trial',
                trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
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
        await this.prisma.subscription.updateMany({
            where: {
                userId,
                planId: 'professional',
                status: 'trial',
            },
            data: { status: 'cancelled' },
        });
        const newSubscription = await this.prisma.subscription.create({
            data: {
                userId,
                planId,
                status: 'active',
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map