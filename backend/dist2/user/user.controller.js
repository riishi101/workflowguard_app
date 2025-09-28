"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getProfile(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        const user = await this.userService.findOneWithSubscription(userId);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
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
    create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    async findAll(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.userService.findOne(userId);
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
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
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get users: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findOne(id) {
        return this.userService.findOne(id);
    }
    update(id, updateUserDto) {
        return this.userService.update(id, updateUserDto);
    }
    remove(id) {
        return this.userService.remove(id);
    }
    async getUserPermissions(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.userService.findOneWithSubscription(userId);
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const planId = user?.subscription?.planId || 'starter';
            const plan = (await this.userService.getPlanById(planId)) ||
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
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get user permissions: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNotificationSettings(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const settings = await this.userService.getNotificationSettings(userId);
            return {
                success: true,
                data: settings,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get notification settings: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateNotificationSettings(req, settings) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const updatedSettings = await this.userService.updateNotificationSettings(userId, settings);
            return {
                success: true,
                data: updatedSettings,
                message: 'Notification settings updated successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to update notification settings: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getApiKeys(req) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.userService.findOneWithSubscription(userId);
            const planId = user?.subscription?.planId || 'starter';
            const plan = (await this.userService.getPlanById(planId)) ||
                (await this.userService.getPlanById('starter'));
            if (!plan?.features?.includes('api_access')) {
                throw new common_1.HttpException('API access is not available on your plan.', common_1.HttpStatus.FORBIDDEN);
            }
            const apiKeys = await this.userService.getApiKeys(userId);
            return {
                success: true,
                data: apiKeys,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get API keys: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createApiKey(req, apiKeyData) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.userService.findOneWithSubscription(userId);
            const planId = user?.subscription?.planId || 'starter';
            const plan = (await this.userService.getPlanById(planId)) ||
                (await this.userService.getPlanById('starter'));
            if (!plan?.features?.includes('api_access')) {
                throw new common_1.HttpException('API access is not available on your plan.', common_1.HttpStatus.FORBIDDEN);
            }
            const apiKey = await this.userService.createApiKey(userId, apiKeyData);
            return {
                success: true,
                data: apiKey,
                message: 'API key created successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create API key: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteApiKey(req, keyId) {
        try {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.userService.findOneWithSubscription(userId);
            const planId = user?.subscription?.planId || 'starter';
            const plan = (await this.userService.getPlanById(planId)) ||
                (await this.userService.getPlanById('starter'));
            if (!plan?.features?.includes('api_access')) {
                throw new common_1.HttpException('API access is not available on your plan.', common_1.HttpStatus.FORBIDDEN);
            }
            await this.userService.deleteApiKey(userId, keyId);
            return {
                success: true,
                message: 'API key deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to delete API key: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Get)('notification-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getNotificationSettings", null);
__decorate([
    (0, common_1.Put)('notification-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateNotificationSettings", null);
__decorate([
    (0, common_1.Get)('api-keys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getApiKeys", null);
__decorate([
    (0, common_1.Post)('api-keys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Delete)('api-keys/:keyId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('keyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteApiKey", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map