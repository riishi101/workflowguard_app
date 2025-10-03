import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: Razorpay;

  constructor(private configService: ConfigService) {
    // Initialize Razorpay with environment variables
    // Memory Check: Following MISTAKE #1 lesson - Backend-only configuration
    console.log('💳 PaymentService - Constructor called');
    
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    
    console.log('💳 PaymentService - Environment variables check:');
    console.log('  - RAZORPAY_KEY_ID:', keyId ? keyId.substring(0, 10) + '...' : 'MISSING');
    console.log('  - RAZORPAY_KEY_SECRET:', keySecret ? keySecret.substring(0, 10) + '...' : 'MISSING');

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

      if (!this.razorpay) {
        console.log('❌ PaymentService - Razorpay not initialized');
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

      const order = await this.razorpay.orders.create(orderOptions);
      console.log('💳 PaymentService - Order created successfully:', {
        id: order.id,
        amount: order.amount,
        currency: order.currency
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
      console.log('❌ PaymentService - Error in createOrder:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      this.logger.error(`Failed to create payment order: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Unable to create payment order. Please try again or contact support.',
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
