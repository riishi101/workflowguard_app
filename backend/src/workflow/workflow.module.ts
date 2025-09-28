import { Module, forwardRef } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { HubSpotModule } from '../services/hubspot.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { WorkflowVersionModule } from '../workflow-version/workflow-version.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    SubscriptionModule,
    HubSpotModule,
    forwardRef(() => WorkflowVersionModule),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
