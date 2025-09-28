import { PrismaService } from '../prisma/prisma.service';
export declare class SsoConfigController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getConfig(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isEnabled: boolean;
        clientId: string;
        provider: string;
        clientSecret: string;
        redirectUri: string;
    }>;
    updateConfig(dto: {
        provider: string;
        clientId: string;
        clientSecret: string;
        redirectUri: string;
        metadata?: string;
        enabled: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isEnabled: boolean;
        clientId: string;
        provider: string;
        clientSecret: string;
        redirectUri: string;
    }>;
}
