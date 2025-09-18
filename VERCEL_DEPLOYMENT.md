# 🚀 Vercel Frontend Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier available)
- Railway backend deployed first

## Step 1: Prepare Frontend for Deployment

1. **Update environment variables in frontend:**
   ```bash
   cd frontend
   cp ../.env.vercel .env.production
   ```

2. **Update the API URL in .env.production:**
   ```
   VITE_API_URL=https://your-backend-name.railway.app
   ```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: workflowguard-frontend
# - Directory: ./
# - Override settings? No
```

### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Framework preset: Vite
6. Build command: `npm run build`
7. Output directory: `dist`
8. Add environment variables from `.env.vercel`

## Step 3: Configure Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:
   - `VITE_API_URL`: Your Railway backend URL
   - `VITE_HUBSPOT_CLIENT_ID`: Your HubSpot client ID
   - `VITE_RAZORPAY_KEY_ID`: Your Razorpay key ID

## Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard → Domains
2. Add your custom domain: `www.workflowguard.pro`
3. Update DNS records as instructed
4. SSL certificates are automatic!

## Step 5: Update HubSpot OAuth Redirect

Update your HubSpot app settings:
- Redirect URI: `https://your-app.vercel.app/auth/callback`
- Or: `https://www.workflowguard.pro/auth/callback`

## ✅ Benefits of Vercel Deployment

- ✅ Automatic HTTPS with custom domains
- ✅ Global CDN for fast loading
- ✅ Automatic deployments on git push
- ✅ Preview deployments for branches
- ✅ 99.99% uptime SLA
- ✅ Zero configuration required
- ✅ Free tier includes custom domains

## 🔧 Troubleshooting

**Build fails?**
- Check that all dependencies are in package.json
- Ensure TypeScript types are correct
- Verify environment variables are set

**API calls failing?**
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure Railway backend is deployed

**HubSpot OAuth not working?**
- Update redirect URI in HubSpot app settings
- Check HUBSPOT_CLIENT_ID matches
