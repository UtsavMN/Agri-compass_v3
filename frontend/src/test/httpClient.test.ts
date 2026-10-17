import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setGlobalClerkUserId, apiGet, apiPost } from '../lib/httpClient';

describe('httpClient - User Resolution and Header Injection Tests', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setGlobalClerkUserId(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setGlobalClerkUserId(null);
  });

  it('injects X-User-Id header into requests when globalClerkUserId is set', async () => {
    let capturedHeaders: any = null;
    global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers;
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'ok' }),
      } as Response;
    });

    setGlobalClerkUserId('user_test_farmer_999');
    await apiGet('/api/farms');

    expect(capturedHeaders).toBeDefined();
    expect(capturedHeaders['X-User-Id']).toBe('user_test_farmer_999');
  });

  it('sends JSON stringified body and correct content-type header on apiPost', async () => {
    let capturedBody: any = null;
    let capturedMethod: any = null;

    global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = init?.body;
      capturedMethod = init?.method;
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ saved: true }),
      } as Response;
    });

    const payload = { nitrogen: 50, phosphorus: 20 };
    await apiPost('/api/farms/1/diagnostics', payload);

    expect(capturedMethod).toBe('POST');
    expect(capturedBody).toBe(JSON.stringify(payload));
  });
});
