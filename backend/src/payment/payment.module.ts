import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentTrackingService } from './payment-tracking.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule,
    SubscriptionModule,
    PrismaModule,
    AuditLogModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentTrackingService],
  exports: [PaymentService, PaymentTrackingService]
})
export class PaymentModule {}
