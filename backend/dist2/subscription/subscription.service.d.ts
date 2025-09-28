import { PrismaService } from '../prisma/prisma.service';
import { RazorpaySubscription } from '../razorpay/razorpay.service';
export declare class SubscriptionService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getUserSubscription(userId: string): Promise<{
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
    }>;
    getTrialStatus(userId: string): Promise<{
        isTrialActive: boolean | null | undefined;
        isTrialExpired: boolean | null | undefined;
        trialDaysRemaining: number;
        trialEndDate: string | undefined;
    }>;
    getUsageStats(userId: string): Promise<{
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
    }>;
    checkSubscriptionExpiration(userId: string): Promise<{
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
    }>;
    getNextPaymentInfo(userId: string): Promise<{
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
    }>;
    private getPlanPrice;
    updateSubscriptionFromRazorpay(userId: string, razorpaySubscription: RazorpaySubscription): Promise<{
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
    }>;
    handleSubscriptionCancellation(userId: string, razorpaySubscriptionId: string): Promise<{
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
    }>;
    updateSubscriptionStatus(razorpaySubscriptionId: string, status: string): Promise<{
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
    }>;
    recordPayment(razorpaySubscriptionId: string, paymentData: any): Promise<any>;
    handleFailedPayment(paymentData: any): Promise<{
        success: boolean;
        message: string;
    }>;
    upgradeUserPlan(userId: string, planId: string, paymentDetails: {
        razorpayPaymentId: string;
        razorpayOrderId: string;
    }): Promise<void>;
    private mapRazorpayStatus;
    private mapRazorpayPlanToLocal;
    private getCurrencyFromPlanId;
    getBillingHistory(userId: string): Promise<{
        id: string;
        date: string;
        amount: number;
        currency: string;
        status: string;
        planName: string;
        description: string;
    }[]>;
    cancelSubscription(userId: string): Promise<{
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
    }>;
    exportBillingHistoryCSV(userId: string): Promise<string>;
    getPaymentMethodUpdateUrl(userId: string): Promise<string>;
    getInvoice(userId: string, invoiceId: string): Promise<string>;
    getRazorpayPlanId(planType: string, currency?: string): string;
}
