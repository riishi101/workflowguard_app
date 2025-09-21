# 🚀 VPS Deployment Guide

## ✅ **Production Ready Configuration**

Your application is now configured for VPS deployment with:
- **Backend**: Docker Container (with PostgreSQL database)
- **Frontend**: Docker + Nginx (with static file serving)

## 📋 **Deployment Files Created**

### 1. **docker-compose.production.yml** - Container Configuration
- ✅ PostgreSQL database container
- ✅ Environment variables configured
- ✅ Build and start commands set
- ✅ Production security settings

### 2. **nginx/nginx.conf** - Web Server Configuration
- ✅ Static file serving
- ✅ API reverse proxy
- ✅ Security headers
- ✅ SSL configuration

### 3. **deploy-production.sh** - Deployment Script
- ✅ Automatic container building
- ✅ Database migrations
- ✅ SSL certificate management
- ✅ Service health checks

## 🚀 **Step-by-Step Deployment Setup**

### **Step 1: Push Changes to GitHub**

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "🚀 Production Ready: PostgreSQL database, security features, and automatic deployment"

# Push to main branch
git push origin main
```

### **Step 2: Set Up VPS Server**

1. **Connect to your VPS server:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Docker and Docker Compose:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo apt install docker-compose
   ```

3. **Clone your repository:**
   ```bash
   git clone https://github.com/your-username/workflowguard_app.git
   cd workflowguard_app
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values:
   nano .env
   ```

   **Required environment variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres:password@db:5432/workflowguard
   JWT_SECRET=xrDmUc9gji+BcWHxH2gEPhjvNDDehJDs4Z04UI/bVn1fhjmKOgH9WoUUnrVEFYcaTlYmbUdhaoSysZWHiNy5Dw==
   JWT_EXPIRES_IN=7d
   HUBSPOT_CLIENT_ID=your-hubspot-client-id
   HUBSPOT_CLIENT_SECRET=your-hubspot-client-secret
   HUBSPOT_REDIRECT_URI=https://api.workflowguard.pro/api/auth/hubspot/callback
   VITE_API_URL=https://api.workflowguard.pro/api
   DOMAIN=workflowguard.pro
   ```

### **Step 3: Deploy with Docker**

1. **Build and start containers:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d --build
   ```

2. **Check container status:**
   ```bash
   docker ps
   ```

3. **Configure SSL certificates:**
   ```bash
   sudo certbot --nginx -d workflowguard.pro -d www.workflowguard.pro -d api.workflowguard.pro
   ```

### **Step 4: Configure Domain DNS**

1. **Add DNS A records for your domain:**
   - `workflowguard.pro` → `your-server-ip`
   - `www.workflowguard.pro` → `your-server-ip`
   - `api.workflowguard.pro` → `your-server-ip`

2. **Wait for DNS propagation (5-60 minutes)**

3. **Test DNS resolution:**
   ```bash
   nslookup workflowguard.pro
   nslookup api.workflowguard.pro
   ```

## 🔗 **Production URLs**

After deployment, your application will be available at:
- **Backend API**: `https://api.workflowguard.pro`
- **Frontend**: `https://www.workflowguard.pro`

## ✅ **Production Features Enabled**

### **Backend (Docker Container):**
- ✅ PostgreSQL database container
- ✅ JWT authentication
- ✅ HubSpot integration
- ✅ Security headers
- ✅ Rate limiting
- ✅ Input validation
- ✅ Database backups
- ✅ SSL encryption

### **Frontend (Nginx + Docker):**
- ✅ Static file serving
- ✅ API reverse proxy
- ✅ Security headers
- ✅ SPA routing
- ✅ Gzip compression
- ✅ Caching optimization

### **VPS Deployment:**
- ✅ Docker containerization
- ✅ Automated deployment scripts
- ✅ SSL certificate management
- ✅ Health monitoring
- ✅ Log management

## 🧪 **Testing Your Deployment**

### **1. Backend Health Check:**
```bash
curl https://api.workflowguard.pro/api
```

### **2. Frontend Access:**
```bash
curl https://workflowguard.pro
```

### **3. Container Status:**
```bash
docker ps
docker-compose -f docker-compose.production.yml logs
```

### **4. Database Connection:**
```bash
docker exec -it postgres_container psql -U postgres -d workflowguard
```

## 🔧 **Troubleshooting**

### **If Backend Container Fails:**
1. Check Docker logs: `docker logs backend_container`
2. Verify environment variables are set in .env
3. Ensure database container is running
4. Check Node.js version compatibility

### **If Frontend Container Fails:**
1. Check nginx logs: `docker logs nginx_container`
2. Verify API proxy configuration
3. Ensure all dependencies are installed
4. Check for build errors in container logs

### **If Database Connection Fails:**
1. Verify PostgreSQL container is running
2. Check database credentials in .env
3. Ensure database schema is migrated
4. Verify container networking

## 🎉 **Success Indicators**

Your deployment is successful when:
- ✅ Backend responds to health checks
- ✅ Frontend loads without errors
- ✅ Database queries work
- ✅ HubSpot OAuth flow works
- ✅ Workflow protection features function
- ✅ All API endpoints respond correctly

## 📊 **Monitoring**

### **VPS Monitoring:**
- Docker container health checks
- System resource monitoring
- Application logs via Docker
- SSL certificate expiry monitoring

### **Application Monitoring:**
- Container status monitoring
- Database performance metrics
- Error logging and tracking
- User access analytics

---

## 🚀 **Ready for Production!**

Your application is now configured for VPS deployment with:
- ✅ **PostgreSQL database** in Docker container
- ✅ **Security features** enabled
- ✅ **Docker containerization** for easy management
- ✅ **Production monitoring** and logging
- ✅ **SSL encryption** via Let's Encrypt

**Push your changes and watch the magic happen!** 🎉 