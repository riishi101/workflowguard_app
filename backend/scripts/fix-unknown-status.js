const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUnknownStatus() {
  console.log('🔧 Starting fix for workflows with unknown status...');
  
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

    console.log(`📊 Found ${workflows.length} workflows to check`);

    let fixedCount = 0;
    
    for (const workflow of workflows) {
      const latestVersion = workflow.versions[0];
      
      if (latestVersion && latestVersion.data?.status === 'unknown') {
        console.log(`🔍 Fixing workflow: ${workflow.name} (${workflow.hubspotId})`);
        
        // Update the version data to set status as 'active' instead of 'unknown'
        const updatedData = {
          ...latestVersion.data,
          status: 'active',
          enabled: true,
          metadata: {
            ...latestVersion.data.metadata,
            statusFix: {
              fixedAt: new Date().toISOString(),
              reason: 'Fixed unknown status to active as default',
              originalStatus: 'unknown'
            }
          }
        };

        await prisma.workflowVersion.update({
          where: { id: latestVersion.id },
          data: { data: updatedData }
        });

        fixedCount++;
        console.log(`✅ Fixed: ${workflow.name}`);
      }
    }

    console.log(`🎉 Fix completed! Updated ${fixedCount} workflows from 'unknown' to 'active' status`);
    
  } catch (error) {
    console.error('❌ Error fixing unknown status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnknownStatus();
