import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WorkflowModule } from './workflow/workflow.module';
import { WorkflowVersionModule } from './workflow-version/workflow-version.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { WebhookModule } from './webhook/webhook.module';
// import { HubSpotModule } from './modules/hubspot.module';
import { EmailModule } from './email/email.module';
// import { RealtimeModule } from './realtime/realtime.module';
// import { MetricsModule } from './metrics/metrics.module';
// import { SupportModule } from './support/support.module';
// import { AnalyticsModule } from './analytics/analytics.module';
// import { OverageModule } from './overage/overage.module';
import { DashboardController } from './dashboard/dashboard.controller';
import { HubSpotController } from './controllers/hubspot.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkflowModule,
    WorkflowVersionModule,
    AuditLogModule,
    UserModule,
    WebhookModule,
    // HubSpotModule,
    EmailModule,
    // RealtimeModule,
    // MetricsModule,
    // SupportModule,
    // AnalyticsModule,
    // OverageModule,
  ],
  controllers: [AppController, DashboardController, HubSpotController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
