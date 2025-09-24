# 🚀 WorkflowGuard Google Cloud Deployment Guide

## Overview
This guide will help you deploy WorkflowGuard to Google Cloud using Cloud Run, Cloud SQL, and Cloud Build for a production-ready, scalable deployment.

## 🏗️ Architecture
- **Frontend**: Cloud Run (React/Vite app with nginx)
- **Backend**: Cloud Run (NestJS API)
- **Database**: Cloud SQL (PostgreSQL)
- **Build**: Cloud Build (CI/CD pipeline)
- **Storage**: Cloud Storage (for static assets)

## 📋 Prerequisites

### 1. Google Cloud Setup
```bash
# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Create Cloud SQL Database
```bash
# Create PostgreSQL instance
gcloud sql instances create workflowguard-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00

# Create database
gcloud sql databases create workflowguard --instance=workflowguard-db

# Create database user
gcloud sql users create workflowguard-user \
  --instance=workflowguard-db \
  --password=YOUR_SECURE_PASSWORD
```

### 3. Store Secrets in Secret Manager
```bash
# Store database URL
echo "postgresql://workflowguard-user:YOUR_SECURE_PASSWORD@/workflowguard?host=/cloudsql/YOUR_PROJECT_ID:us-central1:workflowguard-db" | \
gcloud secrets create DATABASE_URL --data-file=-

# Store JWT Secret
echo "xrDmUc9gji+BcWHxH2gEPhjvNDDehJDs4Z04UI/bVn1fhjmKOgH9WoUUnrVEFYcaTlYmbUdhaoSysZWHiNy5Dw==" | \
gcloud secrets create JWT_SECRET --data-file=-

# Store HubSpot credentials
echo "5e6a6429-8317-4e2a-a9b5-46e8669f72f6" | gcloud secrets create HUBSPOT_CLIENT_ID --data-file=-
echo "07f931e2-bc75-4686-a9cf-c1d464c55019" | gcloud secrets create HUBSPOT_CLIENT_SECRET --data-file=-

# Store Razorpay credentials
echo "rzp_live_R6PjXR1FYupO0Y" | gcloud secrets create RAZORPAY_KEY_ID --data-file=-
echo "O5McpwbAgoiSNMJDQetruaTK" | gcloud secrets create RAZORPAY_KEY_SECRET --data-file=-

# Store Twilio credentials
echo "ACbee0672c967962b2212e68bf188771d2" | gcloud secrets create TWILIO_ACCOUNT_SID --data-file=-
echo "b80c34629dd5c41c26355dc6d60bca88" | gcloud secrets create TWILIO_AUTH_TOKEN --data-file=-
```

## 🚀 Deployment Steps

### 1. Build and Deploy with Cloud Build
```bash
# Submit build to Cloud Build
gcloud builds submit --config=cloudbuild.yaml .

# This will:
# - Build Docker images for frontend and backend
# - Push images to Container Registry
# - Deploy both services to Cloud Run
```

### 2. Configure Environment Variables
```bash
# Update backend service with environment variables
gcloud run services update workflowguard-backend \
  --region=us-central1 \
  --set-env-vars="NODE_ENV=production,PORT=4000" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,HUBSPOT_CLIENT_ID=HUBSPOT_CLIENT_ID:latest,HUBSPOT_CLIENT_SECRET=HUBSPOT_CLIENT_SECRET:latest,RAZORPAY_KEY_ID=RAZORPAY_KEY_ID:latest,RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest,TWILIO_ACCOUNT_SID=TWILIO_ACCOUNT_SID:latest,TWILIO_AUTH_TOKEN=TWILIO_AUTH_TOKEN:latest" \
  --add-cloudsql-instances=YOUR_PROJECT_ID:us-central1:workflowguard-db

# Update frontend service
gcloud run services update workflowguard-frontend \
  --region=us-central1 \
  --set-env-vars="NODE_ENV=production"
```

### 3. Set Up Custom Domain (Optional)
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service=workflowguard-frontend \
  --domain=workflowguard.pro \
  --region=us-central1

gcloud run domain-mappings create \
  --service=workflowguard-backend \
  --domain=api.workflowguard.pro \
  --region=us-central1
```

### 4. Run Database Migrations
```bash
# Get backend service URL
BACKEND_URL=$(gcloud run services describe workflowguard-backend --region=us-central1 --format="value(status.url)")

# Run migrations (you may need to create a migration endpoint or use Cloud Shell)
# Option 1: Create a migration Cloud Function
# Option 2: Use Cloud Shell with database proxy
gcloud sql connect workflowguard-db --user=workflowguard-user
```

## 🔧 Configuration Files

### Environment Variables for Production
Create these in Secret Manager or as environment variables:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://workflowguard-user:PASSWORD@/workflowguard?host=/cloudsql/PROJECT_ID:us-central1:workflowguard-db
HUBSPOT_CLIENT_ID=5e6a6429-8317-4e2a-a9b5-46e8669f72f6
HUBSPOT_CLIENT_SECRET=07f931e2-bc75-4686-a9cf-c1d464c55019
HUBSPOT_REDIRECT_URI=https://api.workflowguard.pro/api/auth/hubspot/callback
JWT_SECRET=xrDmUc9gji+BcWHxH2gEPhjvNDDehJDs4Z04UI/bVn1fhjmKOgH9WoUUnrVEFYcaTlYmbUdhaoSysZWHiNy5Dw==
RAZORPAY_KEY_ID=rzp_live_R6PjXR1FYupO0Y
RAZORPAY_KEY_SECRET=O5McpwbAgoiSNMJDQetruaTK
TWILIO_ACCOUNT_SID=ACbee0672c967962b2212e68bf188771d2
TWILIO_AUTH_TOKEN=b80c34629dd5c41c26355dc6d60bca88
```

## 📊 Monitoring and Scaling

### 1. Set Up Monitoring
```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime checks
gcloud alpha monitoring uptime create \
  --display-name="WorkflowGuard Frontend" \
  --http-check-path="/" \
  --hostname="workflowguard.pro"
```

### 2. Configure Auto-scaling
```bash
# Update backend scaling
gcloud run services update workflowguard-backend \
  --region=us-central1 \
  --min-instances=1 \
  --max-instances=100 \
  --concurrency=80 \
  --cpu=2 \
  --memory=2Gi

# Update frontend scaling
gcloud run services update workflowguard-frontend \
  --region=us-central1 \
  --min-instances=1 \
  --max-instances=50 \
  --concurrency=100 \
  --cpu=1 \
  --memory=512Mi
```

## 💰 Cost Optimization

### Free Tier Limits
- **Cloud Run**: 2 million requests/month free
- **Cloud SQL**: f1-micro instance eligible for free tier
- **Cloud Build**: 120 build-minutes/day free
- **Secret Manager**: 6 active secrets free

### Estimated Monthly Costs
- **Cloud SQL (f1-micro)**: ~$7/month
- **Cloud Run**: Pay per use (likely $0-20/month for moderate traffic)
- **Cloud Build**: $0.003/build-minute after free tier
- **Total**: ~$10-30/month for small to medium usage

## 🔄 CI/CD Pipeline

### Automatic Deployments
```yaml
# .github/workflows/deploy.yml
name: Deploy to Google Cloud
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - run: gcloud builds submit --config=cloudbuild.yaml .
```

## 🛠 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure Cloud SQL proxy is configured
2. **Environment Variables**: Check Secret Manager permissions
3. **Build Failures**: Verify Dockerfile syntax and dependencies
4. **CORS Issues**: Update frontend API URLs to match backend service URL

### Useful Commands
```bash
# View service logs
gcloud logs read --service=workflowguard-backend --limit=50

# Check service status
gcloud run services describe workflowguard-backend --region=us-central1

# Update service
gcloud run services replace service.yaml --region=us-central1
```

## 🎉 Success!

After following this guide, you'll have:
- ✅ Scalable, serverless architecture
- ✅ Managed PostgreSQL database
- ✅ Automatic HTTPS and SSL certificates
- ✅ CI/CD pipeline for automatic deployments
- ✅ Production-ready monitoring and logging
- ✅ Cost-effective pay-per-use pricing

Your WorkflowGuard app will be accessible at:
- **Frontend**: https://workflowguard.pro
- **Backend API**: https://api.workflowguard.pro

## 📞 Support
For deployment issues, check the troubleshooting section or refer to Google Cloud documentation.
