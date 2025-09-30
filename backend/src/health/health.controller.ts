import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('detailed')
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }

  @Get('ready')
  async getReadiness() {
    return this.healthService.getReadinessStatus();
  }

  @Get('live')
  async getLiveness() {
    return this.healthService.getLivenessStatus();
  }
}
