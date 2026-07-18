// ─── Stadium Copilot — API Client ─────────────────────────────────────────────
// Single typed fetch client. Base URL from VITE_API_BASE env var only.
// Every call surfaces loading/error/success states — no silent failures.

import type {
  AssistantQuery,
  AssistantResponse,
  AccessibilityRequest,
  AccessibilityTicket,
  CrowdSample,
  CrowdAdvisory,
  ApiError,
  TinyfishSearchResponse,
  TinyfishFetchResponse,
} from './types';

const BASE_URL: string = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8000';

if (!BASE_URL) {
  console.warn(
    '[api] VITE_API_BASE is not set. Requests will fail. ' +
      'Copy .env.example to .env and set the variable.'
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // body is not JSON — use status text
    }
    const err: ApiError = { detail, status: res.status };
    throw err;
  }
  return res.json() as Promise<T>;
}

function sanitize(value: string): string {
  return value.trim();
}



// ── GET /health ────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  version?: string;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  return handleResponse<HealthResponse>(res);
}

// ── POST /assistant/query ──────────────────────────────────────────────────────

export async function postAssistantQuery(
  payload: AssistantQuery
): Promise<AssistantResponse> {
  const body: AssistantQuery = {
    ...payload,
    message: sanitize(payload.message),
    zone: sanitize(payload.zone),
  };
  const res = await fetch(`${BASE_URL}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<AssistantResponse>(res);
}

// ── POST /accessibility/request ────────────────────────────────────────────────

export async function postAccessibilityRequest(
  payload: AccessibilityRequest
): Promise<AccessibilityTicket> {
  const body: AccessibilityRequest = {
    kind: payload.kind,
    zone: sanitize(payload.zone),
    details: sanitize(payload.details),
    contact: sanitize(payload.contact),
  };
  const res = await fetch(`${BASE_URL}/accessibility/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<AccessibilityTicket>(res);
}

// ── POST /ops/crowd-advisory ───────────────────────────────────────────────────

export async function postCrowdAdvisory(
  payload: CrowdSample,
  staffApiKey: string
): Promise<CrowdAdvisory> {
  const sanitizedKey = sanitize(staffApiKey);
  const body: CrowdSample = {
    zone: sanitize(payload.zone),
    density_pct: payload.density_pct,
    flow_rate: payload.flow_rate,
  };
  const res = await fetch(`${BASE_URL}/ops/crowd-advisory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': sanitizedKey,
    },
    body: JSON.stringify(body),
  });
  return handleResponse<CrowdAdvisory>(res);
}

// ── Tinyfish ──────────────────────────────────────────────────────────────────

const TINYFISH_KEY: string = (import.meta.env.VITE_TINYFISH_API_KEY as string) ?? '';

if (!TINYFISH_KEY) {
  console.info(
    '[api] VITE_TINYFISH_API_KEY is not set. Tinyfish Search and Fetch features are disabled. ' +
      'Get a key at https://agent.tinyfish.ai/api-keys and add it to .env.'
  );
}

/** Shared auth header for every Tinyfish request. */
function tinyfishHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-API-Key': TINYFISH_KEY,
  };
}

/**
 * Perform a live web search via the Tinyfish Search API.
 * Returns `null` (instead of throwing) when the API key is absent so
 * callers can safely skip the feature without guarding.
 *
 * Docs: https://tinyfish.ai/docs/search
 */
export async function tinyfishSearch(
  query: string
): Promise<TinyfishSearchResponse | null> {
  if (!TINYFISH_KEY) return null;

  const url = new URL('https://api.search.tinyfish.ai');
  url.searchParams.set('query', sanitize(query));

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: tinyfishHeaders(),
  });
  return handleResponse<TinyfishSearchResponse>(res);
}

/**
 * Render a remote URL to clean Markdown via the Tinyfish Fetch API.
 * Returns `null` when the API key is absent.
 *
 * Docs: https://tinyfish.ai/docs/fetch
 */
export async function tinyfishFetch(
  pageUrl: string
): Promise<TinyfishFetchResponse | null> {
  if (!TINYFISH_KEY) return null;

  const res = await fetch('https://api.fetch.tinyfish.ai', {
    method: 'POST',
    headers: tinyfishHeaders(),
    body: JSON.stringify({ url: sanitize(pageUrl), format: 'markdown' }),
  });
  return handleResponse<TinyfishFetchResponse>(res);
}
