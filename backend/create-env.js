const fs = require('fs');

const envContent = `# Payment Processing - Razorpay
RAZORPAY_KEY_ID=rzp_live_RP85gyDpAKJ4Au
RAZORPAY_KEY_SECRET=j7s5n6sJ4Yec4n3AdSYeJ2LW`;

fs.writeFileSync('.env.test', envContent, 'utf8');
console.log('.env.test file created successfully');