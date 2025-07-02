import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLog } from '@prisma/client';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAuditLogDto): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findAll(): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      include: {
        user: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async update(id: string, data: any): Promise<AuditLog> {
    return this.prisma.auditLog.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  async remove(id: string): Promise<AuditLog> {
    return this.prisma.auditLog.delete({
      where: { id },
    });
  }
}
