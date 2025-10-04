import axios, { AxiosResponse } from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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
    
    // Handle trial expiration
    if (error.response?.status === 403 && error.response?.data?.message?.includes('Trial expired')) {
      // Redirect to settings for trial expired users
      window.location.href = '/settings';
    }

    // Handle subscription cancellation
    if (error.response?.status === 403 && error.response?.data?.message?.includes('Subscription cancelled')) {
      // Redirect to settings for cancelled subscription users
      window.location.href = '/settings';
    }

    // Handle subscription expiration
    if (error.response?.status === 403 && error.response?.data?.message?.includes('Subscription expired')) {
      // Redirect to settings for expired subscription users
      window.location.href = '/settings';
    }

    // Handle payment failure
    if (error.response?.status === 403 && error.response?.data?.message?.includes('Payment failed')) {
      // Redirect to settings for payment failed users
      window.location.href = '/settings';
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
      const response = await apiClient.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async register(userData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/auth/me');
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
      const response = await apiClient.get('/api/workflow/protected', { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getWorkflowHistory(workflowId: string): Promise<ApiResponse<WorkflowHistoryVersion[]>> {
    try {
      // First try with HubSpot ID endpoint (for workflows from WorkflowSelection)
      const response = await apiClient.get(`/api/workflow-version/by-hubspot-id/${workflowId}/history`);
      return response.data;
    } catch (error: any) {
      // If HubSpot ID endpoint fails, try original endpoint (for internal IDs)
      try {
        const fallbackResponse = await apiClient.get(`/api/workflow-version/${workflowId}/history`);
        return fallbackResponse.data;
      } catch (fallbackError: any) {
        // If both fail, throw the original error with more context
        console.error('Failed to fetch workflow history with both HubSpot ID and internal ID:', {
          workflowId,
          hubspotError: error.response?.data || error.message,
          internalError: fallbackError.response?.data || fallbackError.message
        });
        throw new Error(`Workflow history not found: Unable to locate workflow history for ID ${workflowId}`);
      }
    }
  }

  static async getWorkflowDetails(workflowId: string): Promise<ApiResponse<any>> {
    try {
      // First try with HubSpot ID endpoint (for workflows from WorkflowSelection)
      const response = await apiClient.get(`/api/workflow/by-hubspot-id/${workflowId}`);
      return response.data;
    } catch (error: any) {
      // If HubSpot ID endpoint fails, try original endpoint (for internal IDs)
      try {
        const fallbackResponse = await apiClient.get(`/api/workflow/${workflowId}`);
        return fallbackResponse.data;
      } catch (fallbackError: any) {
        // If both fail, throw the original error with more context
        console.error('Failed to fetch workflow details with both HubSpot ID and internal ID:', {
          workflowId,
          hubspotError: error.response?.data || error.message,
          internalError: fallbackError.response?.data || fallbackError.message
        });
        throw new Error(`Workflow not found: Unable to locate workflow with ID ${workflowId}`);
      }
    }
  }

  static async rollbackWorkflow(workflowId: string, versionId?: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/api/workflow/${workflowId}/rollback${versionId ? `/${versionId}` : ''}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async restoreDeletedWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/workflow/${workflowId}/restore-deleted`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async restoreWorkflowVersion(workflowId: string, versionId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/workflow/${workflowId}/restore/${versionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async downloadWorkflowVersion(workflowId: string, versionId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/api/workflow/${workflowId}/version/${versionId}/download`);
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

  static async compareWorkflowVersions(workflowId: string, versionA: string, versionB: string): Promise<ApiResponse<any>> {
    try {
      // Try HubSpot ID endpoint first (for workflows from WorkflowSelection)
      const response = await apiClient.get(`/api/workflow/by-hubspot-id/${workflowId}/compare/${versionA}/${versionB}`);
      return response.data;
    } catch (error: any) {
      // If HubSpot ID endpoint fails, try original endpoint (for internal IDs)
      if (error.response?.status === 404) {
        try {
          const response = await apiClient.get(`/api/workflow/${workflowId}/compare/${versionA}/${versionB}`);
          return response.data;
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  static async getWorkflowVersionsForComparison(workflowId: string): Promise<ApiResponse<any>> {
    try {
      // Try HubSpot ID endpoint first (for workflows from WorkflowSelection)
      const response = await apiClient.get(`/api/workflow/by-hubspot-id/${workflowId}/versions`);
      return response.data;
    } catch (error: any) {
      // If HubSpot ID endpoint fails, try original endpoint (for internal IDs)
      if (error.response?.status === 404) {
        try {
          const response = await apiClient.get(`/api/workflow/${workflowId}/versions`);
          return response.data;
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  static async startWorkflowProtection(selectedWorkflowObjects: any[]): Promise<ApiResponse<any>> {
    try {
      // Ensure we're sending the data in the format the backend expects
      const response = await apiClient.post('/api/workflow/start-protection', {
        workflows: selectedWorkflowObjects.map(workflow => ({
          id: workflow.id,
          hubspotId: workflow.hubspotId || workflow.id,
          name: workflow.name,
          status: workflow.status
        }))
      });
      return response.data;
    } catch (error) {
      // Add better error handling
      console.error('API Error in startWorkflowProtection:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  static async syncHubSpotWorkflows(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/workflow/sync-hubspot');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getHubSpotWorkflows(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/workflow/hubspot');
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
      const response = await apiClient.post('/api/support/diagnose', { description }, { headers });
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
      const response = await apiClient.post('/api/support/fix-rollback', {}, { headers });
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
      const response = await apiClient.post('/api/support/fix-sync', {}, { headers });
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
      const response = await apiClient.post('/api/support/fix-auth', {}, { headers });
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
      const response = await apiClient.post('/api/support/fix-data', {}, { headers });
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
      const response = await apiClient.post('/api/support/optimize-performance', {}, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async sendWhatsAppSupport(message: string, phoneNumber?: string): Promise<ApiResponse<any>> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await apiClient.post('/api/support/whatsapp', { message, phoneNumber }, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // User management
  static async updateProfile(userData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put('/api/user/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserProfile(userData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put('/api/user/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async disconnectHubSpot(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/user/disconnect-hubspot');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAccount(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete('/api/user/account');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUserProfile(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUsers(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/user/verify-email', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async uploadAvatar(formData: FormData): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async removeAvatar(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete('/api/user/avatar');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getNotificationSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/user/notification-settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateNotificationSettings(settings: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put('/api/user/notification-settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  }



  static async getAuditLogs(filters?: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/audit-logs', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async exportAuditLogs(filters?: any): Promise<ApiResponse<any>> {
    try {
      // Backend expects POST /api/audit-logs/export with filters in body
      const response = await apiClient.post('/api/audit-logs/export', filters || {});
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getApiKeys(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/user/api-keys');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createApiKey(apiKeyData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/user/api-keys', apiKeyData);
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
      const response = await apiClient.get('/api/subscription');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getTrialStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/subscription/trial-status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getExpirationStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/subscription/expiration-status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getNextPaymentInfo(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/subscription/next-payment');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUsageStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/subscription/usage');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateSubscription(planId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/subscription/update', { planId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Fresh Razorpay Integration - Memory-Guided Implementation
  static async getPaymentConfig(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/payment/config');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createPaymentOrder(planId: string): Promise<ApiResponse<any>> {
    try {
      // USING EMERGENCY ENDPOINT - Memory Check: Following MISTAKE #6 lesson for specific error messages
      const token = localStorage.getItem('token');
      console.log('🚨 EMERGENCY ENDPOINT - createPaymentOrder called:');
      console.log('  - planId:', planId);
      console.log('  - token exists:', !!token);
      console.log('  - token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      console.log('  - using emergency endpoint (working solution)');
      
      const response = await apiClient.post('/api/payment/emergency-test', { planId });
      console.log('✅ EMERGENCY - createPaymentOrder success:', response.status);
      
      // Transform emergency response to match expected frontend format
      const emergencyData = response.data;
      if (emergencyData.success) {
        const transformedResponse = {
          success: true,
          data: {
            orderId: emergencyData.orderId,
            amount: emergencyData.amount,
            currency: emergencyData.currency,
            keyId: emergencyData.keyId
          },
          message: emergencyData.message || 'Payment order created successfully'
        };
        console.log('✅ EMERGENCY - Response transformed:', transformedResponse);
        return transformedResponse;
      } else {
        throw new Error(emergencyData.message || 'Emergency endpoint failed');
      }
    } catch (error: any) {
      console.log('❌ EMERGENCY - createPaymentOrder failed:');
      console.log('  - status:', error.response?.status);
      console.log('  - statusText:', error.response?.statusText);
      console.log('  - data:', error.response?.data);
      console.log('  - headers sent:', error.config?.headers);
      throw error;
    }
  }

  static async confirmPayment(paymentData: {
    orderId: string;
    paymentId: string;
    signature: string;
    planId: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/payment/confirm', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async cancelSubscription(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/subscription/cancel');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getBillingHistory(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/subscription/billing-history');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async downloadBillingHistoryCSV(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/subscription/billing-history/export', {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      throw error;
    }
  }

  static async getPaymentMethodUpdateUrl(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/subscription/payment-method-update-url');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getInvoice(invoiceId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/api/subscription/invoice/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Support tickets
  static async createSupportTicket(ticketData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/support/tickets', ticketData);
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

  // Enterprise Analytics APIs
  static async getUserAnalytics(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await apiClient.get(`/analytics/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }



  // Webhook Management APIs
  static async getUserWebhooks(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/webhooks');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createWebhook(webhookData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/webhooks', webhookData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateWebhook(webhookId: string, webhookData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put(`/webhooks/${webhookId}`, webhookData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteWebhook(webhookId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete(`/webhooks/${webhookId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Advanced Enterprise Features
  static async getWorkflowAnalytics(workflowId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/workflow/${workflowId}/analytics`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/analytics/performance');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getComplianceMetrics(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/analytics/compliance');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getSystemHealth(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/system/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getCacheStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/system/cache-stats');
      return response.data;
    } catch (error) {
      // Return mock data for development
      return {
        success: true,
        data: {
          hitRate: 0.85,
          totalRequests: 1000,
          cacheSize: '50MB'
        }
      };
    }
  }

  static async getEnterpriseReport(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/enterprise/report', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async exportDashboardData(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/dashboard/export');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async exportWorkflow(workflowId?: string): Promise<ApiResponse<any>> {
    try {
      const endpoint = workflowId ? `/workflow/${workflowId}/export` : '/workflow/export-all';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async exportDeletedWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/workflow/${workflowId}/export-deleted`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export { ApiService };
export default ApiService;
