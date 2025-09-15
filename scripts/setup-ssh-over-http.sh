#!/bin/bash

# WorkflowGuard - SSH over HTTP Setup Script
# This script configures SSH access over port 80 using nginx as a reverse proxy

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== WorkflowGuard - SSH over HTTP Setup ===${NC}"

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${RED}This script must be run as root. Please use sudo.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if netstat -tuln | grep -q ":$port "; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

echo -e "${GREEN}Step 1: Checking system requirements...${NC}"

# Check if port 80 is available
if check_port 80; then
    echo -e "${YELLOW}Warning: Port 80 is already in use. This may cause conflicts.${NC}"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Setup cancelled.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Step 2: Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

echo -e "${GREEN}Step 3: Building containers with SSH support...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${GREEN}Step 4: Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}Step 5: Waiting for services to start...${NC}"
sleep 30

echo -e "${GREEN}Step 6: Checking service health...${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}Step 7: Testing SSH connectivity...${NC}"
# Test if SSH port is accessible
if timeout 5 bash -c "</dev/tcp/localhost/80"; then
    echo -e "${GREEN}✓ Port 80 is accessible${NC}"
else
    echo -e "${RED}✗ Port 80 is not accessible${NC}"
fi

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your Hostinger firewall to only allow port 80"
echo "2. Set SSH_PASSWORD and SSH_PUBLIC_KEY in your .env file"
echo "3. Test SSH connection: ssh -p 80 workflowguard@your-domain.com"
echo "4. Refer to SSH_ACCESS_GUIDE.md for detailed instructions"

echo -e "${GREEN}For troubleshooting, check logs with:${NC}"
echo "docker logs workflowguard-nginx"
echo "docker logs workflowguard-ssh"
