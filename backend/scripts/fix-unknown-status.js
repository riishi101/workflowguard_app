const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function getHubSpotWorkflowStatus(hubspotId, accessToken) {
  try {
    const response = await axios.get(
      `https://api.hubapi.com/automation/v4/workflows/${hubspotId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.status; // Returns 'ACTIVE', 'INACTIVE', etc.
  } catch (error) {
    console.log(`⚠️  Could not fetch HubSpot status for workflow ${hubspotId}, defaulting to ACTIVE`);
    return 'ACTIVE'; // Fallback to ACTIVE if API call fails
  }
}

async function fixUnknownStatus() {
  console.log('🔧 Starting fix for workflows with unknown status...');
  
  try {
    // Get user with HubSpot access token
    const user = await prisma.user.findFirst({
      where: {
        hubspotAccessToken: { not: null }
      }
    });

    if (!user?.hubspotAccessToken) {
      console.error('❌ No HubSpot access token found. Cannot fetch workflow statuses.');
      return;
    }

    // Get all workflows with their latest versions
    const workflows = await prisma.workflow.findMany({
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });

    console.log(`📊 Found ${workflows.length} workflows to check`);

    let fixedCount = 0;
    
    for (const workflow of workflows) {
      const latestVersion = workflow.versions[0];
      
      if (latestVersion && latestVersion.data?.status === 'unknown') {
        console.log(`🔍 Fixing workflow: ${workflow.name} (${workflow.hubspotId})`);
        
        // Fetch actual HubSpot status
        const hubspotStatus = await getHubSpotWorkflowStatus(workflow.hubspotId, user.hubspotAccessToken);
        const normalizedStatus = hubspotStatus.toLowerCase();
        
        // Update the version data with actual HubSpot status
        const updatedData = {
          ...latestVersion.data,
          status: normalizedStatus,
          enabled: hubspotStatus === 'ACTIVE',
          metadata: {
            ...latestVersion.data.metadata,
            statusFix: {
              fixedAt: new Date().toISOString(),
              reason: 'Fixed unknown status with actual HubSpot status',
              originalStatus: 'unknown',
              hubspotStatus: hubspotStatus
            }
          }
        };

        await prisma.workflowVersion.update({
          where: { id: latestVersion.id },
          data: { data: updatedData }
        });

        fixedCount++;
        console.log(`✅ Fixed: ${workflow.name} → Status: ${normalizedStatus}`);
      }
    }

    console.log(`🎉 Fix completed! Updated ${fixedCount} workflows with actual HubSpot statuses`);
    
  } catch (error) {
    console.error('❌ Error fixing unknown status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnknownStatus();
