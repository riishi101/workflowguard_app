# WorkflowGuard SSH Access Guide

This guide explains how to configure and use SSH access for WorkflowGuard deployments, particularly in environments where only port 80 is available.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Connecting via SSH](#connecting-via-ssh)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Overview

This setup configures SSH access over port 80 using nginx as a reverse proxy. This is useful in environments where only port 80 is open and cannot be changed.

## Prerequisites

1. Docker and Docker Compose installed on the server
2. SSH client on your local machine
3. A user account with sudo privileges

## Configuration

The following components are configured:

1. **Nginx with Stream Module**: Proxies SSH traffic on port 80
2. **OpenSSH Server**: Runs in a container, listening on port 2222
3. **Firewall**: Configured to only allow port 80

## Connecting via SSH

### 1. Using SSH Client

```bash
ssh -p 80 workflowguard@your-domain.com
```

### 2. Using SSH Config (Recommended)

Add the following to your `~/.ssh/config`:

```
Host workflowguard-prod
    HostName your-domain.com
    Port 80
    User workflowguard
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Then connect using:

```bash
ssh workflowguard-prod
```

## SSH Key Authentication

For better security, use SSH key authentication:

1. Generate an SSH key pair if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add your public key to the server:
   - Copy your public key (`~/.ssh/id_ed25519.pub`)
   - Add it to `/config/.ssh/authorized_keys` in the SSH container

## Troubleshooting

### Connection Refused
- Verify nginx is running: `docker ps | grep nginx`
- Check nginx logs: `docker logs workflowguard-nginx`
- Verify SSH server is running: `docker ps | grep ssh`

### Permission Denied
- Verify your SSH key is correctly installed
- Check file permissions on the server:
  ```bash
  chmod 700 ~/.ssh
  chmod 600 ~/.ssh/authorized_keys
  ```

### Connection Timeout
- Verify port 80 is open in your firewall
- Check if your ISP or network is blocking outbound connections on port 80

## Security Considerations

1. **Use Strong Authentication**: Always use SSH keys instead of passwords
2. **Limit Access**: Restrict SSH access to specific IP addresses if possible
3. **Keep Software Updated**: Regularly update nginx, OpenSSH, and Docker
4. **Monitor Logs**: Regularly check SSH and nginx logs for suspicious activity
5. **Fail2Ban**: Consider adding Fail2Ban to prevent brute force attacks

## Maintenance

### Restarting Services

```bash
# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx

# Restart SSH server
docker-compose -f docker-compose.prod.yml restart ssh-server
```

### Viewing Logs

```bash
# Nginx logs
docker logs workflowguard-nginx

# SSH server logs
docker logs workflowguard-ssh
```

## Backup and Restore

### Backup SSH Configuration

```bash
docker cp workflowguard-ssh:/config ./ssh-backup
```

### Restore SSH Configuration

```bash
docker cp ./ssh-backup/. workflowguard-ssh:/config/
docker restart workflowguard-ssh
```

## Support

For additional assistance, please contact your system administrator or refer to the official documentation.
