"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UserController = (() => {
    let _classDecorators = [(0, common_1.Controller)('user')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getProfile_decorators;
    let _create_decorators;
    let _findAll_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _remove_decorators;
    let _getUserPermissions_decorators;
    let _getNotificationSettings_decorators;
    let _updateNotificationSettings_decorators;
    let _getApiKeys_decorators;
    let _createApiKey_decorators;
    let _deleteApiKey_decorators;
    var UserController = _classThis = class {
        constructor(userService) {
            this.userService = (__runInitializers(this, _instanceExtraInitializers), userService);
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
                // For single-user architecture, return current user info
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
    __setFunctionName(_classThis, "UserController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getProfile_decorators = [(0, common_1.Get)('profile'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _create_decorators = [(0, common_1.Post)()];
        _findAll_decorators = [(0, common_1.Get)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _update_decorators = [(0, common_1.Patch)(':id')];
        _remove_decorators = [(0, common_1.Delete)(':id')];
        _getUserPermissions_decorators = [(0, common_1.Get)('permissions'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getNotificationSettings_decorators = [(0, common_1.Get)('notification-settings'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _updateNotificationSettings_decorators = [(0, common_1.Put)('notification-settings'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getApiKeys_decorators = [(0, common_1.Get)('api-keys'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _createApiKey_decorators = [(0, common_1.Post)('api-keys'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _deleteApiKey_decorators = [(0, common_1.Delete)('api-keys/:keyId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserPermissions_decorators, { kind: "method", name: "getUserPermissions", static: false, private: false, access: { has: obj => "getUserPermissions" in obj, get: obj => obj.getUserPermissions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getNotificationSettings_decorators, { kind: "method", name: "getNotificationSettings", static: false, private: false, access: { has: obj => "getNotificationSettings" in obj, get: obj => obj.getNotificationSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateNotificationSettings_decorators, { kind: "method", name: "updateNotificationSettings", static: false, private: false, access: { has: obj => "updateNotificationSettings" in obj, get: obj => obj.updateNotificationSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getApiKeys_decorators, { kind: "method", name: "getApiKeys", static: false, private: false, access: { has: obj => "getApiKeys" in obj, get: obj => obj.getApiKeys }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createApiKey_decorators, { kind: "method", name: "createApiKey", static: false, private: false, access: { has: obj => "createApiKey" in obj, get: obj => obj.createApiKey }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteApiKey_decorators, { kind: "method", name: "deleteApiKey", static: false, private: false, access: { has: obj => "deleteApiKey" in obj, get: obj => obj.deleteApiKey }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserController = _classThis;
})();
exports.UserController = UserController;
