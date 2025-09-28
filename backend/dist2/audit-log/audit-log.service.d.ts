import { PrismaService } from '../prisma/prisma.service';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    createAuditLog(data: {
        userId?: string;
        action: string;
        entityType: string;
        entityId: string;
        oldValue?: any;
        newValue?: any;
        ipAddress?: string;
    }): Promise<{
        id: string;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        timestamp: Date;
        ipAddress: string | null;
    }>;
    getAuditLogs(userId?: string, filters?: any, skip?: number, take?: number): Promise<{
        id: string;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        timestamp: Date;
        ipAddress: string | null;
    }[]>;
}
