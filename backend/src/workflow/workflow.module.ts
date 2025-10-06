import { Module, forwardRef } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { TrialAccountHandlerService } from './trial-account-handler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { HubSpotModule } from '../services/hubspot.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { WorkflowVersionModule } from '../workflow-version/workflow-version.module';
import { EncryptionService } from '../services/encryption.service';
import { SecurityMonitoringService } from '../services/security-monitoring.service';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    SubscriptionModule,
    HubSpotModule,
    forwardRef(() => WorkflowVersionModule),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService, TrialAccountHandlerService, EncryptionService, SecurityMonitoringService],
  exports: [WorkflowService, TrialAccountHandlerService, EncryptionService, SecurityMonitoringService],
})
export class WorkflowModule {}
