// Custom Razorpay type definitions
export interface RazorpayConfig {
  key_id: string;
  key_secret: string;
}

export interface RazorpayCustomer {
  id: string;
  entity: string;
  name: string;
  email: string;
  contact?: string;
  gstin?: string;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPlan {
  id: string;
  entity: string;
  interval: number;
  period: string;
  item: {
    id: string;
    active: boolean;
    name: string;
    description: string;
    amount: number;
    unit_amount: number;
    currency: string;
    type: string;
    unit: string;
    tax_inclusive: boolean;
    hsn_code: string;
    sac_code: string;
    tax_rate: number;
    tags: string[];
    notes: Record<string, any>;
    created_at: number;
    updated_at: number;
  };
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpaySubscription {
  id: string;
  entity: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start: number;
  current_end: number;
  ended_at?: number;
  quantity: number;
  notes: Record<string, any>;
  charge_at: number;
  start_at: number;
  end_at: number;
  auth_attempts: number;
  total_count: number;
  paid_count: number;
  customer_notify: boolean;
  created_at: number;
  expire_by: number;
  short_url: string;
  has_scheduled_changes: boolean;
  change_scheduled_at?: number;
  source: string;
  offer_id?: string;
  remaining_count: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id?: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, any>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  acquirer_data: Record<string, any>;
  created_at: number;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  offer_id?: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: RazorpayPayment;
    };
    subscription?: {
      entity: RazorpaySubscription;
    };
    order?: {
      entity: RazorpayOrder;
    };
  };
  created_at: number;
}

export interface RazorpayInstance {
  customers: {
    create(data: Partial<RazorpayCustomer>): Promise<RazorpayCustomer>;
    fetch(customerId: string): Promise<RazorpayCustomer>;
    edit(customerId: string, data: Partial<RazorpayCustomer>): Promise<RazorpayCustomer>;
  };
  subscriptions: {
    create(data: any): Promise<RazorpaySubscription>;
    fetch(subscriptionId: string): Promise<RazorpaySubscription>;
    cancel(subscriptionId: string, cancelAtCycleEnd?: boolean): Promise<RazorpaySubscription>;
    pause(subscriptionId: string, data?: any): Promise<RazorpaySubscription>;
    resume(subscriptionId: string, data?: any): Promise<RazorpaySubscription>;
    update(subscriptionId: string, data: any): Promise<RazorpaySubscription>;
  };
  payments: {
    fetch(paymentId: string): Promise<RazorpayPayment>;
    all(options?: any): Promise<{ items: RazorpayPayment[] }>;
  };
  plans: {
    fetch(planId: string): Promise<RazorpayPlan>;
    all(options?: any): Promise<{ items: RazorpayPlan[] }>;
  };
  orders: {
    create(data: any): Promise<RazorpayOrder>;
    fetch(orderId: string): Promise<RazorpayOrder>;
  };
}

declare class Razorpay {
  constructor(config: RazorpayConfig);
  customers: RazorpayInstance['customers'];
  subscriptions: RazorpayInstance['subscriptions'];
  payments: RazorpayInstance['payments'];
  plans: RazorpayInstance['plans'];
  orders: RazorpayInstance['orders'];
  static validateWebhookSignature(body: string, signature: string, secret: string): boolean;
}

export default Razorpay;
