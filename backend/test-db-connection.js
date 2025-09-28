const { PrismaClient } = require('@prisma/client');

// Create a new Prisma client instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://workflowguard:workflowguard123@34.68.222.13:5432/workflowguard'
    }
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Successfully executed a test query:', result);
    
    // Disconnect
    await prisma.$disconnect();
    console.log('✅ Disconnected from the database');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    
    // Try to disconnect anyway
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('❌ Error during disconnect:', disconnectError.message);
    }
  }
}

testConnection();