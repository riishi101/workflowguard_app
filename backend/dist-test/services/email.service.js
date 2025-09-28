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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
let EmailService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EmailService = _classThis = class {
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
    __setFunctionName(_classThis, "EmailService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EmailService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EmailService = _classThis;
})();
exports.EmailService = EmailService;
