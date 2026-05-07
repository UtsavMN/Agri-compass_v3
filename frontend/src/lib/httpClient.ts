const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function getAuthHeaders(isFormData = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const mockUser = localStorage.getItem('mockUserId');
  if (mockUser) {
    headers['X-Mock-User-Id'] = mockUser;
  }

  return headers;
}

export async function apiGet(endpoint: string) {
  const headers = await getAuthHeaders();
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

export async function apiPost(endpoint: string, body: any, options?: RequestInit) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    ...options
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => response.statusText);
    const error = new Error(errorBody || `API POST request failed: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
}

export async function apiPut(endpoint: string, body: any) {
  const headers = await getAuthHeaders();
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

export async function apiDelete(endpoint: string) {
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
  return text ? JSON.parse(text) : {};
}

export async function apiUpload(endpoint: string, formData: FormData) {
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
