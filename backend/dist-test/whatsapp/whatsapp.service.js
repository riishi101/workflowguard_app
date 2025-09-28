"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const twilio_1 = __importDefault(require("twilio"));
let WhatsAppService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WhatsAppService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new common_1.Logger(WhatsAppService.name);
            const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
            const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
            this.fromNumber = 'whatsapp:+14155238886'; // Twilio Sandbox WhatsApp number
            // Validate Twilio credentials format and presence
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
    __setFunctionName(_classThis, "WhatsAppService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsAppService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsAppService = _classThis;
})();
exports.WhatsAppService = WhatsAppService;
