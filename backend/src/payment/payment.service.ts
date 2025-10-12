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
    
    // Memory Check: Verify against WORKING credentials (from memory)
    console.log('💳 PaymentService - Memory verification:');
    console.log('  - Expected KEY_ID: rzp_live_RP85gyDpAKJ4Au (NEW credentials)');
    console.log('  - Credentials match:', keyId === 'rzp_live_RP85gyDpAKJ4Au' ? 'YES' : 'NO');
    console.log('  - Using WORKING credentials from memory');
    
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
      console.log('✅ PaymentService - Using NEW credentials (rzp_live_RP85gyDpAKJ4Au)');
      this.logger.log('Razorpay service initialized successfully with WORKING credentials');
    } catch (error) {
      console.log('❌ PaymentService - Razorpay initialization failed:', error);
      this.logger.error('Razorpay initialization failed:', error);
    }
  }

  /**
   * Get payment configuration for frontend - COMPLETE MULTI-CURRENCY SUPPORT
   * Memory Check: Following production credentials setup with all currencies
   */
  getPaymentConfig(currency: string = 'INR') {
    console.log('🌍 PaymentService - getPaymentConfig called for currency:', currency);
    
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    console.log('💳 PaymentService - KeyId check:', keyId ? keyId.substring(0, 10) + '...' : 'MISSING');
    
    if (!keyId) {
      console.log('❌ PaymentService - No keyId found in config');
      throw new HttpException(
        'Payment system is not configured. Please contact support.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    // Get plan IDs for the specified currency
    const currencyUpper = currency.toUpperCase();
    const starterPlanId = this.configService.get<string>(`RAZORPAY_PLAN_ID_STARTER_${currencyUpper}`);
    const professionalPlanId = this.configService.get<string>(`RAZORPAY_PLAN_ID_PROFESSIONAL_${currencyUpper}`);
    const enterprisePlanId = this.configService.get<string>(`RAZORPAY_PLAN_ID_ENTERPRISE_${currencyUpper}`);
    
    console.log(`💳 PaymentService - Plan IDs check (${currencyUpper}):`);
    console.log(`  - STARTER_${currencyUpper}:`, starterPlanId || 'MISSING');
    console.log(`  - PROFESSIONAL_${currencyUpper}:`, professionalPlanId || 'MISSING');
    console.log(`  - ENTERPRISE_${currencyUpper}:`, enterprisePlanId || 'MISSING');

    // Currency-specific pricing
    const pricing = this.getCurrencyPricing(currency);

    return {
      keyId,
      currency: currencyUpper,
      plans: {
        starter: {
          id: 'starter',
          razorpayPlanId: starterPlanId,
          name: 'Starter Plan',
          price: pricing.starter,
          currency: currencyUpper,
          description: 'Perfect for small teams',
          features: ['10 workflows', '30 days history', 'Basic support']
        },
        professional: {
          id: 'professional', 
          razorpayPlanId: professionalPlanId,
          name: 'Professional Plan',
          price: pricing.professional,
          currency: currencyUpper,
          description: 'Best for growing businesses',
          features: ['35 workflows', '90 days history', 'Priority support', 'Advanced features']
        },
        enterprise: {
          id: 'enterprise',
          razorpayPlanId: enterprisePlanId,
          name: 'Enterprise Plan', 
          price: pricing.enterprise,
          currency: currencyUpper,
          description: 'For large organizations',
          features: ['Unlimited workflows', '365 days history', '24/7 support', 'All features']
        }
      }
    };
  }

  /**
   * Get currency-specific pricing in smallest unit (paise/cents)
   */
  private getCurrencyPricing(currency: string) {
    const pricing = {
      'INR': {
        starter: 159900,      // ₹1,599.00 in paise
        professional: 399900, // ₹3,999.00 in paise  
        enterprise: 799900    // ₹7,999.00 in paise
      },
      'USD': {
        starter: 1999,        // $19.99 in cents
        professional: 4999,   // $49.99 in cents
        enterprise: 9999      // $99.99 in cents
      },
      'GBP': {
        starter: 1599,        // £15.99 in pence
        professional: 3999,   // £39.99 in pence
        enterprise: 7999      // £79.99 in pence
      },
      'EUR': {
        starter: 1799,        // €17.99 in cents
        professional: 4499,   // €44.99 in cents
        enterprise: 8999      // €89.99 in cents
      },
      'CAD': {
        starter: 2499,        // C$24.99 in cents
        professional: 6499,   // C$64.99 in cents
        enterprise: 12999     // C$129.99 in cents
      }
    };

    return pricing[currency.toUpperCase()] || pricing['INR'];
  }

  /**
   * Create payment order
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages
   */
  async createOrder(planId: string, userId: string) {
    try {
      console.log('💳 PaymentService - createOrder called:', { planId, userId });
      
      if (!this.razorpay) {
        console.log('❌ PaymentService - Razorpay not initialized');
        throw new HttpException(
          'Payment gateway is not configured. Please contact support.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      const config = this.getPaymentConfig();
      const plan = config.plans[planId as keyof typeof config.plans];
      
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
      console.log('✅ PaymentService - Order created successfully:', order.id);
      
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planName: plan.name,
        planId: planId
      };

    } catch (error) {
      console.log('❌ PaymentService - Error in createOrder:', error);
      
      // Memory Check: Following MISTAKE #6 lesson - Specific error messages
      let errorMessage = 'Unable to create payment order';
      
      if (error.response?.data?.error?.description) {
        errorMessage = error.response.data.error.description;
      } else if (error.message && error.message !== 'undefined') {
        errorMessage = error.message;
      }
      
      this.logger.error(`Failed to create payment order: ${errorMessage}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Payment order creation failed: ${errorMessage}. Please try again or contact support.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Test Razorpay connection
   */
  async testRazorpayConnection() {
    try {
      if (!this.razorpay) {
        throw new Error('Razorpay not initialized - check credentials');
      }

      const testOrder = await this.razorpay.orders.create({
        amount: 100, // ₹1.00 in paise
        currency: 'INR',
        receipt: `test_${Date.now()}`,
        notes: {
          test: true,
          purpose: 'connection_test'
        }
      });

      console.log('✅ PaymentService - Razorpay connection test successful');
      return {
        connectionStatus: 'SUCCESS',
        testOrderId: testOrder.id,
        message: 'Razorpay API is accessible and credentials are valid'
      };

    } catch (error) {
      console.log('❌ PaymentService - Razorpay connection test failed:', error);
      return {
        connectionStatus: 'FAILED',
        error: {
          message: error.message,
          code: error.code,
          response: error.response?.data
        }
      };
    }
  }

  /**
   * Verify payment signature
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
}
