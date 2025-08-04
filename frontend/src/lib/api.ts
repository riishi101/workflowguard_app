import axios, { AxiosResponse } from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token for auth endpoints
      if (error.config.url?.includes('/auth')) {
        localStorage.removeItem('token');
      }
      // Don't clear token for non-auth endpoints to avoid infinite loops
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface WorkflowHistoryVersion {
  id: string;
  workflowId: string;
  versionNumber: number;
  date: string;
  type: string;
  initiator: string;
  notes: string;
  changes: {
    added: number;
    modified: number;
    removed: number;
  };
  status: string;
}

export interface ProtectedWorkflow {
  id: string;
  name: string;
  status: string;
  protectionStatus: string;
  lastModified: string;
  versions: number;
  lastModifiedBy: {
    name: string;
    initials: string;
    email: string;
  };
}

class ApiService {
  static async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async register(userData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getProtectedWorkflows(userId?: string): Promise<ApiResponse<ProtectedWorkflow[]>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (userId) {
      headers['x-user-id'] = userId;
    }

    try {
      const response = await apiClient.get('/workflow/protected', { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getWorkflowHistory(workflowId: string): Promise<ApiResponse<WorkflowHistoryVersion[]>> {
    try {
      const response = await apiClient.get(`/workflow-version/${workflowId}/history`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getWorkflowDetails(workflowId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/workflow/${workflowId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async rollbackWorkflow(workflowId: string, versionId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/workflow/${workflowId}/rollback/${versionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async downloadWorkflowVersion(workflowId: string, versionId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/workflow/${workflowId}/version/${versionId}/download`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getComparisonData(workflowId: string, versionAId: string, versionBId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/workflow/${workflowId}/compare/${versionAId}/${versionBId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async startWorkflowProtection(workflowIds: string[], userId: string, selectedWorkflowObjects: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/workflow/start-protection', {
        workflowIds,
        userId,
        selectedWorkflowObjects
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getHubSpotWorkflows(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/workflow/hubspot');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async syncHubSpotWorkflows(): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post('/workflow/sync-hubspot', {}, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createAutomatedBackup(workflowId: string): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post(`/workflow/${workflowId}/automated-backup`, {}, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createChangeNotification(workflowId: string, changes: any): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post(`/workflow/${workflowId}/change-notification`, changes, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createApprovalRequest(workflowId: string, requestedChanges: any): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post(`/workflow/${workflowId}/approval-request`, requestedChanges, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async generateComplianceReport(workflowId: string, startDate: string, endDate: string): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.get(`/workflow/${workflowId}/compliance-report?startDate=${startDate}&endDate=${endDate}`, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // AI Support Methods
  static async diagnoseIssue(description: string): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post('/support/diagnose', { description }, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async fixRollbackIssue(): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post('/support/fix-rollback', {}, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async fixSyncIssue(): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post('/support/fix-sync', {}, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async fixAuthIssue(): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post('/support/fix-auth', {}, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async fixDataIssue(): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post('/support/fix-data', {}, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async optimizePerformance(): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post('/support/optimize-performance', {}, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // User management
  static async updateProfile(userData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put('/user/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getNotificationSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/user/notification-settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateNotificationSettings(settings: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put('/user/notification-settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUserPermissions(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/user/permissions');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAuditLogs(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/audit-log');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getApiKeys(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/user/api-keys');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createApiKey(apiKeyData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/user/api-keys', apiKeyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteApiKey(keyId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete(`/user/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Subscription and billing
  static async getSubscription(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/subscription');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getTrialStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/subscription/trial-status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUsageStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/subscription/usage');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Support tickets
  static async createSupportTicket(ticketData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/support/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getSupportTickets(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/support/tickets');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export { ApiService };
export default ApiService; 