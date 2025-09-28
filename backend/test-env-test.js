const dotenv = require('dotenv');
const path = require('path');

// Load the .env.test file
const envPath = path.resolve(__dirname, '.env.test');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.test file:', result.error);
} else {
  console.log('.env.test file loaded successfully');
}

console.log('Direct process.env check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '**** (loaded)' : 'NOT FOUND');