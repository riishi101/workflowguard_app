const dotenv = require('dotenv');
const path = require('path');

// Load the .env file explicitly
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

console.log('Direct process.env check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '**** (loaded)' : 'NOT FOUND');

// Test ConfigService simulation
function testConfigService() {
  try {
    // Simulate NestJS module initialization
    const configService = {
      get: (key) => process.env[key]
    };
    
    const keyId = configService.get('RAZORPAY_KEY_ID');
    const keySecret = configService.get('RAZORPAY_KEY_SECRET');
    
    console.log('\nConfigService simulation check:');
    console.log('RAZORPAY_KEY_ID:', keyId);
    console.log('RAZORPAY_KEY_SECRET:', keySecret ? '**** (loaded)' : 'NOT FOUND');
    
    if (!keyId || !keySecret) {
      console.log('ERROR: Razorpay credentials not found in environment variables');
    } else {
      console.log('SUCCESS: Razorpay credentials found');
    }
  } catch (error) {
    console.error('Error testing ConfigService:', error);
  }
}

testConfigService();