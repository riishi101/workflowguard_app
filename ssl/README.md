# SSL Certificates

This directory should contain the SSL certificates for your domains:

- `workflowguard.pro.crt` - Certificate for the main domain
- `workflowguard.pro.key` - Private key for the main domain
- `api.workflowguard.pro.crt` - Certificate for the API subdomain
- `api.workflowguard.pro.key` - Private key for the API subdomain

## Obtaining SSL Certificates

You can obtain free SSL certificates from Let's Encrypt using Certbot. Here's how to install and use Certbot on your Hostinger VPS:

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificates for your domains
sudo certbot --nginx -d workflowguard.pro -d www.workflowguard.pro
sudo certbot --nginx -d api.workflowguard.pro
```

Certbot will automatically place the certificates in the correct location and configure Nginx to use them.

## Manual Certificate Placement

If you're using certificates from another provider, place them in this directory with the filenames mentioned above, and ensure they have the correct permissions:

```bash
chmod 644 *.crt
chmod 600 *.key
```