"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
let EmailService = class EmailService {
    async sendEmail(to, subject, content) {
        console.log(`Email sent to ${to}: ${subject}${content ? ` - ${content}` : ''}`);
    }
    async sendWelcomeEmail(to, name) {
        console.log(`Email sent to ${to}: Welcome ${name}`);
    }
    async sendNotificationEmail(to, template, data) {
        console.log(`Notification email sent to ${to} using template ${template}`);
    }
    async sendOverageAlert(data) {
        console.log(`Overage alert sent with data:`, data);
        return true;
    }
    async sendBillingUpdate(data) {
        console.log(`Billing update sent with data:`, data);
        return true;
    }
    async sendSystemAlert(data) {
        console.log(`System alert sent with data:`, data);
        return true;
    }
    async sendUpgradeRecommendation(userName, currentPlan, recommendedPlan, reason, additionalData) {
        console.log(`Upgrade recommendation sent:`, {
            userName,
            currentPlan,
            recommendedPlan,
            reason,
            additionalData,
        });
        return true;
    }
    async sendUsageWarning(userEmail, userName, planId, currentUsage, limit, percentageUsed) {
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
    async sendBulkNotification(userEmails, subject, message, isHtml) {
        console.log(`Bulk notification sent:`, {
            userEmails,
            subject,
            message,
            isHtml,
        });
        return { success: true, sent: userEmails.length, failed: 0 };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)()
], EmailService);
//# sourceMappingURL=email.service.js.map