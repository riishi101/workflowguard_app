# 🚀 WorkflowGuard VPS Deployment Checklist

## ✅ Pre-Deployment Checklist

### VPS Requirements
- [x] Hostinger VPS (145.79.0.218) - 4GB RAM, 50GB Storage
- [x] Ubuntu 22.04 LTS installed
- [x] Firewall configured (Ports 80, 443, 22)
- [x] SSH access configured

### Application Files
- [x] Docker Compose configuration created
- [x] Backend Dockerfile.production created
- [x] Frontend Dockerfile.production created
- [x] Nginx configuration created
- [x] Environment variables configured (.env.vps)
- [x] Deployment script created (deploy-vps.sh)

### Credentials Verified
- [x] HubSpot Client ID/Secret configured
- [x] Razorpay Live credentials configured
- [x] JWT Secret configured
- [x] Database credentials configured
- [x] Twilio credentials configured

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Configure DNS Records
Update your domain DNS settings:
```
workflowguard.pro        A    145.79.0.218
www.workflowguard.pro    A    145.79.0.218
api.workflowguard.pro    A    145.79.0.218
```

### Step 3: SSH into VPS and Deploy
```bash
# SSH into your VPS
ssh root@145.79.0.218

# Create non-root user
adduser workflowguard
usermod -aG sudo workflowguard
su - workflowguard

# Upload deployment files to VPS
# Copy all files from your local machine to /home/workflowguard/workflowguard/

# Run deployment script
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Step 4: Verify Deployment
Test your endpoints:
- Frontend: https://workflowguard.pro
- Backend API: https://api.workflowguard.pro/api/health
- Backend Status: https://api.workflowguard.pro/api

## 🔧 Post-Deployment Tasks

### Database Setup
```bash
# After backend is deployed, run database migrations
npx prisma db push
npx prisma db seed
```

### Testing
- [ ] Test backend API endpoints
- [ ] Test frontend application
- [ ] Test user registration/login
- [ ] Test workflow creation
- [ ] Test HubSpot integration

## 📊 Monitoring
- [ ] Set up error monitoring (Sentry)
- [ ] Set up performance monitoring
- [ ] Configure logging
- [ ] Set up health checks

## 🔒 Security
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Configure security headers 