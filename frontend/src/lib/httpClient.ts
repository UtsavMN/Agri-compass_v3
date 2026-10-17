const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  ""
).replace(/\/$/, ""); // remove trailing slash

// Log the URL on startup so you can verify in browser console
export const buildUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

let globalClerkToken: string | null = null;
export const setGlobalClerkToken = (token: string | null) => {
  globalClerkToken = token;
};
export const getGlobalClerkToken = () => globalClerkToken;

let globalClerkUserId: string | null = null;
export const setGlobalClerkUserId = (userId: string | null) => {
  globalClerkUserId = userId;
};
export const getGlobalClerkUserId = () => globalClerkUserId;

const getHeaders = (token?: string | null): Record<string, string> => {
  const actualToken = token || globalClerkToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (actualToken) {
    headers["Authorization"] = `Bearer ${actualToken}`;
  }
  if (globalClerkUserId) {
    headers["X-User-Id"] = globalClerkUserId;
  }
  return headers;
};

export const apiGet = async (path: string, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
};

export const apiPost = async (path: string, body: unknown, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errMsg = `POST ${path} failed: ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errMsg = errJson.error;
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errMsg);
  }
  return res.json();
};

export const apiDelete = async (path: string, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const apiPut = async (path: string, body: unknown, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
};

export const apiPatch = async (path: string, body: unknown, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
};

export const apiUpload = async (path: string, body: FormData, token?: string | null): Promise<any> => {
  const actualToken = token || globalClerkToken;
  const headers: Record<string, string> = {};
  if (actualToken) {
    headers["Authorization"] = `Bearer ${actualToken}`;
  }
  if (globalClerkUserId) {
    headers["X-User-Id"] = globalClerkUserId;
  }
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers,
    body: body,
  });
  if (!res.ok) throw new Error(`UPLOAD ${path} failed: ${res.status}`);
  return res.json();
};
