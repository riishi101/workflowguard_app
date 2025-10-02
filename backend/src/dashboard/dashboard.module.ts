import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [WorkflowModule, PrismaModule, AppCacheModule, SubscriptionModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}