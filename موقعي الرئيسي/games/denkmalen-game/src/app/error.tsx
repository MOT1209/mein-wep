'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // No error-reporting service is wired up (Sentry was never installed),
    // so surface the error to the console for debugging.
    console.error('[Denkmalen] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md mx-4">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Don&apos;t worry, our team has been notified and we&apos;re looking into it.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
            <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 dark:text-red-300 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          Try Again
        </button>
        
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
