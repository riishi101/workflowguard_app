# 🚀 WorkflowGuard Cloud Deployment - Complete Guide

## 🎯 Overview: VPS → Cloud Migration

**Why we switched from Hostinger VPS to Vercel + Railway:**
- ❌ VPS reliability issues (frequent downtime)
- ❌ Complex server management (Docker, Caddy, firewall)
- ❌ Manual SSL certificate management
- ✅ **Cloud benefits:** 99.9% uptime, automatic scaling, zero maintenance

## 📋 Deployment Architecture

```
Frontend (React + Vite) → Vercel
Backend (NestJS) → Railway
Database (PostgreSQL) → Railway
```

## 🚀 Step-by-Step Deployment

### Phase 1: Backend + Database (Railway)

1. **Create Railway account:** [railway.app](https://railway.app)
2. **Deploy database:**
   - New Project → Add PostgreSQL
   - Copy `DATABASE_URL` from Variables tab

3. **Deploy backend:**
   - New Service → GitHub Repo → Select your repo
   - Root directory: `backend`
   - Add all environment variables from `.env.railway`
   - Update `DATABASE_URL` with Railway's PostgreSQL URL

4. **Get backend URL:**
   - Copy public URL (e.g., `https://backend-production-abc123.railway.app`)

### Phase 2: Frontend (Vercel)

1. **Update frontend environment:**
   ```bash
   cd frontend
   # Update VITE_API_URL with your Railway backend URL
   ```

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```

3. **Configure environment variables in Vercel dashboard:**
   - `VITE_API_URL`: Your Railway backend URL
   - `VITE_HUBSPOT_CLIENT_ID`: HubSpot client ID
   - `VITE_RAZORPAY_KEY_ID`: Razorpay key ID

### Phase 3: Update OAuth Callbacks

1. **HubSpot App Settings:**
   - Redirect URI: `https://your-app.vercel.app/auth/callback`

2. **Railway Backend Environment:**
   - Update `HUBSPOT_REDIRECT_URI` to match Vercel URL

## 🔗 Final URLs Structure

```
Frontend: https://workflowguard-frontend.vercel.app
Backend:  https://backend-production-abc123.railway.app
Database: Managed by Railway (internal connection)
```

## 🎯 Custom Domains (Optional)

### Vercel (Frontend)
1. Vercel Dashboard → Domains
2. Add: `www.workflowguard.pro`
3. Update DNS: CNAME → vercel-dns.com

### Railway (Backend)
1. Railway Service → Settings → Domains
2. Add: `api.workflowguard.pro`
3. Update DNS: CNAME → railway.app

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Remove all VPS files (Docker, nginx, scripts)
- [ ] Update .gitignore for cloud deployment
- [ ] Create Vercel and Railway configs

### Railway Backend
- [ ] PostgreSQL database deployed
- [ ] Backend service deployed
- [ ] All environment variables configured
- [ ] Database migrations successful
- [ ] API endpoints responding
- [ ] Custom domain configured (optional)

### Vercel Frontend
- [ ] Frontend deployed successfully
- [ ] Environment variables configured
- [ ] API calls working
- [ ] HubSpot OAuth working
- [ ] Custom domain configured (optional)

### Final Testing
- [ ] Frontend loads correctly
- [ ] User authentication works
- [ ] HubSpot integration functional
- [ ] Payment processing works
- [ ] All API endpoints responding
- [ ] HTTPS working on both domains

## 🔧 Environment Variables Summary

### Vercel Frontend (.env.production)
```bash
VITE_API_URL=https://your-backend.railway.app
VITE_HUBSPOT_CLIENT_ID=5e6a6429-8317-4e2a-a9b5-46e8669f72f6
VITE_RAZORPAY_KEY_ID=rzp_live_R6PjXR1FYupO0Y
```

### Railway Backend (Environment Variables)
```bash
DATABASE_URL=postgresql://postgres:password@host:port/database
HUBSPOT_REDIRECT_URI=https://your-frontend.vercel.app/auth/callback
# ... (all other variables from .env.railway)
```

## 🎉 Benefits of New Architecture

### Reliability
- ✅ 99.9% uptime SLA (vs VPS downtime issues)
- ✅ Automatic failover and redundancy
- ✅ Global CDN for fast loading

### Maintenance
- ✅ Zero server management
- ✅ Automatic security updates
- ✅ Automatic SSL certificates
- ✅ No Docker/container management

### Scalability
- ✅ Automatic scaling based on traffic
- ✅ Pay-per-use pricing
- ✅ Easy to add more services

### Developer Experience
- ✅ Automatic deployments on git push
- ✅ Preview deployments for testing
- ✅ Built-in monitoring and logs
- ✅ Easy rollbacks

## 🚨 Migration Complete!

Your WorkflowGuard app is now running on enterprise-grade cloud infrastructure with:
- **Frontend:** Vercel (automatic HTTPS, global CDN)
- **Backend:** Railway (managed containers, auto-scaling)
- **Database:** Railway PostgreSQL (managed, backed up)

**No more VPS headaches! 🎉**
