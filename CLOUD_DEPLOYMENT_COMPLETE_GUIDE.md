# 🚀 WorkflowGuard VPS Deployment - Complete Guide

## 🎯 Overview: Production VPS Deployment

**Current deployment architecture on VPS:**
- ✅ Reliable VPS hosting with full control
- ✅ Docker containerization for easy management
- ✅ Nginx reverse proxy with SSL certificates
- ✅ PostgreSQL database with proper backup

## 📋 Deployment Architecture

```
Frontend (React + Vite) → Docker + Nginx
Backend (NestJS) → Docker Container
Database (PostgreSQL) → Docker Container
```

## 🚀 Step-by-Step VPS Deployment

### Phase 1: Server Setup

1. **Prepare VPS server:**
   - Ubuntu 22.04 LTS
   - Docker and Docker Compose installed
   - Firewall configured (ports 80, 443, 22)

2. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/workflowguard_app.git
   cd workflowguard_app
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

### Phase 2: Docker Deployment

1. **Build and start containers:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

2. **Configure SSL certificates:**
   ```bash
   # SSL certificates via Let's Encrypt
   certbot --nginx -d workflowguard.pro -d www.workflowguard.pro
   ```

### Phase 3: Domain Configuration

1. **DNS Settings:**
   - A record: workflowguard.pro → VPS IP
   - A record: www.workflowguard.pro → VPS IP
   - A record: api.workflowguard.pro → VPS IP

## 🔗 Final URLs Structure

```
Frontend: https://workflowguard.pro
Backend:  https://api.workflowguard.pro
Database: PostgreSQL (Docker container)
```

## 🎯 Production Domains

### Main Application
- Frontend: `https://workflowguard.pro`
- API: `https://api.workflowguard.pro`
- SSL: Let's Encrypt certificates
- Reverse Proxy: Nginx

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Prepare VPS server (Ubuntu 22.04 LTS)
- [ ] Install Docker and Docker Compose
- [ ] Configure firewall (ports 80, 443, 22)
- [ ] Set up domain DNS records

### VPS Backend
- [ ] PostgreSQL container deployed
- [ ] Backend service deployed
- [ ] All environment variables configured
- [ ] Database migrations successful
- [ ] API endpoints responding
- [ ] SSL certificates configured

### VPS Frontend
- [ ] Frontend container deployed successfully
- [ ] Nginx reverse proxy configured
- [ ] Static files serving correctly
- [ ] HubSpot OAuth working
- [ ] SSL certificates working

### Final Testing
- [ ] Frontend loads correctly
- [ ] User authentication works
- [ ] HubSpot integration functional
- [ ] Payment processing works
- [ ] All API endpoints responding
- [ ] HTTPS working on both domains

## 🔧 Environment Variables Summary

### Frontend Environment (.env)
```bash
VITE_API_URL=https://api.workflowguard.pro
VITE_HUBSPOT_CLIENT_ID=5e6a6429-8317-4e2a-a9b5-46e8669f72f6
VITE_RAZORPAY_KEY_ID=rzp_live_R6PjXR1FYupO0Y
```

### Backend Environment (.env)
```bash
DATABASE_URL=postgresql://postgres:password@db:5432/workflowguard
HUBSPOT_REDIRECT_URI=https://workflowguard.pro/auth/callback
JWT_SECRET=your-secure-jwt-secret
RAZORPAY_KEY_SECRET=your-razorpay-secret
# ... (all other production variables)
```

## 🎉 Benefits of VPS Architecture

### Reliability
- ✅ Full control over server resources
- ✅ Predictable performance
- ✅ No vendor lock-in

### Maintenance
- ✅ Complete server control
- ✅ Custom security configurations
- ✅ Let's Encrypt SSL certificates
- ✅ Docker containerization for easy management

### Scalability
- ✅ Vertical scaling by upgrading VPS
- ✅ Horizontal scaling by adding servers
- ✅ Load balancing capabilities

### Developer Experience
- ✅ Direct server access for debugging
- ✅ Custom deployment scripts
- ✅ Full log access
- ✅ Easy rollbacks via Docker

## 🚨 VPS Deployment Complete!

Your WorkflowGuard app is now running on reliable VPS infrastructure with:
- **Frontend:** Docker + Nginx (HTTPS, caching, compression)
- **Backend:** Docker Container (NestJS, auto-restart)
- **Database:** PostgreSQL Container (persistent storage, backups)

**Full control over your infrastructure! 🎉**
