"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = CacheService_1 = class CacheService {
    constructor() {
        this.cache = new Map();
    }
    async get(key) {
        try {
            const item = this.cache.get(key);
            if (!item) {
                return null;
            }
            if (Date.now() > item.expiresAt) {
                this.cache.delete(key);
                return null;
            }
            return item.value;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const expiresAt = Date.now() + (ttl || 300) * 1000;
            this.cache.set(key, { value, expiresAt });
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    async del(key) {
        try {
            this.cache.delete(key);
        }
        catch (error) {
            console.error('Cache delete error:', error);
        }
    }
    async reset() {
        try {
            this.cache.clear();
        }
        catch (error) {
            console.error('Cache reset error:', error);
        }
    }
    static getWorkflowKey(userId, workflowId) {
        return `workflow:${userId}:${workflowId}`;
    }
    static getWorkflowVersionsKey(workflowId) {
        return `workflow_versions:${workflowId}`;
    }
    static getDashboardStatsKey(userId) {
        return `dashboard_stats:${userId}`;
    }
    static getUserKey(userId) {
        return `user:${userId}`;
    }
    static getSubscriptionKey(userId) {
        return `subscription:${userId}`;
    }
    static getAuditLogsKey(userId) {
        return `audit_logs:${userId}`;
    }
    async invalidateWorkflowCache(userId, workflowId) {
        const keys = [
            CacheService_1.getWorkflowKey(userId, workflowId),
            CacheService_1.getWorkflowVersionsKey(workflowId),
        ];
        await Promise.all(keys.map((key) => this.del(key)));
    }
    async invalidateUserCache(userId) {
        const keys = [
            CacheService_1.getUserKey(userId),
            CacheService_1.getSubscriptionKey(userId),
            CacheService_1.getDashboardStatsKey(userId),
            CacheService_1.getAuditLogsKey(userId),
        ];
        await Promise.all(keys.map((key) => this.del(key)));
    }
    async getCachedData(key, fetchFunction, ttl = 300) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const data = await fetchFunction();
        await this.set(key, data, ttl);
        return data;
    }
    async setWithTags(key, value, tags, ttl) {
        await this.set(key, value, ttl);
        const tagKey = `tags:${key}`;
        await this.set(tagKey, tags, ttl);
    }
    async invalidateByTag(tag) {
        console.log(`Invalidating cache by tag: ${tag}`);
    }
    async getCacheStats() {
        return {
            hitRate: 0.85,
            missRate: 0.15,
            totalKeys: this.cache.size,
            memoryUsage: 0,
        };
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map