import { ConfigService } from '@nestjs/config';

export interface ProductionConfig {
  // Core settings
  port: number;
  nodeEnv: string;
  appVersion: string;
  
  // Database
  databaseUrl: string;
  
  // Security
  jwtSecret: string;
  corsOrigins: string[];
  
  // External services
  hubspot: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  
  razorpay: {
    keyId: string;
    keySecret: string;
  };
  
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  
  // Monitoring
  sentry: {
    dsn: string;
    environment: string;
  };
  
  // Rate limiting
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
    apiMaxRequests: number;
  };
  
  // Logging
  logging: {
    level: string;
    enableFileLogging: boolean;
  };
}

export function createProductionConfig(configService: ConfigService): ProductionConfig {
  return {
    port: parseInt(configService.get('PORT', '4000')),
    nodeEnv: configService.get('NODE_ENV', 'development'),
    appVersion: configService.get('APP_VERSION', '1.0.0'),
    
    databaseUrl: configService.get('DATABASE_URL') || '',
    
    jwtSecret: configService.get('JWT_SECRET') || '',
    corsOrigins: configService.get('CORS_ORIGINS', 'https://www.workflowguard.pro,https://workflowguard.pro').split(','),
    
    hubspot: {
      clientId: configService.get('HUBSPOT_CLIENT_ID') || '',
      clientSecret: configService.get('HUBSPOT_CLIENT_SECRET') || '',
      redirectUri: configService.get('HUBSPOT_REDIRECT_URI') || ''
    },
    
    razorpay: {
      keyId: configService.get('RAZORPAY_KEY_ID') || '',
      keySecret: configService.get('RAZORPAY_KEY_SECRET') || ''
    },
    
    twilio: {
      accountSid: configService.get('TWILIO_ACCOUNT_SID') || '',
      authToken: configService.get('TWILIO_AUTH_TOKEN') || '',
      phoneNumber: configService.get('TWILIO_PHONE_NUMBER') || ''
    },
    
    sentry: {
      dsn: configService.get('SENTRY_DSN') || '',
      environment: configService.get('NODE_ENV', 'development')
    },
    
    rateLimiting: {
      windowMs: parseInt(configService.get('RATE_LIMIT_WINDOW_MS', '900000')), // 15 minutes
      maxRequests: parseInt(configService.get('RATE_LIMIT_MAX_REQUESTS', '100')),
      apiMaxRequests: parseInt(configService.get('API_RATE_LIMIT_MAX_REQUESTS', '30'))
    },
    
    logging: {
      level: configService.get('LOG_LEVEL', 'info'),
      enableFileLogging: configService.get('ENABLE_FILE_LOGGING', 'true') === 'true'
    }
  };
}

// Validation function
export function validateProductionConfig(config: ProductionConfig): void {
  const requiredFields: Array<{ path: string; value: any }> = [
    { path: 'databaseUrl', value: config.databaseUrl },
    { path: 'jwtSecret', value: config.jwtSecret },
    { path: 'hubspot.clientId', value: config.hubspot.clientId },
    { path: 'hubspot.clientSecret', value: config.hubspot.clientSecret },
    { path: 'razorpay.keyId', value: config.razorpay.keyId },
    { path: 'razorpay.keySecret', value: config.razorpay.keySecret }
  ];
  
  const missingFields = requiredFields.filter(field => !field.value).map(field => field.path);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration: ${missingFields.join(', ')}`);
  }
  
  // Validate URLs
  if (config.databaseUrl && !config.databaseUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }
  
  // Validate environment
  if (!['development', 'staging', 'production'].includes(config.nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, staging, production');
  }
}
