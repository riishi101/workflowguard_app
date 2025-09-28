"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SupportController = (() => {
    let _classDecorators = [(0, common_1.Controller)('support')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _diagnoseIssue_decorators;
    let _fixRollbackIssue_decorators;
    let _fixSyncIssue_decorators;
    let _fixAuthIssue_decorators;
    let _fixDataIssue_decorators;
    let _optimizePerformance_decorators;
    let _sendWhatsAppSupport_decorators;
    var SupportController = _classThis = class {
        constructor(supportService) {
            this.supportService = (__runInitializers(this, _instanceExtraInitializers), supportService);
        }
        async diagnoseIssue(body, req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (!body.description) {
                throw new common_1.HttpException('Issue description is required', common_1.HttpStatus.BAD_REQUEST);
            }
            try {
                const diagnosis = await this.supportService.diagnoseIssue(body.description, userId);
                return diagnosis;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to diagnose issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async fixRollbackIssue(req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            try {
                const result = await this.supportService.fixRollbackIssue(userId);
                return result;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to fix rollback issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async fixSyncIssue(req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            try {
                const result = await this.supportService.fixSyncIssue(userId);
                return result;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to fix sync issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async fixAuthIssue(req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            try {
                const result = await this.supportService.fixAuthIssue(userId);
                return result;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to fix auth issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async fixDataIssue(req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            try {
                const result = await this.supportService.fixDataIssue(userId);
                return result;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to fix data issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async optimizePerformance(req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            try {
                const result = await this.supportService.optimizePerformance(userId);
                return result;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to optimize performance: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async sendWhatsAppSupport(body, req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (!body.message) {
                throw new common_1.HttpException('Message is required', common_1.HttpStatus.BAD_REQUEST);
            }
            try {
                const result = await this.supportService.sendWhatsAppSupportRequest(userId, body.message, body.phoneNumber);
                return result;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to send WhatsApp support request: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    };
    __setFunctionName(_classThis, "SupportController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _diagnoseIssue_decorators = [(0, common_1.Post)('diagnose'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _fixRollbackIssue_decorators = [(0, common_1.Post)('fix-rollback'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _fixSyncIssue_decorators = [(0, common_1.Post)('fix-sync'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _fixAuthIssue_decorators = [(0, common_1.Post)('fix-auth'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _fixDataIssue_decorators = [(0, common_1.Post)('fix-data'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _optimizePerformance_decorators = [(0, common_1.Post)('optimize-performance'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _sendWhatsAppSupport_decorators = [(0, common_1.Post)('whatsapp'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        __esDecorate(_classThis, null, _diagnoseIssue_decorators, { kind: "method", name: "diagnoseIssue", static: false, private: false, access: { has: obj => "diagnoseIssue" in obj, get: obj => obj.diagnoseIssue }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _fixRollbackIssue_decorators, { kind: "method", name: "fixRollbackIssue", static: false, private: false, access: { has: obj => "fixRollbackIssue" in obj, get: obj => obj.fixRollbackIssue }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _fixSyncIssue_decorators, { kind: "method", name: "fixSyncIssue", static: false, private: false, access: { has: obj => "fixSyncIssue" in obj, get: obj => obj.fixSyncIssue }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _fixAuthIssue_decorators, { kind: "method", name: "fixAuthIssue", static: false, private: false, access: { has: obj => "fixAuthIssue" in obj, get: obj => obj.fixAuthIssue }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _fixDataIssue_decorators, { kind: "method", name: "fixDataIssue", static: false, private: false, access: { has: obj => "fixDataIssue" in obj, get: obj => obj.fixDataIssue }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _optimizePerformance_decorators, { kind: "method", name: "optimizePerformance", static: false, private: false, access: { has: obj => "optimizePerformance" in obj, get: obj => obj.optimizePerformance }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendWhatsAppSupport_decorators, { kind: "method", name: "sendWhatsAppSupport", static: false, private: false, access: { has: obj => "sendWhatsAppSupport" in obj, get: obj => obj.sendWhatsAppSupport }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SupportController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SupportController = _classThis;
})();
exports.SupportController = SupportController;
