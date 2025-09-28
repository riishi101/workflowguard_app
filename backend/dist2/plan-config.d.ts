export type PlanId = 'starter' | 'professional' | 'enterprise';
export interface PlanConfig {
    maxWorkflows: number | null;
    historyDays: number | null;
    features: string[];
}
export declare const PLAN_CONFIG: Record<PlanId, PlanConfig>;
