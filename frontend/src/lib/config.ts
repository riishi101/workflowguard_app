// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro';

// API Endpoints
export const ENDPOINTS = {
  workflows: '/workflows',
  protectedWorkflows: '/workflows/protected',
  workflowHistory: '/workflow-history',
  subscription: '/subscription',
};

// Refresh Intervals
export const REFRESH_INTERVALS = {
  dashboard: 30000, // 30 seconds
  workflows: 60000, // 1 minute
};

// Cache Duration
export const CACHE_DURATION = {
  workflows: 5 * 60 * 1000, // 5 minutes
  stats: 2 * 60 * 1000, // 2 minutes
};
