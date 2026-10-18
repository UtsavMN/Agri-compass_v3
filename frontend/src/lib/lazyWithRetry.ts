import React from 'react';

/**
 * Enhanced React.lazy with automatic chunk-load retry and transparent page recovery.
 * Prevents the jarring "Something went wrong" error boundary crash when a new deployment
 * updates chunk hashes while the user has an existing tab open.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  name?: string
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const componentKey = `agri_chunk_${name || 'route'}_last_reload`;
    try {
      return await componentImport();
    } catch (error: any) {
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Failed to load module script') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('error loading dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('application/octet-stream');

      if (isChunkError && typeof window !== 'undefined') {
        const lastReload = window.sessionStorage.getItem(componentKey);
        const now = Date.now();
        // If not reloaded within the last 10 seconds, reload to fetch latest deployment bundle
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          window.sessionStorage.setItem(componentKey, String(now));
          window.location.reload();
          // Return a pending promise so React Suspense displays the clean loading spinner
          // instead of bubbling an unhandled error to the ErrorBoundary
          return new Promise<{ default: T }>(() => {});
        }
      }

      // Quick retry before throwing
      try {
        await new Promise((res) => setTimeout(res, 500));
        return await componentImport();
      } catch (finalError) {
        throw finalError;
      }
    }
  });
}
