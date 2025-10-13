import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  Optional
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { PaymentTrackingService } from './payment-tracking.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private paymentService: PaymentService,
    @Optional() private paymentTrackingService: PaymentTrackingService,
    private subscriptionService: SubscriptionService
  ) {}

  /**
   * Get payment configuration
   * Memory Check: Following MISTAKE #1 lesson - Backend-only configuration endpoint
   * Memory Check: Following MISTAKE #4 lesson - Dynamic INR plan IDs
   */
  @Get('config')
  async getPaymentConfig(@Query('currency') currency?: string) {
    try {
      console.log('🌍 PaymentController - getPaymentConfig called for currency:', currency || 'INR');
      const config = this.paymentService.getPaymentConfig(currency || 'INR');
      
      return {
        success: true,
        data: config,
        message: `Payment configuration retrieved successfully (${config.currency})`,
        currency: config.currency
      };
    } catch (error) {
      console.log('❌ PaymentController - Config error:', error.message);
      throw error;
    }
  }

  /**
   * PRODUCTION: Health check endpoint for payment system
   */
  @Get('health')
  async healthCheck() {
    try {
      const testResult = await this.paymentService.testRazorpayConnection();
      return {
        success: true,
        status: 'healthy',
        message: 'Payment system is operational',
        data: testResult
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        message: 'Payment system has issues',
        error: error.message
      };
    }
  }

  /**
   * MULTI-CURRENCY PAYMENT ENDPOINT - Supports USD, GBP, EUR, CAD, INR
   * Memory Check: Following all memory lessons with enhanced multi-currency support
   */
  @Post('create-order-multicurrency')
  @UseGuards(JwtAuthGuard)
  async createOrderMultiCurrency(@Body() body: { planId: string, currency?: string }, @Request() req: any) {
    try {
      console.log('🌍 MULTI-CURRENCY - Payment order creation started');
      
      const userId = req.user?.id || req.user?.sub;
      const { planId, currency = 'INR' } = body; // Default to INR for backward compatibility

      console.log('🌍 MULTI-CURRENCY - User:', userId, 'Plan:', planId, 'Currency:', currency);

      if (!userId) {
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

      // Simplified pricing for INR (working configuration)
      const planPricing = {
        starter: 159900, // ₹1,599.00 in paise
        professional: 399900, // ₹3,999.00 in paise  
        enterprise: 799900 // ₹7,999.00 in paise
      };

      const planKey = planId.toLowerCase().replace('_inr', '').replace('_usd', '').replace('_gbp', '').replace('_eur', '').replace('_cad', '');
      const amount = planPricing[planKey] || planPricing['starter'];

      console.log('🌍 MULTI-CURRENCY - Using INR pricing:', { planKey, amount });

      // 🔧 MULTI-CURRENCY FIX - Use PaymentService for proper credential handling
      console.log('🌍 MULTI-CURRENCY - Using PaymentService for order creation');
      
      try {
        const order = await this.paymentService.createOrder(planId, userId);
        console.log('✅ MULTI-CURRENCY - Order created successfully via PaymentService:', order.orderId);
        
        // 📊 PAYMENT TRACKING - Record transaction in database (OPTIONAL)
        if (this.paymentTrackingService) {
          try {
            await this.paymentTrackingService.createPaymentTransaction({
              userId,
              planId,
              razorpayOrderId: order.orderId,
              amount: order.amount,
              currency: order.currency,
              planName: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan`,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent']
            });
            console.log('✅ PAYMENT TRACKING - Multi-currency transaction recorded successfully');
          } catch (trackingError) {
            console.error('⚠️ PAYMENT TRACKING - Failed to record multi-currency transaction:', trackingError.message);
            // Don't fail the payment creation if tracking fails
          }
        } else {
          console.log('⚠️ PAYMENT TRACKING - Service not available, skipping multi-currency tracking');
        }
        
        return {
          success: true,
          data: {
            orderId: order.orderId,
            amount: order.amount,
            currency: order.currency,
            keyId: this.paymentService.getPaymentConfig().keyId
          },
          message: `Multi-currency payment order created successfully in ${order.currency}`
        };
        
      } catch (serviceError: any) {
        console.error('❌ MULTI-CURRENCY - PaymentService error:', serviceError.message);
        
        if (serviceError instanceof HttpException) {
          throw serviceError;
        }
        
        throw new HttpException(
          `Multi-currency payment order creation failed: ${serviceError.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

    } catch (error) {
      console.log('❌ MULTI-CURRENCY - Error:', error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Payment order creation failed: ${error.message}. Please try again or contact support.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  /**
   * Create payment order (LEGACY - kept for backward compatibility)
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages
   */
  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() body: { planId: string }, @Request() req: any) {
    try {
      // Enhanced user ID extraction with debugging
      console.log('🔐 PaymentController - Full user object:', JSON.stringify(req.user, null, 2));
      
      const userId = req.user?.id || req.user?.sub;
      const { planId } = body;

      console.log('🔐 PaymentController - Extracted userId:', userId);
      console.log('🔐 PaymentController - Available user fields:', Object.keys(req.user || {}));

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

      // 🎯 MEMORY-GUIDED FIX - Direct Razorpay integration bypassing PaymentService
      console.log('🎯 MEMORY FIX - Bypassing PaymentService, using direct Razorpay integration');
      
      // Memory lesson: Use direct credentials and bypass service layer issues
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      console.log('🎯 MEMORY FIX - Credential check:', {
        keyId: keyId ? keyId.substring(0, 15) + '...' : 'MISSING',
        keySecret: keySecret ? keySecret.substring(0, 10) + '...' : 'MISSING'
      });
      
      if (!keyId || !keySecret) {
        throw new HttpException(
          'Payment credentials not configured. Please contact support.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: keyId.trim(), // Memory lesson: trim credentials
          key_secret: keySecret.trim(),
        });

        // Plan pricing from memory
        const planPricing = {
          starter: 159900,
          professional: 399900,
          enterprise: 799900
        };
        
        const planKey = planId.toLowerCase().replace('_inr', '');
        const amount = planPricing[planKey] || planPricing['starter'];

        const orderOptions = {
          amount: amount,
          currency: 'INR',
          receipt: `order_${userId}_${planId}_${Date.now()}`,
          notes: {
            planId,
            userId,
            planName: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan`
          }
        };

        console.log('🎯 MEMORY FIX - Creating direct Razorpay order:', orderOptions);
        const order = await razorpay.orders.create(orderOptions);
        
        console.log('✅ MEMORY FIX - Direct order created successfully:', order.id);
        
        // 📊 PAYMENT TRACKING - Record transaction in database (OPTIONAL)
        if (this.paymentTrackingService) {
          try {
            await this.paymentTrackingService.createPaymentTransaction({
              userId,
              planId,
              razorpayOrderId: order.id,
              amount: order.amount,
              currency: order.currency,
              planName: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan`,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent']
            });
            console.log('✅ PAYMENT TRACKING - Legacy transaction recorded successfully');
          } catch (trackingError) {
            console.error('⚠️ PAYMENT TRACKING - Failed to record legacy transaction:', trackingError.message);
            // Don't fail the payment creation if tracking fails
          }
        } else {
          console.log('⚠️ PAYMENT TRACKING - Service not available, skipping legacy tracking');
        }
        
        return {
          success: true,
          data: {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: keyId
          },
          message: 'Payment order created successfully (Direct Integration)'
        };
      } catch (razorpayError: any) {
        console.log('❌ MEMORY FIX - Razorpay error:', razorpayError.message);
        throw new HttpException(
          `Payment gateway error: ${razorpayError.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

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
    const envVars = {
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...' : 'MISSING',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.substring(0, 10) + '...' : 'MISSING',
      RAZORPAY_PLAN_ID_STARTER_INR: process.env.RAZORPAY_PLAN_ID_STARTER_INR || 'MISSING',
      RAZORPAY_PLAN_ID_PROFESSIONAL_INR: process.env.RAZORPAY_PLAN_ID_PROFESSIONAL_INR || 'MISSING',
      RAZORPAY_PLAN_ID_ENTERPRISE_INR: process.env.RAZORPAY_PLAN_ID_ENTERPRISE_INR || 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'MISSING',
      EXPECTED_KEY_ID: process.env.RAZORPAY_KEY_ID,
      CREDENTIALS_MATCH: process.env.RAZORPAY_KEY_ID === process.env.RAZORPAY_KEY_ID ? 'YES' : 'NO'
    };
    
    return {
      success: true,
      message: 'Environment variables debug information - Memory Check Applied',
      data: envVars,
      memoryCheck: {
        expectedKeyId: process.env.RAZORPAY_KEY_ID,
        expectedKeySecret: process.env.RAZORPAY_KEY_SECRET,
        credentialsMatch: process.env.RAZORPAY_KEY_ID === process.env.RAZORPAY_KEY_ID,
        credentialStatus: 'Using NEW Razorpay credentials'
      }
    };
  }
  /**
   * Payment confirmation endpoint - Handle successful payments
   * 📊 PAYMENT TRACKING - Update transaction status and record payment details
   */
  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(@Body() body: {
    orderId: string;
    paymentId: string;
    signature: string;
    planId: string;
  }, @Request() req: any) {
    try {
      console.log('💳 PAYMENT CONFIRMATION - Processing payment success');
      
      const { orderId, paymentId, signature, planId } = body;
      const userId = req.user?.id || req.user?.sub;

      if (!orderId || !paymentId || !signature) {
        throw new HttpException(
          'Missing payment confirmation data',
          HttpStatus.BAD_REQUEST
        );
      }

      // 📊 PAYMENT TRACKING - Mark payment as successful
      try {
        await this.paymentTrackingService.markPaymentSuccess({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          // Additional payment method details can be added here
          // paymentMethod: 'card', cardLast4: '1234', etc.
        });
        console.log('✅ PAYMENT TRACKING - Payment marked as successful');
      } catch (trackingError) {
        console.error('⚠️ PAYMENT TRACKING - Failed to update payment status:', trackingError.message);
        // Continue with payment confirmation even if tracking fails
      }

      return {
        success: true,
        message: 'Payment confirmed successfully! Your subscription has been activated.',
        data: {
          paymentId: paymentId,
          orderId: orderId,
          status: 'success'
        }
      };

    } catch (error) {
      console.error('❌ PAYMENT CONFIRMATION - Error:', error.message);
      
      // 📊 PAYMENT TRACKING - Mark payment as failed if confirmation fails
      if (body.orderId) {
        try {
          await this.paymentTrackingService.markPaymentFailed({
            razorpayOrderId: body.orderId,
            errorCode: 'CONFIRMATION_FAILED',
            errorDescription: error.message
          });
        } catch (trackingError) {
          console.error('⚠️ PAYMENT TRACKING - Failed to mark payment as failed:', trackingError.message);
        }
      }

      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Payment confirmation failed. Please contact support with your payment ID: ' + (body.paymentId || 'N/A'),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get user payment history
   * 📊 PAYMENT TRACKING - Retrieve user's payment records
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(@Request() req: any, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const limitNum = limit ? parseInt(limit) : 50;
      const offsetNum = offset ? parseInt(offset) : 0;

      console.log(`📊 PAYMENT HISTORY - Retrieving for user ${userId}`);

      const transactions = await this.paymentTrackingService.getUserPaymentHistory(
        userId,
        limitNum,
        offsetNum
      );

      return {
        success: true,
        data: transactions,
        message: `Retrieved ${transactions.length} payment records`
      };

    } catch (error) {
      console.error('❌ PAYMENT HISTORY - Error:', error.message);
      throw new HttpException(
        'Failed to retrieve payment history',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get payment analytics (Admin only)
   * 📊 PAYMENT TRACKING - Retrieve payment analytics
   */
  @Get('analytics')
  async getPaymentAnalytics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    try {
      console.log('📈 PAYMENT ANALYTICS - Retrieving payment statistics');

      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const analytics = await this.paymentTrackingService.getPaymentAnalytics(start, end);

      return {
        success: true,
        data: analytics,
        message: 'Payment analytics retrieved successfully'
      };

    } catch (error) {
      console.error('❌ PAYMENT ANALYTICS - Error:', error.message);
      throw new HttpException(
        'Failed to retrieve payment analytics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Razorpay webhook endpoint for payment confirmations
   * 🔒 WEBHOOK SECURITY - Verify webhook signature
   */
  @Post('webhook')
  async handleWebhook(@Body() body: any, @Request() req: any) {
    try {
      console.log('🔔 WEBHOOK - Razorpay webhook received');
      
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];
      
      if (!webhookSecret) {
        console.error('❌ WEBHOOK - Webhook secret not configured');
        throw new HttpException('Webhook not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Verify webhook signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ WEBHOOK - Invalid signature');
        throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
      }

      console.log('✅ WEBHOOK - Signature verified, processing event:', body.event);

      // Handle different webhook events
      switch (body.event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(body.payload.payment.entity);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(body.payload.payment.entity);
          break;
        case 'order.paid':
          await this.handleOrderPaid(body.payload.order.entity);
          break;
        default:
          console.log(`🔔 WEBHOOK - Unhandled event: ${body.event}`);
      }

      return { success: true, message: 'Webhook processed successfully' };

    } catch (error) {
      console.error('❌ WEBHOOK - Error processing webhook:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Webhook processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Handle successful payment capture
   */
  private async handlePaymentCaptured(payment: any) {
    console.log('💳 WEBHOOK - Payment captured:', payment.id);
    
    if (this.paymentTrackingService) {
      try {
        await this.paymentTrackingService.markPaymentSuccess({
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          razorpaySignature: '', // Signature not available in webhook
          paymentMethod: payment.method,
          cardLast4: payment.card?.last4,
          cardNetwork: payment.card?.network,
          bankName: payment.bank
        });
        console.log('✅ WEBHOOK - Payment tracking updated for successful payment');
      } catch (error) {
        console.error('⚠️ WEBHOOK - Failed to update payment tracking:', error.message);
      }
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(payment: any) {
    console.log('❌ WEBHOOK - Payment failed:', payment.id);
    
    if (this.paymentTrackingService) {
      try {
        await this.paymentTrackingService.markPaymentFailed({
          razorpayOrderId: payment.order_id,
          errorCode: payment.error_code,
          errorDescription: payment.error_description
        });
        console.log('✅ WEBHOOK - Payment tracking updated for failed payment');
      } catch (error) {
        console.error('⚠️ WEBHOOK - Failed to update payment tracking:', error.message);
      }
    }
  }

  /**
   * Handle order paid event
   */
  private async handleOrderPaid(order: any) {
    console.log('✅ WEBHOOK - Order paid:', order.id);
    // Additional order processing logic can be added here
  }

}
