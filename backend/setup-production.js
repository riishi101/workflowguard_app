const fs = require('fs');
const path = require('path');

// Production environment configuration
const envContent = `# Database Configuration

DATABASE_URL="postgresql://neondb_owner:npg_oPpKhNtTR20d@ep-dry-resonance-afgqyybz-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_oPpKhNtTR20d@ep-dry-resonance-afgqyybz.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Configuration
JWT_SECRET="xrDmUc9gji+BcWHxH2gEPhjvNDDehJDs4Z04UI/bVn1fhjmKOgH9WoUUnrVEFYcaTlYmbUdhaoSysZWHiNy5Dw=="
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=4000
NODE_ENV=production

# HubSpot Configuration
HUBSPOT_CLIENT_ID=""
HUBSPOT_CLIENT_SECRET=""
HUBSPOT_REDIRECT_URI="https://api.workflowguard.pro/api/auth/hubspot/callback"

# Frontend URLs
VITE_API_URL="https://api.workflowguard.pro/api"
DOMAIN="www.workflowguard.pro"
RENDER_URL="api.workflowguard.pro"
VERCEL_URL="www.workflowguard.pro"

# Email Configuration (optional)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Analytics Configuration
ENABLE_ANALYTICS=true
`;

console.log('🚀 Setting up production environment...');

try {
  // Write .env file
  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  console.log('✅ Created .env file with production configuration');

  console.log('📝 Next steps:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma db push');
  console.log('3. Run: npm run build');
  console.log('4. Run: npm run start:prod');

} catch (error) {
  console.error('❌ Error setting up production environment:', error.message);
} 