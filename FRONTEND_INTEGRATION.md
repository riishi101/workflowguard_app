# Frontend Integration Guide

This document explains how the new frontend has been integrated with the existing WorkflowGuard backend.

## Overview

The frontend has been successfully integrated with the backend API using the following components:

### 1. API Service Layer (`src/lib/api.ts`)
- Centralized API client using Axios
- Automatic token management for authentication
- Error handling and response interceptors
- TypeScript interfaces for all API responses

### 2. Authentication System
- **AuthContext** (`src/contexts/AuthContext.tsx`): Manages user authentication state
- **LoginForm** (`src/components/LoginForm.tsx`): Login component with form validation
- **ProtectedRoute** (`src/components/ProtectedRoute.tsx`): Route protection for authenticated users

### 3. API Hooks (`src/hooks/useApi.ts`)
- Custom React hooks for API calls
- Loading states and error handling
- Specific hooks for common operations (workflows, users, etc.)

## Key Features

### Authentication Flow
1. Users land on the Index page
2. If not authenticated, they see the login form
3. After successful login, they're redirected to the dashboard
4. Protected routes automatically redirect unauthenticated users

### API Integration
- All API calls go through the centralized `ApiService`
- Automatic token inclusion in requests
- Error handling for 401 responses (automatic logout)
- Type-safe API responses

### Docker Integration
- Multi-stage Dockerfile for optimized builds
- Nginx configuration for serving the SPA
- API proxy configuration for backend communication

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:4000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBHOOKS=true

# HubSpot Integration
VITE_HUBSPOT_CLIENT_ID=your_hubspot_client_id
VITE_HUBSPOT_REDIRECT_URI=http://localhost:3000/auth/hubspot/callback
```

## Development Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Docker Deployment

The frontend is configured to run in Docker with the following setup:

1. **Build the Image**:
   ```bash
   docker build -t workflowguard-frontend .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up
   ```

## API Endpoints Integration

The frontend integrates with these backend endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /user/me` - Get current user

### Workflows
- `GET /workflow` - List workflows
- `POST /workflow` - Create workflow
- `GET /workflow/:id` - Get workflow details
- `PUT /workflow/:id` - Update workflow
- `DELETE /workflow/:id` - Delete workflow

### Workflow Versions
- `GET /workflow-version/workflow/:id` - List versions
- `POST /workflow-version` - Create version
- `PUT /workflow-version/:id/activate` - Activate version

### Analytics & Audit
- `GET /analytics` - Get analytics data
- `GET /audit-log` - Get audit logs

### Webhooks
- `GET /webhook` - List webhooks
- `POST /webhook` - Create webhook

## Security Features

1. **Token-based Authentication**: JWT tokens stored in localStorage
2. **Automatic Token Refresh**: Handled by API interceptors
3. **Route Protection**: Unauthenticated users redirected to login
4. **CORS Configuration**: Proper CORS headers in nginx
5. **Security Headers**: XSS protection, content type validation

## Error Handling

- Network errors are caught and displayed to users
- 401 responses trigger automatic logout
- Loading states provide user feedback
- Toast notifications for success/error messages

## Testing the Integration

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Authentication**:
   - Visit `http://localhost:3000`
   - You should see the login form
   - Create an account or login with existing credentials

4. **Test Protected Routes**:
   - After login, you should be redirected to `/dashboard`
   - Try accessing other protected routes

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running and accessible
2. **Authentication Issues**: Check that the backend auth endpoints are working
3. **Build Errors**: Make sure all dependencies are installed
4. **Docker Issues**: Verify the nginx configuration and port mappings

### Debug Mode

Enable debug logging by setting:
```env
VITE_NODE_ENV=development
```

## Next Steps

1. **Complete API Integration**: Add remaining API endpoints
2. **Error Boundaries**: Implement React error boundaries
3. **Testing**: Add unit and integration tests
4. **Performance**: Implement code splitting and lazy loading
5. **Monitoring**: Add error tracking and analytics

## File Structure

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.ts              # API service layer
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication context
│   ├── hooks/
│   │   └── useApi.ts           # API hooks
│   ├── components/
│   │   ├── LoginForm.tsx       # Login component
│   │   └── ProtectedRoute.tsx  # Route protection
│   └── pages/                  # Page components
├── Dockerfile                  # Docker configuration
├── nginx.conf                  # Nginx configuration
└── env.example                 # Environment variables
```

This integration provides a solid foundation for the WorkflowGuard application with proper authentication, API communication, and deployment configuration. 