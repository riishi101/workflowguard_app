#!/bin/bash

echo "=== FIXING WORKFLOWGUARD CONTAINERS ==="

# Step 1: Stop everything and clean up
echo "Step 1: Stopping all containers..."
docker-compose -f docker-compose.production.yml down
docker rm -f workflowguard_frontend workflowguard_nginx workflowguard_backend 2>/dev/null || true

# Step 2: Create simple nginx config that works
echo "Step 2: Creating simple nginx configuration..."
cat > nginx/nginx.conf << 'EOF'
events { 
    worker_connections 1024; 
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name workflowguard.pro www.workflowguard.pro;
        location / {
            proxy_pass http://workflowguard_frontend:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    
    server {
        listen 80;
        server_name api.workflowguard.pro;
        location / {
            proxy_pass http://workflowguard_backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
EOF

# Step 3: Fix frontend container by ensuring React files are properly copied
echo "Step 3: Preparing frontend files..."
# Extract React files from the built image
docker create --name temp_extract workflowguard_app-frontend:latest
docker cp temp_extract:/usr/share/nginx/html/. /tmp/frontend_files/
docker rm temp_extract

# Step 4: Start containers one by one
echo "Step 4: Starting containers..."
docker-compose -f docker-compose.production.yml up -d postgres
echo "Waiting for postgres to be healthy..."
sleep 10

docker-compose -f docker-compose.production.yml up -d backend
echo "Waiting for backend to start..."
sleep 5

docker-compose -f docker-compose.production.yml up -d frontend
echo "Waiting for frontend to start..."
sleep 5

# Step 5: Copy React files to frontend container
echo "Step 5: Copying React files to frontend container..."
docker cp /tmp/frontend_files/. workflowguard_frontend:/usr/share/nginx/html/

# Step 6: Start nginx
echo "Step 6: Starting nginx..."
docker-compose -f docker-compose.production.yml up -d nginx

# Step 7: Check status
echo "Step 7: Checking container status..."
sleep 5
docker-compose -f docker-compose.production.yml ps

echo "=== TESTING CONNECTIONS ==="
echo "Testing workflowguard.pro..."
curl -I http://workflowguard.pro || echo "Connection failed"

echo "Testing www.workflowguard.pro..."
curl -I http://www.workflowguard.pro || echo "Connection failed"

echo "Testing api.workflowguard.pro..."
curl -I http://api.workflowguard.pro || echo "Connection failed"

echo "=== SCRIPT COMPLETE ==="
