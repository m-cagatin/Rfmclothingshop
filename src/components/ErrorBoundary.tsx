import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
  showHomeButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Wraps components to prevent entire app crashes
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Could send error to logging service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }

    // Try to recover by reloading
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  override render() {
    if (this.state.hasError) {
      const { fallbackMessage, showHomeButton = true } = this.props;
      const { error, errorInfo } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <AlertTriangle className="w-8 h-8" />
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                {fallbackMessage || "We're sorry, but an unexpected error occurred. Your work may have been saved automatically."}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-800 mb-2">Error Details:</p>
                  <p className="text-sm text-red-700 font-mono break-all">
                    {error.toString()}
                  </p>
                </div>
              )}

              {errorInfo && import.meta.env.DEV && (
                <details className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-64 mt-2">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>What happened?</strong> A component encountered an error and couldn't continue.
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  <strong>What can you do?</strong> Try reloading the page. If the problem persists, your design may have been auto-saved and you can try again later.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3 justify-end">
              {showHomeButton && (
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Home
                </Button>
              )}
              
              <Button
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
