import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto';
import { Roles } from '../auth/roles.decorator';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('audit-logs')
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() createAuditLogDto: CreateAuditLogDto) {
    try {
      return await this.auditLogService.create(createAuditLogDto);
    } catch (error) {
      throw new HttpException('Failed to create audit log', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req: Request,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    const userIdFromJwt = (req.user as any)?.sub;
    const user = await this.userService.findOneWithSubscription(userIdFromJwt);
    const planId = user?.subscription?.planId || 'starter';
    const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');
    if (!plan?.features?.includes('audit_logs')) {
      throw new HttpException('Audit log access is not available on your plan.', HttpStatus.FORBIDDEN);
    }
    if (userId) {
      return await this.auditLogService.findByUser(userId);
    }
    if (entityType && entityId) {
      return await this.auditLogService.findByEntity(entityType, entityId);
    }
    return await this.auditLogService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const userIdFromJwt = (req.user as any)?.sub;
    const user = await this.userService.findOneWithSubscription(userIdFromJwt);
    const planId = user?.subscription?.planId || 'starter';
    const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');
    if (!plan?.features?.includes('audit_logs')) {
      throw new HttpException('Audit log access is not available on your plan.', HttpStatus.FORBIDDEN);
    }
    const auditLog = await this.auditLogService.findOne(id);
    if (!auditLog) {
      throw new HttpException('Audit log not found', HttpStatus.NOT_FOUND);
    }
    return auditLog;
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Req() req: Request, @Param('userId') userId: string) {
    let safeUserId = userId;
    if (!safeUserId) {
      safeUserId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    }
    if (!safeUserId) {
      const headerId = req.headers['x-user-id'];
      if (Array.isArray(headerId)) {
        safeUserId = headerId[0];
      } else if (typeof headerId === 'string') {
        safeUserId = headerId;
      }
    }
    if (!safeUserId || typeof safeUserId !== 'string') {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }
    const user = await this.userService.findOneWithSubscription(safeUserId);
    const planId = user && user.subscription ? user.subscription.planId : 'starter';
    const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');
    if (!plan?.features?.includes('audit_logs')) {
      throw new HttpException('Audit log access is not available on your plan.', HttpStatus.FORBIDDEN);
    }
    return await this.auditLogService.findByUser(safeUserId);
  }

  @Get('entity/:entityType/:entityId')
  @UseGuards(JwtAuthGuard)
  async findByEntity(@Req() req: Request, @Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    const userIdFromJwt = (req.user as any)?.sub;
    const user = await this.userService.findOneWithSubscription(userIdFromJwt);
    const planId = user?.subscription?.planId || 'starter';
    const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');
    if (!plan?.features?.includes('audit_logs')) {
      throw new HttpException('Audit log access is not available on your plan.', HttpStatus.FORBIDDEN);
    }
    return await this.auditLogService.findByEntity(entityType, entityId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyAuditLogs(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const auditLogs = await this.auditLogService.findByUser(userId);
      return auditLogs;
    } catch (error) {
      throw new HttpException(
        `Failed to get audit logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @Roles('admin', 'restorer')
  async remove(@Param('id') id: string) {
    try {
      const auditLog = await this.auditLogService.remove(id);
      if (!auditLog) {
        throw new HttpException('Audit log not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Audit log deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete audit log', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('export')
  @UseGuards(JwtAuthGuard)
  async exportAuditLogs(
    @Req() req: Request,
    @Body() filters: {
      dateRange?: string;
      user?: string;
      action?: string;
    }
  ) {
    const userIdFromJwt = (req.user as any)?.sub;
    const user = await this.userService.findOneWithSubscription(userIdFromJwt);
    const planId = user?.subscription?.planId || 'starter';
    const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');
    if (!plan?.features?.includes('audit_logs')) {
      throw new HttpException('Audit log access is not available on your plan.', HttpStatus.FORBIDDEN);
    }
    
    try {
      const auditLogs = await this.auditLogService.findAll();
      return {
        data: auditLogs,
        exportDate: new Date().toISOString(),
        filters: filters,
        totalRecords: auditLogs.length
      };
    } catch (error) {
      throw new HttpException('Failed to export audit logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
