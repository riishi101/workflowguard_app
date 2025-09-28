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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
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
        await this.userService.createTrialSubscription(user.id);
        const { password: _password, ...result } = user;
        return result;
    }
    async validateHubSpotUser(hubspotUser) {
        let user = await this.prisma.user.findUnique({
            where: { email: hubspotUser.email },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: hubspotUser.email,
                    name: hubspotUser.name || hubspotUser.email,
                    hubspotPortalId: String(hubspotUser.portalId),
                    hubspotAccessToken: hubspotUser.accessToken,
                    hubspotRefreshToken: hubspotUser.refreshToken,
                    hubspotTokenExpiresAt: hubspotUser.tokenExpiresAt,
                },
            });
            await this.userService.createTrialSubscription(user.id);
        }
        else {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    hubspotPortalId: String(hubspotUser.portalId),
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
            trialEndDate.setDate(trialEndDate.getDate() + 21);
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
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map