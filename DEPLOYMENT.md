# WorkflowGuard Deployment Guide

## Environment Configuration

The application is now configured with production credentials and ready for deployment.

### Environment Files

- `.env.backend` - Backend environment variables for Cloud Run
- `.env.frontend` - Frontend environment variables for Cloud Run  
- `.env.production` - Complete production configuration
- `docker-compose.yml` - Local development with production credentials

### Credentials Implemented

✅ **Database**: PostgreSQL connection configured
✅ **HubSpot OAuth**: Client ID, Secret, and Redirect URI set
✅ **Security**: JWT and Session secrets configured
✅ **Payment**: Razorpay live credentials with multi-currency support
✅ **Support**: Twilio/WhatsApp integration configured
✅ **URLs**: Production domain configured (workflowguard.pro)

### Multi-Currency Support

The application supports 5 currencies with dedicated Razorpay plans:
- 🇮🇳 INR (Indian Rupee)
- 🇺🇸 USD (US Dollar) 
- 🇬🇧 GBP (British Pound)
- 🇪🇺 EUR (Euro)
- 🇨🇦 CAD (Canadian Dollar)

## Deployment Options

### 1. Google Cloud Run (Recommended)

```bash
# Deploy using Cloud Build
gcloud builds submit --config=cloudbuild.yaml

# Or with specific build ID
gcloud builds submit --config=cloudbuild.yaml --substitutions=_BUILD_ID=v1.0.0
```

### 2. Local Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Manual Environment Setup

Copy the credentials from `.env.production` to your deployment platform's environment variables.

## Configuration Fixes Applied

1. ✅ **NODE_ENV**: Corrected from "PORT=4000" to "production"
2. ✅ **HUBSPOT_REDIRECT_URI**: Fixed domain structure
3. ✅ **Multi-currency Plans**: All Razorpay plan IDs configured
4. ✅ **Cloud Build**: Updated with proper environment variables

## Security Notes

- All credentials are production-ready
- JWT secret is cryptographically secure
- Razorpay keys are live (not test) credentials
- Database uses secure connection strings

## Next Steps

1. Ensure Google Cloud project is properly configured
2. Set up Cloud SQL PostgreSQL instance if needed
3. Configure domain DNS to point to Cloud Run services
4. Test HubSpot OAuth flow with production redirect URI
5. Verify Razorpay webhook endpoints are accessible

## Support

The application includes WhatsApp support via Twilio for customer assistance.