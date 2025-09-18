# 🚀 Railway Backend + Database Deployment Guide

## Prerequisites
- GitHub account
- Railway account (free tier available)
- Your backend code ready

## Step 1: Create Railway Account & Connect GitHub

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub repository

## Step 2: Deploy PostgreSQL Database

1. **Create new project in Railway**
2. **Add PostgreSQL service:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will provision a managed PostgreSQL instance
   - Note the connection details

3. **Get database credentials:**
   - Go to PostgreSQL service → Variables
   - Copy `DATABASE_URL` (starts with postgresql://)

## Step 3: Deploy Backend Service

1. **Add backend service:**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Set root directory: `backend`

2. **Configure build settings:**
   - Railway auto-detects Node.js
   - Build command: `npm run build`
   - Start command: `npm run start:prod`

## Step 4: Configure Environment Variables

In Railway backend service → Variables, add:

```bash
# Database (use Railway's DATABASE_URL)
DATABASE_URL=postgresql://postgres:password@host:port/database
DIRECT_URL=postgresql://postgres:password@host:port/database

# App Configuration
PORT=4000
NODE_ENV=production

# HubSpot OAuth
HUBSPOT_APP_ID=18270797
HUBSPOT_CLIENT_ID=5e6a6429-8317-4e2a-a9b5-46e8669f72f6
HUBSPOT_CLIENT_SECRET=07f931e2-bc75-4686-a9cf-c1d464c55019
HUBSPOT_REDIRECT_URI=https://your-frontend.vercel.app/auth/callback

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
# ... (add all other plan IDs)

# Twilio
TWILIO_ACCOUNT_SID=ACbee0672c967962b2212e68bf188771d2
TWILIO_AUTH_TOKEN=b80c34629dd5c41c26355dc6d60bca88

# Logging
LOG_LEVEL=info
```

## Step 5: Database Migration

Railway will automatically run:
1. `prisma generate` (generates Prisma client)
2. `prisma migrate deploy` (applies database migrations)

## Step 6: Get Your Backend URL

After deployment:
1. Go to backend service → Settings
2. Copy the public URL (e.g., `https://backend-production-abc123.railway.app`)
3. Update frontend's `VITE_API_URL` with this URL

## Step 7: Configure Custom Domain (Optional)

1. In Railway backend service → Settings → Domains
2. Add custom domain: `api.workflowguard.pro`
3. Update DNS CNAME record
4. SSL is automatic!

## ✅ Benefits of Railway Deployment

- ✅ Managed PostgreSQL database
- ✅ Automatic deployments on git push
- ✅ Built-in monitoring and logs
- ✅ Automatic SSL certificates
- ✅ Environment variable management
- ✅ 99.9% uptime SLA
- ✅ Easy scaling and rollbacks

## 🔧 Troubleshooting

**Build fails?**
```bash
# Check Railway logs
railway logs

# Common issues:
# - Missing dependencies in package.json
# - TypeScript compilation errors
# - Prisma schema issues
```

**Database connection fails?**
- Verify DATABASE_URL is correct
- Check if database service is running
- Ensure Prisma migrations ran successfully

**API not accessible?**
- Check if service is deployed and running
- Verify PORT environment variable
- Check Railway service logs

**HubSpot OAuth fails?**
- Update HUBSPOT_REDIRECT_URI to match frontend URL
- Verify HubSpot app settings match environment variables

## 📊 Monitoring

Railway provides:
- Real-time logs
- CPU/Memory usage metrics
- Request analytics
- Error tracking
- Deployment history
