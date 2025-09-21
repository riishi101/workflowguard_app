# WorkflowGuard Deployment Guide for Hostinger VPS

This guide will walk you through deploying the WorkflowGuard application on a Hostinger VPS.

## Prerequisites

- A Hostinger VPS with Ubuntu 22.04 LTS
- Domain names configured (workflowguard.pro and api.workflowguard.pro)
- SSH access to your VPS
- Docker and Docker Compose installed on your VPS

## Step 1: Clone the Repository

```bash
# Connect to your VPS via SSH
ssh root@145.79.0.218

# Clone the repository
git clone https://github.com/yourusername/workflowguard_app.git
cd workflowguard_app
```

## Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.production .env

# Edit the environment file with your actual values
nano .env
```

Update the following values in the `.env` file:

- `POSTGRES_PASSWORD`: A secure password for your PostgreSQL database
- `JWT_SECRET`: A secure random string for JWT token generation
- `HUBSPOT_CLIENT_ID` and `HUBSPOT_CLIENT_SECRET`: Your HubSpot API credentials
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Your Razorpay API credentials

## Step 3: Configure DNS Settings

In your Hostinger DNS management panel, create the following records:

1. For the main domain (workflowguard.pro):
   - Type: A
   - Name: @
   - Value: 145.79.0.218 (your VPS IP)
   - TTL: 300

2. For the www subdomain:
   - Type: A
   - Name: www
   - Value: 145.79.0.218 (your VPS IP)
   - TTL: 300

3. For the API subdomain:
   - Type: A
   - Name: api
   - Value: 145.79.0.218 (your VPS IP)
   - TTL: 300

## Step 4: Configure Firewall

Ensure the following ports are open in your Hostinger VPS firewall:

- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

You can check this in the Hostinger control panel under Firewall Configuration.

## Step 5: Set Up SSL Certificates

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificates for your domains
sudo certbot --nginx -d workflowguard.pro -d www.workflowguard.pro
sudo certbot --nginx -d api.workflowguard.pro

# Copy certificates to the SSL directory
mkdir -p ssl
cp /etc/letsencrypt/live/workflowguard.pro/fullchain.pem ssl/workflowguard.pro.crt
cp /etc/letsencrypt/live/workflowguard.pro/privkey.pem ssl/workflowguard.pro.key
cp /etc/letsencrypt/live/api.workflowguard.pro/fullchain.pem ssl/api.workflowguard.pro.crt
cp /etc/letsencrypt/live/api.workflowguard.pro/privkey.pem ssl/api.workflowguard.pro.key

# Set proper permissions
chmod 644 ssl/*.crt
chmod 600 ssl/*.key
```

## Step 6: Deploy the Application

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

## Step 7: Configure HubSpot Integration

1. Log in to your HubSpot developer account
2. Navigate to your app settings
3. Update the Redirect URL to: `https://api.workflowguard.pro/api/auth/hubspot/callback`
4. Update the allowed scopes as needed

## Step 8: Verify Deployment

Check if all services are running correctly:

```bash
docker-compose ps
```

Access your application:

- Frontend: https://workflowguard.pro
- API: https://api.workflowguard.pro

## Troubleshooting

### Check Docker Container Logs

```bash
# View logs for all containers
docker-compose logs

# View logs for a specific container
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
docker-compose logs postgres
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart a specific service
docker-compose restart backend
```

### Check Nginx Configuration

```bash
# Test Nginx configuration
docker-compose exec nginx nginx -t
```

## Maintenance

### Database Backup

```bash
# Backup the PostgreSQL database
docker-compose exec postgres pg_dump -U postgres workflowguard > backup_$(date +%Y%m%d).sql
```

### Update Application

```bash
# Pull latest changes
git pull

# Redeploy
./deploy.sh
```

### SSL Certificate Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

```bash
# Test renewal process
sudo certbot renew --dry-run

# Add to crontab to run twice daily
echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

## Support

If you encounter any issues during deployment, please contact support at support@workflowguard.pro.