# Frontend-Backend Integration Guide

## Overview

This document outlines the integration between the WorkflowGuard frontend and backend, including API services, authentication, and data flow.

## 🏗️ Architecture

### Frontend Structure
```
frontend/src/
├── services/
│   └── api.ts              # API service layer
├── hooks/
│   ├── useWorkflows.ts     # Workflow data hooks
│   └── useWorkflowVersions.ts # Version data hooks
├── contexts/
│   └── AuthContext.tsx     # Authentication context
└── pages/                  # Application pages
```

### Backend Structure
```
backend/src/
├── workflow/
│   ├── workflow.controller.ts
│   └── workflow.service.ts
├── workflow-version/
│   ├── workflow-version.controller.ts
│   └── workflow-version.service.ts
└── auth/
    └── jwt-auth.guard.ts
```

## 🔌 API Integration

### API Service (`frontend/src/services/api.ts`)

**Features:**
- Axios-based HTTP client
- Automatic token management
- Error handling and interceptors
- TypeScript interfaces for all API responses

**Key Methods:**
```typescript
// Workflow management
ApiService.getWorkflows(ownerId?: string)
ApiService.getWorkflowById(id: string)
ApiService.createWorkflow(workflow: CreateWorkflowDto)
ApiService.rollbackWorkflow(workflowId: string, versionId: string)

// Version management
ApiService.getWorkflowVersions(workflowId?: string)
ApiService.getWorkflowHistory(workflowId: string)
ApiService.compareVersions(version1Id: string, version2Id: string)

// Authentication
ApiService.login(credentials)
ApiService.register(userData)
ApiService.getCurrentUser()
```

### React Query Hooks

**Workflow Hooks (`frontend/src/hooks/useWorkflows.ts`):**
```typescript
const { data: workflows, isLoading, error } = useWorkflows();
const rollbackMutation = useRollbackWorkflow();
```

**Version Hooks (`frontend/src/hooks/useWorkflowVersions.ts`):**
```typescript
const { data: versions } = useWorkflowHistory(workflowId);
const { data: latestVersion } = useLatestWorkflowVersion(workflowId);
```

## 🔐 Authentication

### AuthContext (`frontend/src/contexts/AuthContext.tsx`)

**Features:**
- JWT token management
- Automatic token refresh
- User state management
- HubSpot OAuth integration

**Usage:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

## 📊 Data Flow

### 1. Dashboard Flow
```
User visits Dashboard → useWorkflows() → API call → Display workflows
User clicks rollback → useRollbackWorkflow() → API call → Update UI
```

### 2. Workflow History Flow
```
User visits WorkflowHistory → useWorkflowHistory() → API call → Display versions
User selects version → useDeleteWorkflowVersion() → API call → Update UI
```

### 3. Authentication Flow
```
User login → AuthContext.login() → API call → Store token → Update user state
User logout → AuthContext.logout() → Remove token → Clear user state
```

## 🚀 Environment Configuration

### Frontend Environment Variables
```bash
# .env.local
VITE_API_URL=http://localhost:3000/api
VITE_HUBSPOT_CLIENT_ID=your_hubspot_client_id
VITE_HUBSPOT_REDIRECT_URI=http://localhost:5173/auth/hubspot/callback
```

### Backend Environment Variables
```bash
# .env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
```

## 🔄 State Management

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

### Cache Invalidation
- Workflow list is invalidated when workflows are created/updated/deleted
- Version list is invalidated when versions are created/deleted
- User data is refreshed after authentication changes

## 🛡️ Error Handling

### API Error Interceptors
```typescript
// Automatic 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('workflowGuard_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

### Component Error States
```typescript
if (error) {
  return (
    <div className="text-center">
      <p className="text-red-500 mb-4">Failed to load data</p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
}
```

## 📱 Component Integration

### Updated Components

**Dashboard.tsx:**
- Uses `useWorkflows()` for data fetching
- Uses `useRollbackWorkflow()` for rollback functionality
- Shows loading and error states
- Graceful fallback to mock data

**WorkflowHistory.tsx:**
- Uses `useWorkflowHistory()` for version data
- Uses `useDeleteWorkflowVersion()` for deletion
- Real-time data updates

## 🔧 Development Setup

### 1. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Set Environment Variables
```bash
# Copy example files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 3. Start Development Servers
```bash
# Backend (Terminal 1)
cd backend
npm run start:dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 🧪 Testing

### API Testing
```bash
# Test backend endpoints
curl http://localhost:3000/api/workflows

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Frontend Testing
```bash
# Run frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend (Render)
```bash
# Deploy to Render
# Configure environment variables in Render dashboard
```

## 📈 Monitoring

### API Monitoring
- Request/response logging
- Error tracking
- Performance metrics

### Frontend Monitoring
- User interaction tracking
- Error boundary logging
- Performance monitoring

## 🔒 Security

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage

### API Security
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention

## 📚 Next Steps

1. **Real-time Updates**: Implement WebSocket connections for live updates
2. **Offline Support**: Add service worker for offline functionality
3. **Advanced Analytics**: Implement detailed usage analytics
4. **Performance Optimization**: Add lazy loading and code splitting
5. **Testing**: Add comprehensive unit and integration tests

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure backend CORS configuration includes frontend URL
- Check environment variables for correct API URL

**Authentication Issues:**
- Verify JWT token is being sent in requests
- Check token expiration and refresh logic

**Data Loading Issues:**
- Check React Query cache configuration
- Verify API endpoint URLs and parameters

**Build Errors:**
- Ensure all dependencies are installed
- Check TypeScript configuration
- Verify environment variables are set correctly 