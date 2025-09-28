#!/usr/bin/env node

/**
 * Environment Configuration Validator for WorkflowGuard
 * Validates all required environment variables are properly set
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for backend
const REQUIRED_VARS_BACKEND = {
  // Database
  'DATABASE_URL': 'PostgreSQL database connection string',
  'DIRECT_URL': 'Direct PostgreSQL connection string',
  
  // Application
  'NODE_ENV': 'Application environment (production/development)',
  'PORT': 'Application port number',
  
  // HubSpot Integration
  'HUBSPOT_CLIENT_ID': 'HubSpot OAuth client ID',
  'HUBSPOT_CLIENT_SECRET': 'HubSpot OAuth client secret',
  'HUBSPOT_REDIRECT_URI': 'HubSpot OAuth redirect URI',
  
  // Security
  'JWT_SECRET': 'JWT signing secret',
  
  // Payment Processing
  'RAZORPAY_KEY_ID': 'Razorpay API key ID',
  'RAZORPAY_KEY_SECRET': 'Razorpay API key secret',
  
  // Multi-currency Plan IDs
  'RAZORPAY_PLAN_ID_STARTER_INR': 'Razorpay Starter plan ID for INR',
  'RAZORPAY_PLAN_ID_PROFESSIONAL_INR': 'Razorpay Professional plan ID for INR',
  'RAZORPAY_PLAN_ID_ENTERPRISE_INR': 'Razorpay Enterprise plan ID for INR',
  
  // WhatsApp Support
  'TWILIO_ACCOUNT_SID': 'Twilio account SID',
  'TWILIO_AUTH_TOKEN': 'Twilio authentication token',
};

// Required environment variables for frontend
const REQUIRED_VARS_FRONTEND = {
  // Application
  'NODE_ENV': 'Application environment (production/development)',
  
  // Vite environment variables (prefixed with VITE_)
  'VITE_API_URL': 'API base URL for frontend requests',
  'VITE_APP_URL': 'Frontend application URL',
};

// Default required variables (for production environment)
const REQUIRED_VARS = REQUIRED_VARS_BACKEND;

// Optional but recommended variables
const OPTIONAL_VARS = {
  'FRONTEND_URL': 'Frontend application URL',
  'API_URL': 'API base URL',
  'HUBSPOT_WEBHOOK_SECRET': 'HubSpot webhook secret',
  'RAZORPAY_WEBHOOK_SECRET': 'Razorpay webhook secret',
  'LOG_LEVEL': 'Application logging level',
};

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key] = valueParts.join('=').replace(/^"|"$/g, '');
        }
      }
    });
    
    return env;
  } catch (error) {
    console.error(`❌ Failed to load ${filePath}:`, error.message);
    return null;
  }
}

function validateEnvironment(env, envName) {
  console.log(`\n🔍 Validating ${envName}...`);
  
  const missing = [];
  const invalid = [];
  
  // Determine which required variables to check based on environment name
  let requiredVars = REQUIRED_VARS;
  if (envName.includes('Frontend')) {
    requiredVars = REQUIRED_VARS_FRONTEND;
  } else if (envName.includes('Backend')) {
    requiredVars = REQUIRED_VARS_BACKEND;
  }
  
  // Check required variables
  Object.entries(requiredVars).forEach(([key, description]) => {
    if (!env[key]) {
      missing.push({ key, description });
    } else {
      // Basic validation
      if (key === 'NODE_ENV' && !['production', 'development', 'test'].includes(env[key])) {
        invalid.push({ key, value: env[key], issue: 'Should be production, development, or test' });
      }
      if (key === 'PORT' && isNaN(parseInt(env[key]))) {
        invalid.push({ key, value: env[key], issue: 'Should be a valid port number' });
      }
      if (key === 'HUBSPOT_REDIRECT_URI' && !env[key].startsWith('https://')) {
        invalid.push({ key, value: env[key], issue: 'Should use HTTPS protocol' });
      }
    }
  });
  
  // Report results
  if (missing.length === 0 && invalid.length === 0) {
    console.log(`✅ ${envName} configuration is valid!`);
  } else {
    console.log(`❌ ${envName} configuration has issues:`);
    
    if (missing.length > 0) {
      console.log('\n📋 Missing required variables:');
      missing.forEach(({ key, description }) => {
        console.log(`   • ${key}: ${description}`);
      });
    }
    
    if (invalid.length > 0) {
      console.log('\n⚠️  Invalid values:');
      invalid.forEach(({ key, value, issue }) => {
        console.log(`   • ${key}="${value}" - ${issue}`);
      });
    }
  }
  
  // Check optional variables
  const missingOptional = Object.keys(OPTIONAL_VARS).filter(key => !env[key]);
  if (missingOptional.length > 0) {
    console.log('\n💡 Optional variables not set:');
    missingOptional.forEach(key => {
      console.log(`   • ${key}: ${OPTIONAL_VARS[key]}`);
    });
  }
  
  return { missing, invalid };
}

function main() {
  console.log('🔐 WorkflowGuard Environment Configuration Validator\n');
  
  const envFiles = [
    { path: '.env.production', name: 'Production Environment' },
    { path: '.env.backend', name: 'Backend Environment (Cloud Run)' },
    { path: '.env.frontend', name: 'Frontend Environment (Cloud Run)' },
  ];
  
  let allValid = true;
  
  envFiles.forEach(({ path: filePath, name }) => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const env = loadEnvFile(fullPath);
      if (env) {
        const { missing, invalid } = validateEnvironment(env, name);
        if (missing.length > 0 || invalid.length > 0) {
          allValid = false;
        }
      } else {
        allValid = false;
      }
    } else {
      console.log(`⚠️  ${name} file not found: ${filePath}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  if (allValid) {
    console.log('🎉 All environment configurations are valid!');
    console.log('✅ Ready for deployment to Google Cloud Run');
  } else {
    console.log('❌ Environment configuration issues found');
    console.log('🔧 Please fix the issues above before deployment');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, loadEnvFile };