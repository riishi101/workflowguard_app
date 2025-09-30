# 🚀 WorkflowGuard Production Deployment Guide

## 📋 Prerequisites

Before deploying to production, ensure you have:
- Node.js 20+ installed
- Docker and Docker Compose (if using containers)
- Google Cloud SDK (for Cloud Run deployment)
- All environment variables configured

## 🔧 Step 1: Install Production Dependencies

```bash
# Backend dependencies
cd backend
npm install @sentry/node@^7.99.0 @sentry/tracing@^7.99.0 winston@^3.11.0 winston-daily-rotate-file@^4.7.1

# Frontend dependencies (if needed)
cd ../frontend
npm install @sentry/react@^7.99.0
```

## 🛡️ Step 2: Environment Configuration

Create/update your production environment variables:

```bash
# Core Configuration
NODE_ENV=production
PORT=4000
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Security
JWT_SECRET=your-super-secure-jwt-secret-here

# HubSpot Integration
HUBSPOT_CLIENT_ID=your-hubspot-client-id
HUBSPOT_CLIENT_SECRET=your-hubspot-client-secret
HUBSPOT_REDIRECT_URI=https://api.workflowguard.pro/api/auth/hubspot/callback

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Communication
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Monitoring (Production)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
API_RATE_LIMIT_MAX_REQUESTS=30

# Logging
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true

# CORS
CORS_ORIGINS=https://www.workflowguard.pro,https://workflowguard.pro
```

## 🏗️ Step 3: Build Production Application

```bash
# Backend build
cd backend
npm run build

# Frontend build
cd ../frontend
npm run build
```

## 🚀 Step 4: Deploy to Google Cloud Run

### Option A: Using Existing Cloud Build

```bash
# Deploy using your existing cloudbuild.yaml
gcloud builds submit --config=cloudbuild.yaml
```

### Option B: Manual Deployment

```bash
# Build and deploy backend
cd backend
gcloud run deploy workflowguard-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production

# Build and deploy frontend
cd ../frontend
gcloud run deploy workflowguard-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5
```

## 🔍 Step 5: Health Check Verification

After deployment, verify all systems are operational:

```bash
# Basic health check
curl https://api.workflowguard.pro/api/health

# Detailed health check
curl https://api.workflowguard.pro/api/health/detailed

# Readiness check
curl https://api.workflowguard.pro/api/health/ready

# Liveness check
curl https://api.workflowguard.pro/api/health/live
```

Expected responses:
- **Health**: `{"status":"ok","timestamp":"...","uptime":123.45,"version":"1.0.0"}`
- **Detailed**: Full system status with database, external services, memory usage
- **Ready**: `{"status":"ready","timestamp":"..."}`
- **Live**: `{"status":"healthy","timestamp":"..."}`

## 📊 Step 6: Monitoring Setup

### Sentry Error Monitoring
1. Create a Sentry project at https://sentry.io
2. Copy the DSN to your `SENTRY_DSN` environment variable
3. Verify error tracking is working by checking Sentry dashboard

### Log Monitoring
- **Cloud Run**: View logs in Google Cloud Console
- **Local Files**: Check `logs/` directory for rotating log files
- **Structured Logging**: All logs are in JSON format for easy parsing

## 🔐 Step 7: Security Verification

Verify security measures are active:

```bash
# Check security headers
curl -I https://api.workflowguard.pro/api/health

# Verify rate limiting (should get 429 after multiple requests)
for i in {1..105}; do curl -s -o /dev/null -w "%{http_code}\n" https://api.workflowguard.pro/api/health; done
```

Expected security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self'...`

## 🧪 Step 8: End-to-End Testing

Test critical user flows:

1. **User Registration & Authentication**
   ```bash
   # Test HubSpot OAuth flow
   curl https://api.workflowguard.pro/api/auth/hubspot/url
   ```

2. **Workflow Operations**
   ```bash
   # Test workflow listing (requires authentication)
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" https://api.workflowguard.pro/api/workflows
   ```

3. **Payment Flow**
   ```bash
   # Test payment plan retrieval
   curl https://api.workflowguard.pro/api/payments/plans
   ```

## 📈 Step 9: Performance Optimization

### Database Optimization
```sql
-- Run these queries to optimize database performance
ANALYZE;
REINDEX;
VACUUM;
```

### Cloud Run Optimization
- **Memory**: Start with 1Gi, monitor usage, adjust as needed
- **CPU**: 1 CPU is sufficient for most workloads
- **Concurrency**: Default 80 concurrent requests per instance
- **Auto-scaling**: 0-10 instances based on traffic

## 🚨 Step 10: Incident Response Setup

### Alerting Configuration
1. **Sentry Alerts**: Configure for error rate thresholds
2. **Cloud Monitoring**: Set up uptime checks and alerts
3. **Health Check Monitoring**: Monitor `/api/health/detailed` endpoint

### Backup Strategy
```bash
# Database backup (run daily)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Environment backup
cp .env .env.backup.$(date +%Y%m%d)
```

## ✅ Production Readiness Checklist

- [ ] All environment variables configured
- [ ] Production dependencies installed
- [ ] Application builds successfully
- [ ] Health checks pass
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] Error monitoring configured
- [ ] Logging working
- [ ] Database connected
- [ ] External services accessible
- [ ] SSL certificates valid
- [ ] Domain mapping configured
- [ ] Backup strategy implemented
- [ ] Incident response plan ready

## 🎯 Success Metrics

Your application is production-ready when:
- ✅ Health checks return 200 OK
- ✅ Error rate < 1%
- ✅ Response time < 500ms (95th percentile)
- ✅ Uptime > 99.9%
- ✅ All security scans pass
- ✅ Load testing successful

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance optimization and capacity planning

### Emergency Contacts
- **Sentry**: Real-time error monitoring
- **Google Cloud Console**: Infrastructure monitoring
- **Database Provider**: Database issues

---

🎉 **Congratulations!** Your WorkflowGuard application is now production-ready with enterprise-grade monitoring, security, and reliability features.
