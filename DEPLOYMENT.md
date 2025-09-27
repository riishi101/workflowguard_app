# WorkflowGuard - Google Cloud Deployment Guide

## 🚀 **Deployment Status**

### ✅ **Production URLs**
- **Frontend**: https://www.workflowguard.pro
- **Backend API**: https://api.workflowguard.pro

### 🏗️ **Infrastructure**
- **Google Cloud Project**: `continual-mind-473007-h8`
- **Region**: `us-central1` (Global access enabled)
- **Artifact Registry**: `workflowguard-containers`
- **Database**: Cloud SQL PostgreSQL 15
- **Services**: Auto-scaling Cloud Run

## 🔐 **Security & Environment Setup**

### **Environment Variables Setup**

1. **Copy the template file:**
   ```bash
   cp .env.backend.template .env.backend
   ```

2. **Fill in your actual credentials** in `.env.backend`:
   - Replace all `YOUR_*` placeholders with real values
   - Update database password, API keys, etc.

3. **Cloud Build Environment Variables:**
   The following variables need to be set in Google Cloud Build:
   ```bash
   # Set these in Google Cloud Console > Cloud Build > Settings > Environment Variables
   DATABASE_PASSWORD=your_db_password
   HUBSPOT_CLIENT_ID=your_hubspot_client_id
   HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
   ```

## 🌐 **Domain Configuration**

### **DNS Records** (Hostinger)
```
Type: TXT
Name: @
Value: google-site-verification=XTrm37Nu2sbnSRXVUTWnfUtxNJ9fJixUt8TlxnbakCI

Type: CNAME
Name: www
Value: ghs.googlehosted.com

Type: CNAME
Name: api
Value: ghs.googlehosted.com
```

### **Domain Mappings**
- ✅ `www.workflowguard.pro` → `workflowguard-frontend`
- ✅ `api.workflowguard.pro` → `workflowguard-backend`

## 🔧 **Deployment Commands**

### **Manual Deployment**
```bash
# Deploy with Cloud Build
gcloud builds submit --config=cloudbuild.yaml

# Deploy backend only
gcloud run deploy workflowguard-backend \
  --image=us-central1-docker.pkg.dev/continual-mind-473007-h8/workflowguard-containers/workflowguard-backend:latest \
  --region=us-central1
```

### **Local Development**
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run start:dev
```

## 📊 **Monitoring & Logs**

### **Google Cloud Console URLs**
- **Services**: https://console.cloud.google.com/run?project=continual-mind-473007-h8
- **Build History**: https://console.cloud.google.com/cloud-build/builds?project=continual-mind-473007-h8
- **Database**: https://console.cloud.google.com/sql/instances?project=continual-mind-473007-h8
- **Logs**: https://console.cloud.google.com/logs/query?project=continual-mind-473007-h8

### **Quick Status Check**
```bash
# Check services
gcloud run services list --region=us-central1

# Check domain mappings
gcloud beta run domain-mappings list --region=us-central1

# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit=10
```

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Traffic  │───▶│  Google Cloud    │───▶│  Cloud Run      │
│   (Global)      │    │  Load Balancer   │    │  Services       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Custom Domains  │    │  Cloud SQL      │
                       │  SSL Certificates│    │  PostgreSQL     │
                       └──────────────────┘    └─────────────────┘
```

## 🔍 **Troubleshooting**

### **Common Issues**
1. **SSL Certificate Issues**: Wait 5-15 minutes for provisioning
2. **Domain Not Working**: Check DNS propagation with `nslookup`
3. **Backend Errors**: Check Cloud SQL connection and environment variables

### **Useful Commands**
```bash
# Check DNS
nslookup www.workflowguard.pro
nslookup api.workflowguard.pro

# Test endpoints
curl -I https://www.workflowguard.pro
curl -I https://api.workflowguard.pro/api/health
```

## 📝 **Development Notes**

- **Build System**: Multi-stage Docker builds with Cloud Build
- **Database**: Cloud SQL with connection pooling
- **Security**: Environment variables for secrets, no hardcoded credentials
- **Scaling**: Auto-scaling based on traffic with 0-10 instances
- **Global Access**: Single region deployment with global edge network

## 🚀 **Next Steps**

1. **Set up CI/CD**: Automatic deployments on git push
2. **Add Monitoring**: Set up alerting and metrics
3. **Performance Optimization**: Enable Cloud CDN
4. **Security Hardening**: Add WAF and additional security layers

---

**For support or questions, check the logs or contact the development team.**