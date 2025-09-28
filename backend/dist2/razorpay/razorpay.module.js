"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const razorpay_service_1 = require("./razorpay.service");
const razorpay_controller_1 = require("./razorpay.controller");
const subscription_module_1 = require("../subscription/subscription.module");
let RazorpayModule = class RazorpayModule {
};
exports.RazorpayModule = RazorpayModule;
exports.RazorpayModule = RazorpayModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, (0, common_1.forwardRef)(() => subscription_module_1.SubscriptionModule)],
        providers: [razorpay_service_1.RazorpayService],
        controllers: [razorpay_controller_1.RazorpayController],
        exports: [razorpay_service_1.RazorpayService],
    })
], RazorpayModule);
//# sourceMappingURL=razorpay.module.js.map