export interface HubSpotWorkflow {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  status?: string;
  workflowId?: string;
  objectId?: string;
  workflowName?: string;
  label?: string;
  meta?: {
    description?: string;
    status?: string;
  };

  // Enhanced metadata for WorkflowGuard
  _metadata?: {
    fetchedAt: string;
    source: string;
    completeData?: boolean;
    apiError?: string;
  };

  // Detailed workflow structure from HubSpot API
  actions?: HubSpotAction[];
  enrollmentTriggers?: HubSpotTrigger[];
  goals?: any[];
  settings?: any;
  triggerSets?: HubSpotTrigger[];
  objectTypeId?: string;
  type?: string;
  listening?: boolean;
  contactListIds?: string[];
  suppressionListIds?: string[];
  allowContactToTriggerMultipleTimes?: boolean;
  onlyExecuteOnBusinessDays?: boolean;
  analysis?: {
    enrolled: number;
    active: number;
    completed: number;
    succeeded: number;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    name?: string;
  };
  lastUpdatedBy?: {
    id: string;
    name?: string;
  };

  // Raw HubSpot data structure
  steps?: any[];
  enrollmentCriteria?: any;
  reenrollmentSettings?: any;
  timeWindows?: any[];
  blockedDates?: any[];
  customProperties?: any;
}

export interface HubSpotAction {
  id?: string;
  actionId?: string;
  type: string;
  actionType?: string;
  stepId?: string;
  delayMillis?: number;
  subject?: string;
  body?: string;
  to?: string;
  from?: string;
  propertyName?: string;
  propertyValue?: any;
  settings?: any;
  filters?: any[];
  conditions?: any[];
  metadata?: any;
}

export interface HubSpotTrigger {
  id?: string;
  type: string;
  eventId?: string;
  filters?: any[];
  settings?: any;
  conditions?: any[];
  metadata?: any;
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
