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
import { SubscriptionModule } from './subscription/subscription.module';
import { SupportModule } from './support/support.module';
import { EmailModule } from './email/email.module';
import { MetricsModule } from './metrics/metrics.module';
import { WebhookModule } from './webhook/webhook.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppCacheModule } from './cache/cache.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { HubSpotModule } from './services/hubspot.module';
import { HubSpotMarketplaceController } from './controllers/hubspot-marketplace.controller';
import { BillingController } from './controllers/hubspot-billing.controller';
import { HealthModule } from './health/health.module';
// Removed duplicate imports for Razorpay controllers that are already provided by RazorpayModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HubSpotModule,
    AuthModule,
    UserModule,
    WorkflowModule,
    WorkflowVersionModule,
    AuditLogModule,
    EmailModule,
    WebhookModule,
    SupportModule,
    MetricsModule,
    SubscriptionModule,
    DashboardModule,
    AnalyticsModule,
    AppCacheModule,
    RazorpayModule,
    WhatsAppModule,
    HealthModule,
  ],
  controllers: [AppController, HubSpotMarketplaceController, BillingController],
  providers: [AppService],
})
export class AppModule {}