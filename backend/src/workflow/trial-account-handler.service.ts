import { Injectable, Logger } from '@nestjs/common';
import { HubSpotService } from '../services/hubspot.service';

@Injectable()
export class TrialAccountHandlerService {
  private readonly logger = new Logger(TrialAccountHandlerService.name);

  constructor(private hubspotService: HubSpotService) {}

  /**
   * Handle trial account limitations with multiple solutions
   */
  async getWorkflowsWithTrialSupport(userId: string) {
    try {
      // First, try to get real workflows
      const realWorkflows = await this.hubspotService.getWorkflows(userId);
      
      if (realWorkflows && realWorkflows.length > 0) {
        return {
          success: true,
          data: realWorkflows,
          isDemo: false,
          message: `Successfully fetched ${realWorkflows.length} workflows from HubSpot`
        };
      }

      // If 0 workflows returned, likely trial account - provide demo workflows
      this.logger.warn(`Zero workflows returned for user ${userId} - providing demo workflows`);
      
      return {
        success: true,
        data: this.getDemoWorkflows(),
        isDemo: true,
        message: 'Multiple solutions available for HubSpot trial accounts',
        trialSolutions: {
          demoWorkflows: {
            available: true,
            description: 'Explore WorkflowGuard features with sample workflows',
            data: this.getDemoWorkflows()
          },
          manualImport: {
            available: true,
            description: 'Import your real workflows manually',
            endpoint: '/api/workflow/manual-import',
            instructions: 'Manual import instructions available at /api/workflow/manual-import/guide'
          },
          templateLibrary: {
            available: true,
            description: 'Start with proven workflow templates',
            endpoint: '/api/workflow/templates',
            categories: ['lead-generation', 'customer-success', 'e-commerce', 'events']
          },
          browserExtension: {
            available: false, // Coming soon
            description: 'Automatic workflow protection (Coming Soon)',
            eta: 'Next month',
            features: ['Real-time sync', 'Automatic backup', 'No API limitations']
          },
          upgradeIncentive: {
            title: 'Unlock Full Automation',
            description: 'Upgrade HubSpot for seamless integration',
            benefits: [
              'Automatic workflow synchronization',
              'Real-time change detection',
              'One-click backup and restore',
              'Advanced compliance reporting'
            ],
            upgradeUrl: 'https://app.hubspot.com/pricing'
          }
        }
      };

    } catch (error) {
      this.logger.error(`Error fetching workflows for user ${userId}:`, error);
      
      // On any error, provide demo workflows as fallback
      return {
        success: true,
        data: this.getDemoWorkflows(),
        isDemo: true,
        message: 'Demo workflows shown due to API limitations',
        error: error.message
      };
    }
  }

  /**
   * Generate realistic demo workflows based on common HubSpot patterns
   */
  private getDemoWorkflows() {
    return [
      {
        id: 'demo-lead-nurturing',
        name: 'Demo: Lead Nurturing Sequence',
        type: 'DRIP_DELAY',
        enabled: true,
        contactListIds: [],
        actions: [
          {
            type: 'EMAIL',
            subject: 'Welcome to Our Newsletter',
            emailId: 'demo-email-1'
          },
          {
            type: 'DELAY',
            delay: 86400000, // 1 day in milliseconds
            delayType: 'DURATION'
          },
          {
            type: 'SET_CONTACT_PROPERTY',
            propertyName: 'lifecyclestage',
            propertyValue: 'marketingqualifiedlead'
          },
          {
            type: 'EMAIL',
            subject: 'Follow-up: Getting Started Guide',
            emailId: 'demo-email-2'
          }
        ],
        enrollmentTriggers: [
          {
            type: 'form_submission',
            formId: 'demo-form-123',
            formName: 'Newsletter Signup Form'
          }
        ],
        goals: [
          {
            type: 'CONTACT_PROPERTY_VALUE',
            propertyName: 'lifecyclestage',
            propertyValue: 'customer'
          }
        ]
      },
      {
        id: 'demo-customer-onboarding',
        name: 'Demo: Customer Onboarding Flow',
        type: 'DRIP_DELAY',
        enabled: true,
        contactListIds: [],
        actions: [
          {
            type: 'EMAIL',
            subject: 'Welcome! Let\'s Get You Started',
            emailId: 'demo-onboarding-1'
          },
          {
            type: 'DELAY',
            delay: 259200000, // 3 days
            delayType: 'DURATION'
          },
          {
            type: 'BRANCH',
            criteria: {
              propertyName: 'demo_engagement_score',
              operator: 'GT',
              value: '50'
            }
          },
          {
            type: 'EMAIL',
            subject: 'Advanced Features Guide',
            emailId: 'demo-onboarding-2'
          }
        ],
        enrollmentTriggers: [
          {
            type: 'contact_property_change',
            propertyName: 'lifecyclestage',
            propertyValue: 'customer'
          }
        ]
      },
      {
        id: 'demo-re-engagement',
        name: 'Demo: Re-engagement Campaign',
        type: 'DRIP_DELAY',
        enabled: false,
        contactListIds: [],
        actions: [
          {
            type: 'EMAIL',
            subject: 'We Miss You! Special Offer Inside',
            emailId: 'demo-reengagement-1'
          },
          {
            type: 'DELAY',
            delay: 604800000, // 7 days
            delayType: 'DURATION'
          },
          {
            type: 'BRANCH',
            criteria: {
              propertyName: 'email_opened',
              operator: 'EQ',
              value: 'false'
            }
          },
          {
            type: 'EMAIL',
            subject: 'Last Chance: Don\'t Miss Out',
            emailId: 'demo-reengagement-2'
          }
        ],
        enrollmentTriggers: [
          {
            type: 'contact_property_change',
            propertyName: 'last_activity_date',
            operator: 'LT',
            value: '30 days ago'
          }
        ]
      }
    ];
  }

  /**
   * Check if user has trial account limitations
   */
  async checkTrialLimitations(userId: string) {
    try {
      const workflows = await this.hubspotService.getWorkflows(userId);
      
      if (!workflows || workflows.length === 0) {
        return {
          isTrial: true,
          limitations: [
            'HubSpot trial accounts cannot access workflows via API',
            'Workflow data is not available for backup or version control',
            'Demo workflows are shown to demonstrate functionality'
          ],
          recommendations: [
            'Upgrade HubSpot account to Professional or Enterprise',
            'Contact HubSpot support about API access',
            'Use demo mode to understand WorkflowGuard features'
          ],
          upgradeInfo: {
            url: 'https://app.hubspot.com/pricing',
            benefits: [
              'Full API access to all workflows',
              'Real-time workflow backup and versioning',
              'Complete workflow export and restore capabilities'
            ]
          }
        };
      }

      return {
        isTrial: false,
        message: 'Full HubSpot account detected with API access'
      };

    } catch (error) {
      return {
        isTrial: true,
        error: 'Unable to verify account status',
        message: 'Assuming trial limitations for safety'
      };
    }
  }
}
