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
exports.CreateWorkflowVersionDto = void 0;
const class_validator_1 = require("class-validator");
let CreateWorkflowVersionDto = (() => {
    var _a;
    let _workflowId_decorators;
    let _workflowId_initializers = [];
    let _workflowId_extraInitializers = [];
    let _versionNumber_decorators;
    let _versionNumber_initializers = [];
    let _versionNumber_extraInitializers = [];
    let _snapshotType_decorators;
    let _snapshotType_initializers = [];
    let _snapshotType_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _data_decorators;
    let _data_initializers = [];
    let _data_extraInitializers = [];
    return _a = class CreateWorkflowVersionDto {
            constructor() {
                this.workflowId = __runInitializers(this, _workflowId_initializers, void 0);
                this.versionNumber = (__runInitializers(this, _workflowId_extraInitializers), __runInitializers(this, _versionNumber_initializers, void 0));
                this.snapshotType = (__runInitializers(this, _versionNumber_extraInitializers), __runInitializers(this, _snapshotType_initializers, void 0)); // 'manual', 'on-publish', 'daily-backup'
                this.createdBy = (__runInitializers(this, _snapshotType_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0)); // User ID or 'system'
                this.data = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _data_initializers, void 0)); // Raw workflow JSON from HubSpot
                __runInitializers(this, _data_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _workflowId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _versionNumber_decorators = [(0, class_validator_1.IsNumber)()];
            _snapshotType_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _createdBy_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _data_decorators = [(0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _workflowId_decorators, { kind: "field", name: "workflowId", static: false, private: false, access: { has: obj => "workflowId" in obj, get: obj => obj.workflowId, set: (obj, value) => { obj.workflowId = value; } }, metadata: _metadata }, _workflowId_initializers, _workflowId_extraInitializers);
            __esDecorate(null, null, _versionNumber_decorators, { kind: "field", name: "versionNumber", static: false, private: false, access: { has: obj => "versionNumber" in obj, get: obj => obj.versionNumber, set: (obj, value) => { obj.versionNumber = value; } }, metadata: _metadata }, _versionNumber_initializers, _versionNumber_extraInitializers);
            __esDecorate(null, null, _snapshotType_decorators, { kind: "field", name: "snapshotType", static: false, private: false, access: { has: obj => "snapshotType" in obj, get: obj => obj.snapshotType, set: (obj, value) => { obj.snapshotType = value; } }, metadata: _metadata }, _snapshotType_initializers, _snapshotType_extraInitializers);
            __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
            __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: obj => "data" in obj, get: obj => obj.data, set: (obj, value) => { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateWorkflowVersionDto = CreateWorkflowVersionDto;
