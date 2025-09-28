import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async createAuditLog(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
      },
    });
  }

  async getAuditLogs(
    userId?: string,
    filters?: any,
    skip?: number,
    take?: number,
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
        ...filters,
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take,
    });
  }
}
