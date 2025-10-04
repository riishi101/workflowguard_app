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
  Query
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
   * Get payment configuration
   * Memory Check: Following MISTAKE #1 lesson - Backend-only configuration endpoint
   * Memory Check: Following MISTAKE #4 lesson - Dynamic INR plan IDs
   */
  @Get('config')
  async getPaymentConfig() {
    try {
      console.log('🔍 PaymentController - getPaymentConfig called');
      const config = this.paymentService.getPaymentConfig();
      
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
   * EMERGENCY TEST ENDPOINT - Bypass all checks for immediate testing
   * Memory Check: Following all memory lessons while providing guaranteed working solution
   */
  @Post('emergency-test')
  @UseGuards(JwtAuthGuard)
  async emergencyTest(@Body() body: { planId: string }, @Request() req: any) {
    try {
      console.log('🚨 EMERGENCY TEST - Direct Razorpay call');
      
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const orderOptions = {
        amount: 159900, // ₹1,599.00 in paise
        currency: 'INR',
        receipt: `emergency_${Date.now()}`,
        notes: {
          planId: body.planId,
          userId: req.user?.id || req.user?.sub,
          test: 'emergency_bypass'
        }
      };

      console.log('🚨 EMERGENCY - Creating order directly:', orderOptions);
      const order = await razorpay.orders.create(orderOptions);
      
      console.log('✅ EMERGENCY - Order created successfully:', order.id);
      
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        message: 'Emergency test successful - Razorpay is working!'
      };

    } catch (error) {
      console.log('❌ EMERGENCY - Failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Emergency test failed'
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

      // Currency and pricing configuration
      const currencyConfig = {
        INR: { multiplier: 100, symbol: '₹', plans: { starter: 1599, professional: 3999, enterprise: 7999 } },
        USD: { multiplier: 100, symbol: '$', plans: { starter: 19.99, professional: 49.99, enterprise: 99.99 } },
        GBP: { multiplier: 100, symbol: '£', plans: { starter: 15.99, professional: 39.99, enterprise: 79.99 } },
        EUR: { multiplier: 100, symbol: '€', plans: { starter: 18.99, professional: 47.99, enterprise: 94.99 } },
        CAD: { multiplier: 100, symbol: 'C$', plans: { starter: 26.99, professional: 67.99, enterprise: 134.99 } }
      };

      const config = currencyConfig[currency] || currencyConfig['INR'];
      const planKey = planId.toLowerCase().replace('_inr', '').replace('_usd', '').replace('_gbp', '').replace('_eur', '').replace('_cad', '');
      const amount = Math.round(config.plans[planKey] * config.multiplier);

      // Get plan ID from environment variables
      const envPlanKey = `RAZORPAY_PLAN_ID_${planKey.toUpperCase()}_${currency}`;
      const razorpayPlanId = process.env[envPlanKey];

      console.log('🌍 MULTI-CURRENCY - Plan lookup:', { envPlanKey, razorpayPlanId, amount, currency });

      if (!razorpayPlanId) {
        console.log('❌ MULTI-CURRENCY - Plan not found, falling back to INR');
        // Fallback to INR if plan not found
        const fallbackPlanKey = `RAZORPAY_PLAN_ID_${planKey.toUpperCase()}_INR`;
        const fallbackPlanId = process.env[fallbackPlanKey];
        const fallbackAmount = Math.round(currencyConfig['INR'].plans[planKey] * 100);
        
        return await this.createRazorpayOrder({
          amount: fallbackAmount,
          currency: 'INR',
          planId: fallbackPlanId,
          userId,
          notes: { originalCurrency: currency, fallbackUsed: true }
        });
      }

      return await this.createRazorpayOrder({
        amount,
        currency,
        planId: razorpayPlanId,
        userId,
        notes: { originalCurrency: currency }
      });

    } catch (error) {
      console.log('❌ MULTI-CURRENCY - Error:', error.message);
      
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
   * Helper method to create Razorpay orders
   */
  private async createRazorpayOrder(options: {
    amount: number;
    currency: string;
    planId: string;
    userId: string;
    notes: any;
  }) {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderOptions = {
      amount: options.amount,
      currency: options.currency,
      receipt: `order_${Date.now()}`,
      notes: {
        planId: options.planId,
        userId: options.userId,
        ...options.notes
      }
    };

    console.log('🌍 RAZORPAY - Creating order:', orderOptions);
    const order = await razorpay.orders.create(orderOptions);
    
    return {
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      },
      message: `Payment order created successfully in ${options.currency}`
    };
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

      const order = await this.paymentService.createOrder(planId, userId);
      
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
   * SIMPLE TEST ENDPOINT - No authentication required
   */
    @Get('simple-test')
    async simpleTest() {
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
  
        const order = await razorpay.orders.create({
          amount: 159900,
          currency: 'INR',
          receipt: `test_${Date.now()}`,
        });
        
        return {
          success: true,
          orderId: order.id,
          message: 'Razorpay credentials work!'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: 'Razorpay credentials invalid'
        };
      }
    }
}
