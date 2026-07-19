// This file configures the initialization of the Sentry client-side SDK
// The SDK is initialized with this file
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while setting up Sentry
  debug: false,
  
  // replaysSessionSampleRate and replaysOnErrorSampleRate
  // ensure that session replays are captured on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // If you are using the browser tracing integration, set this to true
  enabled: process.env.NODE_ENV === 'production',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local',
  
  // beforeSend: Add custom error filtering if needed
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filter out common non-error events
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception) {
        // Filter out ResizeObserver loop errors (common and harmless)
        if (exception.value?.message?.includes('ResizeObserver loop')) {
          return null;
        }
        
        // Filter out non-essential errors
        if (exception.type === 'ChunkLoadError' || 
            exception.value?.message?.includes('Loading chunk')) {
          return null;
        }
      }
    }
    
    return event;
  },
});
