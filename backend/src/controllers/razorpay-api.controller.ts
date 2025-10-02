import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RazorpayService } from '../razorpay/razorpay.service';

@Controller('razorpay-api')
export class RazorpayApiController {
  private readonly logger = new Logger(RazorpayApiController.name);

  constructor(
    private configService: ConfigService,
    private razorpayService: RazorpayService,
  ) {}

  @Get('config')
  async getRazorpayConfig() {
    this.logger.log('RazorpayApiController: getRazorpayConfig method called');
    return {
      message: 'Razorpay API configuration endpoint working',
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
      availableCurrencies: this.razorpayService.getAvailableCurrencies(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('settings')
  async getApiSettings() {
    this.logger.log('RazorpayApiController: getApiSettings method called');
    return {
      message: 'API settings endpoint working',
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
      availableCurrencies: ['INR', 'USD', 'GBP', 'EUR', 'CAD'],
      planIds: {
        starter: {
          INR: 'plan_R6RI02CsUCUlDz',
          USD: 'plan_RBDqWapKHZfPU7',
          GBP: 'plan_RBFxk81S3ySXxj',
          EUR: 'plan_RBFjbYhAtD3snL',
          CAD: 'plan_RBFrtufmxmxwi8',
        },
        professional: {
          INR: 'plan_R6RKEg5mqJK6Ky',
          USD: 'plan_RBDrKWI81HS1FZ',
          GBP: 'plan_RBFy8LsuW36jIj',
          EUR: 'plan_RBFjqo5wE0d4jz',
          CAD: 'plan_RBFsD6U2rQb4B6',
        },
        enterprise: {
          INR: 'plan_R6RKnjqXu0BZsH',
          USD: 'plan_RBDrX9dGapWrTe',
          GBP: 'plan_RBFyJlB5jxwxB9',
          EUR: 'plan_RBFovOUIUXISBE',
          CAD: 'plan_RBFscXaosRIzEc',
        },
      },
    };
  }
}