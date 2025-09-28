export declare class CacheService {
    private cache;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    static getWorkflowKey(userId: string, workflowId: string): string;
    static getWorkflowVersionsKey(workflowId: string): string;
    static getDashboardStatsKey(userId: string): string;
    static getUserKey(userId: string): string;
    static getSubscriptionKey(userId: string): string;
    static getAuditLogsKey(userId: string): string;
    invalidateWorkflowCache(userId: string, workflowId: string): Promise<void>;
    invalidateUserCache(userId: string): Promise<void>;
    getCachedData<T>(key: string, fetchFunction: () => Promise<T>, ttl?: number): Promise<T>;
    setWithTags(key: string, value: any, tags: string[], ttl?: number): Promise<void>;
    invalidateByTag(tag: string): Promise<void>;
    getCacheStats(): Promise<any>;
}
