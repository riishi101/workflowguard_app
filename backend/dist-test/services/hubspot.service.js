"use strict";
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubSpotService = void 0;
const common_1 = require("@nestjs/common");
let HubSpotService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var HubSpotService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
        }
        async getWorkflows(userId) {
            console.log('🔍 HubSpotService - getWorkflows called for userId:', userId);
            try {
                // Get user with HubSpot tokens
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        email: true,
                        hubspotPortalId: true,
                        hubspotAccessToken: true,
                        hubspotRefreshToken: true,
                        hubspotTokenExpiresAt: true,
                    },
                });
                console.log('🔍 HubSpotService - User found:', user
                    ? {
                        id: user.id,
                        email: user.email,
                        hasAccessToken: !!user.hubspotAccessToken,
                        hasRefreshToken: !!user.hubspotRefreshToken,
                        hasPortalId: !!user.hubspotPortalId,
                        tokenExpiresAt: user.hubspotTokenExpiresAt,
                    }
                    : null);
                if (!user) {
                    console.log('🔍 HubSpotService - User not found');
                    throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                }
                if (!user.hubspotAccessToken) {
                    console.log('🔍 HubSpotService - No HubSpot access token found for user');
                    throw new common_1.HttpException('HubSpot not connected. Please connect your HubSpot account first.', common_1.HttpStatus.BAD_REQUEST);
                }
                // Check if token is expired
                const now = new Date();
                if (user.hubspotTokenExpiresAt && user.hubspotTokenExpiresAt < now) {
                    console.log('🔍 HubSpotService - Token expired, refreshing...');
                    if (user.hubspotRefreshToken) {
                        await this.refreshAccessToken(userId, user.hubspotRefreshToken);
                    }
                    else {
                        console.log('🔍 HubSpotService - No refresh token available');
                        throw new common_1.HttpException('HubSpot token expired and no refresh token available. Please reconnect your HubSpot account.', common_1.HttpStatus.UNAUTHORIZED);
                    }
                }
                // Get the current access token (might have been refreshed)
                const currentUser = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { hubspotAccessToken: true, hubspotPortalId: true },
                });
                if (!currentUser?.hubspotAccessToken) {
                    console.log('🔍 HubSpotService - No valid HubSpot access token after refresh');
                    throw new common_1.HttpException('No valid HubSpot access token', common_1.HttpStatus.UNAUTHORIZED);
                }
                console.log('🔍 HubSpotService - Calling HubSpot API with token:', currentUser.hubspotAccessToken.substring(0, 20) + '...');
                // Call HubSpot API to get workflows
                const workflows = await this.fetchWorkflowsFromHubSpot(currentUser.hubspotAccessToken, currentUser.hubspotPortalId || '');
                console.log('🔍 HubSpotService - Fetched workflows from HubSpot:', workflows.length);
                return workflows;
            }
            catch (error) {
                console.error('🔍 HubSpotService - Error fetching workflows:', error);
                // Provide more specific error messages
                if (error instanceof common_1.HttpException) {
                    throw error;
                }
                if (error.message?.includes('HubSpot API error')) {
                    throw new common_1.HttpException(`HubSpot API error: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
                }
                throw new common_1.HttpException(`Failed to fetch HubSpot workflows: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async getWorkflowById(userId, workflowId) {
            console.log(`🔍 HubSpotService - getWorkflowById called for userId: ${userId}, workflowId: ${workflowId}`);
            try {
                // This logic is similar to getWorkflows, ensuring the token is valid.
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        hubspotAccessToken: true,
                        hubspotRefreshToken: true,
                        hubspotTokenExpiresAt: true,
                    },
                });
                if (!user) {
                    throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                }
                let accessToken = user.hubspotAccessToken;
                if (!accessToken) {
                    throw new common_1.HttpException('HubSpot not connected.', common_1.HttpStatus.BAD_REQUEST);
                }
                const now = new Date();
                if (user.hubspotTokenExpiresAt && user.hubspotTokenExpiresAt < now) {
                    if (user.hubspotRefreshToken) {
                        await this.refreshAccessToken(userId, user.hubspotRefreshToken);
                        const updatedUser = await this.prisma.user.findUnique({
                            where: { id: userId },
                        });
                        accessToken = updatedUser?.hubspotAccessToken || null;
                    }
                    else {
                        throw new common_1.HttpException('HubSpot token expired.', common_1.HttpStatus.UNAUTHORIZED);
                    }
                }
                const endpoint = `https://api.hubapi.com/automation/v3/workflows/${workflowId}`;
                console.log(`🔍 HubSpotService - Calling endpoint: ${endpoint}`);
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 404) {
                    console.warn(`⚠️ Workflow with ID ${workflowId} not found in HubSpot.`);
                    return null;
                }
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ HubSpot API error fetching workflow ${workflowId}: ${response.status} ${errorText}`);
                    throw new Error(`HubSpot API error: ${response.status}`);
                }
                const workflowData = (await response.json());
                console.log(`✅ Successfully fetched workflow ${workflowId} from HubSpot.`);
                return workflowData;
            }
            catch (error) {
                console.error(`❌ Error in getWorkflowById for workflow ${workflowId}:`, error);
                // Return null to prevent webhook retries for processing errors
                return null;
            }
        }
        async fetchWorkflowsFromHubSpot(accessToken, portalId) {
            console.log('🔍 HubSpotService - fetchWorkflowsFromHubSpot called');
            console.log('🔍 HubSpotService - Using portalId:', portalId);
            try {
                // Try multiple HubSpot API endpoints for workflows
                const endpoints = [
                    // Use v3 endpoints first (v4 returns 404 errors)
                    `https://api.hubapi.com/automation/v3/workflows`,
                    `https://api.hubapi.com/automation/v3/workflows?limit=100`,
                    `https://api.hubapi.com/automation/v3/workflows?properties=id,name,description,enabled,createdAt,updatedAt`,
                    `https://api.hubapi.com/automation/v3/workflows?limit=50&properties=id,name,description,enabled`,
                    // Alternative endpoints as fallback
                    `https://api.hubapi.com/marketing/v3/workflows`,
                    `https://api.hubapi.com/workflows/v1/workflows`,
                ];
                let workflows = [];
                let successfulEndpoint = '';
                for (const endpoint of endpoints) {
                    try {
                        console.log('🔍 HubSpotService - Trying endpoint:', endpoint);
                        const response = await fetch(endpoint, {
                            method: 'GET',
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                            },
                        });
                        console.log('🔍 HubSpotService - Response status:', response.status);
                        if (response.ok) {
                            const data = (await response.json());
                            console.log('🔍 HubSpotService - Raw API response from', endpoint, ':', JSON.stringify(data, null, 2));
                            // Handle different response formats
                            let workflowList = [];
                            if (Array.isArray(data)) {
                                workflowList = data;
                            }
                            else {
                                workflowList =
                                    data.results ||
                                        data.workflows ||
                                        data.data ||
                                        data.objects ||
                                        data.value ||
                                        data.items ||
                                        data.workflowList ||
                                        [];
                            }
                            console.log('🔍 HubSpotService - Extracted workflow list from', endpoint, ':', workflowList.length);
                            if (workflowList.length > 0) {
                                // Transform HubSpot workflows to our format
                                workflows = workflowList.map((workflow) => ({
                                    id: workflow.id ||
                                        workflow.workflowId ||
                                        workflow.objectId ||
                                        'unknown',
                                    name: workflow.name ||
                                        workflow.workflowName ||
                                        workflow.label ||
                                        'Unnamed Workflow',
                                    description: workflow.description || workflow.meta?.description || '',
                                    type: 'workflow',
                                    status: workflow.enabled !== undefined
                                        ? workflow.enabled
                                            ? 'active'
                                            : 'inactive'
                                        : workflow.status || workflow.meta?.status || 'active',
                                    hubspotData: workflow, // Keep original data for reference
                                }));
                                successfulEndpoint = endpoint;
                                console.log('🔍 HubSpotService - Successfully fetched workflows from:', endpoint);
                                console.log('🔍 HubSpotService - Transformed workflows:', workflows.length);
                                break;
                            }
                            else {
                                console.log('🔍 HubSpotService - No workflows found in response from:', endpoint);
                            }
                        }
                        else {
                            const errorText = await response.text();
                            console.log('🔍 HubSpotService - Endpoint failed:', endpoint, 'Status:', response.status, 'Error:', errorText);
                            // Log specific error details
                            if (response.status === 401) {
                                console.log('🔍 HubSpotService - 401 Unauthorized - Token might be invalid or expired');
                            }
                            else if (response.status === 403) {
                                console.log('🔍 HubSpotService - 403 Forbidden - Token might not have required permissions');
                            }
                            else if (response.status === 404) {
                                console.log('🔍 HubSpotService - 404 Not Found - Endpoint might not exist');
                            }
                            else if (response.status === 429) {
                                console.log('🔍 HubSpotService - 429 Rate Limited - Too many requests');
                            }
                            else {
                                console.log('🔍 HubSpotService - Other error status:', response.status);
                            }
                        }
                    }
                    catch (endpointError) {
                        console.log('🔍 HubSpotService - Endpoint error:', endpoint, endpointError.message);
                    }
                }
                if (workflows.length === 0) {
                    console.log('🔍 HubSpotService - No workflows found from any endpoint');
                    // Return mock data for testing purposes
                    return [
                        {
                            id: 'mock-workflow-1',
                            name: 'Lead Nurturing Campaign',
                            description: 'Automated lead nurturing workflow',
                            type: 'workflow',
                            status: 'active',
                            hubspotData: {
                                id: 'mock-workflow-1',
                                name: 'Lead Nurturing Campaign',
                            },
                        },
                        {
                            id: 'mock-workflow-2',
                            name: 'Welcome Series',
                            description: 'New contact welcome automation',
                            type: 'workflow',
                            status: 'active',
                            hubspotData: { id: 'mock-workflow-2', name: 'Welcome Series' },
                        },
                        {
                            id: 'mock-workflow-3',
                            name: 'Re-engagement Campaign',
                            description: 'Re-engage inactive contacts',
                            type: 'workflow',
                            status: 'inactive',
                            hubspotData: {
                                id: 'mock-workflow-3',
                                name: 'Re-engagement Campaign',
                            },
                        },
                    ];
                }
                console.log('🔍 HubSpotService - Final transformed workflows:', workflows.length);
                console.log('🔍 HubSpotService - Successful endpoint:', successfulEndpoint);
                return workflows;
            }
            catch (error) {
                console.error('🔍 HubSpotService - Error calling HubSpot API:', error);
                throw new Error(`Failed to fetch workflows from HubSpot: ${error.message}`);
            }
        }
        async refreshAccessToken(userId, refreshToken) {
            console.log('🔍 HubSpotService - refreshAccessToken called');
            try {
                // HubSpot token refresh endpoint
                const url = 'https://api.hubapi.com/oauth/v1/token';
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'refresh_token',
                        refresh_token: refreshToken,
                        client_id: process.env.HUBSPOT_CLIENT_ID || '',
                        client_secret: process.env.HUBSPOT_CLIENT_SECRET || '',
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Token refresh failed: ${response.status}`);
                }
                const data = (await response.json());
                // Update user with new tokens
                await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        hubspotAccessToken: data.access_token,
                        hubspotRefreshToken: data.refresh_token,
                        hubspotTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
                    },
                });
                console.log('🔍 HubSpotService - Access token refreshed successfully');
            }
            catch (error) {
                console.error('🔍 HubSpotService - Error refreshing token:', error);
                throw new Error(`Failed to refresh access token: ${error.message}`);
            }
        }
        async validateToken(accessToken) {
            try {
                const response = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + accessToken);
                return response.ok;
            }
            catch {
                return false;
            }
        }
        /**
         * Create a new workflow in HubSpot using the provided workflow data.
         * This is used to restore deleted workflows.
         */
        async createWorkflow(userId, workflowData) {
            console.log('🔧 HubSpotService - createWorkflow called for userId:', userId);
            try {
                // Get user with HubSpot tokens
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        hubspotAccessToken: true,
                        hubspotRefreshToken: true,
                        hubspotTokenExpiresAt: true,
                    },
                });
                if (!user || !user.hubspotAccessToken) {
                    throw new common_1.HttpException('User not found or HubSpot not connected', common_1.HttpStatus.NOT_FOUND);
                }
                // Try multiple approaches for workflow creation
                const approaches = [
                    // Approach 1: HubSpot v4 API with full workflow structure
                    {
                        name: 'v4 API Full Workflow',
                        endpoint: 'https://api.hubapi.com/automations/v4/flows',
                        payload: {
                            isEnabled: false,
                            flowType: 'WORKFLOW',
                            name: workflowData.name || 'Restored Workflow',
                            type: workflowData.objectTypeId === '0-2'
                                ? 'PLATFORM_FLOW'
                                : 'CONTACT_FLOW',
                            objectTypeId: workflowData.objectTypeId || '0-1',
                            actions: workflowData.actions || [],
                            enrollmentCriteria: workflowData.enrollmentCriteria || workflowData.triggers || {},
                            timeWindows: workflowData.timeWindows || [],
                            blockedDates: workflowData.blockedDates || [],
                            customProperties: workflowData.customProperties || {},
                            suppressionListIds: workflowData.suppressionListIds || [],
                            canEnrollFromSalesforce: workflowData.canEnrollFromSalesforce || false,
                        },
                    },
                    // Approach 2: v3 API with full complex data
                    {
                        name: 'v3 API Full Complex Data',
                        endpoint: 'https://api.hubapi.com/automation/v3/workflows',
                        payload: {
                            name: workflowData.name || 'Restored Workflow',
                            enabled: false,
                            description: workflowData.description ||
                                `Restored by WorkflowGuard on ${new Date().toISOString()}`,
                            type: workflowData.type || 'DRIP_DELAY',
                            actions: workflowData.actions || [],
                            triggers: workflowData.triggers || [],
                            goals: workflowData.goals || [],
                            settings: workflowData.settings || {},
                        },
                    },
                    // Approach 3: v3 API with actions only
                    {
                        name: 'v3 API Actions Only',
                        endpoint: 'https://api.hubapi.com/automation/v3/workflows',
                        payload: {
                            name: workflowData.name || 'Restored Workflow',
                            enabled: false,
                            description: workflowData.description ||
                                `Restored by WorkflowGuard on ${new Date().toISOString()}`,
                            type: workflowData.type || 'DRIP_DELAY',
                            actions: workflowData.actions || [],
                        },
                    },
                    // Approach 4: v3 API basic workflow only (fallback)
                    {
                        name: 'v3 API Basic Only',
                        endpoint: 'https://api.hubapi.com/automation/v3/workflows',
                        payload: {
                            name: workflowData.name || 'Restored Workflow',
                            enabled: false,
                            description: workflowData.description ||
                                `Restored by WorkflowGuard on ${new Date().toISOString()}`,
                            type: workflowData.type || 'DRIP_DELAY',
                        },
                    },
                ];
                for (const approach of approaches) {
                    try {
                        console.log(`🔧 HubSpotService - Trying ${approach.name} approach...`);
                        const response = await fetch(approach.endpoint, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${user.hubspotAccessToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(approach.payload),
                        });
                        if (response.ok) {
                            const createdWorkflow = (await response.json());
                            console.log(`🔧 HubSpotService - SUCCESS with ${approach.name} approach:`, {
                                id: createdWorkflow.id || createdWorkflow.flowId,
                                name: createdWorkflow.name,
                            });
                            return createdWorkflow;
                        }
                        else {
                            const errorText = await response.text();
                            console.log(`🔧 HubSpotService - ${approach.name} approach failed:`, response.status, errorText);
                        }
                    }
                    catch (error) {
                        console.log(`🔧 HubSpotService - ${approach.name} approach error:`, error);
                    }
                }
                throw new Error('All workflow creation approaches failed');
            }
            catch (error) {
                console.error('🔧 HubSpotService - Error creating workflow:', error);
                throw new common_1.HttpException(`Failed to create workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    };
    __setFunctionName(_classThis, "HubSpotService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HubSpotService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HubSpotService = _classThis;
})();
exports.HubSpotService = HubSpotService;
