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
  forwardRef,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { RazorpayService, CreateSubscriptionDto, CreateCustomerDto } from './razorpay.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Controller('razorpay')
export class RazorpayController {
  private readonly logger = new Logger(RazorpayController.name);

  constructor(
    private razorpayService: RazorpayService,
    @Inject(forwardRef(() => SubscriptionService))
    private subscriptionService: SubscriptionService,
  ) {}

  // Customer Management
  @Post('customers')
  @UseGuards(JwtAuthGuard)
  async createCustomer(@Body() customerData: CreateCustomerDto, @GetUser() user: any) {
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
  async createSubscription(@Body() subscriptionData: CreateSubscriptionDto, @GetUser() user: any) {
    this.logger.log(`Creating subscription for user: ${user.id}`);
    
    // Create Razorpay subscription
    const razorpaySubscription = await this.razorpayService.createSubscription(subscriptionData);
    
    // Update local subscription record
    await this.subscriptionService.updateSubscriptionFromRazorpay(user.id, razorpaySubscription);
    
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
    this.logger.log(`Cancelling subscription: ${subscriptionId} for user: ${user.id}`);
    
    const cancelledSubscription = await this.razorpayService.cancelSubscription(
      subscriptionId,
      body.cancelAtCycleEnd,
    );
    
    // Update local subscription status
    await this.subscriptionService.handleSubscriptionCancellation(user.id, subscriptionId);
    
    return cancelledSubscription;
  }

  @Post('subscriptions/:subscriptionId/pause')
  @UseGuards(JwtAuthGuard)
  async pauseSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { pauseAt?: number },
  ) {
    return await this.razorpayService.pauseSubscription(subscriptionId, body.pauseAt);
  }

  @Post('subscriptions/:subscriptionId/resume')
  @UseGuards(JwtAuthGuard)
  async resumeSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { resumeAt?: number },
  ) {
    return await this.razorpayService.resumeSubscription(subscriptionId, body.resumeAt);
  }

  // Plan Upgrade/Downgrade
  @Post('subscriptions/:subscriptionId/upgrade')
  @UseGuards(JwtAuthGuard)
  async upgradeSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { newPlanType: 'starter' | 'professional' | 'enterprise' },
    @GetUser() user: any,
  ) {
    this.logger.log(`Upgrading subscription: ${subscriptionId} to ${body.newPlanType} for user: ${user.id}`);
    
    // Cancel current subscription
    await this.razorpayService.cancelSubscription(subscriptionId, false);
    
    // Get user's Razorpay customer ID
    const userSubscription = await this.subscriptionService.getUserSubscription(user.id);
    if (!userSubscription?.razorpayCustomerId) {
      throw new BadRequestException('User does not have a Razorpay customer ID');
    }
    
    // Create new subscription with new plan
    const newPlanId = this.razorpayService.getPlanIdForSubscription(body.newPlanType);
    const newSubscription = await this.razorpayService.createSubscription({
      planId: newPlanId,
      customerId: userSubscription.razorpayCustomerId,
      notes: {
        upgrade_from: subscriptionId,
        previous_plan: userSubscription.planId,
        user_id: user.id,
      },
    });
    
    // Update local subscription
    await this.subscriptionService.updateSubscriptionFromRazorpay(user.id, newSubscription);
    
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
    
    const userSubscription = await this.subscriptionService.getUserSubscription(user.id);
    if (!userSubscription?.razorpaySubscriptionId) {
      return { payments: [], subscription: null };
    }
    
    const [payments, subscription] = await Promise.all([
      this.razorpayService.getPayments(userSubscription.razorpaySubscriptionId),
      this.razorpayService.getSubscription(userSubscription.razorpaySubscriptionId),
    ]);
    
    return {
      payments: payments.items || [],
      subscription,
      localSubscription: userSubscription,
    };
  }

  // Plans
  @Get('plans')
  async getPlans() {
    return await this.razorpayService.getAllPlans();
  }

  @Get('plans/:planId')
  async getPlan(@Param('planId') planId: string) {
    return await this.razorpayService.getPlan(planId);
  }

  // Create Order for Plan Upgrade
  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createRazorpayOrder(
    @Body() body: { planId: string },
    @GetUser() user: any,
  ) {
    this.logger.log(`Creating Razorpay order for plan upgrade: ${body.planId}, user: ${user.id}`);
    
    // Get plan pricing in rupees (will be converted to paise in service)
    const planPricing = {
      starter: 19, // ₹19
      professional: 49, // ₹49  
      enterprise: 99, // ₹99
    };
    
    const amount = planPricing[body.planId as keyof typeof planPricing] || 19;
    
    const order = await this.razorpayService.createOrder(amount, 'INR', {
      plan_id: body.planId,
      user_id: user.id,
      type: 'subscription_upgrade',
    });
    
    return {
      success: true,
      data: order,
    };
  }

  // Confirm Razorpay Payment
  @Post('confirm-payment')
  @UseGuards(JwtAuthGuard)
  async confirmRazorpayPayment(
    @Body() body: { planId: string; paymentId: string; orderId: string; signature: string },
    @GetUser() user: any,
  ) {
    this.logger.log(`Confirming Razorpay payment: ${body.paymentId}, user: ${user.id}`);
    
    try {
      // Verify payment signature
      const isValid = this.razorpayService.verifyPaymentSignature(
        body.orderId,
        body.paymentId,
        body.signature
      );
      
      if (!isValid) {
        throw new BadRequestException('Invalid payment signature');
      }
      
      // Fetch payment details from Razorpay
      const payment = await this.razorpayService.getPayment(body.paymentId);
      
      if (payment.status !== 'captured') {
        throw new BadRequestException('Payment not captured');
      }
      
      // Update user subscription
      await this.subscriptionService.upgradeUserPlan(user.id, body.planId, {
        razorpayPaymentId: body.paymentId,
        razorpayOrderId: body.orderId,
      });
      
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
    @Body() body: { amount: number; currency?: string; notes?: Record<string, any> },
    @GetUser() user: any,
  ) {
    this.logger.log(`Creating order for user: ${user.id}, amount: ${body.amount}`);
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
    const isValid = this.razorpayService.verifyWebhookSignature(bodyString, signature);
    
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
          await this.handleSubscriptionCharged(payload.payment.entity, payload.subscription.entity);
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
      this.logger.error(`Error processing webhook event ${eventType}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleSubscriptionActivated(subscription: any) {
    this.logger.log(`Subscription activated: ${subscription.id}`);
    // Update local subscription status
    await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'active');
  }

  private async handleSubscriptionCharged(payment: any, subscription: any) {
    this.logger.log(`Subscription charged: ${subscription.id}, payment: ${payment.id}`);
    // Record payment and update subscription
    await this.subscriptionService.recordPayment(subscription.id, payment);
  }

  private async handleSubscriptionCompleted(subscription: any) {
    this.logger.log(`Subscription completed: ${subscription.id}`);
    await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'completed');
  }

  private async handleSubscriptionCancelled(subscription: any) {
    this.logger.log(`Subscription cancelled: ${subscription.id}`);
    await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'cancelled');
  }

  private async handleSubscriptionPaused(subscription: any) {
    this.logger.log(`Subscription paused: ${subscription.id}`);
    await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'paused');
  }

  private async handleSubscriptionResumed(subscription: any) {
    this.logger.log(`Subscription resumed: ${subscription.id}`);
    await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'active');
  }

  private async handlePaymentFailed(payment: any) {
    this.logger.log(`Payment failed: ${payment.id}`);
    // Handle failed payment - maybe send notification, update subscription status, etc.
    await this.subscriptionService.handleFailedPayment(payment);
  }
}
