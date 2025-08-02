const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server with ts-node...');

// Start the server with ts-node
const child = spawn('npx', ['ts-node', '-r', 'tsconfig-paths/register', 'src/main.ts'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '4000'
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

child.on('exit', (code) => {
  console.log(`📤 Server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  child.kill('SIGTERM');
  process.exit(0);
}); 