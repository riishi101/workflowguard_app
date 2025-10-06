import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
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
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,

        subscription: user.subscription,
      },
    };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    try {
      // For single-user architecture, return current user info
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: [
          {
            id: user.id,
            name: user.name || user.email,
            email: user.email,
          },
        ],
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      const plan =
        (await this.userService.getPlanById(planId)) ||
        (await this.userService.getPlanById('starter'));

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          permissions: ['read_workflows', 'write_workflows', 'view_dashboard'],
          plan: plan?.name || 'Starter',
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get user permissions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('notification-settings')
  @UseGuards(JwtAuthGuard)
  async getNotificationSettings(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const settings = await this.userService.getNotificationSettings(userId);

      return {
        success: true,
        data: settings,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get notification settings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('notification-settings')
  @UseGuards(JwtAuthGuard)
  async updateNotificationSettings(@Req() req: any, @Body() settings: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const updatedSettings = await this.userService.updateNotificationSettings(
        userId,
        settings,
      );

      return {
        success: true,
        data: updatedSettings,
        message: 'Notification settings updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to update notification settings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      const plan =
        (await this.userService.getPlanById(planId)) ||
        (await this.userService.getPlanById('starter'));

      if (!plan?.features?.includes('api_access')) {
        throw new HttpException(
          'API access is not available on your plan.',
          HttpStatus.FORBIDDEN,
        );
      }

      const apiKeys = await this.userService.getApiKeys(userId);

      return {
        success: true,
        data: apiKeys,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get API keys: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      const plan =
        (await this.userService.getPlanById(planId)) ||
        (await this.userService.getPlanById('starter'));

      if (!plan?.features?.includes('api_access')) {
        throw new HttpException(
          'API access is not available on your plan.',
          HttpStatus.FORBIDDEN,
        );
      }

      const apiKey = await this.userService.createApiKey(userId, apiKeyData);

      return {
        success: true,
        data: apiKey,
        message: 'API key created successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create API key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      const plan =
        (await this.userService.getPlanById(planId)) ||
        (await this.userService.getPlanById('starter'));

      if (!plan?.features?.includes('api_access')) {
        throw new HttpException(
          'API access is not available on your plan.',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.userService.deleteApiKey(userId, keyId);

      return {
        success: true,
        message: 'API key deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to delete API key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const updatedUser = await this.userService.update(userId, updateData);

      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to update profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('disconnect-hubspot')
  @UseGuards(JwtAuthGuard)
  async disconnectHubSpot(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      // Clear HubSpot tokens and connection data
      await this.userService.update(userId, {
        hubspotAccessToken: null,
        hubspotRefreshToken: null,
        hubspotPortalId: null,
      } as any);

      return {
        success: true,
        message: 'HubSpot account disconnected successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to disconnect HubSpot: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      // Note: In a production environment, you might want to:
      // 1. Soft delete instead of hard delete
      // 2. Send confirmation email
      // 3. Add a grace period for account recovery
      // 4. Clean up related data (workflows, subscriptions, etc.)
      
      await this.userService.remove(userId);

      return {
        success: true,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to delete account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
