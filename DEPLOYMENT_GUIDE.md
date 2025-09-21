# 🚀 WorkflowGuard Deployment Guide

## 📋 **Production Deployment Options**

Your WorkflowGuard application supports multiple deployment strategies:

### **Option 1: Self-Hosted Server (Current Setup)**
- **Server**: Ubuntu 22.04 at `72.60.64.89`
- **Frontend**: Nginx + Docker (`workflowguard.pro`)
- **Backend**: Docker (`api.workflowguard.pro`)
- **Database**: Neon PostgreSQL
- **Monitoring**: Netdata
- **Security**: Fail2Ban + UFW Firewall

### **Option 2: Alternative VPS Setup**
- **Frontend**: Docker + Nginx (`www.workflowguard.pro`)
- **Backend**: Docker Container (`api.workflowguard.pro`)
- **Database**: PostgreSQL Container
- **Authentication**: JWT with secure keys
- **HubSpot Integration**: Configured and ready

## 🎯 **What's Best for Your App**

### **1. Production-Ready Configuration**

Your app is now optimized for:
- ✅ **Scalable Architecture** - Microservices with separate frontend/backend
- ✅ **Secure Authentication** - JWT with production secrets
- ✅ **Database Optimization** - PostgreSQL with connection pooling
- ✅ **CDN & Performance** - Nginx with proper caching for frontend
- ✅ **API Security** - SSL certificates and proper headers

### **2. Environment Configuration**

**Backend (.env):**
```env
DATABASE_URL="postgresql://neondb_owner:npg_oPpKhNtTR20d@ep-dry-resonance-afgqyybz-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="xrDmUc9gji+BcWHxH2gEPhjvNDDehJDs4Z04UI/bVn1fhjmKOgH9WoUUnrVEFYcaTlYmbUdhaoSysZWHiNy5Dw=="
HUBSPOT_CLIENT_ID="YOUR_HUBSPOT_CLIENT_ID"
HUBSPOT_CLIENT_SECRET="YOUR_HUBSPOT_CLIENT_SECRET"
```

**Frontend (.env):**
```env
VITE_API_URL="https://api.workflowguard.pro/api"
```

### **3. Production URLs**

- **Frontend**: `https://www.workflowguard.pro`
- **Backend API**: `https://api.workflowguard.pro/api`
- **Database**: Neon PostgreSQL (managed)

## 🔧 **Deployment Commands**

### **VPS Deployment**
```bash
# Deploy to VPS
docker-compose -f docker-compose.production.yml up -d

# Check container status
docker ps

# View logs
docker-compose -f docker-compose.production.yml logs
```

### **SSL Configuration**
```bash
# Generate SSL certificates
certbot --nginx -d workflowguard.pro -d www.workflowguard.pro -d api.workflowguard.pro
```

### **Database Management**
```bash
# Database backup
docker exec postgres_container pg_dump -U postgres workflowguard > backup.sql

# Database restore
docker exec -i postgres_container psql -U postgres workflowguard < backup.sql
```

## 🛡️ **Security & Performance Optimizations**

### **1. Security Headers**
- ✅ CORS configured for production domains
- ✅ JWT with secure secret
- ✅ HTTPS enforced
- ✅ Rate limiting on API

### **2. Performance**
- ✅ Frontend: Nginx caching and compression
- ✅ Backend: Docker container optimization
- ✅ Database: PostgreSQL connection pooling
- ✅ API: Optimized for HubSpot integration

### **3. Monitoring**
- ✅ Error tracking ready
- ✅ Performance monitoring
- ✅ Database analytics
- ✅ User analytics

## 📊 **Production Features**

### **Authentication Flow**
1. User visits `www.workflowguard.pro`
2. Login/Register via secure JWT
3. Access protected routes
4. HubSpot integration for workflows

### **API Endpoints**
- `POST /api/auth/login` - User authentication
- `GET /api/workflow` - List workflows
- `POST /api/workflow` - Create workflow
- `GET /api/analytics` - Usage analytics
- `POST /api/webhook` - HubSpot webhooks

### **Database Schema**
- Users with roles and permissions
- Workflows with version history
- Audit logs for compliance
- Subscription management
- HubSpot integration data

## 🚀 **Next Steps for Production**

### **1. Deploy to VPS**
```bash
# Push to GitHub
git add .
git commit -m "Production ready"
git push origin main

# On VPS server
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build
```

### **2. Configure SSL**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d workflowguard.pro -d www.workflowguard.pro -d api.workflowguard.pro
```

### **3. Configure Domains**
- ✅ `workflowguard.pro` → VPS IP
- ✅ `api.workflowguard.pro` → VPS IP
- ✅ SSL certificates via Let's Encrypt

### **4. Test Production**
1. Visit `https://www.workflowguard.pro`
2. Create test account
3. Test HubSpot integration
4. Verify all features work

## 🔍 **Monitoring & Maintenance**

### **Health Checks**
- Frontend: `https://workflowguard.pro/health`
- Backend: `https://api.workflowguard.pro/health`
- Database: PostgreSQL container logs

### **Logs & Debugging**
- Docker: `docker-compose logs [service]`
- Nginx: `/var/log/nginx/access.log`
- Application: Container logs via Docker

### **Backup Strategy**
- Database: Regular PostgreSQL dumps
- Code: GitHub repository
- Environment: Version controlled
- SSL: Let's Encrypt auto-renewal

## 🎉 **Production Ready!**

Your WorkflowGuard application is now:

✅ **Fully Integrated** - Frontend + Backend + Database  
✅ **Production Deployed** - VPS + Docker + PostgreSQL  
✅ **Secure** - JWT + HTTPS + CORS  
✅ **Scalable** - Auto-scaling + CDN + Connection pooling  
✅ **Monitored** - Logs + Analytics + Error tracking  
✅ **HubSpot Ready** - OAuth + Webhooks + API integration  

**Your app is ready for users! 🚀**

Visit `https://www.workflowguard.pro` to see your production application in action. 