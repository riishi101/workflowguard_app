import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API base URL - will be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10000 to 30000 (30 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  versions: WorkflowVersion[];
}

export interface WorkflowVersion {
  id: string;
  version: number;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface WorkflowHistoryVersion {
  id: string;
  date: string;
  type: 'On-Publish Save' | 'Manual Snapshot' | 'Daily Backup' | 'System Backup';
  initiator: string;
  notes: string;
  workflowId: string;
  versionNumber: number;
  changes?: {
    added: number;
    modified: number;
    removed: number;
  };
  status: 'active' | 'inactive' | 'restored';
}

export interface WorkflowStep {
  id: string;
  type: 'email' | 'delay' | 'meeting' | 'condition' | 'action' | 'other';
  title: string;
  description?: string;
  config?: any;
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
}

export interface WorkflowVersion {
  id: string;
  versionNumber: number;
  date: string;
  creator: string;
  type: string;
  steps: WorkflowStep[];
  metadata?: {
    totalSteps: number;
    activeSteps: number;
    lastModified: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  hubspotPortalId?: string;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  details?: any;
}

// API service class
export class ApiService {
  // Auth endpoints
  static async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  }

  static async register(userData: { email: string; password: string; name: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('authToken');
  }

  // User endpoints
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  static async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put('/user/me', userData);
    return response.data;
  }

  // Workflow endpoints
  static async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    const response = await apiClient.get('/workflow');
    return response.data;
  }

  static async getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    const response = await apiClient.get(`/workflow/${id}`);
    return response.data;
  }

  static async createWorkflow(workflowData: { name: string; description?: string }): Promise<ApiResponse<Workflow>> {
    const response = await apiClient.post('/workflow', workflowData);
    return response.data;
  }

  static async updateWorkflow(id: string, workflowData: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    const response = await apiClient.put(`/workflow/${id}`, workflowData);
    return response.data;
  }

  static async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/workflow/${id}`);
    return response.data;
  }

  // Workflow version endpoints
  static async getWorkflowVersions(workflowId: string): Promise<ApiResponse<WorkflowVersion[]>> {
    const response = await apiClient.get(`/workflow-version/workflow/${workflowId}`);
    return response.data;
  }

  static async createWorkflowVersion(workflowId: string, versionData: { name: string; description?: string }): Promise<ApiResponse<WorkflowVersion>> {
    const response = await apiClient.post(`/workflow-version`, { workflowId, ...versionData });
    return response.data;
  }

  static async activateWorkflowVersion(workflowId: string, versionId: string): Promise<ApiResponse<WorkflowVersion>> {
    const response = await apiClient.put(`/workflow-version/${versionId}/activate`, { workflowId });
    return response.data;
  }

  // Audit log endpoints (legacy)
  static async getAuditLogsLegacy(filters?: { resource?: string; userId?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<AuditLog[]>> {
    const response = await apiClient.get('/audit-log', { params: filters });
    return response.data;
  }

  // Analytics endpoints
  static async getAnalytics(period: string = '30d'): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/analytics?period=${period}`);
    return response.data;
  }

  // Webhook endpoints
  static async getWebhooks(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/webhook');
    return response.data;
  }

  static async createWebhook(webhookData: { url: string; events: string[] }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/webhook', webhookData);
    return response.data;
  }

  // Subscription endpoints
  static async getSubscription(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/users/me/subscription');
    return response.data;
  }

  static async cancelSubscription(): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/users/me/subscription/cancel');
    return response.data;
  }

  // Trial and subscription management
  static async getTrialStatus(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/users/me/trial/status');
    return response.data;
  }

  static async getUsageStats(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/users/me/usage/stats');
    return response.data;
  }

  static async createTrialSubscription(): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/users/me/trial/create');
    return response.data;
  }

  static async checkTrialAccess(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/users/me/trial/access');
    return response.data;
  }

  static async upgradeSubscription(planId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/users/me/subscription/upgrade', { planId });
    return response.data;
  }

  // HubSpot integration endpoints
  static async connectHubSpot(portalId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/user/hubspot/connect', { portalId });
    return response.data;
  }

  static async disconnectHubSpotLegacy(): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/user/hubspot/disconnect');
    return response.data;
  }

  // HubSpot workflow endpoints
  static async getHubSpotWorkflows(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/hubspot/workflows');
    return response.data;
  }

  static async updateHubSpotPortalId(): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/hubspot/portal/update');
    return response.data;
  }

  static async testHubSpotConnection(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/hubspot/test-connection');
    return response.data;
  }

  static async startWorkflowProtection(workflowIds: string[]): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/workflow/start-protection', { workflowIds });
    return response.data;
  }

  // Support ticket endpoints
  static async createSupportTicket(ticketData: {
    fullName: string;
    email: string;
    subject: string;
    message: string;
    category?: string;
    priority?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/support/tickets', ticketData);
    return response.data;
  }

  static async getUserTickets(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/support/tickets');
    return response.data;
  }

  static async getTicket(ticketId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/support/tickets/${ticketId}`);
    return response.data;
  }

  static async addReply(ticketId: string, message: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/support/tickets/${ticketId}/reply`, { message });
    return response.data;
  }

  // Dashboard endpoints
  static async getProtectedWorkflows(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/workflow/protected');
    return response.data;
  }

  static async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }

  static async rollbackWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/workflow/${workflowId}/rollback`);
    return response.data;
  }

  static async exportDashboardData(): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/dashboard/export');
    return response.data;
  }

  // Workflow history endpoints
  static async getWorkflowHistory(workflowId: string): Promise<ApiResponse<WorkflowHistoryVersion[]>> {
    const response = await apiClient.get(`/workflow/${workflowId}/history`);
    return response.data;
  }

  static async getWorkflowDetails(workflowId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/workflow/${workflowId}`);
    return response.data;
  }

  static async restoreWorkflowVersion(workflowId: string, versionId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/workflow/${workflowId}/restore/${versionId}`);
    return response.data;
  }

  static async downloadWorkflowVersion(workflowId: string, versionId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/workflow/${workflowId}/version/${versionId}/download`);
    return response.data;
  }

  static async createWorkflowFromVersion(workflowId: string, versionId: string, newName: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/workflow/${workflowId}/version/${versionId}/create-new`, { name: newName });
    return response.data;
  }

  // Workflow comparison endpoints
  static async getWorkflowVersion(workflowId: string, versionId: string): Promise<ApiResponse<WorkflowVersion>> {
    const response = await apiClient.get(`/workflow/${workflowId}/version/${versionId}`);
    return response.data;
  }

  static async compareWorkflowVersions(workflowId: string, versionAId: string, versionBId: string): Promise<ApiResponse<{
    versionA: WorkflowVersion;
    versionB: WorkflowVersion;
    differences: {
      added: WorkflowStep[];
      modified: WorkflowStep[];
      removed: WorkflowStep[];
    };
  }>> {
    const response = await apiClient.get(`/workflow/${workflowId}/compare?versionA=${versionAId}&versionB=${versionBId}`);
    return response.data;
  }

  static async getWorkflowVersionsForComparison(workflowId: string): Promise<ApiResponse<WorkflowHistoryVersion[]>> {
    const response = await apiClient.get(`/workflow/${workflowId}/versions`);
    return response.data;
  }

  // Settings endpoints
  static async getUserProfile(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/users/me');
    return response.data;
  }

  static async updateUserProfile(profileData: {
    name?: string;
    email?: string;
    jobTitle?: string;
    timezone?: string;
    language?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.put('/users/me', profileData);
    return response.data;
  }

  static async getNotificationSettings(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/users/me/notification-settings');
    return response.data;
  }

  static async updateNotificationSettings(settings: {
    enabled: boolean;
    email: string;
    workflowDeleted: boolean;
    enrollmentTriggerModified: boolean;
    workflowRolledBack: boolean;
    criticalActionModified: boolean;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.put('/users/me/notification-settings', settings);
    return response.data;
  }

  static async getAuditLogs(filters?: {
    dateRange?: string;
    user?: string;
    action?: string;
  }): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/audit-logs', { params: filters });
    return response.data;
  }

  static async exportAuditLogs(filters?: {
    dateRange?: string;
    user?: string;
    action?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/audit-logs/export', filters);
    return response.data;
  }

  static async getApiKeys(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/users/me/api-keys');
    return response.data;
  }

  static async createApiKey(keyData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/users/me/api-keys', keyData);
    return response.data;
  }

  static async deleteApiKey(keyId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/users/me/api-keys/${keyId}`);
    return response.data;
  }

  static async getUserPermissions(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/users/permissions');
    return response.data;
  }

  static async updateUserRole(userId: string, role: string): Promise<ApiResponse<any>> {
    const response = await apiClient.put(`/users/${userId}`, { role });
    return response.data;
  }

  static async addUser(userData: {
    email: string;
    role: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  }

  static async removeUser(userId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }

  static async getHubSpotAuthUrl(): Promise<ApiResponse<{ url: string }>> {
    const response = await apiClient.get('/hubspot/auth/url');
    return response.data;
  }

  static async disconnectHubSpot(): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/hubspot/disconnect');
    return response.data;
  }

  static async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete('/users/me');
    return response.data;
  }
}

export default apiClient; 