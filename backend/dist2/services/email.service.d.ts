export declare class EmailService {
    sendEmail(to: string, subject: string, content?: string): Promise<void>;
    sendWelcomeEmail(to: string, name: string): Promise<void>;
    sendNotificationEmail(to: string, template: string, data: any): Promise<void>;
    sendOverageAlert(data: any): Promise<boolean>;
    sendBillingUpdate(data: any): Promise<boolean>;
    sendSystemAlert(data: any): Promise<boolean>;
    sendUpgradeRecommendation(userName: string, currentPlan: string, recommendedPlan: string, reason: string, additionalData?: any): Promise<boolean>;
    sendUsageWarning(userEmail: string, userName: string, planId: string, currentUsage: number, limit: number, percentageUsed: number): Promise<boolean>;
    sendBulkNotification(userEmails: string[], subject: string, message: string, isHtml?: boolean): Promise<any>;
}
