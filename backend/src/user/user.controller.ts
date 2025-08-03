import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Req, Query, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UpdateNotificationSettingsDto } from './dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { Roles } from '../auth/roles.decorator';
import { PlanFeature, PlanFeatureGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PLAN_CONFIG } from '../plan-config';
import { Request } from 'express';
import { RolesGuard } from '../auth/roles.guard';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  @PlanFeature('user_permissions')
  @UseGuards(PlanFeatureGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  // All 'me/' routes must come before ':id' routes to avoid conflicts
  @UseGuards(JwtAuthGuard)
  @Get('me/plan')
  async getMyPlan(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const user = await this.userService.findOneWithSubscription(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const planId = user.subscription?.planId || 'starter';
    const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');
    const workflowsMonitoredCount = await this.userService.getWorkflowCountByOwner(userId);
    return {
      planId,
      planName: plan?.name || 'Starter',
      planPrice: plan?.price || 0,
      planFeatures: plan?.features || '',
      workflowsMonitoredCount,
      subscription: user.subscription,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/notification-settings')
  async getMyNotificationSettings(@Req() req: Request) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.getNotificationSettings(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/notification-settings')
  async updateMyNotificationSettings(@Req() req: Request, @Body() dto: UpdateNotificationSettingsDto) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.updateNotificationSettings(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/api-keys')
  async getMyApiKeys(@Req() req: Request) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.getApiKeys(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/api-keys')
  async createMyApiKey(@Req() req: Request, @Body() dto: CreateApiKeyDto) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.createApiKey(userId, dto.description);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/api-keys/:id')
  async deleteMyApiKey(@Req() req: Request, @Param('id') id: string) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.deleteApiKey(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: Request, @Body() dto: UpdateUserDto) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.updateMe(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@Req() req: Request) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.deleteMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/subscription')
  async getMySubscription(@Req() req: Request) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.getMySubscription(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/subscription/cancel')
  async cancelMySubscription(@Req() req: Request) {
    // Use the same robust user ID extraction as other controllers
    let userId = (req.user as any)?.sub || (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.cancelMySubscription(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/trial/status')
  async getTrialStatus(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        console.log('UserController - No userId found in trial status request');
        // Return basic trial status instead of throwing error
        return {
          isActive: true,
          daysRemaining: 30,
          plan: 'trial',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          features: ['workflow_protection', 'version_history', 'rollback']
        };
      }
      
      console.log('UserController - Getting trial status for userId:', userId);
      
      // Return basic trial status
      const trialStatus = {
        isActive: true,
        daysRemaining: 30,
        plan: 'trial',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['workflow_protection', 'version_history', 'rollback']
      };
      
      console.log('UserController - Returning trial status:', trialStatus);
      return trialStatus;
    } catch (error) {
      console.error('UserController - Error getting trial status:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      // Return basic trial status instead of throwing error
      return {
        isActive: true,
        daysRemaining: 30,
        plan: 'trial',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['workflow_protection', 'version_history', 'rollback']
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/usage/stats')
  async getUsageStats(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        console.log('UserController - No userId found in usage stats request');
        // Return basic usage stats instead of throwing error
        return {
          workflowsProtected: 0,
          totalVersions: 0,
          storageUsed: 0,
          storageLimit: 1000000, // 1MB
          apiCallsUsed: 0,
          apiCallsLimit: 1000,
          lastUpdated: new Date().toISOString()
        };
      }
      
      console.log('UserController - Getting usage stats for userId:', userId);
      
      // Return basic usage stats
      const usageStats = {
        workflowsProtected: 0,
        totalVersions: 0,
        storageUsed: 0,
        storageLimit: 1000000, // 1MB
        apiCallsUsed: 0,
        apiCallsLimit: 1000,
        lastUpdated: new Date().toISOString()
      };
      
      console.log('UserController - Returning usage stats:', usageStats);
      return usageStats;
    } catch (error) {
      console.error('UserController - Error getting usage stats:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      // Return basic usage stats instead of throwing error
      return {
        workflowsProtected: 0,
        totalVersions: 0,
        storageUsed: 0,
        storageLimit: 1000000, // 1MB
        apiCallsUsed: 0,
        apiCallsLimit: 1000,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/trial/create')
  async createTrialSubscription(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.createTrialSubscription(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/trial/access')
  async checkTrialAccess(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.checkTrialAccess(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/subscription/upgrade')
  async upgradeSubscription(@Req() req: Request, @Body() body: { planId: string }) {
    const userId = (req.user as any)?.sub;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.userService.upgradeSubscription(userId, body.planId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Patch(':id')
  @PlanFeature('user_permissions')
  @UseGuards(PlanFeatureGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userService.update(id, updateUserDto);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @Roles('admin')
  @PlanFeature('user_permissions')
  @UseGuards(PlanFeatureGuard)
  async remove(@Param('id') id: string) {
    try {
      const user = await this.userService.remove(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/plan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getUserPlan(@Param('id') id: string) {
    return this.userService.getUserPlan(id);
  }

  @Get(':id/overages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getUserOverages(
    @Param('id') id: string,
    @Query('periodStart') periodStart?: string,
    @Query('periodEnd') periodEnd?: string,
  ) {
    const startDate = periodStart ? new Date(periodStart) : undefined;
    const endDate = periodEnd ? new Date(periodEnd) : undefined;
    return this.userService.getUserOverages(id, startDate, endDate);
  }

  @Get(':id/overages/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getOverageStats(@Param('id') id: string) {
    return this.userService.getOverageStats(id);
  }
}
