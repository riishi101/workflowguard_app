import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }>;
    findAll(): Promise<({
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
        } | null;
        workflows: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string | null;
            ownerId: string;
            hubspotId: string;
            deletedAt: Date | null;
            isDeleted: boolean;
            restoredAt: Date | null;
        }[];
    } & {
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    })[]>;
    findOne(id: string): Promise<({
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
        } | null;
        workflows: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string | null;
            ownerId: string;
            hubspotId: string;
            deletedAt: Date | null;
            isDeleted: boolean;
            restoredAt: Date | null;
        }[];
    } & {
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }) | null>;
    findByEmail(email: string): Promise<({
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
        } | null;
        workflows: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string | null;
            ownerId: string;
            hubspotId: string;
            deletedAt: Date | null;
            isDeleted: boolean;
            restoredAt: Date | null;
        }[];
    } & {
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }) | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }>;
    remove(id: string): Promise<{
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }>;
    findOneWithSubscription(id: string): Promise<({
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
        } | null;
    } & {
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }) | null>;
    getPlanById(planId: string): Promise<any>;
    getOverageStats(userId: string): Promise<{
        totalOverage: number;
        unbilledOverage: number;
        overageCount: number;
        unbilledCount: number;
    }>;
    createOverage(userId: string, amount: number, description?: string): Promise<void>;
    getApiKeys(userId: string): Promise<any[]>;
    createApiKey(userId: string, apiKeyData: any): Promise<{
        message: string;
        name: string;
        id: string;
        createdAt: Date;
        description: string | null;
        isActive: boolean;
        key: string;
    }>;
    revokeApiKey(userId: string, keyId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    revokeAllApiKeys(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createTrialSubscription(userId: string): Promise<{
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
    checkTrialAccess(userId: string): Promise<{
        hasTrial: boolean;
        message: string;
        isExpired?: undefined;
        endDate?: undefined;
        daysRemaining?: undefined;
    } | {
        hasTrial: boolean;
        isExpired: boolean | null;
        endDate: Date | null;
        daysRemaining: number;
        message?: undefined;
    }>;
    upgradeSubscription(userId: string, planId: string): Promise<{
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
    getUserPlan(userId: string): Promise<{
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
    } | {
        plan: null;
        status: string;
    }>;
    getUserOverages(userId: string, startDate?: Date, endDate?: Date): Promise<{
        overages: never[];
        totalAmount: number;
        count: number;
    }>;
    cancelMySubscription(userId: string): Promise<{
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
    getWorkflowCountByOwner(userId: string): Promise<number>;
    getNotificationSettings(userId: string): Promise<{
        email: string;
        workflowDeleted: boolean;
        enrollmentTriggerModified: boolean;
        workflowRolledBack: boolean;
        criticalActionModified: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        enabled: boolean;
    } | {
        userId: string;
        enabled: true;
        email: string;
        workflowDeleted: true;
        enrollmentTriggerModified: true;
        workflowRolledBack: true;
        criticalActionModified: true;
    }>;
    updateNotificationSettings(userId: string, dto: any): Promise<{
        email: string;
        workflowDeleted: boolean;
        enrollmentTriggerModified: boolean;
        workflowRolledBack: boolean;
        criticalActionModified: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        enabled: boolean;
    }>;
    deleteApiKey(userId: string, keyId: string): Promise<{
        success: boolean;
    }>;
    getMe(userId: string): Promise<({
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
        } | null;
        workflows: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string | null;
            ownerId: string;
            hubspotId: string;
            deletedAt: Date | null;
            isDeleted: boolean;
            restoredAt: Date | null;
        }[];
    } & {
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }) | null>;
    updateMe(userId: string, dto: UpdateUserDto): Promise<{
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }>;
    deleteMe(userId: string): Promise<{
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    }>;
    getMySubscription(userId: string): Promise<{
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
    } | {
        plan: null;
        status: string;
    }>;
}
