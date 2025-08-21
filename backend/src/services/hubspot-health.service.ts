import { Injectable } from '@nestjs/common';

@Injectable()
export class HubSpotHealthService {
  async checkHealth(): Promise<any> {
    return { status: 'healthy' };
  }

  async getMetrics(): Promise<any> {
    return { metrics: {} };
  }
}
