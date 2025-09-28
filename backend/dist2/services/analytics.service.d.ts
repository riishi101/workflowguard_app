export interface UsageTrend {
    period: string;
    value: number;
    change: number;
}
export interface UserAnalytics {
    userId: string;
    email: string;
    riskLevel: string;
    avgOveragesPerMonth: number;
}
export interface RevenueAnalytics {
    period: string;
    revenue: number;
    growth: number;
}
export interface PredictiveAnalytics {
    prediction: string;
    confidence: number;
    factors: string[];
}
export declare class AnalyticsService {
    getUsageTrends(): Promise<UsageTrend[]>;
    getUserAnalytics(): Promise<UserAnalytics[]>;
    getRevenueAnalytics(): Promise<RevenueAnalytics[]>;
    getPredictiveAnalytics(): Promise<PredictiveAnalytics[]>;
}
