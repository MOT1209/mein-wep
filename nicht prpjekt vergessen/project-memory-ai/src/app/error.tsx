'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4 p-6 bg-red-950/30 border border-red-900/50 rounded-lg max-w-md">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <h2 className="text-xl font-semibold text-red-200">Something went wrong</h2>
        <p className="text-slate-400 text-center text-sm">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="text-xs text-slate-500">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  )
}
