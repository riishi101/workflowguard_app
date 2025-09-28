import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private twilioClient: Twilio.Twilio;
  private readonly fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = 'whatsapp:+14155238886'; // Twilio Sandbox WhatsApp number

    // Validate Twilio credentials format and presence
    if (
      !accountSid ||
      !authToken ||
      accountSid === 'your-twilio-account-sid' ||
      authToken === 'your-twilio-auth-token' ||
      accountSid === 'AC00000000000000000000000000000000' ||
      !accountSid.startsWith('AC') ||
      accountSid.length !== 34
    ) {
      this.logger.warn(
        'Twilio credentials not configured or invalid. WhatsApp service will be disabled.',
      );
      return;
    }

    try {
      this.twilioClient = Twilio(accountSid, authToken);
      this.logger.log('WhatsApp service initialized with Twilio Sandbox');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
      this.logger.warn(
        'WhatsApp service will be disabled due to initialization error.',
      );
    }
  }

  async sendSupportMessage(
    to: string,
    message: string,
    userEmail?: string,
  ): Promise<boolean> {
    if (!this.twilioClient) {
      this.logger.error('Twilio client not initialized');
      return false;
    }

    try {
      // Format the phone number for WhatsApp
      const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      // Create a formatted message with user context
      const formattedMessage = userEmail
        ? `WorkflowGuard Support Request from ${userEmail}:\n\n${message}`
        : `WorkflowGuard Support Request:\n\n${message}`;

      const messageResponse = await this.twilioClient.messages.create({
        body: formattedMessage,
        from: this.fromNumber,
        to: toNumber,
      });

      this.logger.log(
        `WhatsApp message sent successfully. SID: ${messageResponse.sid}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: string[],
  ): Promise<boolean> {
    if (!this.twilioClient) {
      this.logger.error('Twilio client not initialized');
      return false;
    }

    try {
      const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      // Use pre-approved template for business-initiated messages
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

      this.logger.log(
        `WhatsApp template message sent successfully. SID: ${messageResponse.sid}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp template message:', error);
      return false;
    }
  }

  async sendWelcomeMessage(to: string, userName?: string): Promise<boolean> {
    const welcomeMessage = userName
      ? `Hi ${userName}! 👋 Welcome to WorkflowGuard support. How can we help you today?`
      : `Hi! 👋 Welcome to WorkflowGuard support. How can we help you today?`;

    return this.sendSupportMessage(to, welcomeMessage);
  }

  async sendAutoReplyMessage(to: string, issueType: string): Promise<boolean> {
    const autoReplyMessages: { [key: string]: string } = {
      rollback:
        'We received your rollback issue. Our team is investigating and will get back to you within 2 hours.',
      sync: "We received your sync issue. Please try refreshing your workflows. If the issue persists, we'll help you resolve it.",
      auth: "We received your authentication issue. Please try logging out and back in. If that doesn't work, we'll assist you further.",
      data: 'We received your data issue. Our team is checking the data integrity and will update you shortly.',
      performance:
        "We received your performance issue. We're optimizing the system and will notify you once resolved.",
      default:
        'We received your support request and will get back to you as soon as possible.',
    };

    const message = autoReplyMessages[issueType] || autoReplyMessages.default;
    return this.sendSupportMessage(to, message);
  }

  isConfigured(): boolean {
    return !!this.twilioClient;
  }

  getSandboxNumber(): string {
    return '+14155238886';
  }

  getSandboxInstructions(): string {
    return 'To connect to our WhatsApp support, send "join grown-settlers" to +1 415 523 8886 first, then you can chat with us!';
  }
}
