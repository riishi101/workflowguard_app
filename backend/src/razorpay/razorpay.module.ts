import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RazorpayService } from './razorpay.service';
import { RazorpayController } from './razorpay.controller';
import { RazorpayConfigController } from './razorpay-config.controller';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [ConfigModule, forwardRef(() => SubscriptionModule)],
  providers: [RazorpayService],
  controllers: [RazorpayController, RazorpayConfigController],
  exports: [RazorpayService],
})
export class RazorpayModule {}
