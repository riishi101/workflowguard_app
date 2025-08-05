import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      console.error('Cache reset error:', error);
    }
  }

  // Cache keys for different data types
  static getWorkflowKey(userId: string, workflowId: string): string {
    return `workflow:${userId}:${workflowId}`;
  }

  static getWorkflowVersionsKey(workflowId: string): string {
    return `workflow_versions:${workflowId}`;
  }

  static getDashboardStatsKey(userId: string): string {
    return `dashboard_stats:${userId}`;
  }

  static getUserKey(userId: string): string {
    return `user:${userId}`;
  }

  static getSubscriptionKey(userId: string): string {
    return `subscription:${userId}`;
  }

  static getAuditLogsKey(userId: string): string {
    return `audit_logs:${userId}`;
  }

  // Cache invalidation methods
  async invalidateWorkflowCache(userId: string, workflowId: string): Promise<void> {
    const keys = [
      CacheService.getWorkflowKey(userId, workflowId),
      CacheService.getWorkflowVersionsKey(workflowId),
    ];
    
    await Promise.all(keys.map(key => this.del(key)));
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const keys = [
      CacheService.getUserKey(userId),
      CacheService.getSubscriptionKey(userId),
      CacheService.getDashboardStatsKey(userId),
      CacheService.getAuditLogsKey(userId),
    ];
    
    await Promise.all(keys.map(key => this.del(key)));
  }

  // Cache with automatic invalidation
  async getCachedData<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = 300 // 5 minutes default
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
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
  async setWithTags(key: string, value: any, tags: string[], ttl?: number): Promise<void> {
    await this.set(key, value, ttl);
    
    // Store tags for this key
    const tagKey = `tags:${key}`;
    await this.set(tagKey, tags, ttl);
  }

  async invalidateByTag(tag: string): Promise<void> {
    // This is a simplified implementation
    // In production, you'd use Redis or a more sophisticated cache
    console.log(`Invalidating cache by tag: ${tag}`);
  }

  // Performance monitoring
  async getCacheStats(): Promise<any> {
    // This would return cache statistics in a real implementation
    return {
      hitRate: 0.85, // Mock data
      missRate: 0.15,
      totalKeys: 0,
      memoryUsage: 0,
    };
  }
} 