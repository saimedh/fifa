// ─── MatchPredictorPage ────────────────────────────────────────────────────────
// AI-powered match outcome predictor.
// Tinyfish fetches web analysis; fans vote and results are persisted in localStorage.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ExternalLink, ChevronDown } from 'lucide-react';
import { tinyfishSearch } from '../api';
import type { TinyfishSearchResult } from '../types';

interface PredictMatch {
  id: string;
  home: { name: string; flag: string; code: string; color: string; form: ('W' | 'D' | 'L')[] };
  away: { name: string; flag: string; code: string; color: string; form: ('W' | 'D' | 'L')[] };
  venue: string;
  date: string;
  aiWin: number;   // % AI predicts home wins
  aiDraw: number;
  aiAway: number;
  query: string;   // Tinyfish search query
  h2h: { year: number; result: string; comp: string }[];
}

const MATCHES: PredictMatch[] = [
  {
    id: 'qf3',
    home: { name: 'Argentina', flag: '🇦🇷', code: 'ARG', color: '#74ACDF',
            form: ['W', 'W', 'D', 'W', 'W'] },
    away: { name: 'Germany',   flag: '🇩🇪', code: 'GER', color: '#FFCC00',
            form: ['W', 'D', 'W', 'L', 'W'] },
    venue: 'SoFi Stadium, Los Angeles', date: 'Jul 6, 2026 · LIVE',
    aiWin: 55, aiDraw: 22, aiAway: 23,
    query: 'Argentina Germany World Cup 2026 quarter-final prediction',
    h2h: [
      { year: 2022, result: 'ARG 2-2 GER (WC)', comp: 'World Cup' },
      { year: 2019, result: 'ARG 2-2 GER', comp: 'Friendly' },
      { year: 2010, result: 'GER 4-0 ARG', comp: 'World Cup QF' },
    ],
  },
  {
    id: 'qf4',
    home: { name: 'Spain',   flag: '🇪🇸', code: 'ESP', color: '#AA151B',
            form: ['W', 'W', 'W', 'D', 'W'] },
    away: { name: 'Morocco', flag: '🇲🇦', code: 'MAR', color: '#C1272D',
            form: ['W', 'D', 'W', 'W', 'D'] },
    venue: "Levi's Stadium, San Francisco", date: 'Jul 6, 2026 · HT',
    aiWin: 48, aiDraw: 30, aiAway: 22,
    query: 'Spain Morocco World Cup 2026 quarter-final prediction analysis',
    h2h: [
      { year: 2022, result: 'ESP 0-0 MAR (MAR wins on pens)', comp: 'World Cup R16' },
      { year: 2018, result: 'ESP 2-2 MAR', comp: 'World Cup Group' },
    ],
  },
  {
    id: 'sf1',
    home: { name: 'Brazil', flag: '🇧🇷', code: 'BRA', color: '#009C3B',
            form: ['W', 'W', 'D', 'W', 'W'] },
    away: { name: 'France', flag: '🇫🇷', code: 'FRA', color: '#0055A4',
            form: ['W', 'W', 'W', 'D', 'W'] },
    venue: 'MetLife Stadium, New York', date: 'Jul 14, 2026',
    aiWin: 42, aiDraw: 24, aiAway: 34,
    query: 'Brazil France World Cup 2026 semi-final prediction',
    h2h: [
      { year: 2006, result: 'FRA 1-0 BRA', comp: 'World Cup QF' },
      { year: 1998, result: 'FRA 3-0 BRA', comp: 'World Cup Final' },
    ],
  },
];

const FORM_COLOR: Record<string, string> = {
  W: '#3CAC3B', D: '#f59e0b', L: '#E61D25',
};

// ── Fan Vote ───────────────────────────────────────────────────────────────────
function getVotes(matchId: string): { home: number; draw: number; away: number } {
  try {
    const raw = localStorage.getItem(`votes_${matchId}`);
    return raw ? JSON.parse(raw) : { home: 120, draw: 40, away: 88 };
  } catch {
    return { home: 120, draw: 40, away: 88 };
  }
}
function saveVotes(matchId: string, v: { home: number; draw: number; away: number }) {
  try { localStorage.setItem(`votes_${matchId}`, JSON.stringify(v)); } catch { /* noop */ }
}
function getUserVote(matchId: string): string | null {
  try { return localStorage.getItem(`uservote_${matchId}`); } catch { return null; }
}
function saveUserVote(matchId: string, vote: string) {
  try { localStorage.setItem(`uservote_${matchId}`, vote); } catch { /* noop */ }
}

// ── Prediction bar ─────────────────────────────────────────────────────────────
const PredBar: React.FC<{ label: string; pct: number; color: string; delay?: number }> = ({ label, pct, color, delay = 0 }) => (
  <div>
    <div className="flex justify-between text-xs text-white/60 mb-1.5 font-medium">
      <span>{label}</span>
      <span className="font-black" style={{ color }}>{pct}%</span>
    </div>
    <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: `width 1s ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
        }}
      />
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const MatchPredictorPage: React.FC = () => {
  const [matchIdx, setMatchIdx] = useState(0);
  const [sources,  setSources]  = useState<TinyfishSearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);

  const match = MATCHES[matchIdx];
  const [votes,     setVotes]     = useState(() => getVotes(match.id));
  const [userVote,  setUserVote]  = useState<string | null>(() => getUserVote(match.id));

  // Reload votes + userVote when match changes
  useEffect(() => {
    setVotes(getVotes(match.id));
    setUserVote(getUserVote(match.id));
    setSources([]);
  }, [match.id]);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tinyfishSearch(match.query);
      setSources(res?.results?.filter(r => r.snippet).slice(0, 4) ?? []);
    } catch { /* fail silently */ }
    finally { setLoading(false); }
  }, [match.query]);

  useEffect(() => { void fetchAnalysis(); }, [fetchAnalysis]);

  const totalVotes = votes.home + votes.draw + votes.away;
  const fanHome    = Math.round((votes.home / totalVotes) * 100);
  const fanDraw    = Math.round((votes.draw / totalVotes) * 100);
  const fanAway    = 100 - fanHome - fanDraw;

  const castVote = (v: 'home' | 'draw' | 'away') => {
    if (userVote) return;
    const next = { ...votes, [v]: votes[v] + 1 };
    setVotes(next);
    setUserVote(v);
    saveVotes(match.id, next);
    saveUserVote(match.id, v);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50
                                hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <p className="text-[#E61D25] text-xs font-black uppercase tracking-[0.2em] mb-2">
          AI-Powered
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8">
          <span className="gradient-text">Match Predictor</span>
        </h1>

        {/* Match selector */}
        <div className="relative inline-block mb-8">
          <select
            value={matchIdx}
            onChange={(e) => setMatchIdx(Number(e.target.value))}
            className="appearance-none bg-[var(--color-surface)] text-white font-semibold
                       text-sm px-4 py-3 pr-10 rounded-xl border border-white/10
                       hover:border-white/25 transition-colors cursor-pointer"
            aria-label="Select match to predict"
          >
            {MATCHES.map((m, i) => (
              <option key={m.id} value={i}>
                {m.home.flag} {m.home.name} vs {m.away.name} {m.away.flag} · {m.date}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: form + H2H */}
          <div className="space-y-5">
            {/* Team cards */}
            {[
              { team: match.home, side: 'Home' },
              { team: match.away, side: 'Away' },
            ].map(({ team, side }) => (
              <div key={team.code} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{team.flag}</span>
                  <div>
                    <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">{side}</p>
                    <h3 className="text-lg font-extrabold text-white">{team.name}</h3>
                  </div>
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                  Last 5 matches
                </p>
                <div className="flex gap-1.5">
                  {team.form.map((r, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                      style={{ background: `${FORM_COLOR[r]}33`, border: `1.5px solid ${FORM_COLOR[r]}66` }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Head-to-head */}
            <div className="glass rounded-2xl p-5">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">
                Head to Head
              </p>
              <div className="space-y-2">
                {match.h2h.map((h) => (
                  <div key={h.year} className="flex items-center justify-between text-sm">
                    <span className="text-white/40 text-xs">{h.year} · {h.comp}</span>
                    <span className="font-bold text-white/80">{h.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: predictions + vote */}
          <div className="space-y-5">
            {/* AI prediction */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  🤖 AI Prediction
                </p>
                <button
                  onClick={() => void fetchAnalysis()}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-white/40
                             hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="space-y-3">
                <PredBar label={`${match.home.flag} ${match.home.name} Win`} pct={match.aiWin}  color={match.home.color} delay={0} />
                <PredBar label="Draw"                                          pct={match.aiDraw} color="#f59e0b"           delay={100} />
                <PredBar label={`${match.away.flag} ${match.away.name} Win`}  pct={match.aiAway} color={match.away.color}  delay={200} />
              </div>
            </div>

            {/* Fan vote */}
            <div className="glass rounded-2xl p-5">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">
                ⚽ Fan Vote · {totalVotes.toLocaleString()} votes
              </p>

              {!userVote ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { key: 'home' as const, label: match.home.flag, sub: match.home.name, color: match.home.color },
                    { key: 'draw' as const, label: '🤝',            sub: 'Draw',           color: '#f59e0b' },
                    { key: 'away' as const, label: match.away.flag, sub: match.away.name, color: match.away.color },
                  ].map(({ key, label, sub, color }) => (
                    <button
                      key={key}
                      onClick={() => castVote(key)}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl border
                                 transition-all duration-200 hover:scale-105"
                      style={{ borderColor: `${color}44`, background: `${color}15` }}
                    >
                      <span className="text-2xl">{label}</span>
                      <span className="text-[10px] font-bold text-white/70">{sub}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#3CAC3B] font-semibold mb-4">
                  ✓ You voted for{' '}
                  {userVote === 'home' ? match.home.name
                    : userVote === 'away' ? match.away.name
                    : 'Draw'}
                </p>
              )}

              <div className="space-y-3">
                <PredBar label={`${match.home.flag} ${match.home.name}`} pct={fanHome} color={match.home.color} />
                <PredBar label="Draw"                                      pct={fanDraw} color="#f59e0b" />
                <PredBar label={`${match.away.flag} ${match.away.name}`}  pct={fanAway} color={match.away.color} />
              </div>
            </div>
          </div>
        </div>

        {/* Tinyfish web sources */}
        {sources.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">
              📰 Web Analysis
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-xl p-4 group hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="flex justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-white/80 group-hover:text-white
                                  transition-colors line-clamp-2">
                      {s.title}
                    </p>
                    <ExternalLink className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
                  </div>
                  {s.snippet && (
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-3">{s.snippet}</p>
                  )}
                  <p className="text-[10px] text-white/30 mt-2">{s.site_name}</p>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MatchPredictorPage;
