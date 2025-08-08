import { ApiService } from '@/lib/api';

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  description: string;
}

export interface BillingSubscription {
  id: string;
  portalId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface BillingPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface BillingSummary {
  subscription: BillingSubscription | null;
  payments: BillingPayment[];
  totalPayments: number;
  totalAmount: number;
  availablePlans: BillingPlan[];
  currentPlan: BillingPlan | null;
}

class HubSpotBillingService {
  private baseUrl = '/api/hubspot-billing';

  /**
   * Get available billing plans
   */
  async getAvailablePlans(): Promise<BillingPlan[]> {
    try {
      const response = await ApiService.get(`${this.baseUrl}/plans`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get available plans:', error);
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(planId: string): Promise<BillingSubscription> {
    try {
      const response = await ApiService.post(`${this.baseUrl}/subscriptions`, {
        planId
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(): Promise<any> {
    try {
      const response = await ApiService.post(`${this.baseUrl}/subscriptions/cancel`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(): Promise<BillingSubscription | null> {
    try {
      const response = await ApiService.get(`${this.baseUrl}/subscriptions/status`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      throw error;
    }
  }

  /**
   * Process a payment
   */
  async processPayment(planId: string, amount: number): Promise<any> {
    try {
      const response = await ApiService.post(`${this.baseUrl}/payments`, {
        planId,
        amount
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<BillingPayment[]> {
    try {
      const response = await ApiService.get(`${this.baseUrl}/payments/history`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw error;
    }
  }

  /**
   * Create an invoice
   */
  async createInvoice(amount: number, description: string): Promise<any> {
    try {
      const response = await ApiService.post(`${this.baseUrl}/invoices`, {
        amount,
        description
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  /**
   * Get billing summary
   */
  async getBillingSummary(): Promise<BillingSummary> {
    try {
      const response = await ApiService.get(`${this.baseUrl}/summary`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get billing summary:', error);
      throw error;
    }
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(planId: string): Promise<BillingSubscription> {
    try {
      const response = await ApiService.post(`${this.baseUrl}/upgrade`, {
        planId
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      throw error;
    }
  }

  /**
   * Downgrade subscription
   */
  async downgradeSubscription(planId: string): Promise<BillingSubscription> {
    try {
      const response = await ApiService.post(`${this.baseUrl}/downgrade`, {
        planId
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to downgrade subscription:', error);
      throw error;
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<BillingPlan | null> {
    try {
      const plans = await this.getAvailablePlans();
      return plans.find(plan => plan.id === planId) || null;
    } catch (error) {
      console.error('Failed to get plan by ID:', error);
      return null;
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus();
      return subscription?.status === 'active';
    } catch (error) {
      console.error('Failed to check active subscription:', error);
      return false;
    }
  }

  /**
   * Get current plan details
   */
  async getCurrentPlan(): Promise<BillingPlan | null> {
    try {
      const summary = await this.getBillingSummary();
      return summary.currentPlan;
    } catch (error) {
      console.error('Failed to get current plan:', error);
      return null;
    }
  }

  /**
   * Get subscription status text
   */
  getSubscriptionStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'canceled':
        return 'Canceled';
      case 'past_due':
        return 'Past Due';
      case 'trialing':
        return 'Trial';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get subscription status color
   */
  getSubscriptionStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get payment status text
   */
  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'succeeded':
        return 'Successful';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export default new HubSpotBillingService(); 