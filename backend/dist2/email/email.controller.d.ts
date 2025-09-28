import { EmailService } from '../services/email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmail(req: any, emailData: any): Promise<{
        message: string;
    }>;
}
