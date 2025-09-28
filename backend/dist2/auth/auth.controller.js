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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
const public_decorator_1 = require("./public.decorator");
let AuthController = class AuthController {
    constructor(authService, prisma) {
        this.authService = authService;
        this.prisma = prisma;
    }
    async getProfile(req) {
        return req.user;
    }
    async getHubSpotAuthUrl(marketplace) {
        try {
            const clientId = process.env.HUBSPOT_CLIENT_ID;
            const redirectUri = process.env.HUBSPOT_REDIRECT_URI ||
                'https://api.workflowguard.pro/api/auth/hubspot/callback';
            const scopes = 'automation oauth';
            console.log('HUBSPOT_CLIENT_ID:', clientId);
            console.log('HUBSPOT_REDIRECT_URI:', redirectUri);
            console.log('Marketplace installation:', marketplace);
            if (!clientId) {
                console.error('HUBSPOT_CLIENT_ID is not set');
                throw new common_1.HttpException('HubSpot is not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
            console.log('Generated OAuth URL:', authUrl);
            return { url: authUrl };
        }
        catch (error) {
            console.error('Error generating HubSpot OAuth URL:', error);
            throw new common_1.HttpException('Failed to generate HubSpot OAuth URL', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async initiateHubSpotOAuth(res) {
        const clientId = process.env.HUBSPOT_CLIENT_ID;
        const redirectUri = encodeURIComponent(process.env.HUBSPOT_REDIRECT_URI ||
            'http://localhost:3000/auth/hubspot/callback');
        const scopes = encodeURIComponent('automation oauth');
        const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
        res.redirect(authUrl);
    }
    async handleHubSpotCallback(code, state, res) {
        try {
            console.log('HubSpot callback received with code:', code);
            if (!code) {
                console.error('No authorization code provided');
                return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=no_code`);
            }
            let isMarketplaceInstall = false;
            if (state) {
                try {
                    const stateData = JSON.parse(decodeURIComponent(state));
                    isMarketplaceInstall = stateData.marketplaceInstall || false;
                }
                catch {
                    console.log('Could not parse state, treating as regular OAuth');
                }
            }
            const clientId = process.env.HUBSPOT_CLIENT_ID;
            const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
            const redirectUri = process.env.HUBSPOT_REDIRECT_URI ||
                'https://api.workflowguard.pro/api/auth/hubspot/callback';
            console.log('Using clientId:', clientId);
            console.log('Using redirectUri:', redirectUri);
            console.log('Client secret available:', !!clientSecret);
            console.log('Marketplace installation:', isMarketplaceInstall);
            if (!clientId || !clientSecret) {
                console.error('HUBSPOT_CLIENT_SECRET is not set');
                return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=config_error`);
            }
            console.log('Exchanging code for tokens...');
            const tokenRes = await axios_1.default.post('https://api.hubapi.com/oauth/v1/token', null, {
                params: {
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    code,
                },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            console.log('Token response received:', !!tokenRes.data);
            const { access_token, refresh_token, hub_id } = tokenRes.data;
            console.log('Token exchange successful, hub_id:', hub_id);
            if (!access_token) {
                console.error('No access token received from HubSpot');
                return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=token_error`);
            }
            console.log('Fetching user info from HubSpot...');
            const userRes = await axios_1.default.get('https://api.hubapi.com/integrations/v1/me', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            console.log('User response received:', !!userRes.data);
            console.log('User response data:', JSON.stringify(userRes.data, null, 2));
            let email = userRes.data.user ||
                userRes.data.email ||
                userRes.data.userEmail ||
                userRes.data.user_email;
            if (!email &&
                userRes.data.user &&
                typeof userRes.data.user === 'object') {
                email = userRes.data.user.email || userRes.data.user.userEmail;
            }
            if (!email && (userRes.data.portalId || userRes.data.hub_id || hub_id)) {
                const portalId = userRes.data.portalId || userRes.data.hub_id || hub_id;
                email = `portal-${portalId}@hubspot.workflowguard.app`;
                console.log('No email found, using generated email based on portal ID:', email);
            }
            console.log('User email from HubSpot:', email);
            if (!email) {
                console.error('No email found in HubSpot user response');
                console.error('Available fields:', Object.keys(userRes.data));
                return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=user_error`);
            }
            console.log('Creating/updating user in database...');
            let user;
            try {
                user = await this.prisma.user.findFirst({
                    where: {
                        OR: [{ email }, { hubspotPortalId: String(hub_id) }],
                    },
                });
                if (user) {
                    console.log('Updating existing user:', user.id);
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: {
                            email,
                            hubspotPortalId: String(hub_id),
                            hubspotAccessToken: access_token,
                            hubspotRefreshToken: refresh_token,
                            hubspotTokenExpiresAt: new Date(Date.now() + (tokenRes.data.expires_in || 3600) * 1000),
                        },
                    });
                    console.log('User updated successfully:', user.id);
                }
                else {
                    console.log('Creating new user with email:', email);
                    user = await this.prisma.user.create({
                        data: {
                            email,
                            name: email.split('@')[0],
                            hubspotPortalId: String(hub_id),
                            hubspotAccessToken: access_token,
                            hubspotRefreshToken: refresh_token,
                            hubspotTokenExpiresAt: new Date(Date.now() + (tokenRes.data.expires_in || 3600) * 1000),
                        },
                    });
                    console.log('User created successfully:', user.id);
                    try {
                        await this.prisma.subscription.create({
                            data: {
                                userId: user.id,
                                planId: 'professional',
                                status: 'trial',
                                trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                            },
                        });
                        console.log('Trial subscription created for user:', user.id);
                    }
                    catch (subscriptionError) {
                        console.warn('Failed to create trial subscription, but continuing:', subscriptionError.message);
                    }
                }
            }
            catch (dbError) {
                console.error('Database operation failed:', dbError);
                console.error('Database error details:', {
                    message: dbError.message,
                    code: dbError.code,
                    meta: dbError.meta,
                    stack: dbError.stack,
                });
                if (dbError.code === 'P2002') {
                    console.error('Unique constraint violation - user may already exist');
                    try {
                        user = await this.prisma.user.findFirst({
                            where: {
                                OR: [{ email }, { hubspotPortalId: String(hub_id) }],
                            },
                        });
                        if (user) {
                            console.log('Found existing user after constraint violation:', user.id);
                            user = await this.prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    hubspotAccessToken: access_token,
                                    hubspotRefreshToken: refresh_token,
                                    hubspotTokenExpiresAt: new Date(Date.now() + (tokenRes.data.expires_in || 3600) * 1000),
                                },
                            });
                        }
                    }
                    catch (recoveryError) {
                        console.error('Failed to recover from constraint violation:', recoveryError);
                    }
                }
                if (!user) {
                    return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=user_creation_failed`);
                }
            }
            const token = this.authService.generateToken(user);
            console.log('JWT token generated for user:', user.id);
            console.log('Generated token (first 50 chars):', token.substring(0, 50) + '...');
            if (isMarketplaceInstall) {
                console.log('Marketplace installation completed successfully');
                const redirectUrl = `${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?success=true&token=${encodeURIComponent(token)}&marketplace=true`;
                console.log('Redirecting to marketplace success:', redirectUrl);
                return res.redirect(redirectUrl);
            }
            else {
                console.log('OAuth callback completed successfully');
                const redirectUrl = `${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?success=true&token=${encodeURIComponent(token)}`;
                console.log('Redirecting to:', redirectUrl);
                return res.redirect(redirectUrl);
            }
        }
        catch (error) {
            console.error('OAuth callback error:', error);
            console.error('Error stack:', error.stack);
            if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);
                console.error('Error response headers:', error.response.headers);
            }
            if (error.request) {
                console.error('Error request:', error.request);
            }
            console.error('Error message:', error.message);
            console.error('Error name:', error.name);
            return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=oauth_failed`);
        }
    }
    async validateUser(body) {
        try {
            const user = await this.authService.validateUser(body.email, body.password);
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            return user;
        }
        catch {
            throw new common_1.HttpException('User validation failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(body) {
        try {
            const user = await this.authService.validateUser(body.email, body.password);
            if (!user) {
                throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED);
            }
            return await this.authService.login(user);
        }
        catch {
            throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async register(createUserDto) {
        try {
            const user = await this.authService.register(createUserDto);
            return await this.authService.login(user);
        }
        catch {
            throw new common_1.HttpException('Registration failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCurrentUser(req) {
        try {
            console.log('🔍 /api/auth/me - Headers received:', {
                authorization: req.headers.authorization,
                'content-type': req.headers['content-type'],
                origin: req.headers.origin,
                'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
            });
            const userId = req.user?.sub || req.user?.id;
            console.log('🔍 /api/auth/me - User from JWT:', {
                userId,
                user: req.user,
            });
            if (!userId) {
                console.log('❌ /api/auth/me - No userId found in JWT payload');
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    hubspotPortalId: true,
                    createdAt: true,
                },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: user,
            };
        }
        catch {
            throw new common_1.HttpException('Failed to get current user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('hubspot/url'),
    __param(0, (0, common_1.Query)('marketplace')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getHubSpotAuthUrl", null);
__decorate([
    (0, common_1.Get)('hubspot'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "initiateHubSpotOAuth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('hubspot/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleHubSpotCallback", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateUser", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map