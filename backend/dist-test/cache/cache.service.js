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
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CacheService = _classThis = class {
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
                const expiresAt = Date.now() + (ttl || 300) * 1000; // Default 5 minutes
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
        // Cache keys for different data types
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
        // Cache invalidation methods
        async invalidateWorkflowCache(userId, workflowId) {
            const keys = [
                CacheService.getWorkflowKey(userId, workflowId),
                CacheService.getWorkflowVersionsKey(workflowId),
            ];
            await Promise.all(keys.map((key) => this.del(key)));
        }
        async invalidateUserCache(userId) {
            const keys = [
                CacheService.getUserKey(userId),
                CacheService.getSubscriptionKey(userId),
                CacheService.getDashboardStatsKey(userId),
                CacheService.getAuditLogsKey(userId),
            ];
            await Promise.all(keys.map((key) => this.del(key)));
        }
        // Cache with automatic invalidation
        async getCachedData(key, fetchFunction, ttl = 300) {
            // Try to get from cache first
            const cached = await this.get(key);
            if (cached !== null) {
                return cached;
            }
            // Fetch fresh data
            const data = await fetchFunction();
            // Cache the result
            await this.set(key, data, ttl);
            return data;
        }
        // Cache with tags for easier invalidation
        async setWithTags(key, value, tags, ttl) {
            await this.set(key, value, ttl);
            // Store tags for this key
            const tagKey = `tags:${key}`;
            await this.set(tagKey, tags, ttl);
        }
        async invalidateByTag(tag) {
            // This is a simplified in-memory implementation
            console.log(`Invalidating cache by tag: ${tag}`);
        }
        // Performance monitoring
        async getCacheStats() {
            // This would return cache statistics in a real implementation
            return {
                hitRate: 0.85, // Mock data
                missRate: 0.15,
                totalKeys: this.cache.size,
                memoryUsage: 0,
            };
        }
    };
    __setFunctionName(_classThis, "CacheService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CacheService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CacheService = _classThis;
})();
exports.CacheService = CacheService;
