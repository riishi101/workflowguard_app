import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('🔍 SUBSCRIPTION GUARD - Starting subscription check');
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.error('❌ SUBSCRIPTION GUARD - No user in request');
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = user.sub || user.id || user.userId;
    console.log('🔍 SUBSCRIPTION GUARD - User ID extracted:', userId);
    if (!userId) {
      console.error('❌ SUBSCRIPTION GUARD - User ID not found in token');
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Get user subscription status
      console.log('🔍 SUBSCRIPTION GUARD - Getting user subscription for:', userId);
      const subscription =
        await this.subscriptionService.getUserSubscription(userId);
      console.log('✅ SUBSCRIPTION GUARD - Subscription retrieved:', {
        planId: subscription.planId,
        status: subscription.status,
        planName: subscription.planName
      });

      // Check if subscription is cancelled or past due
      if (subscription.status === 'canceled') {
        throw new HttpException(
          'Subscription cancelled. Please reactivate your subscription to continue using WorkflowGuard.',
          HttpStatus.FORBIDDEN,
        );
      }

      if (subscription.status === 'past_due') {
        throw new HttpException(
          'Payment failed. Please update your payment method to continue using WorkflowGuard.',
          HttpStatus.FORBIDDEN,
        );
      }

      // Check if subscription has expired (for non-trial subscriptions)
      if (
        subscription.nextBillingDate &&
        new Date() > new Date(subscription.nextBillingDate)
      ) {
        throw new HttpException(
          'Subscription expired. Please renew your subscription to continue using WorkflowGuard.',
          HttpStatus.FORBIDDEN,
        );
      }

      console.log('✅ SUBSCRIPTION GUARD - All checks passed, access granted');
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        console.log('🔍 SUBSCRIPTION GUARD - HttpException thrown:', error.message, 'Status:', error.getStatus());
        throw error;
      }

      console.error('❌ SUBSCRIPTION GUARD - Unexpected error:', {
        error: error.message,
        stack: error.stack,
        userId,
        errorType: error.constructor.name
      });
      throw new HttpException(
        'Failed to verify subscription status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
