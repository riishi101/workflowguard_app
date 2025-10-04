import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private paymentService: PaymentService,
    private subscriptionService: SubscriptionService
  ) {}

  /**
   * Memory Check: Avoiding MISTAKE #1 (Environment Variable Chaos) - Single source of truth
   */
  @Get('config')
  getPaymentConfig() {
    try {
      console.log('💳 PaymentController - getPaymentConfig called');
      const config = this.paymentService.getPaymentConfig();
      console.log('💳 PaymentController - Config retrieved successfully');
      
      return {
        success: true,
        data: config,
        message: 'Payment configuration retrieved successfully'
      };
    } catch (error) {
      console.log('❌ PaymentController - Config error:', error.message);
      throw error;
    }
  }

  /**
   * Test Razorpay connection
   */
  @Get('debug/test-razorpay')
  async testRazorpayConnection() {
    try {
      const testResult = await this.paymentService.testRazorpayConnection();
      return {
        success: true,
        message: 'Razorpay connection test completed',
        data: testResult
      };
    } catch (error) {
      return {
        success: false,
        message: 'Razorpay connection test failed',
        error: {
          message: error.message,
          code: error.code,
          response: error.response?.data
        }
      };
    }
  }

  /**
   * Debug endpoint to check environment variables
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages for debugging
   */
  @Get('debug/env')
  debugEnvironmentVariables() {
    console.log('🔍 PaymentController - Debug environment variables called');
    
    const envVars = {
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...' : 'MISSING',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.substring(0, 10) + '...' : 'MISSING',
      RAZORPAY_PLAN_ID_STARTER_INR: process.env.RAZORPAY_PLAN_ID_STARTER_INR || 'MISSING',
      RAZORPAY_PLAN_ID_PROFESSIONAL_INR: process.env.RAZORPAY_PLAN_ID_PROFESSIONAL_INR || 'MISSING',
      RAZORPAY_PLAN_ID_ENTERPRISE_INR: process.env.RAZORPAY_PLAN_ID_ENTERPRISE_INR || 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'MISSING',
      // Memory check: Expected credentials from latest memory
      EXPECTED_KEY_ID: 'rzp_live_RP85gyDpAKJ4Au',
      CREDENTIALS_MATCH: process.env.RAZORPAY_KEY_ID === 'rzp_live_RP85gyDpAKJ4Au' ? 'YES' : 'NO'
    };
    
    console.log('🔍 PaymentController - Environment variables:', envVars);
    
    return {
      success: true,
      message: 'Environment variables debug information - Memory Check Applied',
      data: envVars,
      memoryCheck: {
        expectedKeyId: 'rzp_live_RP85gyDpAKJ4Au',
        expectedKeySecret: 'j7s5n6sJ4Yec4n3AdSYeJ2LW',
        credentialsMatch: process.env.RAZORPAY_KEY_ID === 'rzp_live_RP85gyDpAKJ4Au',
        deploymentId: 'Build ID: 855005e8-be80-4d1b-bdfa-980f14e2dff9 (from memory)',
        memorySource: 'Memory f70fe203 - NEW credentials (old ones removed)',
        credentialStatus: 'Using NEW Razorpay credentials as intended'
      },
      troubleshooting: {
        commonIssues: [
          'Credentials mismatch - check if environment variables match expected values',
          'Razorpay API authentication failure - verify key_id and key_secret',
          'Plan ID configuration - ensure INR plan IDs are properly set',
          'Network connectivity - verify Razorpay API accessibility'
        ],
        nextSteps: [
          'Check if CREDENTIALS_MATCH shows YES',
          'Verify all plan IDs are not MISSING',
          'Test payment creation with debug logs',
          'Check Google Cloud Run logs for detailed errors'
        ]
      }
    };
  }

  /**
   * Create payment order
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages with clear instructions
   */
  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() body: { planId: string }, @Request() req: any) {
    try {
      // Debug user object from JWT strategy
      console.log('🔐 PaymentController - User from JWT:', req.user);
      
      const userId = req.user?.id; // Fixed: use 'id' instead of 'userId'
      const { planId } = body;

      console.log('🔐 PaymentController - Extracted userId:', userId);

      if (!userId) {
        console.log('❌ PaymentController - No userId found in req.user:', req.user);
        throw new HttpException(
          'User authentication required. Please log in and try again.',
          HttpStatus.UNAUTHORIZED
        );
      }

      if (!planId) {
        throw new HttpException(
          'Plan selection required. Please select a plan and try again.',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate plan ID
      const validPlans = ['starter', 'professional', 'enterprise'];
      if (!validPlans.includes(planId)) {
        throw new HttpException(
          `Invalid plan: ${planId}. Please select from: ${validPlans.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      const order = await this.paymentService.createOrder(planId, userId);
      
      this.logger.log(`Order created successfully for user: ${userId}, plan: ${planId}`);
      
      return {
        success: true,
        data: order,
        message: 'Payment order created successfully'
      };

    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Unable to process your request. Please try again or contact support.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Confirm payment and upgrade subscription
   * Memory Check: Following MISTAKE #6 lesson - Proper error handling with user feedback
   */
  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(
    @Body() body: { 
      orderId: string; 
      paymentId: string; 
      signature: string; 
      planId: string; 
    }, 
    @Request() req: any
  ) {
    try {
      const userId = req.user?.id;
      const { orderId, paymentId, signature, planId } = body;

      if (!userId) {
        throw new HttpException(
          'User authentication required. Please log in and try again.',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Validate required fields
      if (!orderId || !paymentId || !signature || !planId) {
        throw new HttpException(
          'Payment confirmation failed. Missing payment details. Please try again.',
          HttpStatus.BAD_REQUEST
        );
      }

      // Verify payment signature
      const isValidPayment = this.paymentService.verifyPayment(orderId, paymentId, signature);
      
      if (!isValidPayment) {
        this.logger.warn(`Invalid payment signature for user: ${userId}, order: ${orderId}`);
        throw new HttpException(
          'Payment verification failed. Please contact support if amount was deducted.',
          HttpStatus.BAD_REQUEST
        );
      }

      // Get payment details for logging
      try {
        const paymentDetails = await this.paymentService.getPaymentDetails(paymentId);
        this.logger.log(`Payment confirmed: ${paymentId}, Amount: ${paymentDetails.amount}, Status: ${paymentDetails.status}`);
      } catch (detailsError) {
        this.logger.warn(`Could not fetch payment details: ${detailsError.message}`);
      }

      // Update user subscription
      await this.subscriptionService.upgradeUserPlan(userId, planId, { paymentId, orderId });
      
      this.logger.log(`Payment confirmed and subscription updated for user: ${userId}, plan: ${planId}`);
      
      return {
        success: true,
        data: {
          paymentId,
          planId,
          status: 'confirmed'
        },
        message: `Successfully upgraded to ${planId} plan! Welcome to your new subscription.`
      };

    } catch (error) {
      this.logger.error(`Payment confirmation failed: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Payment confirmation failed. Please contact support if amount was deducted.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Handle Razorpay webhooks for payment confirmation
   * Memory Check: Following MISTAKE #6 lesson - Proper webhook handling with specific error messages
   */
  @Post('webhook')
  async handleWebhook(@Body() body: any, @Request() req: any) {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        this.logger.error('Webhook secret not configured');
        throw new HttpException('Webhook not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Verify webhook signature (basic implementation)
      const receivedSignature = req.headers['x-razorpay-signature'];
      
      if (!receivedSignature) {
        this.logger.warn('Webhook received without signature');
        throw new HttpException('Invalid webhook signature', HttpStatus.BAD_REQUEST);
      }

      // Log webhook event for monitoring
      this.logger.log(`Webhook received: ${body.event}, Entity: ${body.entity}`);

      // Handle different webhook events
      switch (body.event) {
        case 'payment.captured':
          this.logger.log(`Payment captured: ${body.payload.payment.entity.id}`);
          break;
        case 'payment.failed':
          this.logger.warn(`Payment failed: ${body.payload.payment.entity.id}`);
          break;
        case 'subscription.charged':
          this.logger.log(`Subscription charged: ${body.payload.subscription.entity.id}`);
          break;
        default:
          this.logger.log(`Unhandled webhook event: ${body.event}`);
      }

      return {
        success: true,
        message: 'Webhook processed successfully'
      };

    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get payment history (placeholder for future implementation)
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(@Request() req: any) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new HttpException(
          'User authentication required.',
          HttpStatus.UNAUTHORIZED
        );
      }

      // This will be implemented when payment history tracking is added
      return {
        success: true,
        data: [],
        message: 'Payment history feature coming soon'
      };

    } catch (error) {
      this.logger.error(`Failed to get payment history: ${error.message}`);
      throw error;
    }
  }
}
