const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugWorkflowStatus() {
  console.log('🔍 Debugging workflow status data...');
  
  try {
    // Get all workflows with their latest versions
    const workflows = await prisma.workflow.findMany({
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });

    console.log(`📊 Found ${workflows.length} total workflows`);
    console.log('');

    for (const workflow of workflows) {
      const latestVersion = workflow.versions[0];
      
      console.log(`🔍 Workflow: ${workflow.name}`);
      console.log(`   HubSpot ID: ${workflow.hubspotId}`);
      console.log(`   Has Version: ${latestVersion ? 'Yes' : 'No'}`);
      
      if (latestVersion) {
        console.log(`   Version Data Type: ${typeof latestVersion.data}`);
        console.log(`   Version Data Keys: ${Object.keys(latestVersion.data || {}).join(', ')}`);
        console.log(`   Status in Data: "${latestVersion.data?.status}"`);
        console.log(`   Status Type: ${typeof latestVersion.data?.status}`);
        console.log(`   Full Data:`, JSON.stringify(latestVersion.data, null, 2));
      }
      
      console.log('   ---');
    }
    
  } catch (error) {
    console.error('❌ Error debugging workflow status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugWorkflowStatus();
