import axios from 'axios';

// API base URL - will be set from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workflowGuard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('workflowGuard_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface Workflow {
  id: string;
  hubspotId: string;
  name: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  versions?: WorkflowVersion[];
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  versionNumber: number;
  snapshotType: string;
  createdBy: string;
  createdAt: string;
  data: any;
  workflow?: Workflow;
}

export interface CreateWorkflowDto {
  hubspotId: string;
  name: string;
  ownerId: string;
}

export interface CreateWorkflowVersionDto {
  workflowId: string;
  versionNumber: number;
  snapshotType: string;
  createdBy: string;
  data: any;
}

export interface CompareResult {
  version1: WorkflowVersion;
  version2: WorkflowVersion;
  differences: {
    hasChanges: boolean;
    // Add more detailed diff information here
  };
}

// API Service class
export class ApiService {
  // Workflow endpoints
  static async getWorkflows(ownerId?: string): Promise<Workflow[]> {
    const params = ownerId ? { ownerId } : {};
    const response = await apiClient.get('/workflows', { params });
    return response.data;
  }

  static async getWorkflowById(id: string): Promise<Workflow> {
    const response = await apiClient.get(`/workflows/${id}`);
    return response.data;
  }

  static async getWorkflowByHubspotId(hubspotId: string): Promise<Workflow> {
    const response = await apiClient.get(`/workflows/hubspot/${hubspotId}`);
    return response.data;
  }

  static async createWorkflow(workflow: CreateWorkflowDto): Promise<Workflow> {
    const response = await apiClient.post('/workflows', workflow);
    return response.data;
  }

  static async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const response = await apiClient.patch(`/workflows/${id}`, updates);
    return response.data;
  }

  static async deleteWorkflow(id: string): Promise<void> {
    await apiClient.delete(`/workflows/${id}`);
  }

  // Workflow Version endpoints
  static async getWorkflowVersions(workflowId?: string): Promise<WorkflowVersion[]> {
    const params = workflowId ? { workflowId } : {};
    const response = await apiClient.get('/workflow-versions', { params });
    return response.data;
  }

  static async getWorkflowVersionById(id: string): Promise<WorkflowVersion> {
    const response = await apiClient.get(`/workflow-versions/${id}`);
    return response.data;
  }

  static async getLatestWorkflowVersion(workflowId: string): Promise<WorkflowVersion> {
    const response = await apiClient.get(`/workflow-versions/workflow/${workflowId}/latest`);
    return response.data;
  }

  static async getWorkflowHistory(workflowId: string): Promise<WorkflowVersion[]> {
    const response = await apiClient.get(`/workflow-versions/workflow/${workflowId}/history`);
    return response.data;
  }

  static async createWorkflowVersion(version: CreateWorkflowVersionDto): Promise<WorkflowVersion> {
    const response = await apiClient.post('/workflow-versions', version);
    return response.data;
  }

  static async deleteWorkflowVersion(id: string): Promise<void> {
    await apiClient.delete(`/workflow-versions/${id}`);
  }

  static async compareVersions(version1Id: string, version2Id: string): Promise<CompareResult> {
    const response = await apiClient.get(`/workflow-versions/compare/${version1Id}/${version2Id}`);
    return response.data;
  }

  // Rollback functionality
  static async rollbackWorkflow(workflowId: string, versionId: string): Promise<WorkflowVersion> {
    const response = await apiClient.post(`/workflows/${workflowId}/rollback`, {
      versionId,
    });
    return response.data;
  }

  // Sync from HubSpot
  static async syncFromHubspot(workflowId: string): Promise<Workflow> {
    const response = await apiClient.post(`/workflows/${workflowId}/sync-from-hubspot`);
    return response.data;
  }

  // Authentication endpoints
  static async login(credentials: { email: string; password: string }): Promise<{ token: string; user: any }> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  static async register(userData: { email: string; password: string; name: string }): Promise<{ token: string; user: any }> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  static async getCurrentUser(): Promise<any> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  // HubSpot integration
  static async connectHubSpot(code: string): Promise<any> {
    const response = await apiClient.post('/auth/hubspot/callback', { code });
    return response.data;
  }

  static async getHubSpotAuthUrl(): Promise<{ url: string }> {
    const response = await apiClient.get('/auth/hubspot/url');
    return response.data;
  }

  // Utility methods
  static setAuthToken(token: string): void {
    localStorage.setItem('workflowGuard_token', token);
  }

  static getAuthToken(): string | null {
    return localStorage.getItem('workflowGuard_token');
  }

  static removeAuthToken(): void {
    localStorage.removeItem('workflowGuard_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Export default instance
export default ApiService; 