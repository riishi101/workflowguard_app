# 🚀 Railway Deployment Fix Guide

## 🚨 ISSUE: "No start command was found"

**Problem:** Railway can't find the start command because the backend package.json wasn't configured properly for production deployment.

## ✅ SOLUTION IMPLEMENTED:

### 1. Fixed package.json start script:
```json
{
  "scripts": {
    "start": "npm run build && npm run start:prod",
    "start:prod": "node dist/main.js",
    "prestart:prod": "prisma generate && prisma migrate deploy"
  }
}
```

### 2. Updated railway.json configuration:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/api"
  }
}
```

## 🔧 RAILWAY DEPLOYMENT STEPS:

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `workflowguard_app` repository
5. Set **Root Directory**: `backend`

### Step 2: Add PostgreSQL Database
1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a managed PostgreSQL instance
4. Copy the `DATABASE_URL` from the Variables tab

### Step 3: Configure Environment Variables
In Railway dashboard → Backend Service → Variables, add ALL these variables:

```bash
# Database (Railway auto-generates these)
DATABASE_URL=postgresql://postgres:password@host:port/database
DIRECT_URL=postgresql://postgres:password@host:port/database

# Application
PORT=4000
NODE_ENV=production

# Frontend URLs (update with your Vercel URL)
FRONTEND_URL=https://your-app.vercel.app
API_URL=https://your-backend.railway.app

# HubSpot OAuth
HUBSPOT_APP_ID=18270797
HUBSPOT_CLIENT_ID=5e6a6429-8317-4e2a-a9b5-46e8669f72f6
HUBSPOT_CLIENT_SECRET=07f931e2-bc75-4686-a9cf-c1d464c55019
HUBSPOT_REDIRECT_URI=https://your-backend.railway.app/api/auth/hubspot/callback

# Security
JWT_SECRET=xrDmUc9gji+BcWHxH2gEPhjvNDDehJDs4Z04UI/bVn1fhjmKOgH9WoUUnrVEFYcaTlYmbUdhaoSysZWHiNy5Dw==
SESSION_SECRET=your-super-secure-session-secret-here

# Razorpay
RAZORPAY_KEY_ID=rzp_live_R6PjXR1FYupO0Y
RAZORPAY_KEY_SECRET=O5McpwbAgoiSNMJDQetruaTK
RAZORPAY_WEBHOOK_SECRET=Liverpoolisthebest@1998

# All Razorpay Plan IDs (copy from .env.railway file)
RAZORPAY_PLAN_ID_STARTER_INR=plan_R6RI02CsUCUlDz
RAZORPAY_PLAN_ID_PROFESSIONAL_INR=plan_R6RKEg5mqJK6Ky
RAZORPAY_PLAN_ID_ENTERPRISE_INR=plan_R6RKnjqXu0BZsH
# ... (add all other plan IDs from .env.railway)

# Twilio
TWILIO_ACCOUNT_SID=ACbee0672c967962b2212e68bf188771d2
TWILIO_AUTH_TOKEN=b80c34629dd5c41c26355dc6d60bca88

# Logging
LOG_LEVEL=info
```

### Step 4: Deploy
1. Railway will automatically detect the changes
2. It will run: `npm ci && npm run build`
3. Then start with: `npm run start:prod`
4. Database migrations will run automatically

## 🎯 EXPECTED DEPLOYMENT FLOW:

```
1. Build Phase:
   ✅ npm ci (install dependencies)
   ✅ npm run build (compile TypeScript)
   ✅ Copy Prisma files to dist/

2. Start Phase:
   ✅ prisma generate (generate Prisma client)
   ✅ prisma migrate deploy (run database migrations)
   ✅ node dist/main.js (start the application)

3. Health Check:
   ✅ GET /api (should return 200 OK)
```

## 🔍 TROUBLESHOOTING:

### If build still fails:
1. Check Railway logs for specific error messages
2. Ensure all environment variables are set
3. Verify DATABASE_URL is correct
4. Check that Node.js version is 20+

### If database connection fails:
1. Verify PostgreSQL service is running
2. Check DATABASE_URL format
3. Ensure database migrations completed

### If HubSpot OAuth fails:
1. Update HUBSPOT_REDIRECT_URI with actual Railway URL
2. Verify HubSpot app settings match environment variables

## ✅ SUCCESS INDICATORS:

- ✅ Build completes without errors
- ✅ Application starts on port 4000
- ✅ Health check `/api` returns 200 OK
- ✅ Database connection established
- ✅ Prisma migrations applied

## 🚀 NEXT STEPS:

1. Get your Railway backend URL (e.g., `https://backend-production-abc123.railway.app`)
2. Update Vercel frontend `VITE_API_URL` with this URL
3. Update HubSpot app redirect URI to match Railway URL
4. Test the complete flow: Frontend → Backend → Database

Your WorkflowGuard backend should now deploy successfully on Railway! 🎉
