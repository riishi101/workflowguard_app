import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private userService;
    private jwtService;
    constructor(prisma: PrismaService, userService: UserService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
        };
    }>;
    register(createUserDto: any): Promise<{
        email: string;
        name: string | null;
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
    validateHubSpotUser(hubspotUser: any): Promise<{
        email: string;
        name: string | null;
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
    validateJwtPayload(payload: {
        sub: string;
        email: string;
    }): Promise<{
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
    } | null>;
    verifyToken(token: string): Promise<{
        email: string;
        name: string | null;
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
    } | null>;
    generateToken(user: any): string;
    updateUserHubspotPortalId(userId: string, hubspotPortalId: string): Promise<void>;
    updateUserHubspotTokens(userId: string, tokens: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }): Promise<void>;
    createTrialSubscription(userId: string): Promise<void>;
}
