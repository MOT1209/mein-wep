---
name: error-tracking
description: Implement error tracking and monitoring — Sentry, console logging, error boundaries
triggers:
  - error tracking
  - error monitoring
  - Sentry
  - error boundaries
  - console errors
  - crash reporting
---

# Error Tracking Skill

## Overview
Implement comprehensive error tracking for Rashid's portfolio to monitor and fix issues in production.

## Error Types

### 1. JavaScript Errors
```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Uncaught Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  // Send to monitoring service
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise:', event.reason);
});
```

### 2. API Errors
```javascript
// API call error handling
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Call Failed:', {
      url,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### 3. Resource Loading Errors
```html
<img src="image.webp" alt="Description" 
     onerror="this.style.display='none'; console.error('Image failed:', this.src)">
<script src="script.js" 
        onerror="console.error('Script failed:', this.src)"></script>
```

## Error Boundaries (React/Vue)
```javascript
// React Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Monitoring Services

### Sentry Setup
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_DSN",
  environment: "production",
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Custom Error Reporting
```javascript
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  track(error, context = {}) {
    const errorData = {
      id: Date.now(),
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errors.push(errorData);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Send to server
    this.sendToServer(errorData);
  }

  async sendToServer(errorData) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (e) {
      // Silently fail - don't create error loops
    }
  }
}

export const errorTracker = new ErrorTracker();
```

## Console Logging Levels
```javascript
console.error('Critical error');    // Always shown
console.warn('Warning');           // Shown in development
console.info('Info');              // Shown in development
console.debug('Debug');            // Shown in development only
console.log('Log');                // Shown in development
```

## Rules
- Never expose sensitive data in errors (API keys, passwords)
- Always sanitize error messages before sending to server
- Use try-catch for all async operations
- Log errors with context (user action, page state)
- Set up error alerts (email/Slack notification)
- Monitor error rates (alerts if > 1% of sessions)
- Keep error IDs for correlation
- Rotate error logs (max 30 days)
