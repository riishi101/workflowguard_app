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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const axios_1 = __importDefault(require("axios"));
const public_decorator_1 = require("./public.decorator");
let AuthController = (() => {
    let _classDecorators = [(0, common_1.Controller)('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getProfile_decorators;
    let _getHubSpotAuthUrl_decorators;
    let _initiateHubSpotOAuth_decorators;
    let _handleHubSpotCallback_decorators;
    let _validateUser_decorators;
    let _login_decorators;
    let _register_decorators;
    let _getCurrentUser_decorators;
    var AuthController = _classThis = class {
        constructor(authService, prisma) {
            this.authService = (__runInitializers(this, _instanceExtraInitializers), authService);
            this.prisma = prisma;
        }
        async getProfile(req) {
            // Return the authenticated user's profile
            return req.user;
        }
        async getHubSpotAuthUrl(marketplace) {
            try {
                const clientId = process.env.HUBSPOT_CLIENT_ID;
                const redirectUri = process.env.HUBSPOT_REDIRECT_URI ||
                    'https://api.workflowguard.pro/api/auth/hubspot/callback';
                // Use only automation scope for workflows API (as per HubSpot docs)
                const scopes = 'automation oauth';
                // Debug logging
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
            // This would redirect to HubSpot's OAuth consent page
            const clientId = process.env.HUBSPOT_CLIENT_ID;
            const redirectUri = encodeURIComponent(process.env.HUBSPOT_REDIRECT_URI ||
                'http://localhost:3000/auth/hubspot/callback');
            // Use only automation scope for workflows API (as per HubSpot docs)
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
                // Parse state to check if this is a marketplace installation
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
                // Full OAuth flow with proper environment variables
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
                // 1. Exchange code for tokens
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
                // 2. Fetch user email from HubSpot
                console.log('Fetching user info from HubSpot...');
                const userRes = await axios_1.default.get('https://api.hubapi.com/integrations/v1/me', {
                    headers: { Authorization: `Bearer ${access_token}` },
                });
                console.log('User response received:', !!userRes.data);
                console.log('User response data:', JSON.stringify(userRes.data, null, 2));
                // Try different possible email fields
                let email = userRes.data.user ||
                    userRes.data.email ||
                    userRes.data.userEmail ||
                    userRes.data.user_email;
                // If no email found, try to extract from user object if it exists
                if (!email &&
                    userRes.data.user &&
                    typeof userRes.data.user === 'object') {
                    email = userRes.data.user.email || userRes.data.user.userEmail;
                }
                // If still no email found, use portalId as email (convert to string)
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
                // 3. Create or update user in your DB with hubspotPortalId and tokens
                console.log('Creating/updating user in database...');
                let user;
                try {
                    // First try to find existing user by hubspotPortalId or email
                    user = await this.prisma.user.findFirst({
                        where: {
                            OR: [{ email }, { hubspotPortalId: String(hub_id) }],
                        },
                    });
                    if (user) {
                        // Update existing user
                        console.log('Updating existing user:', user.id);
                        user = await this.prisma.user.update({
                            where: { id: user.id },
                            data: {
                                email, // Update email in case it changed
                                hubspotPortalId: String(hub_id),
                                hubspotAccessToken: access_token,
                                hubspotRefreshToken: refresh_token,
                                hubspotTokenExpiresAt: new Date(Date.now() + (tokenRes.data.expires_in || 3600) * 1000),
                            },
                        });
                        console.log('User updated successfully:', user.id);
                    }
                    else {
                        // Create new user
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
                        // Try to create trial subscription, but don't fail if it doesn't work
                        try {
                            await this.prisma.subscription.create({
                                data: {
                                    userId: user.id,
                                    planId: 'professional',
                                    status: 'trial',
                                    trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
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
                    // Try to provide more specific error handling
                    if (dbError.code === 'P2002') {
                        console.error('Unique constraint violation - user may already exist');
                        // Try to find and return existing user
                        try {
                            user = await this.prisma.user.findFirst({
                                where: {
                                    OR: [{ email }, { hubspotPortalId: String(hub_id) }],
                                },
                            });
                            if (user) {
                                console.log('Found existing user after constraint violation:', user.id);
                                // Update the existing user's tokens
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
                // 4. Generate JWT token for the user
                const token = this.authService.generateToken(user);
                console.log('JWT token generated for user:', user.id);
                console.log('Generated token (first 50 chars):', token.substring(0, 50) + '...');
                // 5. Redirect based on installation type
                if (isMarketplaceInstall) {
                    // For marketplace installations, redirect to dashboard with success
                    console.log('Marketplace installation completed successfully');
                    const redirectUrl = `${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?success=true&token=${encodeURIComponent(token)}&marketplace=true`;
                    console.log('Redirecting to marketplace success:', redirectUrl);
                    return res.redirect(redirectUrl);
                }
                else {
                    // For regular OAuth, redirect to frontend root with success and token
                    console.log('OAuth callback completed successfully');
                    const redirectUrl = `${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?success=true&token=${encodeURIComponent(token)}`;
                    console.log('Redirecting to:', redirectUrl);
                    return res.redirect(redirectUrl);
                }
            }
            catch (error) {
                console.error('OAuth callback error:', error);
                console.error('Error stack:', error.stack);
                // Log more details about the error
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
                // Debug headers
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
    __setFunctionName(_classThis, "AuthController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getProfile_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.Get)('profile')];
        _getHubSpotAuthUrl_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('hubspot/url')];
        _initiateHubSpotOAuth_decorators = [(0, common_1.Get)('hubspot')];
        _handleHubSpotCallback_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('hubspot/callback')];
        _validateUser_decorators = [(0, common_1.Post)('validate')];
        _login_decorators = [(0, common_1.Post)('login')];
        _register_decorators = [(0, common_1.Post)('register')];
        _getCurrentUser_decorators = [(0, common_1.Get)('me'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getHubSpotAuthUrl_decorators, { kind: "method", name: "getHubSpotAuthUrl", static: false, private: false, access: { has: obj => "getHubSpotAuthUrl" in obj, get: obj => obj.getHubSpotAuthUrl }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _initiateHubSpotOAuth_decorators, { kind: "method", name: "initiateHubSpotOAuth", static: false, private: false, access: { has: obj => "initiateHubSpotOAuth" in obj, get: obj => obj.initiateHubSpotOAuth }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleHubSpotCallback_decorators, { kind: "method", name: "handleHubSpotCallback", static: false, private: false, access: { has: obj => "handleHubSpotCallback" in obj, get: obj => obj.handleHubSpotCallback }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _validateUser_decorators, { kind: "method", name: "validateUser", static: false, private: false, access: { has: obj => "validateUser" in obj, get: obj => obj.validateUser }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: obj => "register" in obj, get: obj => obj.register }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCurrentUser_decorators, { kind: "method", name: "getCurrentUser", static: false, private: false, access: { has: obj => "getCurrentUser" in obj, get: obj => obj.getCurrentUser }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthController = _classThis;
})();
exports.AuthController = AuthController;
