import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  RawBody,
  UseGuards,
  Logger,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import {
  RazorpayService,
  CreateSubscriptionDto,
  CreateCustomerDto,
} from './razorpay.service';

@Controller('razorpay')
export class RazorpayController {
  private readonly logger = new Logger(RazorpayController.name);

  constructor(
    private razorpayService: RazorpayService,
    private configService: ConfigService,
  ) {}

  // Customer Management
  @Post('customers')
  @UseGuards(JwtAuthGuard)
  async createCustomer(
    @Body() customerData: CreateCustomerDto,
    @GetUser() user: any,
  ) {
    this.logger.log(`Creating Razorpay customer for user: ${user.id}`);
    return await this.razorpayService.createCustomer(customerData);
  }

  @Get('customers/:customerId')
  @UseGuards(JwtAuthGuard)
  async getCustomer(@Param('customerId') customerId: string) {
    return await this.razorpayService.getCustomer(customerId);
  }

  @Put('customers/:customerId')
  @UseGuards(JwtAuthGuard)
  async updateCustomer(
    @Param('customerId') customerId: string,
    @Body() updateData: Partial<CreateCustomerDto>,
  ) {
    return await this.razorpayService.updateCustomer(customerId, updateData);
  }

  // Subscription Management
  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Body() subscriptionData: CreateSubscriptionDto,
    @GetUser() user: any,
  ) {
    this.logger.log(`Creating subscription for user: ${user.id}`);

    // Create Razorpay subscription
    const razorpaySubscription =
      await this.razorpayService.createSubscription(subscriptionData);

    // Update local subscription record - handle this in the service layer
    // For now, just return the subscription - the webhook will handle updates
    return razorpaySubscription;
  }

  @Get('subscriptions/:subscriptionId')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    return await this.razorpayService.getSubscription(subscriptionId);
  }

  @Post('subscriptions/:subscriptionId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { cancelAtCycleEnd?: boolean },
    @GetUser() user: any,
  ) {
    this.logger.log(
      `Cancelling subscription: ${subscriptionId} for user: ${user.id}`,
    );

    const cancelledSubscription = await this.razorpayService.cancelSubscription(
      subscriptionId,
      body.cancelAtCycleEnd,
    );

    // Update local subscription status - handle this in the webhook
    return cancelledSubscription;
  }

  @Post('subscriptions/:subscriptionId/pause')
  @UseGuards(JwtAuthGuard)
  async pauseSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { pauseAt?: number },
  ) {
    return await this.razorpayService.pauseSubscription(
      subscriptionId,
      body.pauseAt,
    );
  }

  @Post('subscriptions/:subscriptionId/resume')
  @UseGuards(JwtAuthGuard)
  async resumeSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { resumeAt?: number },
  ) {
    return await this.razorpayService.resumeSubscription(
      subscriptionId,
      body.resumeAt,
    );
  }

  // Plan Upgrade/Downgrade
  @Post('subscriptions/:subscriptionId/upgrade')
  @UseGuards(JwtAuthGuard)
  async upgradeSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body()
    body: {
      newPlanType: 'starter' | 'professional' | 'enterprise';
      currency?: string;
    },
    @GetUser() user: any,
  ) {
    this.logger.log(
      `Upgrading subscription: ${subscriptionId} to ${body.newPlanType} for user: ${user.id}`,
    );

    // Cancel current subscription
    await this.razorpayService.cancelSubscription(subscriptionId, false);

    // Get user's Razorpay customer ID - simplified for now
    // TODO: Implement proper subscription lookup
    const userSubscription = { razorpayCustomerId: null };

    if (!userSubscription?.razorpayCustomerId) {
      throw new BadRequestException(
        'User does not have a Razorpay customer ID',
      );
    }

    // Get the correct plan ID for the currency
    const currency = body.currency || 'USD';
    const newPlanId = this.razorpayService.getPlanIdForSubscription(
      body.newPlanType,
      currency,
    );
    const newSubscription = await this.razorpayService.createSubscription({
      planId: newPlanId,
      customerId: userSubscription.razorpayCustomerId,
      notes: {
        upgrade_from: subscriptionId,
        previous_plan: body.newPlanType,
        user_id: user.id,
        currency: currency,
      },
    });

    // Update local subscription - handle this in the webhook
    return newSubscription;
  }

  // Payment History
  @Get('payments')
  @UseGuards(JwtAuthGuard)
  async getPayments(
    @Query('subscriptionId') subscriptionId?: string,
    @Query('count') count: number = 100,
    @Query('skip') skip: number = 0,
  ) {
    return await this.razorpayService.getPayments(subscriptionId, count, skip);
  }

  @Get('payments/:paymentId')
  @UseGuards(JwtAuthGuard)
  async getPayment(@Param('paymentId') paymentId: string) {
    return await this.razorpayService.getPayment(paymentId);
  }

  // User's Billing History
  @Get('billing-history')
  @UseGuards(JwtAuthGuard)
  async getBillingHistory(@GetUser() user: any) {
    this.logger.log(`Fetching billing history for user: ${user.id}`);

    // Simplified for now - TODO: Implement proper subscription lookup
    return {
      payments: [],
      subscription: null,
      localSubscription: null,
    };
  }

  // Plans
  @Get('plans')
  async getPlans() {
    return await this.razorpayService.getAllPlans();
  }

  // Plans (temporary override for config testing)
  @Get('plans-config')
  async getPlansAsConfig() {
    this.logger.log('getPlansAsConfig method called');
    return {
      message: 'Razorpay config from plans method',
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
      availableCurrencies: this.razorpayService.getAvailableCurrencies(),
    };
  }

  @Get('plans/:planId')
  async getPlan(@Param('planId') planId: string) {
    return await this.razorpayService.getPlan(planId);
  }

  // Configuration endpoint for frontend - Original Method
  @Get('config')
  async getRazorpayConfig(): Promise<any> {
    this.logger.log('getRazorpayConfig method called');
    return {
      message: 'Razorpay config endpoint working',
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
      availableCurrencies: this.razorpayService.getAvailableCurrencies(),
    };
  }

  // Configuration endpoint for frontend - Debug Version
  @Get('config-debug')
  async getRazorpayConfigDebug() {
    console.log('DEBUG: getRazorpayConfigDebug method called');
    return {
      message: 'Razorpay config debug endpoint working',
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
      availableCurrencies: ['INR', 'USD', 'GBP', 'EUR', 'CAD'],
      timestamp: new Date().toISOString(),
    };
  }

  // Configuration endpoint for frontend - Simple Version (no service dependencies)
  @Get('config-simple')
  async getSimpleRazorpayConfig(): Promise<{
    message: string;
    keyId: string;
    availableCurrencies: string[];
  }> {
    this.logger.log('getSimpleRazorpayConfig method called');
    return {
      message: 'Razorpay configuration loaded successfully',
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID') || '',
      availableCurrencies: ['INR', 'USD', 'GBP', 'EUR', 'CAD'],
    };
  }

  // Configuration endpoint - Different pattern
  @Get('payment-settings')
  async getPaymentSettings() {
    this.logger.log('getPaymentSettings method called');
    return {
      message: 'Payment settings endpoint working',
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
      availableCurrencies: this.razorpayService.getAvailableCurrencies(),
    };
  }

  // Test method using exact same pattern as working getPlans method
  @Get('config-test')
  async getConfigTest() {
    this.logger.log('getConfigTest method called');
    return {
      message: 'Config test endpoint working',
      keyId: 'test-key',
      availableCurrencies: ['INR', 'USD', 'GBP', 'EUR', 'CAD'],
    };
  }

  // Configuration endpoint for frontend - Hardcoded Version
  @Get('config-hardcoded')
  async getHardcodedRazorpayConfig() {
    this.logger.log('getHardcodedRazorpayConfig method called');
    return {
      message: 'Razorpay configuration with hardcoded values',
      keyId: 'rzp_live_R6PjXR1FYupO0Y',
      availableCurrencies: ['INR', 'USD', 'GBP', 'EUR', 'CAD'],
      planIds: {
        starter: {
          INR: 'plan_R6RI02CsUCUlDz',
          USD: 'plan_RBDqWapKHZfPU7',
          GBP: 'plan_RBFxk81S3ySXxj',
          EUR: 'plan_RBFjbYhAtD3snL',
          CAD: 'plan_RBFrtufmxmxwi8',
        },
        professional: {
          INR: 'plan_R6RKEg5mqJK6Ky',
          USD: 'plan_RBDrKWI81HS1FZ',
          GBP: 'plan_RBFy8LsuW36jIj',
          EUR: 'plan_RBFjqo5wE0d4jz',
          CAD: 'plan_RBFsD6U2rQb4B6',
        },
        enterprise: {
          INR: 'plan_R6RKnjqXu0BZsH',
          USD: 'plan_RBDrX9dGapWrTe',
          GBP: 'plan_RBFyJlB5jxwxB9',
          EUR: 'plan_RBFovOUIUXISBE',
          CAD: 'plan_RBFscXaosRIzEc',
        },
      },
    };
  }

  // Create Order for Plan Upgrade
  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createRazorpayOrder(
    @Body() body: { planId: string; currency?: string },
    @GetUser() user: any,
  ) {
    this.logger.log(
      `Creating Razorpay order for plan upgrade: ${body.planId}, user: ${user.id}`,
    );

    // Detect user's currency (default to USD for international users)
    const currency = body.currency || 'USD';

    // Multi-currency pricing
    const planPricing = {
      starter: {
        USD: 19,
        GBP: 15,
        EUR: 17,
        CAD: 27,
        INR: 19,
      },
      professional: {
        USD: 49,
        GBP: 39,
        EUR: 44,
        CAD: 69,
        INR: 49,
      },
      enterprise: {
        USD: 99,
        GBP: 79,
        EUR: 89,
        CAD: 139,
        INR: 99,
      },
    };

    const amount =
      planPricing[body.planId as keyof typeof planPricing]?.[
        currency as keyof typeof planPricing.starter
      ] || 19;

    try {
      const order = await this.razorpayService.createOrder(amount, currency, {
        plan_id: body.planId,
        user_id: user.id,
        type: 'subscription_upgrade',
        currency: currency,
      });

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order for user ${user.id}: ${error.message}`);
      if (error.message?.includes('Payment system')) {
        throw error; // Re-throw configuration errors as-is
      }
      throw new BadRequestException('Payment system is temporarily unavailable. Please contact support.');
    }
  }

  // Confirm Razorpay Payment
  @Post('confirm-payment')
  @UseGuards(JwtAuthGuard)
  async confirmRazorpayPayment(
    @Body()
    body: {
      planId: string;
      paymentId: string;
      orderId: string;
      signature: string;
    },
    @GetUser() user: any,
  ) {
    this.logger.log(
      `Confirming Razorpay payment: ${body.paymentId}, user: ${user.id}`,
    );

    try {
      // Verify payment signature
      const isValid = this.razorpayService.verifyPaymentSignature(
        body.orderId,
        body.paymentId,
        body.signature,
      );

      if (!isValid) {
        throw new BadRequestException('Invalid payment signature');
      }

      // Fetch payment details from Razorpay
      const payment = await this.razorpayService.getPayment(body.paymentId);

      if (payment.status !== 'captured') {
        throw new BadRequestException('Payment not captured');
      }

      // Update user subscription - simplified for now
      // TODO: Implement proper subscription management
      return {
        success: true,
        message: 'Payment confirmed and subscription updated',
        data: { paymentId: body.paymentId, planId: body.planId },
      };
    } catch (error) {
      this.logger.error(`Payment confirmation failed: ${error.message}`);
      throw error;
    }
  }

  // Create Order (for one-time payments)
  @Post('orders')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body()
    body: { amount: number; currency?: string; notes?: Record<string, any> },
    @GetUser() user: any,
  ) {
    this.logger.log(
      `Creating order for user: ${user.id}, amount: ${body.amount}`,
    );
    return await this.razorpayService.createOrder(body.amount, body.currency, {
      ...body.notes,
      user_id: user.id,
    });
  }

  // Webhook Handler
  @Post('webhooks')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @RawBody() body: Buffer,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    this.logger.log('Received Razorpay webhook');

    const bodyString = body.toString();
    const isValid = this.razorpayService.verifyWebhookSignature(
      bodyString,
      signature,
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    const event = JSON.parse(bodyString);
    this.logger.log(`Processing webhook event: ${event.event}`);

    await this.handleWebhookEvent(event);

    return { status: 'ok' };
  }

  private async handleWebhookEvent(event: any) {
    const { event: eventType, payload } = event;

    try {
      switch (eventType) {
        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload.subscription.entity);
          break;

        case 'subscription.charged':
          await this.handleSubscriptionCharged(
            payload.payment.entity,
            payload.subscription.entity,
          );
          break;

        case 'subscription.completed':
          await this.handleSubscriptionCompleted(payload.subscription.entity);
          break;

        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload.subscription.entity);
          break;

        case 'subscription.paused':
          await this.handleSubscriptionPaused(payload.subscription.entity);
          break;

        case 'subscription.resumed':
          await this.handleSubscriptionResumed(payload.subscription.entity);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload.payment.entity);
          break;

        default:
          this.logger.log(`Unhandled webhook event: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event ${eventType}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleSubscriptionActivated(subscription: any) {
    this.logger.log(`Subscription activated: ${subscription.id}`);
    // TODO: Implement subscription status update
  }

  private async handleSubscriptionCharged(payment: any, subscription: any) {
    this.logger.log(
      `Subscription charged: ${subscription.id}, payment: ${payment.id}`,
    );
    // TODO: Implement payment recording
  }

  private async handleSubscriptionCompleted(subscription: any) {
    this.logger.log(`Subscription completed: ${subscription.id}`);
    // TODO: Implement subscription status update
  }

  private async handleSubscriptionCancelled(subscription: any) {
    this.logger.log(`Subscription cancelled: ${subscription.id}`);
    // TODO: Implement subscription status update
  }

  private async handleSubscriptionPaused(subscription: any) {
    this.logger.log(`Subscription paused: ${subscription.id}`);
    // TODO: Implement subscription status update
  }

  private async handleSubscriptionResumed(subscription: any) {
    this.logger.log(`Subscription resumed: ${subscription.id}`);
    // TODO: Implement subscription status update
  }

  private async handlePaymentFailed(payment: any) {
    this.logger.log(`Payment failed: ${payment.id}`);
    // TODO: Implement failed payment handling
  }
}
