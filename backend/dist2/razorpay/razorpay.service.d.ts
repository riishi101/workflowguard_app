import { ConfigService } from '@nestjs/config';
export interface RazorpaySubscription {
    id: string;
    entity: string;
    plan_id: string;
    customer_id: string;
    status: string;
    current_start: number;
    current_end: number;
    ended_at: number | null;
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
    change_scheduled_at: number | null;
    source: string;
    offer_id: string | null;
    remaining_count: number;
}
export interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string | null;
    invoice_id: string | null;
    international: boolean;
    method: string;
    amount_refunded: number;
    refund_status: string | null;
    captured: boolean;
    description: string;
    card_id: string | null;
    bank: string | null;
    wallet: string | null;
    vpa: string | null;
    email: string;
    contact: string;
    notes: Record<string, any>;
    fee: number;
    tax: number;
    error_code: string | null;
    error_description: string | null;
    error_source: string | null;
    error_step: string | null;
    error_reason: string | null;
    acquirer_data: Record<string, any>;
    created_at: number;
}
export interface CreateSubscriptionDto {
    planId: string;
    customerId: string;
    totalCount?: number;
    customerNotify?: boolean;
    notes?: Record<string, any>;
    addons?: Array<{
        item: {
            name: string;
            amount: number;
            currency: string;
        };
    }>;
}
export interface CreateCustomerDto {
    name: string;
    email: string;
    contact?: string;
    notes?: Record<string, any>;
}
export declare class RazorpayService {
    private configService;
    private readonly logger;
    private razorpay;
    constructor(configService: ConfigService);
    createCustomer(customerData: CreateCustomerDto): Promise<any>;
    getCustomer(customerId: string): Promise<any>;
    updateCustomer(customerId: string, updateData: Partial<CreateCustomerDto>): Promise<any>;
    createSubscription(subscriptionData: CreateSubscriptionDto): Promise<RazorpaySubscription>;
    getSubscription(subscriptionId: string): Promise<RazorpaySubscription>;
    cancelSubscription(subscriptionId: string, cancelAtCycleEnd?: boolean): Promise<any>;
    pauseSubscription(subscriptionId: string, pauseAt?: number): Promise<any>;
    resumeSubscription(subscriptionId: string, resumeAt?: number): Promise<any>;
    getPayments(subscriptionId?: string, count?: number, skip?: number): Promise<any>;
    getPayment(paymentId: string): Promise<RazorpayPayment>;
    getPlan(planId: string): Promise<any>;
    getAllPlans(): Promise<any>;
    verifyWebhookSignature(body: string, signature: string): boolean;
    getPlanIdForSubscription(planType: 'starter' | 'professional' | 'enterprise', currency?: string): string;
    getAvailableCurrencies(): string[];
    isCurrencySupported(currency: string): boolean;
    formatAmount(amount: number): number;
    formatAmountFromPaise(amountInPaise: number): number;
    getSubscriptionsByCustomer(customerId: string): Promise<any>;
    createOrder(amount: number, currency?: string, notes?: Record<string, any>): Promise<any>;
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
}
