// ─── useScoreWebSocket ─────────────────────────────────────────────────────────
// Connects to the FastAPI WebSocket at ws://localhost:8000/ws/scores.
// Reconnects with exponential backoff. Falls back to static matches when offline.
// ──────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import type { LiveMatch } from '../types';

/** Static fallback — shown until WebSocket delivers real/simulated data. */
export const STATIC_MATCHES: LiveMatch[] = [
  {
    id: 'qf1',
    homeTeam: { name: 'Brazil',    flag: '🇧🇷', code: 'BRA' },
    awayTeam: { name: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
    homeScore: 2, awayScore: 1, status: 'FT',
    venue: 'AT&T Stadium, Dallas', round: 'Quarter-Final', date: 'Jul 5, 2026',
  },
  {
    id: 'qf2',
    homeTeam: { name: 'France',    flag: '🇫🇷', code: 'FRA' },
    awayTeam: { name: 'USA',       flag: '🇺🇸', code: 'USA' },
    homeScore: 3, awayScore: 0, status: 'FT',
    venue: 'MetLife Stadium, NY', round: 'Quarter-Final', date: 'Jul 5, 2026',
  },
  {
    id: 'qf3',
    homeTeam: { name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
    awayTeam: { name: 'Germany',   flag: '🇩🇪', code: 'GER' },
    homeScore: 1, awayScore: 0, status: 'LIVE', minute: 78,
    venue: 'SoFi Stadium, Los Angeles', round: 'Quarter-Final', date: 'Jul 6, 2026',
  },
  {
    id: 'qf4',
    homeTeam: { name: 'Spain',     flag: '🇪🇸', code: 'ESP' },
    awayTeam: { name: 'Morocco',   flag: '🇲🇦', code: 'MAR' },
    homeScore: 2, awayScore: 2, status: 'HT',
    venue: "Levi's Stadium, San Francisco", round: 'Quarter-Final', date: 'Jul 6, 2026',
  },
  {
    id: 'sf1',
    homeTeam: { name: 'Brazil',    flag: '🇧🇷', code: 'BRA' },
    awayTeam: { name: 'France',    flag: '🇫🇷', code: 'FRA' },
    homeScore: null, awayScore: null, status: 'NS',
    venue: 'MetLife Stadium, NY', round: 'Semi-Final', date: 'Jul 14, 2026',
  },
  {
    id: 'sf2',
    homeTeam: { name: 'TBD', flag: '🏳️', code: 'TBD' },
    awayTeam: { name: 'TBD', flag: '🏳️', code: 'TBD' },
    homeScore: null, awayScore: null, status: 'NS',
    venue: 'AT&T Stadium, Dallas', round: 'Semi-Final', date: 'Jul 15, 2026',
  },
];

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/scores';
const MAX_BACKOFF_MS = 30_000;

interface ScoreWebSocketResult {
  matches: LiveMatch[];
  connected: boolean;
  simulated: boolean;
  lastUpdated: Date | null;
}

export function useScoreWebSocket(): ScoreWebSocketResult {
  const [matches,     setMatches]     = useState<LiveMatch[]>(STATIC_MATCHES);
  const [connected,   setConnected]   = useState(false);
  const [simulated,   setSimulated]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const wsRef            = useRef<WebSocket | null>(null);
  const reconnectRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef       = useRef(1000);
  const mountedRef       = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        setConnected(true);
        backoffRef.current = 1000; // reset
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data) as { type: string; matches?: LiveMatch[]; simulated?: boolean };
          if (msg.type === 'scores_update' && Array.isArray(msg.matches)) {
            setMatches(msg.matches as LiveMatch[]);
            setSimulated(msg.simulated ?? true);
            setLastUpdated(new Date());
          }
        } catch { /* ignore malformed frames */ }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        const delay = backoffRef.current;
        backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);
        reconnectRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close(); // triggers onclose → reconnect
      };
    } catch {
      // WebSocket API unavailable (SSR / test env)
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  return { matches, connected, simulated, lastUpdated };
}
