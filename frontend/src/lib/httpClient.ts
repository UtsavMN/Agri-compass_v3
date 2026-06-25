import { useState, useEffect } from 'react';

// In dev, use relative URLs so Vite's /api proxy forwards to the backend (port 8080).
// Set VITE_API_URL when deploying (e.g. production API host).
const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? '' : 'http://localhost:8080');

/**
 * Get the Clerk session token from the active session.
 * Uses the global Clerk instance injected by ClerkProvider.
 */
async function getClerkToken(): Promise<string | null> {
  try {
    // Access the global Clerk instance
    const clerk = (window as any).__clerk_frontend_api
      ? (window as any).Clerk
      : (window as any).Clerk;

    if (clerk?.session) {
      const token = await clerk.session.getToken();
      return token;
    }
    return null;
  } catch (e) {
    console.warn('Could not get Clerk token:', e);
    return null;
  }
}

async function getAuthHeaders(isFormData = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Get Clerk JWT token for authenticated requests
  const token = await getClerkToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function apiGet<T = any>(endpoint: string, token?: string | null): Promise<T> {
  const headers = await getAuthHeaders();
  // Allow manually passed token to override
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => response.statusText);
    throw new Error(errorBody || `API GET request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function apiPost<T = any>(endpoint: string, body: any, token?: string | null): Promise<T> {
  const headers = await getAuthHeaders();
  // Allow manually passed token to override
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => response.statusText);
    const error = new Error(errorBody || `API POST request failed: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
}

export async function apiPut<T = any>(endpoint: string, body: any, token?: string | null): Promise<T> {
  const headers = await getAuthHeaders();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => response.statusText);
    throw new Error(errorBody || `API PUT request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => response.statusText);
    throw new Error(errorBody || `API DELETE request failed: ${response.statusText}`);
  }
  // Some DELETE responses may not have a body
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export async function apiUpload<T = any>(endpoint: string, formData: FormData): Promise<T> {
  const headers = await getAuthHeaders(true);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => response.statusText);
    throw new Error(errorBody || `API UPLOAD request failed: ${response.statusText}`);
  }
  return response.json();
}

export function useApiGet<T = any>(endpoint: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!endpoint) {
      setData(null);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setError(null);

    getAuthHeaders()
      .then((headers) => {
        return fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers,
          signal,
        });
      })
      .then(async (response) => {
        if (!response.ok) {
          const errorBody = await response.text().catch(() => response.statusText);
          throw new Error(errorBody || `API GET request failed: ${response.statusText}`);
        }
        return response.json();
      })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [endpoint]);

  return { data, loading, error };
}
