import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { TrialGuard } from '../guards/trial.guard';

describe('WorkflowController', () => {
  let controller: WorkflowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowController],
      providers: [
        {
          provide: WorkflowService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByHubspotId: jest.fn(),
            getHubSpotWorkflows: jest.fn(),
            getProtectedWorkflows: jest.fn(),
            syncHubSpotWorkflows: jest.fn(),
            createAutomatedBackup: jest.fn(),
            createChangeNotification: jest.fn(),
            createApprovalRequest: jest.fn(),
            generateComplianceReport: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            restoreWorkflowVersion: jest.fn(),
            rollbackWorkflow: jest.fn(),
            downloadWorkflowVersion: jest.fn(),
            startWorkflowProtection: jest.fn(),
            getWorkflowStats: jest.fn(),
          },
        },
        {
          provide: SubscriptionService,
          useValue: {
            getSubscriptionByUserId: jest
              .fn()
              .mockResolvedValue({ planId: 'pro' }),
          },
        },
        TrialGuard,
      ],
    }).compile();

    controller = module.get<WorkflowController>(WorkflowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
