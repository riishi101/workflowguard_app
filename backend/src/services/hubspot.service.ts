import { Injectable } from '@nestjs/common';

@Injectable()
export class HubSpotService {
  async getWorkflows(accessToken: string): Promise<any[]> {
    return [];
  }

  async getWorkflowDetails(workflowId: string, accessToken: string): Promise<any> {
    return null;
  }

  async validateToken(accessToken: string): Promise<boolean> {
    return true;
  }
} 