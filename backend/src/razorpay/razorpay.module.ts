import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RazorpayService } from './razorpay.service';
import { RazorpayController } from './razorpay.controller';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [ConfigModule, forwardRef(() => SubscriptionModule)],
  providers: [RazorpayService],
  controllers: [RazorpayController],
  exports: [RazorpayService],
})
export class RazorpayModule {}