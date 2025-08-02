const { spawn } = require('child_process');

console.log('🚀 Starting backend server with minimal TypeScript checking...');

// Start the server with ts-node and skip type checking
const child = spawn('npx', ['ts-node', '--transpile-only', 'src/main.ts'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '4000',
    TS_NODE_TRANSPILE_ONLY: 'true'
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