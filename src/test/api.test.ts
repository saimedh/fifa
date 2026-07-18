// ── API client tests ─────────────────────────────────────────────────────────
// Tests every exported function in src/api.ts.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Ensure VITE_API_BASE is set so the module doesn't emit the console.warn
// and calls actually build a URL.
vi.stubEnv('VITE_API_BASE', 'http://localhost:8000');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeErrorResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makePlainTextErrorResponse(status: number): Response {
  return new Response('Internal Server Error', { status });
}

// ── Import after env stub ─────────────────────────────────────────────────────
import {
  getHealth,
  postAssistantQuery,
  postAccessibilityRequest,
  postCrowdAdvisory,
} from '../api';

describe('API client', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── getHealth ────────────────────────────────────────────────────────────────

  describe('getHealth', () => {
    it('returns health data on 200', async () => {
      fetchSpy.mockResolvedValue(makeResponse({ status: 'ok', version: '1.0.0' }));
      const result = await getHealth();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
    });

    it('calls the correct URL with GET', async () => {
      fetchSpy.mockResolvedValue(makeResponse({ status: 'ok' }));
      await getHealth();
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/health',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('throws ApiError with detail on non-OK JSON response', async () => {
      fetchSpy.mockResolvedValue(makeErrorResponse({ detail: 'Service unavailable' }, 503));
      await expect(getHealth()).rejects.toMatchObject({
        detail: 'Service unavailable',
        status: 503,
      });
    });

    it('throws ApiError with HTTP status text when body is not JSON', async () => {
      fetchSpy.mockResolvedValue(makePlainTextErrorResponse(502));
      await expect(getHealth()).rejects.toMatchObject({ status: 502 });
    });
  });

  // ── postAssistantQuery ───────────────────────────────────────────────────────

  describe('postAssistantQuery', () => {
    const payload = { message: 'Where is Gate A?', language: 'en' as const, role: 'fan' as const, zone: 'Gate A' };
    const mockResponse = {
      intent: 'navigation',
      reply: 'Head north.',
      suggested_action: null,
      language: 'en',
      escalated: false,
    };

    it('calls /assistant/query with POST + correct headers + body', async () => {
      fetchSpy.mockResolvedValue(makeResponse(mockResponse));
      await postAssistantQuery(payload);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/assistant/query',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: expect.stringContaining('"message":"Where is Gate A?"'),
        })
      );
    });

    it('sanitizes (trims) message and zone before sending', async () => {
      fetchSpy.mockResolvedValue(makeResponse(mockResponse));
      await postAssistantQuery({ ...payload, message: '  hello  ', zone: '  Gate A  ' });
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.message).toBe('hello');
      expect(body.zone).toBe('Gate A');
    });

    it('returns the parsed response', async () => {
      fetchSpy.mockResolvedValue(makeResponse(mockResponse));
      const result = await postAssistantQuery(payload);
      expect(result.reply).toBe('Head north.');
      expect(result.escalated).toBe(false);
    });

    it('throws ApiError on 429', async () => {
      fetchSpy.mockResolvedValue(
        makeErrorResponse({ detail: 'Rate limit exceeded.' }, 429)
      );
      await expect(postAssistantQuery(payload)).rejects.toMatchObject({
        detail: 'Rate limit exceeded.',
        status: 429,
      });
    });
  });

  // ── postAccessibilityRequest ─────────────────────────────────────────────────

  describe('postAccessibilityRequest', () => {
    const payload = {
      kind: 'wheelchair' as const,
      zone: 'Section 3',
      details: 'Need assistance',
      contact: '555-1234',
    };
    const mockTicket = { ticket_id: 'abc-123', status: 'open' as const, eta_minutes: 5 };

    it('calls /accessibility/request with POST', async () => {
      fetchSpy.mockResolvedValue(makeResponse(mockTicket));
      await postAccessibilityRequest(payload);
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/accessibility/request',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('returns the ticket on success', async () => {
      fetchSpy.mockResolvedValue(makeResponse(mockTicket));
      const result = await postAccessibilityRequest(payload);
      expect(result.ticket_id).toBe('abc-123');
      expect(result.eta_minutes).toBe(5);
    });

    it('sanitizes fields before sending', async () => {
      fetchSpy.mockResolvedValue(makeResponse(mockTicket));
      await postAccessibilityRequest({ ...payload, zone: '  Section 3  ', details: '  Need  ' });
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.zone).toBe('Section 3');
      expect(body.details).toBe('Need');
    });
  });

  // ── postCrowdAdvisory ────────────────────────────────────────────────────────

  describe('postCrowdAdvisory', () => {
    const payload = { zone: 'Gate B', density_pct: 75, flow_rate: 200 };
    const mockAdvisory = {
      zone: 'Gate B',
      risk_level: 'high' as const,
      summary: 'High density.',
      recommended_actions: ['Open Gate C'],
    };

    it('sends X-API-Key header', async () => {
      fetchSpy.mockResolvedValue(makeResponse(mockAdvisory));
      await postCrowdAdvisory(payload, 'my-secret-key');
      const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
      expect(headers['X-API-Key']).toBe('my-secret-key');
    });

    it('returns the advisory on success', async () => {
      fetchSpy.mockResolvedValue(makeResponse(mockAdvisory));
      const result = await postCrowdAdvisory(payload, 'key');
      expect(result.risk_level).toBe('high');
      expect(result.recommended_actions).toContain('Open Gate C');
    });
  });

  // ── tinyfishSearch ───────────────────────────────────────────────────────────

  describe('tinyfishSearch', () => {
    it('returns null when VITE_TINYFISH_API_KEY is not set', async () => {
      // The module captures the key at import time (ESM caching).
      // Reset modules and re-import with an empty key so the guard fires.
      vi.stubEnv('VITE_TINYFISH_API_KEY', '');
      vi.resetModules();
      const { tinyfishSearch: freshSearch } = await import('../api');
      const result = await freshSearch('test query');
      expect(result).toBeNull();
      // fetch should NOT have been called
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // ── tinyfishFetch ────────────────────────────────────────────────────────────

  describe('tinyfishFetch', () => {
    it('returns null when VITE_TINYFISH_API_KEY is not set', async () => {
      vi.stubEnv('VITE_TINYFISH_API_KEY', '');
      vi.resetModules();
      const { tinyfishFetch: freshFetch } = await import('../api');
      const result = await freshFetch('https://example.com');
      expect(result).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
