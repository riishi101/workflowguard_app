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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNotificationSettingsDto = exports.UpdateUserDto = void 0;
const class_validator_1 = require("class-validator");
let UpdateUserDto = (() => {
    var _a;
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _jobTitle_decorators;
    let _jobTitle_initializers = [];
    let _jobTitle_extraInitializers = [];
    let _timezone_decorators;
    let _timezone_initializers = [];
    let _timezone_extraInitializers = [];
    let _language_decorators;
    let _language_initializers = [];
    let _language_extraInitializers = [];
    return _a = class UpdateUserDto {
            constructor() {
                this.email = __runInitializers(this, _email_initializers, void 0);
                this.name = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.jobTitle = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _jobTitle_initializers, void 0));
                this.timezone = (__runInitializers(this, _jobTitle_extraInitializers), __runInitializers(this, _timezone_initializers, void 0));
                this.language = (__runInitializers(this, _timezone_extraInitializers), __runInitializers(this, _language_initializers, void 0));
                __runInitializers(this, _language_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, class_validator_1.IsEmail)(), (0, class_validator_1.IsOptional)()];
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _jobTitle_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _timezone_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _language_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _jobTitle_decorators, { kind: "field", name: "jobTitle", static: false, private: false, access: { has: obj => "jobTitle" in obj, get: obj => obj.jobTitle, set: (obj, value) => { obj.jobTitle = value; } }, metadata: _metadata }, _jobTitle_initializers, _jobTitle_extraInitializers);
            __esDecorate(null, null, _timezone_decorators, { kind: "field", name: "timezone", static: false, private: false, access: { has: obj => "timezone" in obj, get: obj => obj.timezone, set: (obj, value) => { obj.timezone = value; } }, metadata: _metadata }, _timezone_initializers, _timezone_extraInitializers);
            __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: obj => "language" in obj, get: obj => obj.language, set: (obj, value) => { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpdateUserDto = UpdateUserDto;
let UpdateNotificationSettingsDto = (() => {
    var _a;
    let _notificationsEnabled_decorators;
    let _notificationsEnabled_initializers = [];
    let _notificationsEnabled_extraInitializers = [];
    let _notificationEmail_decorators;
    let _notificationEmail_initializers = [];
    let _notificationEmail_extraInitializers = [];
    let _workflowDeleted_decorators;
    let _workflowDeleted_initializers = [];
    let _workflowDeleted_extraInitializers = [];
    let _enrollmentTriggerModified_decorators;
    let _enrollmentTriggerModified_initializers = [];
    let _enrollmentTriggerModified_extraInitializers = [];
    let _workflowRolledBack_decorators;
    let _workflowRolledBack_initializers = [];
    let _workflowRolledBack_extraInitializers = [];
    let _criticalActionModified_decorators;
    let _criticalActionModified_initializers = [];
    let _criticalActionModified_extraInitializers = [];
    return _a = class UpdateNotificationSettingsDto {
            constructor() {
                this.notificationsEnabled = __runInitializers(this, _notificationsEnabled_initializers, void 0);
                this.notificationEmail = (__runInitializers(this, _notificationsEnabled_extraInitializers), __runInitializers(this, _notificationEmail_initializers, void 0));
                this.workflowDeleted = (__runInitializers(this, _notificationEmail_extraInitializers), __runInitializers(this, _workflowDeleted_initializers, void 0));
                this.enrollmentTriggerModified = (__runInitializers(this, _workflowDeleted_extraInitializers), __runInitializers(this, _enrollmentTriggerModified_initializers, void 0));
                this.workflowRolledBack = (__runInitializers(this, _enrollmentTriggerModified_extraInitializers), __runInitializers(this, _workflowRolledBack_initializers, void 0));
                this.criticalActionModified = (__runInitializers(this, _workflowRolledBack_extraInitializers), __runInitializers(this, _criticalActionModified_initializers, void 0));
                __runInitializers(this, _criticalActionModified_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _notificationsEnabled_decorators = [(0, class_validator_1.IsBoolean)()];
            _notificationEmail_decorators = [(0, class_validator_1.IsEmail)()];
            _workflowDeleted_decorators = [(0, class_validator_1.IsBoolean)()];
            _enrollmentTriggerModified_decorators = [(0, class_validator_1.IsBoolean)()];
            _workflowRolledBack_decorators = [(0, class_validator_1.IsBoolean)()];
            _criticalActionModified_decorators = [(0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _notificationsEnabled_decorators, { kind: "field", name: "notificationsEnabled", static: false, private: false, access: { has: obj => "notificationsEnabled" in obj, get: obj => obj.notificationsEnabled, set: (obj, value) => { obj.notificationsEnabled = value; } }, metadata: _metadata }, _notificationsEnabled_initializers, _notificationsEnabled_extraInitializers);
            __esDecorate(null, null, _notificationEmail_decorators, { kind: "field", name: "notificationEmail", static: false, private: false, access: { has: obj => "notificationEmail" in obj, get: obj => obj.notificationEmail, set: (obj, value) => { obj.notificationEmail = value; } }, metadata: _metadata }, _notificationEmail_initializers, _notificationEmail_extraInitializers);
            __esDecorate(null, null, _workflowDeleted_decorators, { kind: "field", name: "workflowDeleted", static: false, private: false, access: { has: obj => "workflowDeleted" in obj, get: obj => obj.workflowDeleted, set: (obj, value) => { obj.workflowDeleted = value; } }, metadata: _metadata }, _workflowDeleted_initializers, _workflowDeleted_extraInitializers);
            __esDecorate(null, null, _enrollmentTriggerModified_decorators, { kind: "field", name: "enrollmentTriggerModified", static: false, private: false, access: { has: obj => "enrollmentTriggerModified" in obj, get: obj => obj.enrollmentTriggerModified, set: (obj, value) => { obj.enrollmentTriggerModified = value; } }, metadata: _metadata }, _enrollmentTriggerModified_initializers, _enrollmentTriggerModified_extraInitializers);
            __esDecorate(null, null, _workflowRolledBack_decorators, { kind: "field", name: "workflowRolledBack", static: false, private: false, access: { has: obj => "workflowRolledBack" in obj, get: obj => obj.workflowRolledBack, set: (obj, value) => { obj.workflowRolledBack = value; } }, metadata: _metadata }, _workflowRolledBack_initializers, _workflowRolledBack_extraInitializers);
            __esDecorate(null, null, _criticalActionModified_decorators, { kind: "field", name: "criticalActionModified", static: false, private: false, access: { has: obj => "criticalActionModified" in obj, get: obj => obj.criticalActionModified, set: (obj, value) => { obj.criticalActionModified = value; } }, metadata: _metadata }, _criticalActionModified_initializers, _criticalActionModified_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpdateNotificationSettingsDto = UpdateNotificationSettingsDto;
