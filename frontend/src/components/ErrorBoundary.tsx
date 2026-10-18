import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  variant?: 'full' | 'inline';
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
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('Failed to load module script') ||
      error.message?.includes('error loading dynamically imported module') ||
      error.message?.includes('Importing a module script failed') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('application/octet-stream');

    if (isChunkError) {
      const lastReload = typeof window !== 'undefined' ? sessionStorage.getItem('last_chunk_reload') : null;
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('last_chunk_reload', String(now));
          window.location.reload();
        }
        return;
      }
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkLoad =
        this.state.error?.name === 'ChunkLoadError' ||
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('dynamically imported module') ||
        this.state.error?.message?.includes('Failed to load module script') ||
        this.state.error?.message?.includes('error loading dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed') ||
        this.state.error?.message?.includes('Failed to fetch') ||
        this.state.error?.message?.includes('application/octet-stream');

      if (isChunkLoad) {
        return (
          <div className="min-h-[300px] flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#C9A84C] text-xs font-semibold tracking-wider uppercase">Loading latest version...</p>
            </div>
          </div>
        );
      }

      const isInline = this.props.variant === 'inline';

      return (
        <div
          className={
            isInline
              ? "w-full py-16 px-4 flex items-center justify-center"
              : "min-h-screen flex items-center justify-center bg-earth-main p-4"
          }
          style={{ background: isInline ? 'transparent' : 'var(--bg-main)' }}
        >
          <div
            className="max-w-md w-full bg-earth-card rounded-2xl shadow-premium p-8 text-center border border-earth-border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="mb-6">
              <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-gold-100 tracking-tight mb-2">
                {isInline ? "Feature Temporarily Unavailable" : "Something went wrong"}
              </h2>
              <p className="text-gold-100/40 text-sm font-medium italic mb-6">
                {isInline
                  ? "An unexpected issue occurred while rendering this section. You can try reloading it."
                  : "An unexpected error occurred. Please try again."}
              </p>
            </div>

            <div className="space-y-4">
              <Button onClick={this.handleRetry} className="btn-gold w-full h-12 shadow-gold-glow">
                <RefreshCw className="h-4 w-4 mr-3" />
                Try again
              </Button>

              <Button
                variant="ghost"
                onClick={() => (window.location.href = '/dashboard')}
                className="w-full text-gold-100/40 hover:text-gold-100"
              >
                Go to Dashboard
              </Button>
            </div>

            {this.state.error && (
              <details className="mt-8 text-left border-t border-earth-border pt-4">
                <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-gold-100/30 hover:text-gold-400 transition-colors flex items-center justify-between">
                  <span>Diagnostic Details</span>
                  <ChevronDown className="h-3 w-3" />
                </summary>
                <pre className="mt-3 text-[10px] bg-earth-main p-3 rounded-xl overflow-auto max-h-40 text-red-400/80 border border-red-500/10 font-mono">
                  {this.state.error.message || this.state.error.toString()}
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
  };
}

/**
 * Network Error Handler Component
 */
export function NetworkErrorHandler({
  error,
  onRetry,
  children,
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
            <h3 className="text-sm font-medium text-red-800">Network Error</h3>
            <p className="text-sm text-red-700 mt-1">
              {error.message || 'Unable to connect. Please check your internet connection.'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={onRetry} className="ml-3">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
