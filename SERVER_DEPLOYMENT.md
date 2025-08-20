# 🖥️ Server Deployment Guide

## 🚀 **Self-Hosted Production Setup**

Your server at `72.60.64.89` is fully configured and ready for deployment.

### **✅ Server Infrastructure Ready**
- **OS**: Ubuntu 22.04.5 LTS
- **Web Server**: Nginx with SSL certificates
- **Security**: Fail2Ban + UFW firewall
- **Monitoring**: Netdata dashboard
- **Container Platform**: Docker + Docker Compose

---

## 📦 **Deployment Methods**

### **Method 1: Automatic CI/CD (Recommended)**

**Setup GitHub Secrets:**
```bash
# In your GitHub repository settings > Secrets and variables > Actions
SERVER_HOST=72.60.64.89
SERVER_USER=root
SERVER_SSH_KEY=<your-private-ssh-key>
```

**Automatic Deployment:**
- Push to `main` branch → Automatic deployment
- Tests run first, then deploys if successful
- Zero-downtime deployment with health checks

### **Method 2: Manual Deployment**

**Quick One-Liner:**
```bash
git pull && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --build
```

**Step-by-Step:**
```bash
# 1. Connect to server
ssh root@72.60.64.89

# 2. Navigate to app directory
cd /opt/workflowguard

# 3. Pull latest code
git pull origin main

# 4. Deploy with production config
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## 🔧 **Initial Server Setup**

**1. Clone Repository:**
```bash
ssh root@72.60.64.89
mkdir -p /opt/workflowguard
cd /opt/workflowguard
git clone https://github.com/YOUR_USERNAME/workflowguard_app.git .
```

**2. Setup Environment:**
```bash
cp .env.production .env
# Edit .env with your production values
```

**3. First Deployment:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 🌐 **Production URLs**

- **Frontend**: `https://workflowguard.pro`
- **API**: `https://api.workflowguard.pro`
- **Monitoring**: `http://72.60.64.89:19999`

---

## 📊 **Monitoring & Health Checks**

### **Service Status:**
```bash
# Check all services
systemctl status nginx fail2ban docker netdata

# Check application containers
docker-compose -f docker-compose.prod.yml ps

# View application logs
docker-compose -f docker-compose.prod.yml logs -f
```

### **Health Endpoints:**
- Backend: `curl http://localhost:4000/health`
- Frontend: `curl http://localhost:3000`
- Nginx: `curl -I https://workflowguard.pro`

### **Netdata Dashboard:**
Access real-time monitoring at: `http://72.60.64.89:19999`

---

## 🛡️ **Security Features**

### **Firewall (UFW):**
```bash
# View current rules
ufw status

# Allowed ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 19999 (Netdata)
```

### **Fail2Ban Protection:**
```bash
# Check jail status
fail2ban-client status

# View banned IPs
fail2ban-client status sshd
```

### **SSL Certificates:**
- Auto-renewal enabled via Let's Encrypt
- Wildcard certificate for `*.workflowguard.pro`

---

## 🔄 **Maintenance Commands**

### **Update System:**
```bash
apt update && apt upgrade -y
```

### **Docker Cleanup:**
```bash
docker system prune -f
docker volume prune -f
```

### **View Logs:**
```bash
# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### **Backup:**
```bash
# Database backup (if using local DB)
docker-compose -f docker-compose.prod.yml exec db pg_dump -U youruser workflowguard > backup.sql

# Application backup
tar -czf workflowguard-backup-$(date +%Y%m%d).tar.gz /opt/workflowguard
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. Containers not starting:**
```bash
docker-compose -f docker-compose.prod.yml logs
```

**2. SSL certificate issues:**
```bash
certbot certificates
nginx -t
systemctl reload nginx
```

**3. Port conflicts:**
```bash
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

**4. Database connection:**
```bash
# Test Neon database connection
docker-compose -f docker-compose.prod.yml exec backend npm run db:test
```

---

## 📈 **Performance Optimization**

### **Production Settings:**
- ✅ Docker containers optimized for production
- ✅ Nginx gzip compression enabled
- ✅ SSL/TLS optimization
- ✅ Security headers configured
- ✅ Rate limiting enabled

### **Scaling Options:**
- **Horizontal**: Add more server instances behind load balancer
- **Vertical**: Upgrade server resources (CPU/RAM)
- **Database**: Neon auto-scales connection pooling

---

## 🎉 **Deployment Complete!**

Your WorkflowGuard application is now:

✅ **Live**: `https://workflowguard.pro`  
✅ **Secure**: SSL + Firewall + Fail2Ban  
✅ **Monitored**: Netdata real-time monitoring  
✅ **Automated**: CI/CD pipeline ready  
✅ **Scalable**: Docker-based architecture  

**Ready for production traffic! 🚀**
