import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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

    const auditLogs = await this.auditLogService.getAuditLogs(user.id, filters, skip, pageSizeNum);
    
    return {
      success: true,
      data: auditLogs,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total: auditLogs.length
      }
    };
  }
}
