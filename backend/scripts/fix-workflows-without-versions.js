const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixWorkflowsWithoutVersions() {
  console.log('🔧 Starting comprehensive migration: Fix workflows without versions...');
  
  try {
    // First, let's analyze the current state
    const totalWorkflows = await prisma.workflow.count();
    const workflowsWithVersions = await prisma.workflow.count({
      where: {
        versions: {
          some: {}
        }
      }
    });
    const workflowsWithoutVersions = totalWorkflows - workflowsWithVersions;

    console.log('📊 Current Database State:');
    console.log(`   Total workflows: ${totalWorkflows}`);
    console.log(`   Workflows with versions: ${workflowsWithVersions}`);
    console.log(`   Workflows without versions: ${workflowsWithoutVersions}`);

    if (workflowsWithoutVersions === 0) {
      console.log('✅ No workflows need fixing. All workflows have versions.');
      return { fixed: 0, failed: 0, total: 0 };
    }

    // Find all workflows that have no versions
    const problematicWorkflows = await prisma.workflow.findMany({
      where: {
        versions: {
          none: {}
        }
      },
      include: {
        owner: true,
        versions: true
      }
    });

    console.log(`\n🔍 Found ${problematicWorkflows.length} workflows that need fixing:`);
    problematicWorkflows.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w.name} (ID: ${w.id}, HubSpot: ${w.hubspotId})`);
    });

    let fixed = 0;
    let failed = 0;
    const errors = [];

    // Use transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      for (const workflow of problematicWorkflows) {
        try {
          console.log(`\n🔄 Processing: ${workflow.name}`);
          
          // Check if version was created by another process
          const existingVersions = await tx.workflowVersion.findMany({
            where: { workflowId: workflow.id }
          });

          if (existingVersions.length > 0) {
            console.log(`   ⏭️  Skipping - versions already exist (${existingVersions.length})`);
            continue;
          }

          // Create comprehensive initial version data
          const initialVersionData = {
            hubspotId: workflow.hubspotId,
            name: workflow.name,
            status: 'active',
            type: 'workflow',
            enabled: true,
            createdAt: workflow.createdAt.toISOString(),
            updatedAt: workflow.updatedAt.toISOString(),
            metadata: {
              migration: {
                fixedAt: new Date().toISOString(),
                reason: 'Migration fix for workflows without versions',
                originalCreatedAt: workflow.createdAt.toISOString(),
                fixVersion: '1.0.0'
              },
              protection: {
                initialProtection: true,
                protectedAt: workflow.createdAt.toISOString(),
                protectedBy: workflow.ownerId,
                source: 'migration_fix'
              },
              workflow: {
                hubspotId: workflow.hubspotId,
                name: workflow.name,
                ownerId: workflow.ownerId
              }
            }
          };
        
          // Create initial version
          const initialVersion = await tx.workflowVersion.create({
            data: {
              workflowId: workflow.id,
              versionNumber: 1,
              snapshotType: 'Migration Fix',
              createdBy: workflow.ownerId,
              data: initialVersionData
            }
          });

          // Create audit log entry
          await tx.auditLog.create({
            data: {
              userId: workflow.ownerId,
              action: 'migration_version_created',
              entityType: 'workflow',
              entityId: workflow.id,
              oldValue: null,
              newValue: JSON.stringify({
                versionId: initialVersion.id,
                versionNumber: 1,
                snapshotType: 'Migration Fix',
                reason: 'Fixed workflow without versions during database migration',
                timestamp: new Date().toISOString()
              })
            }
          });

          console.log(`   ✅ Created version ${initialVersion.versionNumber} (${initialVersion.id})`);
          fixed++;
          
        } catch (error) {
          console.error(`   ❌ Failed to fix workflow ${workflow.name}:`, error.message);
          errors.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            error: error.message
          });
          failed++;
        }
      }
    });

    // Final verification
    const finalWorkflowsWithoutVersions = await prisma.workflow.count({
      where: {
        versions: {
          none: {}
        }
      }
    });

    console.log('\n📈 Migration Results:');
    console.log(`✅ Successfully fixed: ${fixed} workflows`);
    console.log(`❌ Failed to fix: ${failed} workflows`);
    console.log(`📊 Total processed: ${problematicWorkflows.length} workflows`);
    console.log(`🔍 Remaining without versions: ${finalWorkflowsWithoutVersions}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Detailed Error Report:');
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.workflowName} (${err.workflowId}): ${err.error}`);
      });
    }

    if (finalWorkflowsWithoutVersions === 0) {
      console.log('\n🎉 SUCCESS: All workflows now have initial versions!');
    } else {
      console.log(`\n⚠️  WARNING: ${finalWorkflowsWithoutVersions} workflows still need manual attention.`);
    }

    return { fixed, failed, total: problematicWorkflows.length, errors };

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Additional utility function to verify the fix
async function verifyWorkflowVersions() {
  console.log('🔍 Verifying workflow versions...');
  
  try {
    const totalWorkflows = await prisma.workflow.count();
    const workflowsWithVersions = await prisma.workflow.count({
      where: {
        versions: {
          some: {}
        }
      }
    });
    const workflowsWithoutVersions = totalWorkflows - workflowsWithVersions;

    console.log('📊 Verification Results:');
    console.log(`   Total workflows: ${totalWorkflows}`);
    console.log(`   Workflows with versions: ${workflowsWithVersions}`);
    console.log(`   Workflows without versions: ${workflowsWithoutVersions}`);

    if (workflowsWithoutVersions === 0) {
      console.log('✅ VERIFICATION PASSED: All workflows have versions!');
    } else {
      console.log(`❌ VERIFICATION FAILED: ${workflowsWithoutVersions} workflows still missing versions`);
    }

    return workflowsWithoutVersions === 0;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'fix';

  if (command === 'verify') {
    verifyWorkflowVersions()
      .then((success) => {
        process.exit(success ? 0 : 1);
      })
      .catch((error) => {
        console.error('💥 Verification failed:', error);
        process.exit(1);
      });
  } else {
    fixWorkflowsWithoutVersions()
      .then((result) => {
        console.log('🏁 Migration completed');
        process.exit(result.failed > 0 ? 1 : 0);
      })
      .catch((error) => {
        console.error('💥 Migration failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { fixWorkflowsWithoutVersions, verifyWorkflowVersions };
