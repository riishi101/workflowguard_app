export interface HubSpotBillingResponse {
  status: string;
  plan_id: string;
  current_period_end: string;
  next_billing_date: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  planId: string;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  status: string;
}

export interface HubSpotSubscriptionInfo {
  next_billing_date: string;
  [key: string]: any;
}
