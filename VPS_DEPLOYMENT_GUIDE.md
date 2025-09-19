# 🚀 WorkflowGuard VPS Deployment Guide

## 📋 Overview
This guide will help you deploy WorkflowGuard to your Hostinger VPS (145.79.0.218) using Docker containers with Nginx reverse proxy and SSL certificates.

## 🖥️ VPS Specifications
- **IP Address:** 145.79.0.218
- **OS:** Ubuntu 22.04 LTS
- **RAM:** 4 GB (perfect for WorkflowGuard)
- **Storage:** 50 GB
- **Firewall:** Ports 80, 443, 22 open

## 🏗️ Architecture
```
Internet → Nginx (Port 80/443) → Docker Containers
                                ├── Frontend (React)
                                ├── Backend (NestJS)
                                └── Database (PostgreSQL)
```

## 🚀 Deployment Steps

### 1. 📡 Update DNS Records
Point your domains to the VPS IP:
```
workflowguard.pro        A    145.79.0.218
www.workflowguard.pro    A    145.79.0.218
api.workflowguard.pro    A    145.79.0.218
```

### 2. 🔐 SSH into VPS
```bash
ssh root@145.79.0.218
```

### 3. 👤 Create Non-Root User (Security Best Practice)
```bash
adduser workflowguard
usermod -aG sudo workflowguard
su - workflowguard
```

### 4. 📂 Upload Deployment Files
Upload these files to your VPS:
- `docker-compose.production.yml`
- `deploy-vps.sh`
- `.env.vps`
- `nginx/` directory
- `backend/Dockerfile.production`
- `frontend/Dockerfile.production`

### 5. 🔧 Configure Environment Variables
```bash
cp .env.vps .env
nano .env
```

**Update these critical values:**
```env
POSTGRES_PASSWORD=your_secure_postgres_password_here
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret_here
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
```

### 6. 🚀 Run Deployment Script
```bash
chmod +x deploy-vps.sh
./deploy-vps.sh
```

The script will:
- ✅ Install Docker & Docker Compose
- ✅ Install Nginx
- ✅ Install Certbot for SSL
- ✅ Clone your repository
- ✅ Generate SSL certificates
- ✅ Build and start containers
- ✅ Setup automatic backups
- ✅ Configure log rotation

## 🔍 Verification

### Check Services
```bash
# Check Docker containers
docker-compose -f docker-compose.production.yml ps

# Check Nginx status
sudo systemctl status nginx

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Test Endpoints
- **Frontend:** https://workflowguard.pro
- **Backend Health:** https://api.workflowguard.pro/api/health
- **Backend API:** https://api.workflowguard.pro/api

## 🛠️ Management Commands

### Update Application
```bash
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build
```

### Restart Services
```bash
docker-compose -f docker-compose.production.yml restart
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
```

### Database Backup
```bash
./backup.sh
```

### SSL Certificate Renewal (Automatic)
```bash
# Manual renewal (if needed)
sudo certbot renew
```

## 🔒 Security Features

### Firewall Configuration
- ✅ Port 80 (HTTP) - Redirects to HTTPS
- ✅ Port 443 (HTTPS) - Main application
- ✅ Port 22 (SSH) - Server access
- ❌ Port 3000/3001 - Blocked (containers only)

### SSL/TLS Security
- ✅ Let's Encrypt certificates
- ✅ TLS 1.2 & 1.3 only
- ✅ Strong cipher suites
- ✅ HSTS headers
- ✅ Security headers (XSS, CSRF protection)

### Application Security
- ✅ Non-root Docker containers
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ JWT authentication
- ✅ Input validation

## 📊 Monitoring

### Resource Usage
```bash
# System resources
htop

# Docker resources
docker stats

# Disk usage
df -h
```

### Log Files
- **Nginx:** `/var/log/nginx/`
- **Application:** `docker-compose logs`
- **System:** `/var/log/syslog`

## 🔄 Backup Strategy

### Automated Daily Backups (2 AM)
- ✅ Database dump
- ✅ Application files
- ✅ 7-day retention
- ✅ Stored in `/home/workflowguard/backups/`

### Manual Backup
```bash
./backup.sh
```

## 🚨 Troubleshooting

### Common Issues

**1. SSL Certificate Issues**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

**2. Database Connection Issues**
```bash
docker-compose -f docker-compose.production.yml logs postgres
docker-compose -f docker-compose.production.yml exec postgres psql -U workflowguard -d workflowguard
```

**3. Container Issues**
```bash
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

**4. Nginx Configuration Issues**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📈 Performance Optimization

### Current VPS Usage
- **CPU:** 1% (excellent headroom)
- **Memory:** 24% (~1GB used, 3GB free)
- **Perfect for production workload**

### Scaling Options
- ✅ Vertical scaling (upgrade VPS)
- ✅ Database optimization
- ✅ CDN integration
- ✅ Load balancing (multiple VPS)

## 🎯 Migration Benefits

### Compared to Render/Vercel
- ✅ **No Sleep Timeouts** - Always available
- ✅ **Better Performance** - Dedicated resources
- ✅ **Cost Effective** - Fixed monthly cost
- ✅ **Full Control** - Complete server access
- ✅ **Custom Configuration** - Nginx, SSL, etc.

### Reliability Improvements
- ✅ **99.9% Uptime** - No cloud provider dependencies
- ✅ **Instant Response** - No cold starts
- ✅ **Professional UX** - Consistent performance
- ✅ **Data Control** - Your server, your data

## 📞 Support

### Useful Resources
- **Hostinger Support:** Available 24/7
- **Docker Documentation:** https://docs.docker.com/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/

### Emergency Commands
```bash
# Stop all services
docker-compose -f docker-compose.production.yml down

# Emergency restart
sudo reboot

# Check system status
systemctl status nginx docker
```

---

**🎉 Your WorkflowGuard application is now deployed on a professional VPS with enterprise-grade security, performance, and reliability!**
