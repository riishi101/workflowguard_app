"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = __importDefault(require("twilio"));
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(WhatsAppService_1.name);
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.fromNumber = 'whatsapp:+14155238886';
        if (!accountSid ||
            !authToken ||
            accountSid === 'your-twilio-account-sid' ||
            authToken === 'your-twilio-auth-token' ||
            accountSid === 'AC00000000000000000000000000000000' ||
            !accountSid.startsWith('AC') ||
            accountSid.length !== 34) {
            this.logger.warn('Twilio credentials not configured or invalid. WhatsApp service will be disabled.');
            return;
        }
        try {
            this.twilioClient = (0, twilio_1.default)(accountSid, authToken);
            this.logger.log('WhatsApp service initialized with Twilio Sandbox');
        }
        catch (error) {
            this.logger.error('Failed to initialize Twilio client:', error);
            this.logger.warn('WhatsApp service will be disabled due to initialization error.');
        }
    }
    async sendSupportMessage(to, message, userEmail) {
        if (!this.twilioClient) {
            this.logger.error('Twilio client not initialized');
            return false;
        }
        try {
            const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            const formattedMessage = userEmail
                ? `WorkflowGuard Support Request from ${userEmail}:\n\n${message}`
                : `WorkflowGuard Support Request:\n\n${message}`;
            const messageResponse = await this.twilioClient.messages.create({
                body: formattedMessage,
                from: this.fromNumber,
                to: toNumber,
            });
            this.logger.log(`WhatsApp message sent successfully. SID: ${messageResponse.sid}`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send WhatsApp message:', error);
            return false;
        }
    }
    async sendTemplateMessage(to, templateName, variables) {
        if (!this.twilioClient) {
            this.logger.error('Twilio client not initialized');
            return false;
        }
        try {
            const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            let templateMessage = '';
            switch (templateName) {
                case 'appointment_reminder':
                    templateMessage = `Your appointment is coming up on ${variables[0]} at ${variables[1]}. If you need to change it, please reply back and let us know.`;
                    break;
                case 'support_welcome':
                    templateMessage = `Hi! 👋 Welcome to WorkflowGuard support. How can we help you today?`;
                    break;
                default:
                    templateMessage = `Thank you for contacting WorkflowGuard support. We'll get back to you as soon as possible.`;
            }
            const messageResponse = await this.twilioClient.messages.create({
                body: templateMessage,
                from: this.fromNumber,
                to: toNumber,
            });
            this.logger.log(`WhatsApp template message sent successfully. SID: ${messageResponse.sid}`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send WhatsApp template message:', error);
            return false;
        }
    }
    async sendWelcomeMessage(to, userName) {
        const welcomeMessage = userName
            ? `Hi ${userName}! 👋 Welcome to WorkflowGuard support. How can we help you today?`
            : `Hi! 👋 Welcome to WorkflowGuard support. How can we help you today?`;
        return this.sendSupportMessage(to, welcomeMessage);
    }
    async sendAutoReplyMessage(to, issueType) {
        const autoReplyMessages = {
            rollback: 'We received your rollback issue. Our team is investigating and will get back to you within 2 hours.',
            sync: "We received your sync issue. Please try refreshing your workflows. If the issue persists, we'll help you resolve it.",
            auth: "We received your authentication issue. Please try logging out and back in. If that doesn't work, we'll assist you further.",
            data: 'We received your data issue. Our team is checking the data integrity and will update you shortly.',
            performance: "We received your performance issue. We're optimizing the system and will notify you once resolved.",
            default: 'We received your support request and will get back to you as soon as possible.',
        };
        const message = autoReplyMessages[issueType] || autoReplyMessages.default;
        return this.sendSupportMessage(to, message);
    }
    isConfigured() {
        return !!this.twilioClient;
    }
    getSandboxNumber() {
        return '+14155238886';
    }
    getSandboxInstructions() {
        return 'To connect to our WhatsApp support, send "join grown-settlers" to +1 415 523 8886 first, then you can chat with us!';
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map