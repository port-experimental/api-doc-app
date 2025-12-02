'use client';

/**
 * Loading State Component
 * Displays loading spinner and error states
 */

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading API documentation...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-slate-700 rounded-full" />
        {/* Spinning ring */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" />
      </div>
      <p className="mt-6 text-slate-400 text-sm font-medium">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Error loading documentation',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'No APIs found',
  message = 'No API endpoints match your current filters.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md">{message}</p>
    </div>
  );
}

