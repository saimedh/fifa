// ─── Stadium Copilot — Type Definitions ───────────────────────────────────────
// Mirrors backend Pydantic schemas exactly. Field names and types must stay in sync.

// ── Enums ─────────────────────────────────────────────────────────────────────

export type Role = 'fan' | 'volunteer' | 'staff' | 'organizer';

export type Language =
  | 'en'
  | 'es'
  | 'fr'
  | 'ar'
  | 'pt'
  | 'de'
  | 'ja'
  | 'zh'
  | 'ko'
  | 'hi';

export type Intent =
  | 'navigation'
  | 'emergency'
  | 'accessibility'
  | 'ticketing'
  | 'food_beverage'
  | 'crowd_info'
  | 'general';

export type AccessibilityKind =
  | 'wheelchair'
  | 'visual_impairment'
  | 'hearing_impairment'
  | 'mobility'
  | 'medical'
  | 'other';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type TicketStatus = 'open' | 'in_progress' | 'resolved';

// ── Request Schemas ────────────────────────────────────────────────────────────

export interface AssistantQuery {
  message: string;
  language: Language;
  role: Role;
  zone: string;
  intent_hint?: Intent;
}

export interface AccessibilityRequest {
  kind: AccessibilityKind;
  zone: string;
  details: string;
  contact: string;
}

export interface CrowdSample {
  zone: string;
  density_pct: number;
  flow_rate: number;
}

// ── Response Schemas ───────────────────────────────────────────────────────────

export interface AssistantResponse {
  intent: Intent;
  reply: string;
  suggested_action: string | null;
  language: Language;
  escalated: boolean;
}

export interface AccessibilityTicket {
  ticket_id: string;
  status: TicketStatus;
  eta_minutes: number;
}

export interface CrowdAdvisory {
  zone: string;
  risk_level: RiskLevel;
  summary: string;
  recommended_actions: string[];
}

// ── UI-only helpers ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggested_action?: string | null;
  escalated?: boolean;
  /** Live web sources from Tinyfish Search, attached to assistant messages. */
  sources?: TinyfishSearchResult[];
  timestamp: Date;
}

export interface ApiError {
  detail: string;
  status: number;
}

// ── Tinyfish types ──────────────────────────────────────────────────────────────────

/** One result item returned by the Tinyfish Search API. */
export interface TinyfishSearchResult {
  position: number;
  url: string;
  title: string;
  snippet: string;
  site_name: string;
  /** Present on some results (e.g. "Jul 15, 2025"). */
  date?: string;
}

/** Full response from GET https://api.search.tinyfish.ai */
export interface TinyfishSearchResponse {
  results: TinyfishSearchResult[];
  query: string;
  total_results: number;
  page: number;
}

/** Response from POST https://api.fetch.tinyfish.ai */
export interface TinyfishFetchResponse {
  /** Cleaned page content as Markdown (or HTML / JSON depending on `format`). */
  content: string;
  url: string;
  title?: string;
}

// ── Player types ──────────────────────────────────────────────────────────────────

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface PlayerStats {
  goals: number;
  assists: number;
  caps: number;
  height: string;
  preferredFoot: 'Left' | 'Right' | 'Both';
  club: string;
  clubCountry: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  country: string;
  countryCode: string;
  countryFlag: string;
  /** Primary brand/accent colour for this player's nation. */
  countryColor: string;
  /** Wikipedia CDN thumbnail URL — falls back to initials avatar on error. */
  photo: string;
  age: number;
  stats: PlayerStats;
}

// ── Live score types ─────────────────────────────────────────────────────────────

export type MatchStatus = 'LIVE' | 'FT' | 'HT' | 'NS';

export interface LiveMatchTeam {
  name: string;
  flag: string;
  code: string;
}

export interface LiveMatch {
  id: string;
  homeTeam: LiveMatchTeam;
  awayTeam: LiveMatchTeam;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  /** Elapsed minutes — only present when status is 'LIVE'. */
  minute?: number;
  venue: string;
  round: string;
  date: string;
}

// ── Supabase / Auth types ─────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string | null;
  favorite_team: string | null;
  favorite_player_id: string | null;
  language: Language;
  created_at: string;
}

export interface AccessibilityRequestRecord {
  id: string;
  user_id: string | null;
  request_type: string;
  description: string | null;
  location: string | null;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface ChatHistoryRow {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// ── WebSocket score message ────────────────────────────────────────────────────

export interface ScoreMessage {
  type: 'scores_update';
  matches: LiveMatch[];
  simulated: boolean;
  timestamp?: string;
}



