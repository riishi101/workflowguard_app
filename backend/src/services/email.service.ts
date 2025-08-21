import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string): Promise<void> {
    console.log(`Email sent to ${to}: ${subject}`);
  }

  async sendWelcomeEmail(to: string, name: string) {
    console.log(`Email sent to ${to}: Welcome ${name}`);
  }

  async sendNotificationEmail(
    to: string,
    template: string,
    data: any,
  ): Promise<void> {
    console.log(`Notification email sent to ${to} using template ${template}`);
  }

  async sendOverageAlert(data: any): Promise<boolean> {
    console.log(`Overage alert sent with data:`, data);
    return true;
  }

  async sendBillingUpdate(data: any): Promise<boolean> {
    console.log(`Billing update sent with data:`, data);
    return true;
  }

  async sendSystemAlert(data: any): Promise<boolean> {
    console.log(`System alert sent with data:`, data);
    return true;
  }

  async sendUpgradeRecommendation(
    userName: string,
    currentPlan: string,
    recommendedPlan: string,
    reason: string,
    additionalData?: any,
  ): Promise<boolean> {
    console.log(`Upgrade recommendation sent:`, {
      userName,
      currentPlan,
      recommendedPlan,
      reason,
      additionalData,
    });
    return true;
  }

  async sendUsageWarning(
    userEmail: string,
    userName: string,
    planId: string,
    currentUsage: number,
    limit: number,
    percentageUsed: number,
  ): Promise<boolean> {
    console.log(`Usage warning sent:`, {
      userEmail,
      userName,
      planId,
      currentUsage,
      limit,
      percentageUsed,
    });
    return true;
  }

  async sendBulkNotification(
    userEmails: string[],
    subject: string,
    message: string,
    isHtml?: boolean,
  ): Promise<any> {
    console.log(`Bulk notification sent:`, {
      userEmails,
      subject,
      message,
      isHtml,
    });
    return { success: true, sent: userEmails.length, failed: 0 };
  }
}
