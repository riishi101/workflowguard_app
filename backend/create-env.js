const fs = require('fs');

const envContent = `# Payment Processing - Razorpay
RAZORPAY_KEY_ID=rzp_live_R6PjXR1FYupO0Y
RAZORPAY_KEY_SECRET=O5McpwbAgoiSNMJDQetruaTK`;

fs.writeFileSync('.env.test', envContent, 'utf8');
console.log('.env.test file created successfully');