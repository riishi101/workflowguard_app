import { Injectable, HttpException, HttpStatus, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Use require for razorpay since it doesn't have proper TypeScript support
const Razorpay = require('razorpay');

export interface RazorpaySubscription {
  id: string;
  entity: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start: number;
  current_end: number;
  ended_at: number | null;
  quantity: number;
  notes: Record<string, any>;
  charge_at: number;
  start_at: number;
  end_at: number;
  auth_attempts: number;
  total_count: number;
  paid_count: number;
  customer_notify: boolean;
  created_at: number;
  expire_by: number;
  short_url: string;
  has_scheduled_changes: boolean;
  change_scheduled_at: number | null;
  source: string;
  offer_id: string | null;
  remaining_count: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, any>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: Record<string, any>;
  created_at: number;
}

export interface CreateSubscriptionDto {
  planId: string;
  customerId: string;
  totalCount?: number;
  customerNotify?: boolean;
  notes?: Record<string, any>;
  addons?: Array<{
    item: {
      name: string;
      amount: number;
      currency: string;
    };
  }>;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  contact?: string;
  notes?: Record<string, any>;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private razorpay: any;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not found in environment variables');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    this.logger.log('Razorpay service initialized');
  }

  // Customer Management
  async createCustomer(customerData: CreateCustomerDto) {
    try {
      this.logger.log(`Creating Razorpay customer for email: ${customerData.email}`);
      
      const customer = await this.razorpay.customers.create({
        name: customerData.name,
        email: customerData.email,
        contact: customerData.contact,
        notes: customerData.notes || {},
      });

      this.logger.log(`Customer created successfully: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  async getCustomer(customerId: string) {
    try {
      const customer = await this.razorpay.customers.fetch(customerId);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to fetch customer ${customerId}: ${error.message}`);
      throw new BadRequestException('Customer not found');
    }
  }

  async updateCustomer(customerId: string, updateData: Partial<CreateCustomerDto>) {
    try {
      const customer = await this.razorpay.customers.edit(customerId, updateData);
      this.logger.log(`Customer updated successfully: ${customerId}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to update customer ${customerId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to update customer');
    }
  }

  // Subscription Management
  async createSubscription(subscriptionData: CreateSubscriptionDto): Promise<RazorpaySubscription> {
    try {
      this.logger.log(`Creating subscription for plan: ${subscriptionData.planId}`);
      
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: subscriptionData.planId,
        customer_id: subscriptionData.customerId,
        total_count: subscriptionData.totalCount,
        customer_notify: subscriptionData.customerNotify ?? true,
        notes: subscriptionData.notes || {},
        addons: subscriptionData.addons || [],
      });

      this.logger.log(`Subscription created successfully: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async getSubscription(subscriptionId: string): Promise<RazorpaySubscription> {
    try {
      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to fetch subscription ${subscriptionId}: ${error.message}`);
      throw new BadRequestException('Subscription not found');
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = false) {
    try {
      this.logger.log(`Cancelling subscription: ${subscriptionId}`);
      
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId, {
        cancel_at_cycle_end: cancelAtCycleEnd,
      });

      this.logger.log(`Subscription cancelled successfully: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription ${subscriptionId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  async pauseSubscription(subscriptionId: string, pauseAt?: number) {
    try {
      this.logger.log(`Pausing subscription: ${subscriptionId}`);
      
      const subscription = await this.razorpay.subscriptions.pause(subscriptionId, {
        pause_at: pauseAt,
      });

      this.logger.log(`Subscription paused successfully: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to pause subscription ${subscriptionId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to pause subscription');
    }
  }

  async resumeSubscription(subscriptionId: string, resumeAt?: number) {
    try {
      this.logger.log(`Resuming subscription: ${subscriptionId}`);
      
      const subscription = await this.razorpay.subscriptions.resume(subscriptionId, {
        resume_at: resumeAt,
      });

      this.logger.log(`Subscription resumed successfully: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to resume subscription ${subscriptionId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to resume subscription');
    }
  }

  // Payment Management
  async getPayments(subscriptionId?: string, count: number = 100, skip: number = 0) {
    try {
      const options: any = { count, skip };
      if (subscriptionId) {
        options.subscription_id = subscriptionId;
      }

      const payments = await this.razorpay.payments.all(options);
      return payments;
    } catch (error) {
      this.logger.error(`Failed to fetch payments: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch payments');
    }
  }

  async getPayment(paymentId: string): Promise<RazorpayPayment> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      this.logger.error(`Failed to fetch payment ${paymentId}: ${error.message}`);
      throw new BadRequestException('Payment not found');
    }
  }

  // Plan Management
  async getPlan(planId: string) {
    try {
      const plan = await this.razorpay.plans.fetch(planId);
      return plan;
    } catch (error) {
      this.logger.error(`Failed to fetch plan ${planId}: ${error.message}`);
      throw new BadRequestException('Plan not found');
    }
  }

  async getAllPlans() {
    try {
      const plans = await this.razorpay.plans.all();
      return plans;
    } catch (error) {
      this.logger.error(`Failed to fetch plans: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch plans');
    }
  }

  // Webhook Verification
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
      if (!webhookSecret) {
        this.logger.warn('Webhook secret not configured');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      return false;
    }
  }

  // Utility Methods
  getPlanIdForSubscription(planType: 'starter' | 'professional' | 'enterprise', currency: string = 'INR'): string {
    const envKey = `RAZORPAY_PLAN_ID_${planType.toUpperCase()}_${currency}`;
    const planId = this.configService.get<string>(envKey);
    
    if (!planId) {
      this.logger.warn(`Plan ID not found for ${planType} in ${currency}, falling back to INR`);
      // Fallback to INR if currency-specific plan not found
      const fallbackKey = `RAZORPAY_PLAN_ID_${planType.toUpperCase()}_INR`;
      const fallbackPlanId = this.configService.get<string>(fallbackKey);
      
      if (!fallbackPlanId) {
        throw new BadRequestException(`No plan ID found for ${planType} in any currency`);
      }
      
      return fallbackPlanId;
    }
    
    return planId;
  }

  /**
   * Get all available currencies for plans
   */
  getAvailableCurrencies(): string[] {
    return ['INR', 'USD', 'GBP', 'EUR', 'CAD'];
  }

  /**
   * Check if a currency is supported
   */
  isCurrencySupported(currency: string): boolean {
    return this.getAvailableCurrencies().includes(currency.toUpperCase());
  }

  formatAmount(amount: number): number {
    // Razorpay expects amount in paise (smallest currency unit)
    return Math.round(amount * 100);
  }

  formatAmountFromPaise(amountInPaise: number): number {
    // Convert from paise to rupees
    return amountInPaise / 100;
  }

  async getSubscriptionsByCustomer(customerId: string) {
    try {
      const subscriptions = await this.razorpay.subscriptions.all({
        customer_id: customerId,
      });
      return subscriptions;
    } catch (error) {
      this.logger.error(`Failed to fetch subscriptions for customer ${customerId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch customer subscriptions');
    }
  }

  async createOrder(amount: number, currency: string = 'INR', notes?: Record<string, any>) {
    try {
      const order = await this.razorpay.orders.create({
        amount: this.formatAmount(amount),
        currency,
        notes: notes || {},
      });
      
      this.logger.log(`Order created successfully: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw new InternalServerErrorException('Failed to create order');
    }
  }
}
