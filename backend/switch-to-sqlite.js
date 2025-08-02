const fs = require('fs');
const path = require('path');

// Copy SQLite schema to main schema
const sqliteSchemaPath = path.join(__dirname, 'prisma', 'schema-sqlite.prisma');
const mainSchemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

console.log('Switching to SQLite for local development...');

try {
  // Read SQLite schema
  const sqliteSchema = fs.readFileSync(sqliteSchemaPath, 'utf8');
  
  // Write to main schema
  fs.writeFileSync(mainSchemaPath, sqliteSchema);
  
  console.log('✅ Successfully switched to SQLite schema');
  console.log('📝 Next steps:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma db push');
  console.log('3. Run: npm run start');
  
} catch (error) {
  console.error('❌ Error switching to SQLite:', error.message);
} 