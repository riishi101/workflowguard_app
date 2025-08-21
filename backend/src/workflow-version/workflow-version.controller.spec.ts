import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowVersionController } from './workflow-version.controller';
import { WorkflowVersionService } from './workflow-version.service';

describe('WorkflowVersionController', () => {
  let controller: WorkflowVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowVersionController],
      providers: [
        {
          provide: WorkflowVersionService,
          useValue: {
            // mock methods if they are called in tests
          },
        },
      ],
    }).compile();

    controller = module.get<WorkflowVersionController>(
      WorkflowVersionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
