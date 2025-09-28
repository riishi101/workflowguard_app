import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Response, Request } from 'express';
export declare class AuthController {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    getProfile(req: Request): Promise<Express.User | undefined>;
    getHubSpotAuthUrl(marketplace?: string): Promise<{
        url: string;
    }>;
    initiateHubSpotOAuth(res: Response): Promise<void>;
    handleHubSpotCallback(code: string, state: string, res: Response): Promise<void>;
    validateUser(body: {
        email: string;
        password: string;
    }): Promise<any>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
        };
    }>;
    register(createUserDto: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
        };
    }>;
    getCurrentUser(req: Request): Promise<{
        success: boolean;
        data: {
            email: string;
            name: string | null;
            id: string;
            createdAt: Date;
            hubspotPortalId: string | null;
        };
    }>;
}
