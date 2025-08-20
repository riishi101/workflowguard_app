// Usage: node backend/scripts/clear-hubspot-data.js
// Clears HubSpot-related fields for all users.
// Requires DATABASE_URL env configured (your normal backend .env).

(async () => {
  try {
    // Load env from project root .env (one level up from backend/)
    const path = require('path');
    const dotenvPath = path.resolve(__dirname, '../../.env');
    require('dotenv').config({ path: dotenvPath });

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const result = await prisma.user.updateMany({
      data: {
        hubspotPortalId: null,
        hubspotAccessToken: null,
        hubspotRefreshToken: null,
        hubspotTokenExpiresAt: null,
      },
    });

    console.log(`Cleared HubSpot fields for ${result.count} user(s).`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to clear HubSpot fields:', err);
    process.exit(1);
  }
})();
