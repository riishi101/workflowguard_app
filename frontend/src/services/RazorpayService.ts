import { ApiService } from '@/lib/api';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RazorpaySubscription {
  id: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start: number;
  current_end: number;
  short_url: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  customerId: string;
  totalCount?: number;
  customerNotify?: boolean;
  notes?: Record<string, any>;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  contact?: string;
  notes?: Record<string, any>;
}

export interface BillingHistory {
  payments: any[];
  subscription: RazorpaySubscription | null;
  localSubscription: any;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

class RazorpayService {
  private static instance: RazorpayService;
  private razorpayLoaded = false;

  private constructor() {}

  static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  // Load Razorpay script
  async loadRazorpay(): Promise<boolean> {
    if (this.razorpayLoaded) return true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Customer Management
  async createCustomer(customerData: CreateCustomerRequest) {
    const response = await ApiService.post('/razorpay/customers', customerData);
    return response.data;
  }

  async getCustomer(customerId: string) {
    const response = await ApiService.get(`/razorpay/customers/${customerId}`);
    return response.data;
  }

  async updateCustomer(customerId: string, updateData: Partial<CreateCustomerRequest>) {
    const response = await ApiService.put(`/razorpay/customers/${customerId}`, updateData);
    return response.data;
  }

  // Subscription Management
  async createSubscription(subscriptionData: CreateSubscriptionRequest): Promise<RazorpaySubscription> {
    const response = await ApiService.post('/razorpay/subscriptions', subscriptionData);
    return response.data;
  }

  async getSubscription(subscriptionId: string): Promise<RazorpaySubscription> {
    const response = await ApiService.get(`/razorpay/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = false) {
    const response = await ApiService.post(`/razorpay/subscriptions/${subscriptionId}/cancel`, {
      cancelAtCycleEnd,
    });
    return response.data;
  }

  async pauseSubscription(subscriptionId: string, pauseAt?: number) {
    const response = await ApiService.post(`/razorpay/subscriptions/${subscriptionId}/pause`, {
      pauseAt,
    });
    return response.data;
  }

  async resumeSubscription(subscriptionId: string, resumeAt?: number) {
    const response = await ApiService.post(`/razorpay/subscriptions/${subscriptionId}/resume`, {
      resumeAt,
    });
    return response.data;
  }

  async upgradeSubscription(subscriptionId: string, newPlanType: 'starter' | 'professional' | 'enterprise') {
    const response = await ApiService.post(`/razorpay/subscriptions/${subscriptionId}/upgrade`, {
      newPlanType,
    });
    return response.data;
  }

  // Payment Management
  async getPayments(subscriptionId?: string, count: number = 100, skip: number = 0) {
    const params = new URLSearchParams({
      count: count.toString(),
      skip: skip.toString(),
    });
    
    if (subscriptionId) {
      params.append('subscriptionId', subscriptionId);
    }

    const response = await ApiService.get(`/razorpay/payments?${params}`);
    return response.data;
  }

  async getPayment(paymentId: string) {
    const response = await ApiService.get(`/razorpay/payments/${paymentId}`);
    return response.data;
  }

  async getBillingHistory(): Promise<BillingHistory> {
    const response = await ApiService.get('/razorpay/billing-history');
    return response.data;
  }

  // Plans
  async getPlans() {
    const response = await ApiService.get('/razorpay/plans');
    return response.data;
  }

  async getPlan(planId: string) {
    const response = await ApiService.get(`/razorpay/plans/${planId}`);
    return response.data;
  }

  // Order Management (for one-time payments)
  async createOrder(amount: number, currency: string = 'INR', notes?: Record<string, any>): Promise<RazorpayOrder> {
    const response = await ApiService.post('/razorpay/orders', {
      amount,
      currency,
      notes,
    });
    return response.data;
  }

  // Payment UI
  async openCheckout(options: {
    order_id?: string;
    subscription_id?: string;
    amount?: number;
    currency?: string;
    name: string;
    description: string;
    prefill: {
      name: string;
      email: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
    modal?: {
      ondismiss?: () => void;
    };
    handler: (response: any) => void;
  }) {
    await this.loadRazorpay();

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_R6PjXR1FYupO0Y',
      ...options,
    });

    rzp.open();
    return rzp;
  }

  // Subscription Checkout
  async openSubscriptionCheckout(subscription: RazorpaySubscription, userDetails: {
    name: string;
    email: string;
    contact?: string;
  }) {
    return this.openCheckout({
      subscription_id: subscription.id,
      name: 'WorkflowGuard',
      description: 'Subscription Payment',
      prefill: userDetails,
      theme: {
        color: '#3B82F6',
      },
      handler: (response) => {
        // Handle successful payment
        window.location.reload();
      },
      modal: {
        ondismiss: () => {
        },
      },
    });
  }

  // One-time Payment Checkout
  async openOrderCheckout(order: RazorpayOrder, userDetails: {
    name: string;
    email: string;
    contact?: string;
  }) {
    return this.openCheckout({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'WorkflowGuard',
      description: 'Payment for WorkflowGuard',
      prefill: userDetails,
      theme: {
        color: '#3B82F6',
      },
      handler: (response) => {
        // Handle successful payment
        window.location.reload();
      },
      modal: {
        ondismiss: () => {
        },
      },
    });
  }

  // Utility Methods
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  formatAmountFromPaise(amountInPaise: number): string {
    return this.formatAmount(amountInPaise / 100);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-IN');
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'created': 'text-yellow-600 bg-yellow-100',
      'authenticated': 'text-blue-600 bg-blue-100',
      'active': 'text-green-600 bg-green-100',
      'paused': 'text-orange-600 bg-orange-100',
      'halted': 'text-red-600 bg-red-100',
      'cancelled': 'text-gray-600 bg-gray-100',
      'completed': 'text-purple-600 bg-purple-100',
      'expired': 'text-red-600 bg-red-100',
      'captured': 'text-green-600 bg-green-100',
      'failed': 'text-red-600 bg-red-100',
      'refunded': 'text-orange-600 bg-orange-100',
    };
    
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  }
}

export default RazorpayService.getInstance();
