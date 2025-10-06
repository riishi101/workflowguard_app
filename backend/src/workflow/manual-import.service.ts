import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManualImportService {
  private readonly logger = new Logger(ManualImportService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Allow trial users to manually paste workflow JSON from HubSpot
   * This bypasses API limitations by letting users export/import manually
   */
  async importWorkflowFromJSON(userId: string, workflowData: any) {
    try {
      // Validate the workflow data structure
      this.validateWorkflowStructure(workflowData);

      // Create workflow record
      const workflow = await this.prisma.workflow.create({
        data: {
          hubspotId: `manual-${Date.now()}`,
          name: workflowData.name || 'Imported Workflow',
          ownerId: userId,
          status: 'active',
          // Note: isManualImport field not in schema - using hubspotId prefix instead
        },
      });

      // Create initial version
      await this.prisma.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          versionNumber: 1,
          data: workflowData,
          snapshotType: 'MANUAL_IMPORT',
          createdBy: userId,
        },
      });

      return {
        success: true,
        workflow,
        message: 'Workflow imported successfully from manual data',
        instructions: this.getManualImportInstructions(),
      };
    } catch (error) {
      this.logger.error('Failed to import workflow manually:', error);
      throw new BadRequestException('Invalid workflow data format');
    }
  }

  /**
   * Provide step-by-step instructions for manual workflow export from HubSpot
   */
  getManualImportInstructions() {
    return {
      title: 'How to Export Workflows from HubSpot (Trial Account)',
      steps: [
        {
          step: 1,
          title: 'Access HubSpot Workflows',
          description: 'Go to Automation > Workflows in your HubSpot account',
          note: 'Even trial accounts can view workflow configurations'
        },
        {
          step: 2,
          title: 'Select Your Workflow',
          description: 'Click on the workflow you want to protect',
        },
        {
          step: 3,
          title: 'Copy Workflow Configuration',
          description: 'Use browser developer tools to inspect the workflow data',
          technical: 'Look for network requests containing workflow JSON data'
        },
        {
          step: 4,
          title: 'Paste into WorkflowGuard',
          description: 'Use our import tool to paste the workflow configuration',
        },
        {
          step: 5,
          title: 'Enable Protection',
          description: 'WorkflowGuard will now monitor and protect your workflow',
        }
      ],
      benefits: [
        'Full workflow protection even with trial account',
        'Version control and change tracking',
        'Backup and restore capabilities',
        'Compliance reporting'
      ]
    };
  }

  /**
   * Validate that the imported data looks like a HubSpot workflow
   */
  private validateWorkflowStructure(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Workflow data must be a valid JSON object');
    }

    // Basic structure validation
    const requiredFields = ['name'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate workflow has some actions or structure
    if (!data.actions && !data.steps && !data.triggers) {
      throw new Error('Workflow must contain actions, steps, or triggers');
    }

    return true;
  }

  /**
   * Generate a manual export guide for users
   */
  async generateExportGuide(userId: string) {
    return {
      title: 'Manual Workflow Export Guide',
      description: 'Since your HubSpot trial account has API limitations, follow these steps to manually export your workflows:',
      
      methods: [
        {
          name: 'Browser Developer Tools Method',
          difficulty: 'Advanced',
          steps: [
            'Open HubSpot workflows page',
            'Open browser Developer Tools (F12)',
            'Go to Network tab',
            'Click on a workflow to view it',
            'Look for API calls containing workflow data',
            'Copy the JSON response'
          ]
        },
        {
          name: 'Screenshot + Manual Recreation',
          difficulty: 'Beginner',
          steps: [
            'Take screenshots of your workflow steps',
            'Document trigger conditions',
            'Note all email templates and delays',
            'Use our workflow builder to recreate',
            'Enable protection once recreated'
          ]
        },
        {
          name: 'HubSpot Export (if available)',
          difficulty: 'Easy',
          steps: [
            'Check if HubSpot offers workflow export',
            'Download workflow configuration file',
            'Upload to WorkflowGuard import tool'
          ]
        }
      ],

      alternativeSolution: {
        title: 'Upgrade Recommendation',
        description: 'For seamless integration, consider upgrading your HubSpot account',
        benefits: [
          'Automatic workflow synchronization',
          'Real-time change detection',
          'One-click backup and restore',
          'Advanced compliance reporting'
        ],
        upgradeUrl: 'https://app.hubspot.com/pricing'
      }
    };
  }
}
