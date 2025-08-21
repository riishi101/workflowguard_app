import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowService } from './workflow.service';
import { PrismaService } from '../prisma/prisma.service';
import { HubSpotService } from '../services/hubspot.service';
import { WorkflowVersionService } from '../workflow-version/workflow-version.service';

describe('WorkflowService', () => {
  let service: WorkflowService;

  const mockPrismaService = {
    workflow: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workflowVersion: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
    },
  };

  const mockHubSpotService = {
    getWorkflows: jest.fn(),
  };

  const mockWorkflowVersionService = {
    createInitialVersion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HubSpotService,
          useValue: mockHubSpotService,
        },
        {
          provide: WorkflowVersionService,
          useValue: mockWorkflowVersionService,
        },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
