#!/bin/bash

# WorkflowGuard VPS Deployment Script
# Run this script on your Hostinger VPS (145.79.0.218)

set -e

echo "🚀 Starting WorkflowGuard VPS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
print_status "Installing Docker and Docker Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed successfully"
else
    print_status "Docker is already installed"
fi

if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose is already installed"
fi

# Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl enable nginx
    print_status "Nginx installed successfully"
else
    print_status "Nginx is already installed"
fi

# Install Certbot for SSL certificates
print_status "Installing Certbot for SSL certificates..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    print_status "Certbot installed successfully"
else
    print_status "Certbot is already installed"
fi

# Create application directory
print_status "Creating application directory..."
APP_DIR="/home/$USER/workflowguard"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository (if not already present)
if [ ! -d ".git" ]; then
    print_status "Cloning WorkflowGuard repository..."
    git clone https://github.com/riishi101/workflowguard_app.git .
else
    print_status "Updating WorkflowGuard repository..."
    git pull origin main
fi

# Copy environment file
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.vps .env
    print_warning "Please edit .env file with your actual credentials:"
    print_warning "  - POSTGRES_PASSWORD"
    print_warning "  - HUBSPOT_CLIENT_SECRET"
    print_warning "  - RAZORPAY credentials"
    read -p "Press Enter after editing .env file..."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p nginx/sites-enabled
mkdir -p nginx/logs
mkdir -p ssl
mkdir -p postgres-init

# Enable Nginx site
print_status "Configuring Nginx..."
sudo ln -sf $APP_DIR/nginx/sites-available/workflowguard.conf /etc/nginx/sites-available/workflowguard.conf
sudo ln -sf /etc/nginx/sites-available/workflowguard.conf /etc/nginx/sites-enabled/workflowguard.conf
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Generate SSL certificates
print_status "Generating SSL certificates..."
print_warning "Make sure your domains point to this server IP (145.79.0.218) before continuing"
read -p "Press Enter when DNS is configured..."

sudo certbot --nginx -d workflowguard.pro -d www.workflowguard.pro -d api.workflowguard.pro --non-interactive --agree-tos --email your-email@example.com

# Copy SSL certificates for Docker
sudo cp /etc/letsencrypt/live/workflowguard.pro/fullchain.pem ssl/workflowguard.pro.crt
sudo cp /etc/letsencrypt/live/workflowguard.pro/privkey.pem ssl/workflowguard.pro.key
sudo chown $USER:$USER ssl/*

# Build and start Docker containers
print_status "Building and starting Docker containers..."
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.production.yml ps

# Setup automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/workflowguard > /dev/null <<EOF
$APP_DIR/nginx/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f $APP_DIR/docker-compose.production.yml exec nginx nginx -s reload
    endscript
}
EOF

# Create backup script
print_status "Creating backup script..."
tee backup.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U workflowguard workflowguard > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz --exclude=node_modules --exclude=.git .

# Keep only last 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Setup daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -

print_status "🎉 WorkflowGuard deployment completed successfully!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Verify your domains point to 145.79.0.218"
print_status "2. Test your application:"
print_status "   - Frontend: https://www.workflowguard.pro"
print_status "   - Backend API: https://api.workflowguard.pro/api/health"
print_status "3. Monitor logs: docker-compose -f docker-compose.production.yml logs -f"
print_status "4. Daily backups are scheduled at 2 AM"
print_status ""
print_status "🔧 Useful commands:"
print_status "  - Restart services: docker-compose -f docker-compose.production.yml restart"
print_status "  - View logs: docker-compose -f docker-compose.production.yml logs -f [service_name]"
print_status "  - Update application: git pull && docker-compose -f docker-compose.production.yml up -d --build"
print_status ""
print_warning "Remember to:"
print_warning "  - Update your DNS records to point to 145.79.0.218"
print_warning "  - Configure your actual credentials in .env file"
print_warning "  - Test all functionality thoroughly"
