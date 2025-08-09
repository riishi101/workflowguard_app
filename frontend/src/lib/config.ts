// API Configuration
export const API_URL = process.env.VITE_API_URL || 'https://api.workflowguard.pro/api';

// WebSocket Configuration
export const WS_CONFIG = {
  path: '/socket.io',
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};

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
