const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  ""
).replace(/\/$/, ""); // remove trailing slash

// Log the URL on startup so you can verify in browser console
if (import.meta.env.DEV) {
  console.log("[API] Base URL:", API_BASE_URL || "relative (same origin)");
}

export const buildUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const apiGet = async (path: string, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
};

export const apiPost = async (path: string, body: unknown, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
};

export const apiDelete = async (path: string, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
};

export const apiPut = async (path: string, body: unknown, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
};

export const apiPatch = async (path: string, body: unknown, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
};

export const apiUpload = async (path: string, body: FormData, token?: string | null): Promise<any> => {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      // Do NOT set Content-Type to application/json for FormData, browser will set it with boundary
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body,
  });
  if (!res.ok) throw new Error(`UPLOAD ${path} failed: ${res.status}`);
  return res.json();
};
