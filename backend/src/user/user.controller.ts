import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('permissions')
  @UseGuards(JwtAuthGuard)
  async getUserPermissions(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }
      
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findOneWithSubscription(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const planId = user?.subscription?.planId || 'starter';
      const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          permissions: ['read_workflows', 'write_workflows', 'view_dashboard'],
          plan: plan?.name || 'Starter'
        }
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get user permissions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('api-keys')
  @UseGuards(JwtAuthGuard)
  async getApiKeys(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }
      
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findOneWithSubscription(userId);
      const planId = user?.subscription?.planId || 'starter';
      const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');

      if (!plan?.features?.includes('api_access')) {
        throw new HttpException('API access is not available on your plan.', HttpStatus.FORBIDDEN);
      }

      // Mock API keys for now
      const apiKeys = [
        {
          id: '1',
          name: 'Production API Key',
          key: 'wg_live_...',
          created: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          permissions: ['read', 'write']
        },
        {
          id: '2',
          name: 'Development API Key',
          key: 'wg_test_...',
          created: new Date().toISOString(),
          lastUsed: null,
          permissions: ['read']
        }
      ];

      return {
        success: true,
        data: apiKeys
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get API keys: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('api-keys')
  @UseGuards(JwtAuthGuard)
  async createApiKey(@Req() req: any, @Body() apiKeyData: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }
      
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findOneWithSubscription(userId);
      const planId = user?.subscription?.planId || 'starter';
      const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');

      if (!plan?.features?.includes('api_access')) {
        throw new HttpException('API access is not available on your plan.', HttpStatus.FORBIDDEN);
      }

      // Mock API key creation
      const newApiKey = {
        id: Date.now().toString(),
        name: apiKeyData.name,
        key: `wg_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
        created: new Date().toISOString(),
        lastUsed: null,
        permissions: apiKeyData.permissions || ['read']
      };

      return {
        success: true,
        data: newApiKey,
        message: 'API key created successfully'
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create API key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('api-keys/:keyId')
  @UseGuards(JwtAuthGuard)
  async deleteApiKey(@Req() req: any, @Param('keyId') keyId: string) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }
      
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findOneWithSubscription(userId);
      const planId = user?.subscription?.planId || 'starter';
      const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');

      if (!plan?.features?.includes('api_access')) {
        throw new HttpException('API access is not available on your plan.', HttpStatus.FORBIDDEN);
      }

      return {
        success: true,
        message: 'API key deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        `Failed to delete API key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
