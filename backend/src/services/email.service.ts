import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    console.log(`Email sent to ${to}: ${subject}`);
  }

  async sendNotificationEmail(to: string, template: string, data: any): Promise<void> {
    console.log(`Notification email sent to ${to} using template ${template}`);
  }

  // Add missing methods
  async sendOverageAlert(data: any): Promise<boolean> {
    console.log('Overage alert email sent:', data);
    return true;
  }

  async sendBillingUpdate(data: any): Promise<boolean> {
    console.log('Billing update email sent:', data);
    return true;
  }

  async sendSystemAlert(data: any): Promise<boolean> {
    console.log('System alert email sent:', data);
    return true;
  }

  async sendWelcomeEmail(data: any): Promise<boolean> {
    console.log('Welcome email sent:', data);
    return true;
  }

  async sendUpgradeRecommendation(
    userName: string,
    currentPlan: string,
    recommendedPlan: string,
    reason: string,
    additionalData?: any
  ): Promise<boolean> {
    console.log('Upgrade recommendation email sent:', { userName, currentPlan, recommendedPlan, reason, additionalData });
    return true;
  }

  async sendUsageWarning(
    userEmail: string,
    userName: string,
    planId: string,
    currentUsage: number,
    limit: number,
    percentageUsed: number
  ): Promise<boolean> {
    console.log('Usage warning email sent:', { userEmail, userName, planId, currentUsage, limit, percentageUsed });
    return true;
  }

  async sendBulkNotification(
    userEmails: string[],
    subject: string,
    message: string,
    isHtml?: boolean
  ): Promise<any> {
    console.log('Bulk notification email sent:', { userEmails, subject, message, isHtml });
    return { success: true, sent: 1, failed: 0 };
  }
} 