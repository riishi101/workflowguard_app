import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WorkflowModule } from './workflow/workflow.module';
import { WorkflowVersionModule } from './workflow-version/workflow-version.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailModule } from './email/email.module';
import { NotificationModule } from './notification/notification.module';
import { WebhookModule } from './webhook/webhook.module';
import { SupportModule } from './support/support.module';
import { HubSpotModule } from './modules/hubspot.module';
import { HubSpotBillingModule } from './modules/hubspot-billing.module';
import { OverageModule } from './overage/overage.module';
import { RealtimeModule } from './realtime/realtime.module';
import { SupportTicketModule } from './support/support-ticket.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    WorkflowModule,
    WorkflowVersionModule,
    AuditLogModule,
    AnalyticsModule,
    EmailModule,
    NotificationModule,
    WebhookModule,
    SupportModule,
    HubSpotModule,
    HubSpotBillingModule,
    OverageModule,
    RealtimeModule,
    SupportTicketModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
