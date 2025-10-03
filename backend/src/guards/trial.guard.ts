import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class TrialGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('🔍 TRIAL GUARD - Starting trial check');
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.error('❌ TRIAL GUARD - No user in request');
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = user.sub || user.id || user.userId;
    console.log('🔍 TRIAL GUARD - User ID extracted:', userId);
    if (!userId) {
      console.error('❌ TRIAL GUARD - User ID not found in token');
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Check trial status
      console.log('🔍 TRIAL GUARD - Getting trial status for:', userId);
      const trialStatus = await this.subscriptionService.getTrialStatus(userId);
      console.log('✅ TRIAL GUARD - Trial status retrieved:', trialStatus);

      console.log(
        'TrialGuard - Trial status for user',
        userId,
        ':',
        trialStatus,
      );

      // If trial has expired, block access
      if (trialStatus.isTrialExpired) {
        console.log('TrialGuard - Blocking access for expired trial:', userId);
        throw new HttpException(
          'Trial expired. Please upgrade your subscription to continue using WorkflowGuard.',
          HttpStatus.FORBIDDEN,
        );
      }

      console.log('✅ TRIAL GUARD - Access granted for user:', userId);
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        console.log('🔍 TRIAL GUARD - HttpException thrown:', error.message, 'Status:', error.getStatus());
        throw error;
      }

      console.error('❌ TRIAL GUARD - Error checking trial status:', {
        error: error.message,
        stack: error.stack,
        userId,
        errorType: error.constructor.name
      });

      // Block access if we can't verify trial status - security first
      console.error(
        'TrialGuard - Blocking access due to service error for user:',
        userId,
      );
      throw new HttpException(
        'Unable to verify trial status. Please contact support.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
