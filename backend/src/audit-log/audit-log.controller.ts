import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';
import { GetUser } from '../auth/get-user.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  async getAuditLogs(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('dateRange') dateRange?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    const filters: any = {};
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;

    const pageNum = parseInt(page || '1') || 1;
    const pageSizeNum = parseInt(pageSize || '20') || 20;
    const skip = (pageNum - 1) * pageSizeNum;

    const auditLogs = await this.auditLogService.getAuditLogs(
      user.id,
      filters,
      skip,
      pageSizeNum,
    );

    return {
      success: true,
      data: auditLogs,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total: auditLogs.length,
      },
    };
  }

  @Post('export')
  async exportAuditLogs(
    @GetUser() user: any,
    @Body() filters?: any,
  ) {
    const auditLogs = await this.auditLogService.getAuditLogs(
      user.id,
      filters || {},
      0, // skip
      10000, // large limit for export
    );

    return {
      success: true,
      data: auditLogs,
      exportInfo: {
        totalRecords: auditLogs.length,
        exportDate: new Date().toISOString(),
        filters: filters || {},
      },
    };
  }
}
