"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsoConfigController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SsoConfigController = class SsoConfigController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfig() {
        const config = await this.prisma.ssoConfig.findFirst();
        if (!config)
            throw new common_1.HttpException('SSO config not found', common_1.HttpStatus.NOT_FOUND);
        return config;
    }
    async updateConfig(dto) {
        let config = await this.prisma.ssoConfig.findFirst();
        if (!config) {
            config = await this.prisma.ssoConfig.create({ data: dto });
        }
        else {
            config = await this.prisma.ssoConfig.update({
                where: { id: config.id },
                data: dto,
            });
        }
        return config;
    }
};
exports.SsoConfigController = SsoConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SsoConfigController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SsoConfigController.prototype, "updateConfig", null);
exports.SsoConfigController = SsoConfigController = __decorate([
    (0, common_1.Controller)('sso-config'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SsoConfigController);
//# sourceMappingURL=sso-config.controller.js.map