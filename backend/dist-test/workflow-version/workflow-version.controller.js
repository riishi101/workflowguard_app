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
exports.WorkflowVersionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WorkflowVersionController = (() => {
    let _classDecorators = [(0, common_1.Controller)('workflow-version')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _remove_decorators;
    let _getWorkflowHistoryByHubspotId_decorators;
    let _getWorkflowHistory_decorators;
    var WorkflowVersionController = _classThis = class {
        constructor(workflowVersionService) {
            this.workflowVersionService = (__runInitializers(this, _instanceExtraInitializers), workflowVersionService);
        }
        create(createWorkflowVersionDto) {
            return this.workflowVersionService.create(createWorkflowVersionDto);
        }
        findAll() {
            return this.workflowVersionService.findAll();
        }
        findOne(id) {
            return this.workflowVersionService.findOne(id);
        }
        update(id, updateWorkflowVersionDto) {
            return this.workflowVersionService.update(id, updateWorkflowVersionDto);
        }
        remove(id) {
            return this.workflowVersionService.remove(id);
        }
        async getWorkflowHistoryByHubspotId(hubspotId, req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            try {
                const history = await this.workflowVersionService.findByHubspotIdWithHistory(hubspotId, userId);
                return {
                    success: true,
                    data: history,
                    message: 'Workflow history retrieved successfully',
                };
            }
            catch (error) {
                console.error('Failed to get workflow history by HubSpot ID:', error);
                throw new common_1.HttpException('Workflow history not found or access denied', common_1.HttpStatus.NOT_FOUND);
            }
        }
        async getWorkflowHistory(workflowId, req) {
            let userId = req.user?.sub || req.user?.id || req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            try {
                const history = await this.workflowVersionService.findByWorkflowIdWithHistoryLimit(workflowId, userId);
                return history;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to get workflow history: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    };
    __setFunctionName(_classThis, "WorkflowVersionController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)()];
        _findAll_decorators = [(0, common_1.Get)()];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _update_decorators = [(0, common_1.Patch)(':id')];
        _remove_decorators = [(0, common_1.Delete)(':id')];
        _getWorkflowHistoryByHubspotId_decorators = [(0, common_1.Get)('by-hubspot-id/:hubspotId/history'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getWorkflowHistory_decorators = [(0, common_1.Get)(':workflowId/history'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWorkflowHistoryByHubspotId_decorators, { kind: "method", name: "getWorkflowHistoryByHubspotId", static: false, private: false, access: { has: obj => "getWorkflowHistoryByHubspotId" in obj, get: obj => obj.getWorkflowHistoryByHubspotId }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWorkflowHistory_decorators, { kind: "method", name: "getWorkflowHistory", static: false, private: false, access: { has: obj => "getWorkflowHistory" in obj, get: obj => obj.getWorkflowHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WorkflowVersionController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WorkflowVersionController = _classThis;
})();
exports.WorkflowVersionController = WorkflowVersionController;
