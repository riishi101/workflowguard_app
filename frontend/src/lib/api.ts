import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API base URL - will be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
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
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  static async register(userData: { email: string; password: string; name: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  static async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  }

  // User endpoints
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  static async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put('/user/me', userData);
    return response.data;
  }

  // Workflow endpoints
  static async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    const response = await api.get('/workflow');
    return response.data;
  }

  static async getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    const response = await api.get(`/workflow/${id}`);
    return response.data;
  }

  static async createWorkflow(workflowData: { name: string; description?: string }): Promise<ApiResponse<Workflow>> {
    const response = await api.post('/workflow', workflowData);
    return response.data;
  }

  static async updateWorkflow(id: string, workflowData: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    const response = await api.put(`/workflow/${id}`, workflowData);
    return response.data;
  }

  static async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/workflow/${id}`);
    return response.data;
  }

  // Workflow version endpoints
  static async getWorkflowVersions(workflowId: string): Promise<ApiResponse<WorkflowVersion[]>> {
    const response = await api.get(`/workflow-version/workflow/${workflowId}`);
    return response.data;
  }

  static async createWorkflowVersion(workflowId: string, versionData: { name: string; description?: string }): Promise<ApiResponse<WorkflowVersion>> {
    const response = await api.post(`/workflow-version`, { workflowId, ...versionData });
    return response.data;
  }

  static async activateWorkflowVersion(workflowId: string, versionId: string): Promise<ApiResponse<WorkflowVersion>> {
    const response = await api.put(`/workflow-version/${versionId}/activate`, { workflowId });
    return response.data;
  }

  // Audit log endpoints
  static async getAuditLogs(filters?: { resource?: string; userId?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<AuditLog[]>> {
    const response = await api.get('/audit-log', { params: filters });
    return response.data;
  }

  // Analytics endpoints
  static async getAnalytics(period: string = '30d'): Promise<ApiResponse<any>> {
    const response = await api.get(`/analytics?period=${period}`);
    return response.data;
  }

  // Webhook endpoints
  static async getWebhooks(): Promise<ApiResponse<any[]>> {
    const response = await api.get('/webhook');
    return response.data;
  }

  static async createWebhook(webhookData: { url: string; events: string[] }): Promise<ApiResponse<any>> {
    const response = await api.post('/webhook', webhookData);
    return response.data;
  }

  // Subscription endpoints
  static async getSubscription(): Promise<ApiResponse<any>> {
    const response = await api.get('/user/subscription');
    return response.data;
  }

  static async cancelSubscription(): Promise<ApiResponse<void>> {
    const response = await api.post('/user/subscription/cancel');
    return response.data;
  }

  // HubSpot integration endpoints
  static async connectHubSpot(portalId: string): Promise<ApiResponse<void>> {
    const response = await api.post('/user/hubspot/connect', { portalId });
    return response.data;
  }

  static async disconnectHubSpot(): Promise<ApiResponse<void>> {
    const response = await api.post('/user/hubspot/disconnect');
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
    const response = await api.post('/support/tickets', ticketData);
    return response.data;
  }

  static async getUserTickets(): Promise<ApiResponse<any[]>> {
    const response = await api.get('/support/tickets');
    return response.data;
  }

  static async getTicket(ticketId: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/support/tickets/${ticketId}`);
    return response.data;
  }

  static async addReply(ticketId: string, message: string): Promise<ApiResponse<any>> {
    const response = await api.post(`/support/tickets/${ticketId}/reply`, { message });
    return response.data;
  }
}

export default api; 