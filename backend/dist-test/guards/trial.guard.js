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
exports.TrialGuard = void 0;
const common_1 = require("@nestjs/common");
let TrialGuard = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TrialGuard = _classThis = class {
        constructor(subscriptionService) {
            this.subscriptionService = subscriptionService;
        }
        async canActivate(context) {
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            if (!user) {
                throw new common_1.HttpException('Authentication required', common_1.HttpStatus.UNAUTHORIZED);
            }
            const userId = user.sub || user.id || user.userId;
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            try {
                // Check trial status
                const trialStatus = await this.subscriptionService.getTrialStatus(userId);
                console.log('TrialGuard - Trial status for user', userId, ':', trialStatus);
                // If trial has expired, block access
                if (trialStatus.isTrialExpired) {
                    console.log('TrialGuard - Blocking access for expired trial:', userId);
                    throw new common_1.HttpException('Trial expired. Please upgrade your subscription to continue using WorkflowGuard.', common_1.HttpStatus.FORBIDDEN);
                }
                console.log('TrialGuard - Access granted for user:', userId);
                return true;
            }
            catch (error) {
                if (error instanceof common_1.HttpException) {
                    throw error;
                }
                console.error('TrialGuard - Error checking trial status for user', userId, ':', error);
                // Be more permissive - if we can't check trial status, allow access
                // This prevents blocking users due to temporary service issues
                console.log('TrialGuard - Allowing access due to service error for user:', userId);
                return true;
            }
        }
    };
    __setFunctionName(_classThis, "TrialGuard");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TrialGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TrialGuard = _classThis;
})();
exports.TrialGuard = TrialGuard;
