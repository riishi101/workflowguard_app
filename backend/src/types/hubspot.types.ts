export interface HubSpotWorkflow {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  type?: string;
  status?: string;
  actionType?: string;
  workflowId?: string;
  objectId?: string;
  workflowName?: string;
  label?: string;
  meta?: {
    description?: string;
    status?: string;
    actionType?: string;
    type?: string;
  };
}

export interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface HubSpotApiResponse {
  results?: HubSpotWorkflow[];
  workflows?: HubSpotWorkflow[];
  data?: HubSpotWorkflow[];
  objects?: HubSpotWorkflow[];
  value?: HubSpotWorkflow[];
  items?: HubSpotWorkflow[];
  workflowList?: HubSpotWorkflow[];
}

export interface WorkflowResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  hubspotData: HubSpotWorkflow;
}
