import React from 'react';

/**
 * Enhanced React.lazy with automatic chunk-load retry and transparent page recovery.
 * Prevents the jarring "Something went wrong" error boundary crash when a new deployment
 * updates chunk hashes while the user has an existing tab open.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const sessionKey = 'agri_chunk_refresh_attempted';
    try {
      const component = await componentImport();
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(sessionKey);
      }
      return component;
    } catch (error: any) {
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Failed to load module script') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('error loading dynamically imported module') ||
        error?.message?.includes('application/octet-stream');

      if (isChunkError && typeof window !== 'undefined') {
        const alreadyTried = window.sessionStorage.getItem(sessionKey);
        if (!alreadyTried) {
          window.sessionStorage.setItem(sessionKey, 'true');
          // Silently reload the page to pull the latest HTML and bundle hashes
          window.location.reload();
          // Return a pending promise so React Suspense continues showing the loading spinner
          // instead of flashing "Something went wrong" before the reload takes effect
          return new Promise<{ default: T }>(() => {});
        }
      }

      // Try one more quick async retry before throwing
      try {
        await new Promise((res) => setTimeout(res, 800));
        const retryComponent = await componentImport();
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(sessionKey);
        }
        return retryComponent;
      } catch (finalError) {
        throw finalError;
      }
    }
  });
}
