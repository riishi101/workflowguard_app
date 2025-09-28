import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            name: string | null;
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
        };
    }>;
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
    findAll(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string;
        }[];
    }>;
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
    getUserPermissions(req: any): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                email: string;
                name: string | null;
            };
            permissions: string[];
            plan: any;
        };
    }>;
    getNotificationSettings(req: any): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateNotificationSettings(req: any, settings: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    getApiKeys(req: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    createApiKey(req: any, apiKeyData: any): Promise<{
        success: boolean;
        data: {
            message: string;
            name: string;
            id: string;
            createdAt: Date;
            description: string | null;
            isActive: boolean;
            key: string;
        };
        message: string;
    }>;
    deleteApiKey(req: any, keyId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
