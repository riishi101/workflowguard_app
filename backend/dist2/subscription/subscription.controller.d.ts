import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getSubscription(req: any): Promise<{
        success: boolean;
        data: {
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
    getTrialStatus(req: any): Promise<{
        success: boolean;
        data: {
            isTrialActive: boolean | null | undefined;
            isTrialExpired: boolean | null | undefined;
            trialDaysRemaining: number;
            trialEndDate: string | undefined;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getExpirationStatus(req: any): Promise<{
        success: boolean;
        data: {
            isExpired: boolean;
            message: string;
            expiredDate?: undefined;
            error?: undefined;
        } | {
            isExpired: boolean;
            message: string;
            expiredDate: Date;
            error?: undefined;
        } | {
            isExpired: boolean;
            message?: undefined;
            expiredDate?: undefined;
            error?: undefined;
        } | {
            isExpired: boolean;
            error: any;
            message?: undefined;
            expiredDate?: undefined;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getNextPaymentInfo(req: any): Promise<{
        success: boolean;
        data: {
            hasSubscription: boolean;
            nextPayment?: undefined;
            error?: undefined;
        } | {
            hasSubscription: boolean;
            nextPayment: null;
            error?: undefined;
        } | {
            hasSubscription: boolean;
            nextPayment: {
                date: Date;
                daysUntil: number;
                isOverdue: boolean;
                amount: number;
                currency: string;
            };
            error?: undefined;
        } | {
            hasSubscription: boolean;
            error: any;
            nextPayment?: undefined;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getUsageStats(req: any): Promise<{
        success: boolean;
        data: {
            workflows: {
                used: number;
                limit: number;
                percentage: number;
            };
            versionHistory: {
                used: number;
                limit: number;
                percentage: number;
            };
            storage: {
                used: number;
                limit: number;
                percentage: number;
            };
        };
    }>;
    getBillingHistory(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            date: string;
            amount: number;
            currency: string;
            status: string;
            planName: string;
            description: string;
        }[];
    }>;
    cancelSubscription(req: any): Promise<{
        success: boolean;
        data: {
            message: string;
            subscription: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                planId: string;
                status: string;
                trialEndDate: Date | null;
                nextBillingDate: Date | null;
                razorpayCustomerId: string | null;
                razorpaySubscriptionId: string | null;
            };
        };
    }>;
    exportBillingHistory(req: any): Promise<{
        success: boolean;
        data: string;
    }>;
    getPaymentMethodUpdateUrl(req: any): Promise<{
        success: boolean;
        data: {
            updateUrl: string;
        };
    }>;
    getInvoice(req: any): Promise<{
        success: boolean;
        data: {
            invoiceUrl: string;
        };
    }>;
}
