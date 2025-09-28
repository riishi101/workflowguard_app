"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor(prisma, userService, jwtService) {
            this.prisma = prisma;
            this.userService = userService;
            this.jwtService = jwtService;
        }
        async validateUser(email, password) {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (user &&
                user.password &&
                (await bcrypt.compare(password, user.password))) {
                const { password: _password, ...result } = user;
                return result;
            }
            return null;
        }
        async login(user) {
            const payload = { email: user.email, sub: user.id };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            };
        }
        async register(createUserDto) {
            const { email } = createUserDto;
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    email,
                    password: hashedPassword,
                },
            });
            // Automatically create trial subscription for new users
            await this.userService.createTrialSubscription(user.id);
            const { password: _password, ...result } = user;
            return result;
        }
        async validateHubSpotUser(hubspotUser) {
            // For HubSpot App Marketplace users, create account if doesn't exist
            let user = await this.prisma.user.findUnique({
                where: { email: hubspotUser.email },
            });
            if (!user) {
                // Create new user from HubSpot
                user = await this.prisma.user.create({
                    data: {
                        email: hubspotUser.email,
                        name: hubspotUser.name || hubspotUser.email,
                        hubspotPortalId: String(hubspotUser.portalId), // Ensure string type
                        hubspotAccessToken: hubspotUser.accessToken,
                        hubspotRefreshToken: hubspotUser.refreshToken,
                        hubspotTokenExpiresAt: hubspotUser.tokenExpiresAt,
                    },
                });
                // Automatically create trial subscription for HubSpot users
                await this.userService.createTrialSubscription(user.id);
            }
            else {
                // Update existing user's HubSpot tokens
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        hubspotPortalId: String(hubspotUser.portalId), // Ensure string type
                        hubspotAccessToken: hubspotUser.accessToken,
                        hubspotRefreshToken: hubspotUser.refreshToken,
                        hubspotTokenExpiresAt: hubspotUser.tokenExpiresAt,
                    },
                });
            }
            const { password: _password, ...result } = user;
            return result;
        }
        async validateJwtPayload(payload) {
            console.log('AuthService - validateJwtPayload called with payload:', payload);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            console.log('AuthService - User found in database:', user ? { id: user.id, email: user.email } : null);
            return user;
        }
        async verifyToken(token) {
            try {
                console.log('AuthService - Verifying token:', token.substring(0, 20) + '...');
                const payload = this.jwtService.verify(token);
                console.log('AuthService - JWT payload verified:', {
                    sub: payload.sub,
                    email: payload.email,
                });
                const user = await this.validateJwtPayload(payload);
                console.log('AuthService - User found from payload:', user ? { id: user.id, email: user.email } : null);
                if (!user) {
                    console.log('AuthService - No user found for payload');
                    return null;
                }
                // Remove password from user object before returning
                const { password: _, ...userWithoutPassword } = user;
                console.log('AuthService - Returning user without password:', {
                    id: userWithoutPassword.id,
                    email: userWithoutPassword.email,
                });
                return userWithoutPassword;
            }
            catch (error) {
                console.error('AuthService - Token verification failed:', error.message);
                return null;
            }
        }
        generateToken(user) {
            return this.jwtService.sign({
                sub: user.id,
                email: user.email,
            });
        }
        async updateUserHubspotPortalId(userId, hubspotPortalId) {
            try {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { hubspotPortalId },
                });
            }
            catch {
                throw new common_1.HttpException('Failed to update HubSpot portal ID', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async updateUserHubspotTokens(userId, tokens) {
            try {
                const expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);
                await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        hubspotAccessToken: tokens.access_token,
                        hubspotRefreshToken: tokens.refresh_token,
                        hubspotTokenExpiresAt: expiresAt,
                    },
                });
            }
            catch {
                throw new common_1.HttpException('Failed to update HubSpot tokens', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async createTrialSubscription(userId) {
            try {
                const trialEndDate = new Date();
                trialEndDate.setDate(trialEndDate.getDate() + 21); // 21-day trial
                await this.prisma.subscription.upsert({
                    where: { userId },
                    update: {
                        planId: 'professional',
                        status: 'trial',
                        trialEndDate,
                        nextBillingDate: trialEndDate,
                    },
                    create: {
                        userId,
                        planId: 'professional',
                        status: 'trial',
                        trialEndDate,
                        nextBillingDate: trialEndDate,
                    },
                });
            }
            catch (error) {
                console.error('Failed to create trial subscription:', error);
                // Don't throw error to avoid breaking OAuth flow
            }
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
