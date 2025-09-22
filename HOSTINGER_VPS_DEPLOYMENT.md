# 🚀 WorkflowGuard Hostinger VPS Deployment Guide

## 📋 Prerequisites

### VPS Requirements
- **Server**: Hostinger VPS (KVM-1 or KVM-2)
- **OS**: Ubuntu 22.04 LTS
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB
- **Firewall**: Ports 80, 443, and 22 configured ✅

### Domain Configuration
- **Frontend**: `workflowguard.pro` → Your VPS IP
- **API**: `api.workflowguard.pro` → Your VPS IP
- **DNS A Records**: Both domains pointing to your VPS IP address

## 🔧 Environment Setup

### 1. Update Environment Variables

Copy the VPS environment template:
```bash
cp .env.vps .env
```

**CRITICAL**: Update these values in `.env`:
```bash
# HubSpot Integration
HUBSPOT_CLIENT_ID=5e0dc425-8337-49dc-a91c-e1ccea96db05
HUBSPOT_CLIENT_SECRET=YOUR_ACTUAL_HUBSPOT_CLIENT_SECRET

# Razorpay Payment
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_RAZORPAY_KEY_SECRET

# Twilio WhatsApp
TWILIO_AUTH_TOKEN=YOUR_ACTUAL_TWILIO_AUTH_TOKEN
```

### 2. Configure Nginx

Copy the VPS nginx configuration:
```bash
cp nginx/nginx.vps.conf nginx/nginx.conf
```

## 🚀 Deployment Steps

### Step 1: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Clone Repository

```bash
git clone https://github.com/riishi101/workflowguard_app.git
cd workflowguard_app
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 4: Configure Environment

```bash
# Copy environment variables
cp .env.vps .env

# Edit with your actual credentials
nano .env
```

### Step 5: Deploy Application

```bash
# Use VPS-specific docker-compose file
docker-compose -f docker-compose.vps.yml up --build -d
```

### Step 6: Generate SSL Certificates

```bash
# Create directories
sudo mkdir -p /var/www/certbot

# Generate certificates for both domains
sudo certbot certonly --webroot -w /var/www/certbot -d workflowguard.pro -d www.workflowguard.pro --email admin@workflowguard.pro --agree-tos --non-interactive

sudo certbot certonly --webroot -w /var/www/certbot -d api.workflowguard.pro --email admin@workflowguard.pro --agree-tos --non-interactive
```

### Step 7: Restart with SSL

```bash
# Restart nginx with SSL configuration
docker-compose -f docker-compose.vps.yml restart nginx
```

### Step 8: Run Database Migrations

```bash
# Apply database schema
docker-compose -f docker-compose.vps.yml exec backend npx prisma db push
```

## ✅ Verification

### Check Container Status
```bash
docker-compose -f docker-compose.vps.yml ps
```

Expected output:
```
NAME                    STATUS
workflowguard_postgres  Up (healthy)
workflowguard_backend   Up (healthy)
workflowguard_frontend  Up
workflowguard_nginx     Up
```

### Test Endpoints
```bash
# Frontend
curl -I https://workflowguard.pro
# Expected: HTTP/2 200

# Backend API
curl -I https://api.workflowguard.pro/api
# Expected: HTTP/2 200
```

## 🔧 Troubleshooting

### Container Issues
```bash
# View logs
docker-compose -f docker-compose.vps.yml logs backend
docker-compose -f docker-compose.vps.yml logs frontend
docker-compose -f docker-compose.vps.yml logs nginx

# Restart specific service
docker-compose -f docker-compose.vps.yml restart backend
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run
```

### Database Issues
```bash
# Connect to database
docker-compose -f docker-compose.vps.yml exec postgres psql -U postgres -d workflowguard

# Reset database (CAUTION: This deletes all data)
docker-compose -f docker-compose.vps.yml down -v
docker-compose -f docker-compose.vps.yml up -d
```

## 🔄 Updates and Maintenance

### Deploy Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.vps.yml down
docker-compose -f docker-compose.vps.yml up --build -d
```

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.vps.yml exec postgres pg_dump -U postgres workflowguard > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Monitor Resources
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check container resources
docker stats
```

## 🎯 Final Configuration

### HubSpot App Settings
Update your HubSpot app with:
- **Redirect URI**: `https://api.workflowguard.pro/api/auth/hubspot/callback`
- **Webhook URL**: `https://api.workflowguard.pro/api/webhooks/hubspot`

### DNS Configuration
Ensure both domains point to your VPS IP:
```
workflowguard.pro     A    YOUR_VPS_IP
api.workflowguard.pro A    YOUR_VPS_IP
```

## 🚨 Security Notes

1. **Firewall**: Only ports 80, 443, and 22 should be open
2. **SSL**: Certificates auto-renew via certbot
3. **Environment**: Never commit `.env` file to git
4. **Database**: PostgreSQL is only accessible from containers
5. **Rate Limiting**: API endpoints have built-in rate limiting

## 📞 Support

If you encounter issues:
1. Check container logs first
2. Verify DNS propagation
3. Ensure all environment variables are set
4. Check SSL certificate validity

Your WorkflowGuard application should now be fully operational at:
- **Frontend**: https://workflowguard.pro
- **API**: https://api.workflowguard.pro/api
