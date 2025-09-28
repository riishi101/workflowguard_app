"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowVersionModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_version_service_1 = require("./workflow-version.service");
const workflow_version_controller_1 = require("./workflow-version.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const user_module_1 = require("../user/user.module");
let WorkflowVersionModule = class WorkflowVersionModule {
};
exports.WorkflowVersionModule = WorkflowVersionModule;
exports.WorkflowVersionModule = WorkflowVersionModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, user_module_1.UserModule],
        controllers: [workflow_version_controller_1.WorkflowVersionController],
        providers: [workflow_version_service_1.WorkflowVersionService],
        exports: [workflow_version_service_1.WorkflowVersionService],
    })
], WorkflowVersionModule);
//# sourceMappingURL=workflow-version.module.js.map