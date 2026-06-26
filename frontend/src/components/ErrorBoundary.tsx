import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Auto-reload on chunk load error (common after new deployments)
    if (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('dynamically imported module') ||
      error.message.includes('Failed to load module script') ||
      error.message.includes('application/octet-stream')
    ) {
      // Force a hard reload from server
      window.location.reload();
      return;
    }

    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-main p-4" style={{ background: 'var(--bg-main)' }}>
        <div className="max-w-md w-full bg-earth-card rounded-2xl shadow-premium p-8 text-center border border-earth-border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <div className="mb-6">
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gold-100 tracking-tight mb-2">
              Something went wrong
            </h2>
            <p className="text-gold-100/40 text-sm font-medium italic mb-6">
              An unexpected error occurred. Please try again.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={this.handleRetry} className="btn-gold w-full h-12 shadow-gold-glow">
              <RefreshCw className="h-4 w-4 mr-3" />
              Try again
            </Button>

            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="w-full text-gold-100/40 hover:text-gold-100"
            >
              Go to Dashboard
            </Button>
          </div>

          {(import.meta.env.DEV || process.env.NODE_ENV === 'development') && this.state.error && (
            <details className="mt-8 text-left border-t border-earth-border pt-6">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-gold-100/20 hover:text-gold-400 transition-colors">
                Error Details (Dev)
              </summary>
              <pre className="mt-4 text-[10px] bg-earth-main p-4 rounded-xl overflow-auto max-h-48 text-red-400/80 border border-red-500/10 font-mono">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling async errors in functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Async error caught:', error, errorInfo);

    // Could dispatch to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  };
}

/**
 * Network Error Handler Component
 */
export function NetworkErrorHandler({
  error,
  onRetry,
  children
}: {
  error: Error | null;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Network Error
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error.message || 'Unable to connect. Please check your internet connection.'}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="ml-3"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
