import * as Sentry from '@sentry/node';

export function initializeSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app: undefined }),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: process.env.APP_VERSION || '1.0.0',
    // Error filtering
    beforeSend(event) {
      // Filter out non-critical errors in production
      if (process.env.NODE_ENV === 'production') {
        // Don't send 404 errors
        if (event.exception?.values?.[0]?.type === 'NotFoundException') {
          return null;
        }
        // Don't send validation errors
        if (event.exception?.values?.[0]?.type === 'ValidationError') {
          return null;
        }
      }
      return event;
    },
    // Additional context
    initialScope: {
      tags: {
        component: 'backend',
        service: 'workflowguard-api'
      }
    }
  });
}

export { Sentry };
