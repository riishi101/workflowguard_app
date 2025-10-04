 import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: any;

  constructor(private configService: ConfigService) {
    // Initialize Razorpay with environment variables
    // Memory Check: Following MISTAKE #1 lesson - Backend-only configuration
    console.log('💳 PaymentService - Constructor called');
    
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    
    console.log('💳 PaymentService - Environment variables check:');
    console.log('  - RAZORPAY_KEY_ID:', keyId ? keyId.substring(0, 15) + '...' : 'MISSING');
    console.log('  - RAZORPAY_KEY_SECRET:', keySecret ? keySecret.substring(0, 10) + '...' : 'MISSING');
    
    // Memory Check: Verify against latest credentials from memory f70fe203
    console.log('💳 PaymentService - Memory verification:');
    console.log('  - Expected KEY_ID: rzp_live_RP85gyDpAKJ4Au (from memory f70fe203)');
    console.log('  - Credentials match:', keyId === 'rzp_live_RP85gyDpAKJ4Au' ? 'YES' : 'NO');
    
    if (!keyId || !keySecret) {
      console.log('❌ PaymentService - Razorpay credentials not configured');
      this.logger.warn('Razorpay credentials not configured. Payment functionality will be disabled.');
      return;
    }

    try {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log('✅ PaymentService - Razorpay initialized successfully');
      console.log('✅ PaymentService - Using credentials from memory f70fe203');
      this.logger.log('Razorpay service initialized successfully');
    } catch (error) {
      console.log('❌ PaymentService - Razorpay initialization failed:', error);
      this.logger.error('Razorpay initialization failed:', error);
    }
  }

  /**
   * Get payment configuration for frontend
   * Memory Check: Avoiding MISTAKE #1 (Environment Variable Chaos) - Backend-only config
   */
  getPaymentConfig() {
    console.log('💳 PaymentService - getPaymentConfig called');
    
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    console.log('💳 PaymentService - KeyId check:', keyId ? keyId.substring(0, 10) + '...' : 'MISSING');
    
    if (!keyId) {
      console.log('❌ PaymentService - No keyId found in config');
      throw new HttpException(
        'Payment system is not configured. Please contact support.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    // Memory Check: Following MISTAKE #4 lesson - Dynamic plan IDs from environment, starting with INR
    const starterPlanId = this.configService.get<string>('RAZORPAY_PLAN_ID_STARTER_INR');
    const professionalPlanId = this.configService.get<string>('RAZORPAY_PLAN_ID_PROFESSIONAL_INR');
    const enterprisePlanId = this.configService.get<string>('RAZORPAY_PLAN_ID_ENTERPRISE_INR');
    
    console.log('💳 PaymentService - Plan IDs check:');
    console.log('  - STARTER_INR:', starterPlanId || 'MISSING');
    console.log('  - PROFESSIONAL_INR:', professionalPlanId || 'MISSING');
    console.log('  - ENTERPRISE_INR:', enterprisePlanId || 'MISSING');

    return {
      keyId,
      currency: 'INR',
      plans: {
        starter: {
          id: 'starter',
          razorpayPlanId: starterPlanId,
          name: 'Starter Plan',
          price: 1900, // ₹19.00 in paise
          currency: 'INR',
          description: 'Perfect for small teams',
          features: ['10 workflows', '30 days history', 'Basic support']
        },
        professional: {
          id: 'professional', 
          razorpayPlanId: professionalPlanId,
          name: 'Professional Plan',
          price: 4900, // ₹49.00 in paise
          currency: 'INR',
          description: 'Best for growing businesses',
          features: ['35 workflows', '90 days history', 'Priority support', 'Advanced features']
        },
        enterprise: {
          id: 'enterprise',
          razorpayPlanId: enterprisePlanId,
          name: 'Enterprise Plan', 
          price: 9900, // ₹99.00 in paise
          currency: 'INR',
          description: 'For large organizations',
          features: ['Unlimited workflows', '365 days history', '24/7 support', 'All features']
        }
      }
    };
  }

  /**
   * Create payment order
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages
   */
  async createOrder(planId: string, userId: string) {
    try {
      // Debug payment service initialization - Memory Check: Following MISTAKE #6 lesson
      console.log('💳 PaymentService - createOrder called:');
      console.log('  - planId:', planId);
      console.log('  - userId:', userId);
      console.log('  - razorpay initialized:', !!this.razorpay);
      
      // Enhanced credential debugging from memories
      const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
      const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      console.log('💳 PaymentService - Current credentials check:');
      console.log('  - RAZORPAY_KEY_ID:', keyId ? keyId.substring(0, 15) + '...' : 'MISSING');
      console.log('  - RAZORPAY_KEY_SECRET:', keySecret ? keySecret.substring(0, 10) + '...' : 'MISSING');
      console.log('  - Expected KEY_ID prefix: rzp_live_RP85gyDpAKJ4Au (from memory)');

      if (!this.razorpay) {
        console.log('❌ PaymentService - Razorpay not initialized');
        console.log('❌ PaymentService - This usually means credentials are missing or invalid');
        throw new HttpException(
          'Payment gateway is not configured. Please contact support.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      const config = this.getPaymentConfig();
      console.log('💳 PaymentService - Config loaded:', {
        keyId: config.keyId ? config.keyId.substring(0, 10) + '...' : 'MISSING',
        currency: config.currency,
        availablePlans: Object.keys(config.plans)
      });

      const plan = config.plans[planId as keyof typeof config.plans];
      console.log('💳 PaymentService - Plan lookup result:', plan ? {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        razorpayPlanId: plan.razorpayPlanId
      } : 'PLAN NOT FOUND');

      if (!plan) {
        console.log('❌ PaymentService - Invalid plan selected:', planId);
        throw new HttpException(
          `Invalid plan selected: ${planId}. Please choose a valid plan.`,
          HttpStatus.BAD_REQUEST
        );
      }

      const orderOptions = {
        amount: plan.price,
        currency: plan.currency,
        receipt: `order_${userId}_${planId}_${Date.now()}`,
        notes: {
          planId,
          userId,
          planName: plan.name
        }
      };

      console.log('💳 PaymentService - Creating order with options:', orderOptions);

      console.log('💳 PaymentService - About to call Razorpay API with options:', {
        amount: orderOptions.amount,
        currency: orderOptions.currency,
        receipt: orderOptions.receipt
      });
      
      const order = await this.razorpay.orders.create(orderOptions);
      console.log('✅ PaymentService - Razorpay API call successful!');
      console.log('💳 PaymentService - Order created successfully:', {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      });
      
      this.logger.log(`Payment order created: ${order.id} for user: ${userId}, plan: ${planId}`);
      
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planName: plan.name,
        planId: planId
      };

    } catch (error) {
      // Comprehensive error logging - Memory Check: Following MISTAKE #6 lesson
      console.log('❌ PaymentService - Error in createOrder:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        statusCode: error.statusCode,
        response: error.response?.data,
        description: error.description,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      // Enhanced error analysis from memories
      if (error.message && error.message.includes('authentication')) {
        console.log('❌ PaymentService - AUTHENTICATION ERROR: Invalid Razorpay credentials');
        console.log('❌ PaymentService - Check if credentials match: rzp_live_RP85gyDpAKJ4Au');
      }
      
      if (error.code === 'BAD_REQUEST_ERROR') {
        console.log('❌ PaymentService - BAD_REQUEST_ERROR from Razorpay API');
        console.log('❌ PaymentService - This usually means invalid plan ID or amount');
      }
      
      // Extract meaningful error message - Fix for "undefined" error
      let errorMessage = 'Unable to create payment order';
      
      if (error.response?.data?.error?.description) {
        errorMessage = error.response.data.error.description;
        console.log('🔍 PaymentService - Using Razorpay API error description:', errorMessage);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        console.log('🔍 PaymentService - Using response message:', errorMessage);
      } else if (error.message && error.message !== 'undefined') {
        errorMessage = error.message;
        console.log('🔍 PaymentService - Using error message:', errorMessage);
      } else if (error.description) {
        errorMessage = error.description;
        console.log('🔍 PaymentService - Using error description:', errorMessage);
      } else if (typeof error === 'string') {
        errorMessage = error;
        console.log('🔍 PaymentService - Using string error:', errorMessage);
      } else {
        errorMessage = 'Razorpay API error - please check credentials and configuration';
        console.log('🔍 PaymentService - Using fallback error message');
      }
      
      this.logger.error(`Failed to create payment order: ${errorMessage}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Memory Check: Following MISTAKE #6 lesson - Specific error messages
      throw new HttpException(
        `Payment order creation failed: ${errorMessage}. Please try again or contact support.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify payment signature
   * Memory Check: Following MISTAKE #6 lesson - Proper error handling with specific messages
   */
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    try {
      if (!this.razorpay) {
        throw new HttpException(
          'Payment verification unavailable. Please contact support.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET'))
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = expectedSignature === signature;
      
      this.logger.log(`Payment verification ${isValid ? 'successful' : 'failed'} for order: ${orderId}`);
      
      return isValid;

    } catch (error) {
      this.logger.error(`Payment verification error: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string) {
    try {
      if (!this.razorpay) {
        throw new HttpException(
          'Payment service unavailable. Please contact support.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;

    } catch (error) {
      this.logger.error(`Failed to fetch payment details: ${error.message}`, error.stack);
      throw new HttpException(
        'Unable to fetch payment details. Please contact support.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
