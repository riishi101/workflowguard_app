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
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = user.sub || user.id || user.userId;
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Check trial status
      const trialStatus = await this.subscriptionService.getTrialStatus(userId);

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

      console.log('TrialGuard - Access granted for user:', userId);
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error(
        'TrialGuard - Error checking trial status for user',
        userId,
        ':',
        error,
      );

      // Be more permissive - if we can't check trial status, allow access
      // This prevents blocking users due to temporary service issues
      console.log(
        'TrialGuard - Allowing access due to service error for user:',
        userId,
      );
      return true;
    }
  }
}
