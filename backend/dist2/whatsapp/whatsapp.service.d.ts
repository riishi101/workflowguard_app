import { ConfigService } from '@nestjs/config';
export declare class WhatsAppService {
    private configService;
    private readonly logger;
    private twilioClient;
    private readonly fromNumber;
    constructor(configService: ConfigService);
    sendSupportMessage(to: string, message: string, userEmail?: string): Promise<boolean>;
    sendTemplateMessage(to: string, templateName: string, variables: string[]): Promise<boolean>;
    sendWelcomeMessage(to: string, userName?: string): Promise<boolean>;
    sendAutoReplyMessage(to: string, issueType: string): Promise<boolean>;
    isConfigured(): boolean;
    getSandboxNumber(): string;
    getSandboxInstructions(): string;
}
