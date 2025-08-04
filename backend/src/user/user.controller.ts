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
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const user = await this.userService.getMe(userId);
      return user;
    } catch (error) {
      throw new HttpException(
        `Failed to get user profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const user = await this.userService.updateMe(userId, updateUserDto);
      return user;
    } catch (error) {
      throw new HttpException(
        `Failed to update user profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('me/profile')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.userService.deleteMe(userId);
      return { message: 'User account deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete user account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('me/subscription')
  @UseGuards(JwtAuthGuard)
  async getMySubscription(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const subscription = await this.userService.getMySubscription(userId);
      return subscription;
    } catch (error) {
      throw new HttpException(
        `Failed to get subscription: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('me/notification-settings')
  @UseGuards(JwtAuthGuard)
  async getNotificationSettings(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const settings = await this.userService.getNotificationSettings(userId);
      return settings;
    } catch (error) {
      throw new HttpException(
        `Failed to get notification settings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch('me/notification-settings')
  @UseGuards(JwtAuthGuard)
  async updateNotificationSettings(@Req() req: any, @Body() settings: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const updatedSettings = await this.userService.updateNotificationSettings(userId, settings);
      return updatedSettings;
    } catch (error) {
      throw new HttpException(
        `Failed to update notification settings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('me/api-keys')
  @UseGuards(JwtAuthGuard)
  async getApiKeys(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const apiKeys = await this.userService.getApiKeys(userId);
      return apiKeys;
    } catch (error) {
      throw new HttpException(
        `Failed to get API keys: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('me/api-keys')
  @UseGuards(JwtAuthGuard)
  async createApiKey(@Req() req: any, @Body() apiKeyData: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const apiKey = await this.userService.createApiKey(userId, apiKeyData.name, apiKeyData.description);
      return apiKey;
    } catch (error) {
      throw new HttpException(
        `Failed to create API key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('me/api-keys/:keyId')
  @UseGuards(JwtAuthGuard)
  async deleteApiKey(@Req() req: any, @Param('keyId') keyId: string) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.userService.deleteApiKey(userId, keyId);
      return { message: 'API key deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete API key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('me/overages')
  @UseGuards(JwtAuthGuard)
  async getMyOverages(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const overages = await this.userService.getUserOverages(userId);
      return overages;
    } catch (error) {
      throw new HttpException(
        `Failed to get overages: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('me/subscription/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelMySubscription(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const result = await this.userService.cancelMySubscription(userId);
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to cancel subscription: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
