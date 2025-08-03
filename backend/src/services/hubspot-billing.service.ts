import { Injectable } from '@nestjs/common';

@Injectable()
export class HubSpotBillingService {
  async createInvoice(userId: string, amount: number): Promise<any> {
    return { success: true };
  }

  async processPayment(userId: string, amount: number): Promise<any> {
    return { success: true };
  }
} 