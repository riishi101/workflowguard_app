import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private auditLogService;
    constructor(auditLogService: AuditLogService);
    getAuditLogs(user: any, page?: string, pageSize?: string, dateRange?: string, action?: string, entityType?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            userId: string | null;
            action: string;
            entityType: string;
            entityId: string;
            oldValue: import("@prisma/client/runtime/library").JsonValue | null;
            newValue: import("@prisma/client/runtime/library").JsonValue | null;
            timestamp: Date;
            ipAddress: string | null;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
}
