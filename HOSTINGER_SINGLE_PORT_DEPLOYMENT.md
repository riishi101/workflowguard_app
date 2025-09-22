# 🚀 WorkflowGuard Hostinger Single-Port Deployment Guide

## 🚨 **CRITICAL: Hostinger VPS Limitation**

**Hostinger VPS allows only ONE active port at a time:**
- ✅ Port 443 (HTTPS) - **ACTIVE**
- ❌ Port 80 (HTTP) - Disabled when 443 is active
- ❌ Port 22 (SSH) - Disabled when 443 is active

This deployment is configured for **HTTPS-only operation**.

## 📋 Prerequisites

### VPS Configuration
- **Server**: Hostinger VPS (145.79.0.218)
- **OS**: Ubuntu 22.04 LTS
- **Firewall**: Only Port 443 active ✅
- **SSH Access**: Use Hostinger Browser Terminal (not SSH)

### Domain Configuration
- **Frontend**: `workflowguard.pro` → 145.79.0.218
- **API**: `api.workflowguard.pro` → 145.79.0.218
- **DNS A Records**: Both domains pointing to your VPS IP

## 🔧 Environment Setup

### 1. Update Environment Variables

Your production credentials are already configured in `.env.vps`:

```bash
# Copy VPS environment template
cp .env.vps .env
```

**✅ All credentials are already set:**
- HubSpot: `5e6a6429-8317-4e2a-a9b5-46e8669f72f6`
- Razorpay: `rzp_live_R6PjXR1FYupO0Y`
- Twilio: `ACbee0672c967962b2212e68bf188771d2`

## 🚀 Deployment Steps

### Step 1: Access VPS via Browser Terminal

**⚠️ IMPORTANT**: Use Hostinger Browser Terminal, not SSH
- SSH is disabled when port 443 is active
- Access via Hostinger control panel → Browser Terminal

### Step 2: Clone Repository

```bash
git clone https://github.com/riishi101/workflowguard_app.git
cd workflowguard_app
```

### Step 3: Configure Environment

```bash
# Copy production environment
cp .env.vps .env

# Verify credentials (all should be set)
cat .env
```

### Step 4: Run Hostinger Deployment Script

```bash
# Make script executable
chmod +x deploy-hostinger.sh

# Run deployment
./deploy-hostinger.sh
```

The script will:
1. ✅ Install Docker & Docker Compose
2. ✅ Generate self-signed SSL certificates
3. ✅ Deploy containers on port 443 only
4. ✅ Run database migrations
5. ✅ Test HTTPS endpoints

### Step 5: Verify Deployment

```bash
# Check container status
docker-compose -f docker-compose.hostinger.yml ps

# Expected output:
# workflowguard_postgres  Up (healthy)
# workflowguard_backend   Up (healthy)  
# workflowguard_frontend  Up
# workflowguard_nginx     Up
```

### Step 6: Test HTTPS Access

```bash
# Test from server
curl -k -I https://workflowguard.pro
curl -k -I https://api.workflowguard.pro/api

# Both should return 200 OK
```

## 🌐 DNS Configuration

Configure these A records at your domain registrar:

```
workflowguard.pro     A    145.79.0.218
api.workflowguard.pro A    145.79.0.218
```

## 🔒 SSL Certificate Options

### Option A: Self-Signed (Initial Setup) ✅
- Already configured by deployment script
- Works immediately but shows browser warning
- Good for testing and initial setup

### Option B: Cloudflare SSL (Recommended)
1. Add domains to Cloudflare
2. Set DNS to "Proxied" (orange cloud)
3. Enable "Full (Strict)" SSL mode
4. Cloudflare handles SSL termination

### Option C: Let's Encrypt with DNS Challenge
```bash
# Install certbot
sudo apt install certbot python3-certbot-dns-cloudflare

# Generate certificates using DNS challenge
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d workflowguard.pro -d api.workflowguard.pro
```

## 🎯 HubSpot Configuration

Update your HubSpot app settings:

```
Redirect URI: https://api.workflowguard.pro/api/auth/hubspot/callback
Webhook URL:  https://api.workflowguard.pro/api/webhooks/hubspot
```

## 🔧 Management Commands

### View Logs
```bash
# Backend logs
docker-compose -f docker-compose.hostinger.yml logs backend

# Frontend logs  
docker-compose -f docker-compose.hostinger.yml logs frontend

# Nginx logs
docker-compose -f docker-compose.hostinger.yml logs nginx
```

### Restart Services
```bash
# Restart all services
docker-compose -f docker-compose.hostinger.yml restart

# Restart specific service
docker-compose -f docker-compose.hostinger.yml restart backend
```

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.hostinger.yml down
docker-compose -f docker-compose.hostinger.yml up --build -d
```

### Database Management
```bash
# Connect to database
docker-compose -f docker-compose.hostinger.yml exec postgres psql -U postgres -d workflowguard

# Run migrations
docker-compose -f docker-compose.hostinger.yml exec backend npx prisma db push

# Backup database
docker-compose -f docker-compose.hostinger.yml exec postgres pg_dump -U postgres workflowguard > backup.sql
```

## 🚨 Troubleshooting

### Container Issues
```bash
# Check container status
docker-compose -f docker-compose.hostinger.yml ps

# View detailed logs
docker-compose -f docker-compose.hostinger.yml logs --tail=50 backend
```

### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/workflowguard.pro.crt -text -noout

# Regenerate self-signed certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/workflowguard.pro.key \
  -out ssl/workflowguard.pro.crt \
  -subj "/C=US/ST=CA/L=SF/O=WorkflowGuard/CN=workflowguard.pro"
```

### DNS Issues
```bash
# Check DNS resolution
nslookup workflowguard.pro
nslookup api.workflowguard.pro

# Both should return: 145.79.0.218
```

### Port Issues
```bash
# Check what's listening on port 443
sudo netstat -tlnp | grep :443

# Should show nginx container
```

## 📊 Monitoring

### Resource Usage
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check container resources
docker stats
```

### Application Health
```bash
# Test frontend
curl -k -I https://workflowguard.pro

# Test API
curl -k -I https://api.workflowguard.pro/api

# Test database connection
docker-compose -f docker-compose.hostinger.yml exec backend npx prisma db push --preview-feature
```

## ✅ Success Checklist

- [ ] All containers running and healthy
- [ ] HTTPS frontend accessible: `https://workflowguard.pro`
- [ ] HTTPS API responding: `https://api.workflowguard.pro/api`
- [ ] DNS records configured correctly
- [ ] HubSpot app settings updated
- [ ] SSL certificates working (self-signed or real)
- [ ] Database migrations applied
- [ ] OAuth flow tested

## 🎉 Final Status

Your WorkflowGuard application should now be fully operational at:
- **Frontend**: https://workflowguard.pro
- **API**: https://api.workflowguard.pro/api
- **HubSpot OAuth**: https://api.workflowguard.pro/api/auth/hubspot/callback

**Note**: The application uses self-signed certificates initially. For production, consider using Cloudflare SSL or Let's Encrypt with DNS challenge method.
