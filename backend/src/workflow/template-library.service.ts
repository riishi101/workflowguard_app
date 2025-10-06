import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplateLibraryService {
  private readonly logger = new Logger(TemplateLibraryService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Provide a comprehensive library of workflow templates
   * Trial users can use these as starting points and customize them
   */
  async getWorkflowTemplates(category?: string) {
    const templates = this.getBuiltInTemplates();
    
    if (category) {
      return templates.filter(t => t.category === category);
    }
    
    return templates;
  }

  /**
   * Create a workflow from a template for trial users
   */
  async createFromTemplate(userId: string, templateId: string, customizations: any = {}) {
    const template = this.getBuiltInTemplates().find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Apply customizations to template
    const workflowData = this.applyCustomizations(template.workflow, customizations);

    // Create workflow record
    const workflow = await this.prisma.workflow.create({
      data: {
        hubspotId: `template-${templateId}-${Date.now()}`,
        name: customizations.name || template.name,
        ownerId: userId,
        status: 'active',
      },
    });

    // Create initial version
    await this.prisma.workflowVersion.create({
      data: {
        workflowId: workflow.id,
        versionNumber: 1,
        data: workflowData,
        snapshotType: 'TEMPLATE_CREATED',
        createdBy: userId,
      },
    });

    return {
      success: true,
      workflow,
      template: template.name,
      message: 'Workflow created from template successfully',
      nextSteps: [
        'Customize the workflow to match your needs',
        'Test the workflow with sample data',
        'Deploy to your HubSpot account when ready',
        'Enable WorkflowGuard protection'
      ]
    };
  }

  /**
   * Built-in workflow templates covering common use cases
   */
  private getBuiltInTemplates() {
    return [
      {
        id: 'lead-nurturing-basic',
        name: 'Basic Lead Nurturing Sequence',
        category: 'lead-generation',
        description: 'A simple 5-email sequence for new leads',
        difficulty: 'Beginner',
        estimatedSetupTime: '15 minutes',
        workflow: {
          name: 'Lead Nurturing Sequence',
          type: 'DRIP_DELAY',
          triggers: [
            {
              type: 'form_submission',
              formName: 'Newsletter Signup',
              criteria: { lifecycle_stage: 'subscriber' }
            }
          ],
          actions: [
            {
              type: 'EMAIL',
              subject: 'Welcome! Here\'s what to expect',
              template: 'welcome-email',
              delay: 0
            },
            {
              type: 'DELAY',
              duration: 86400000, // 1 day
              unit: 'days',
              value: 1
            },
            {
              type: 'EMAIL',
              subject: 'Getting started with [Product Name]',
              template: 'getting-started',
              delay: 86400000
            },
            {
              type: 'DELAY',
              duration: 259200000, // 3 days
              unit: 'days',
              value: 3
            },
            {
              type: 'BRANCH',
              condition: 'email_engagement > 50%',
              trueActions: [
                {
                  type: 'EMAIL',
                  subject: 'Advanced tips for power users',
                  template: 'advanced-tips'
                }
              ],
              falseActions: [
                {
                  type: 'EMAIL',
                  subject: 'Need help getting started?',
                  template: 'help-offer'
                }
              ]
            }
          ],
          goals: [
            {
              type: 'property_change',
              property: 'lifecycle_stage',
              value: 'marketing_qualified_lead'
            }
          ]
        }
      },
      {
        id: 'customer-onboarding',
        name: 'Customer Onboarding Flow',
        category: 'customer-success',
        description: 'Welcome new customers and guide them through setup',
        difficulty: 'Intermediate',
        estimatedSetupTime: '30 minutes',
        workflow: {
          name: 'Customer Onboarding',
          type: 'DRIP_DELAY',
          triggers: [
            {
              type: 'property_change',
              property: 'lifecycle_stage',
              newValue: 'customer'
            }
          ],
          actions: [
            {
              type: 'EMAIL',
              subject: 'Welcome to [Company Name]! Let\'s get you started',
              template: 'customer-welcome'
            },
            {
              type: 'TASK',
              title: 'Schedule onboarding call',
              assignee: 'sales_rep',
              dueDate: '+2 days'
            },
            {
              type: 'DELAY',
              duration: 172800000, // 2 days
              unit: 'days',
              value: 2
            },
            {
              type: 'EMAIL',
              subject: 'Your quick setup guide',
              template: 'setup-guide',
              attachments: ['setup-checklist.pdf']
            }
          ]
        }
      },
      {
        id: 'abandoned-cart',
        name: 'Abandoned Cart Recovery',
        category: 'e-commerce',
        description: 'Win back customers who left items in their cart',
        difficulty: 'Advanced',
        estimatedSetupTime: '45 minutes',
        workflow: {
          name: 'Abandoned Cart Recovery',
          type: 'BEHAVIORAL',
          triggers: [
            {
              type: 'page_view',
              page: '/checkout',
              condition: 'did_not_complete_purchase',
              timeframe: '1 hour'
            }
          ],
          actions: [
            {
              type: 'DELAY',
              duration: 3600000, // 1 hour
              unit: 'hours',
              value: 1
            },
            {
              type: 'EMAIL',
              subject: 'Forgot something? Your cart is waiting',
              template: 'cart-reminder-1',
              personalization: {
                cart_items: true,
                discount_code: '10OFF'
              }
            },
            {
              type: 'DELAY',
              duration: 86400000, // 1 day
              unit: 'days',
              value: 1
            },
            {
              type: 'EMAIL',
              subject: 'Last chance: 15% off your order',
              template: 'cart-reminder-2',
              personalization: {
                discount_code: '15OFF',
                urgency: true
              }
            }
          ]
        }
      },
      {
        id: 'event-follow-up',
        name: 'Event Follow-up Sequence',
        category: 'events',
        description: 'Nurture leads after webinars or events',
        difficulty: 'Intermediate',
        estimatedSetupTime: '25 minutes',
        workflow: {
          name: 'Event Follow-up',
          type: 'DRIP_DELAY',
          triggers: [
            {
              type: 'event_attendance',
              eventType: 'webinar',
              status: 'attended'
            }
          ],
          actions: [
            {
              type: 'EMAIL',
              subject: 'Thanks for attending! Here\'s your recording',
              template: 'event-thank-you',
              attachments: ['recording-link', 'slides.pdf']
            },
            {
              type: 'DELAY',
              duration: 259200000, // 3 days
              unit: 'days',
              value: 3
            },
            {
              type: 'EMAIL',
              subject: 'Ready to take the next step?',
              template: 'next-steps',
              cta: 'Schedule Demo'
            }
          ]
        }
      }
    ];
  }

  /**
   * Apply user customizations to a template
   */
  private applyCustomizations(template: any, customizations: any) {
    const customized = JSON.parse(JSON.stringify(template)); // Deep clone

    // Apply name customization
    if (customizations.name) {
      customized.name = customizations.name;
    }

    // Apply email customizations
    if (customizations.emails) {
      customized.actions.forEach((action: any, index: number) => {
        if (action.type === 'EMAIL' && customizations.emails[index]) {
          Object.assign(action, customizations.emails[index]);
        }
      });
    }

    // Apply delay customizations
    if (customizations.delays) {
      customized.actions.forEach((action: any, index: number) => {
        if (action.type === 'DELAY' && customizations.delays[index]) {
          action.duration = customizations.delays[index].duration;
          action.value = customizations.delays[index].value;
        }
      });
    }

    return customized;
  }

  /**
   * Get template categories for filtering
   */
  getTemplateCategories() {
    return [
      {
        id: 'lead-generation',
        name: 'Lead Generation',
        description: 'Attract and nurture potential customers',
        icon: 'target'
      },
      {
        id: 'customer-success',
        name: 'Customer Success',
        description: 'Onboard and retain customers',
        icon: 'users'
      },
      {
        id: 'e-commerce',
        name: 'E-commerce',
        description: 'Boost sales and reduce cart abandonment',
        icon: 'shopping-cart'
      },
      {
        id: 'events',
        name: 'Events & Webinars',
        description: 'Promote events and follow up with attendees',
        icon: 'calendar'
      },
      {
        id: 're-engagement',
        name: 'Re-engagement',
        description: 'Win back inactive customers',
        icon: 'refresh'
      }
    ];
  }
}
