import { RazorpayService, CreateSubscriptionDto, CreateCustomerDto } from './razorpay.service';
import { SubscriptionService } from '../subscription/subscription.service';
export declare class RazorpayController {
    private razorpayService;
    private subscriptionService;
    private readonly logger;
    constructor(razorpayService: RazorpayService, subscriptionService: SubscriptionService);
    createCustomer(customerData: CreateCustomerDto, user: any): Promise<any>;
    getCustomer(customerId: string): Promise<any>;
    updateCustomer(customerId: string, updateData: Partial<CreateCustomerDto>): Promise<any>;
    createSubscription(subscriptionData: CreateSubscriptionDto, user: any): Promise<import("./razorpay.service").RazorpaySubscription>;
    getSubscription(subscriptionId: string): Promise<import("./razorpay.service").RazorpaySubscription>;
    cancelSubscription(subscriptionId: string, body: {
        cancelAtCycleEnd?: boolean;
    }, user: any): Promise<any>;
    pauseSubscription(subscriptionId: string, body: {
        pauseAt?: number;
    }): Promise<any>;
    resumeSubscription(subscriptionId: string, body: {
        resumeAt?: number;
    }): Promise<any>;
    upgradeSubscription(subscriptionId: string, body: {
        newPlanType: 'starter' | 'professional' | 'enterprise';
        currency?: string;
    }, user: any): Promise<import("./razorpay.service").RazorpaySubscription>;
    getPayments(subscriptionId?: string, count?: number, skip?: number): Promise<any>;
    getPayment(paymentId: string): Promise<import("./razorpay.service").RazorpayPayment>;
    getBillingHistory(user: any): Promise<{
        payments: never[];
        subscription: null;
        localSubscription?: undefined;
    } | {
        payments: any;
        subscription: import("./razorpay.service").RazorpaySubscription;
        localSubscription: {
            id: string;
            planId: string;
            planName: string;
            price: number;
            status: string;
            currentPeriodStart: string;
            currentPeriodEnd: string;
            trialEndDate: string | undefined;
            nextBillingDate: string | undefined;
            razorpayCustomerId: any;
            razorpaySubscriptionId: any;
            features: string[];
            limits: {
                workflows: number;
                versionHistory: number;
            };
            usage: {
                workflows: number;
                versionHistory: number;
            };
            email: string;
            paymentMethod: {
                brand: string;
                last4: string;
                exp: string;
            };
        };
    }>;
    getPlans(): Promise<any>;
    getPlan(planId: string): Promise<any>;
    createRazorpayOrder(body: {
        planId: string;
        currency?: string;
    }, user: any): Promise<{
        success: boolean;
        data: any;
    }>;
    confirmRazorpayPayment(body: {
        planId: string;
        paymentId: string;
        orderId: string;
        signature: string;
    }, user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            paymentId: string;
            planId: string;
        };
    }>;
    createOrder(body: {
        amount: number;
        currency?: string;
        notes?: Record<string, any>;
    }, user: any): Promise<any>;
    handleWebhook(body: Buffer, signature: string): Promise<{
        status: string;
    }>;
    private handleWebhookEvent;
    private handleSubscriptionActivated;
    private handleSubscriptionCharged;
    private handleSubscriptionCompleted;
    private handleSubscriptionCancelled;
    private handleSubscriptionPaused;
    private handleSubscriptionResumed;
    private handlePaymentFailed;
}
