import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

/**
 * Full-screen loading overlay with spinner
 */
export function LoadingOverlay({ message = 'Loading...', className = '' }: LoadingOverlayProps) {
  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4 max-w-sm">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Inline loading spinner
 */
export function InlineLoading({ message, size = 'md', className = '' }: InlineLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {message && <span className="text-gray-600">{message}</span>}
    </div>
  );
}

/**
 * Skeleton loader for canvas initialization
 */
export function CanvasSkeleton() {
  return (
    <div className="w-full h-full bg-gray-100 animate-pulse relative">
      {/* Canvas area skeleton */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gray-200 rounded-lg p-8 space-y-4">
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mt-4" />
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md p-3 flex gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* Side panel skeleton */}
      <div className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        </div>
        <div className="h-40 w-full bg-gray-200 rounded mt-4"></div>
      </div>
    </div>
  );
}

/**
 * Progress bar for uploads or long operations
 */
interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
  className?: string;
}

export function ProgressBar({ progress, message, className = '' }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {message && <p className="text-sm text-gray-600">{message}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">{Math.round(progress)}%</p>
    </div>
  );
}
