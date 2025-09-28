const fs = require('fs');
const path = require('path');

// Read the .env file content
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('Raw .env file content:');
console.log('=====================');
console.log(envContent);
console.log('=====================');

// Parse the .env file manually
const lines = envContent.split('\n');
console.log('\nParsed lines:');
lines.forEach((line, index) => {
  console.log(`${index}: "${line}"`);
});

// Look for Razorpay keys specifically
console.log('\nLooking for Razorpay keys:');
const razorpayLines = lines.filter(line => line.includes('RAZORPAY'));
razorpayLines.forEach((line, index) => {
  console.log(`${index}: "${line}"`);
});

// Check if there are any special characters
console.log('\nChecking for special characters in Razorpay lines:');
razorpayLines.forEach((line, index) => {
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) {
      console.log(`Line ${index}, position ${i}: char code ${code} (${char})`);
    }
  }
});