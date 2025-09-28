const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '.env.backend');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('Environment variables loaded from .env.backend');
  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
  console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '**** (loaded)' : 'NOT FOUND');
} else {
  console.log('.env.backend file not found');
}

// Also check process.env directly
console.log('\nDirect process.env check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '**** (loaded)' : 'NOT FOUND');