const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

function generateJwtSecret() {
  return generateSecureSecret(64);
}

function generateCookieSecret() {
  return generateSecureSecret(32);
}

async function rotateCredentials() {
  console.log('🔄 Starting credentials rotation...');

  // Generate new secrets
  const newJwtSecret = generateJwtSecret();
  const newCookieSecret = generateCookieSecret();

  console.log('\n📋 New Credentials Generated');
  console.log('---------------------------');
  console.log('JWT_SECRET:', newJwtSecret);
  console.log('COOKIE_SECRET:', newCookieSecret);
  
  console.log('\n⚠️ Action Required:');
  console.log('1. Update these credentials in your production environment:');
  console.log('   - Render.com Environment Variables');
  console.log('   - Vercel Environment Variables');
  console.log('   - Local .env file (for development only)');
  
  console.log('\n2. Update HubSpot credentials:');
  console.log('   - Visit: https://app.hubspot.com/developer');
  console.log('   - Generate new Client ID and Secret');
  console.log('   - Update in environment variables');
  
  console.log('\n3. Update Database credentials:');
  console.log('   - Visit: https://console.neon.tech');
  console.log('   - Generate new database credentials');
  console.log('   - Update DATABASE_URL and DIRECT_URL');

  console.log('\n4. After updating all credentials:');
  console.log('   - Deploy the application');
  console.log('   - Verify all integrations are working');
  console.log('   - Monitor for any authentication issues');
}

// Run the rotation
rotateCredentials().catch(console.error);
