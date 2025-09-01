# WorkflowGuard Hostinger Deployment Credentials

## Server Information
- **Server IP**: 72.60.64.89
- **Server Name**: srv958417
- **Operating System**: Ubuntu 22.04.5 LTS
- **Hosting Provider**: Hostinger VPS

## SSH Access
```bash
ssh root@72.60.64.89
```

## Domain Configuration
- **Primary Domain**: www.workflowguard.pro
- **App Domain**: app.workflowguard.pro
- **API Domain**: api.workflowguard.pro (SSL certificates source)

## SSL Certificates
- **Provider**: Let's Encrypt
- **Certificate Path**: `/etc/letsencrypt/live/api.workflowguard.pro/`
- **Certificate Files**:
  - `fullchain.pem` - SSL certificate
  - `privkey.pem` - Private key

## Application Deployment
- **Deployment Path**: `/opt/workflowguard`
- **Repository**: https://github.com/riishi101/workflowguard_app
- **Branch**: main

## Docker Configuration
- **Container Management**: docker-compose
- **Services**:
  - `workflowguard_frontend_1` - React frontend (port 80)
  - `workflowguard_backend_1` - NestJS backend (port 4000)
  - `workflowguard_db_1` - PostgreSQL database (port 5432)
  - `workflowguard_nginx_1` - nginx reverse proxy (ports 80, 443)

## Port Configuration
- **HTTP**: 80 (redirects to HTTPS)
- **HTTPS**: 443 (SSL enabled)
- **Database**: 5432 (internal access only)
- **Backend**: 4000 (internal access only)

## Environment Files
- **Production Environment**: `.env.production`
- **Database Configuration**: PostgreSQL connection strings
- **HubSpot Integration**: OAuth credentials configured

## Deployment Commands
```bash
# Navigate to application directory
cd /opt/workflowguard

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker logs workflowguard_backend_1 -f
docker logs workflowguard_frontend_1 -f
docker logs workflowguard_nginx_1 -f
```

## SSL Certificate Renewal
```bash
# Renew Let's Encrypt certificates (automated via cron)
certbot renew

# Restart nginx after renewal
docker-compose restart nginx
```

## Backup Procedures
- **Database Backup**: PostgreSQL dumps via docker exec
- **Application Code**: Git repository backup
- **SSL Certificates**: Let's Encrypt auto-renewal

## Monitoring
- **Application Health**: Available via HTTPS endpoints
- **Service Status**: `docker-compose ps`
- **Resource Usage**: `htop`, `df -h`
- **Logs**: Docker container logs

## Security Configuration
- **Firewall**: UFW configured for ports 22, 80, 443
- **SSL/TLS**: TLS 1.2 & 1.3 with modern ciphers
- **Rate Limiting**: 300 requests per 15 minutes
- **Security Headers**: CSP, HSTS, X-Frame-Options enabled

## Production Status
- **Status**: ✅ Live and operational
- **HubSpot Marketplace**: ✅ Approved and published
- **SSL Security**: ✅ A+ grade configuration
- **Performance**: ✅ Optimized for production load

## Support Contacts
- **Technical Issues**: Check application logs first
- **SSL Issues**: Let's Encrypt documentation
- **Server Issues**: Hostinger VPS support
- **Application Issues**: GitHub repository issues

---
*Last Updated: September 1, 2025*
*Deployment Status: Production Ready*
