// ─── LiveScoresSection ─────────────────────────────────────────────────────────
// Landing-page section showing current FIFA 2026 match scores.
// Static match cards + live Tinyfish web-search results as a news feed below.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { tinyfishSearch } from '../api';
import type { LiveMatch, MatchStatus, TinyfishSearchResult } from '../types';

// ── Match data ─────────────────────────────────────────────────────────────────
const MATCHES: LiveMatch[] = [
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
    venue: 'MetLife Stadium, New York', round: 'Quarter-Final', date: 'Jul 5, 2026',
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
];

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG: Record<MatchStatus, { label: string; bg: string; text: string }> = {
  LIVE: { label: 'LIVE',  bg: '#E61D25',  text: '#fff' },
  FT:   { label: 'Full Time', bg: '#1a2a3a', text: '#8ca0b0' },
  HT:   { label: 'Half Time', bg: '#2A398D', text: '#fff' },
  NS:   { label: 'Upcoming',  bg: '#172242', text: '#8ca0b0' },
};

// ── Match card ─────────────────────────────────────────────────────────────────
const MatchScoreCard: React.FC<{ match: LiveMatch; index: number }> = ({ match, index }) => {
  const cfg  = STATUS_CFG[match.status];
  const isLive = match.status === 'LIVE';

  return (
    <article
      className="glass rounded-2xl p-5 score-in flex flex-col gap-4"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
          {match.round} · {match.date}
        </span>
        <span
          className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
          style={{ background: `${cfg.bg}22`, color: cfg.text, border: `1px solid ${cfg.bg}55` }}
        >
          {isLive && <span className="live-dot" aria-hidden="true" />}
          {isLive && match.minute ? `${match.minute}'` : cfg.label}
        </span>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between gap-3">
        {/* Home team */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-3xl" role="img" aria-label={match.homeTeam.name}>
            {match.homeTeam.flag}
          </span>
          <span className="text-sm font-bold text-white text-center leading-tight">
            {match.homeTeam.name}
          </span>
          <span className="text-[10px] text-white/40">{match.homeTeam.code}</span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: isLive ? 'rgba(230,29,37,0.12)' : 'rgba(255,255,255,0.05)' }}
          >
            <span
              className="text-3xl font-black font-mono tabular-nums"
              style={{ color: isLive ? '#E61D25' : '#fff' }}
            >
              {match.homeScore ?? '–'}
            </span>
            <span className="text-white/30 text-xl font-light">:</span>
            <span
              className="text-3xl font-black font-mono tabular-nums"
              style={{ color: isLive ? '#E61D25' : '#fff' }}
            >
              {match.awayScore ?? '–'}
            </span>
          </div>
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-3xl" role="img" aria-label={match.awayTeam.name}>
            {match.awayTeam.flag}
          </span>
          <span className="text-sm font-bold text-white text-center leading-tight">
            {match.awayTeam.name}
          </span>
          <span className="text-[10px] text-white/40">{match.awayTeam.code}</span>
        </div>
      </div>

      {/* Venue */}
      <p className="text-[10px] text-white/35 text-center truncate">
        📍 {match.venue}
      </p>
    </article>
  );
};

// ── Web sources strip ──────────────────────────────────────────────────────────
const SourceStrip: React.FC<{ results: TinyfishSearchResult[] }> = ({ results }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
    {results.map((r) => (
      <a
        key={r.url}
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="glass rounded-xl p-3 flex flex-col gap-1.5 hover:scale-[1.02]
                   transition-all duration-200 group"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-white/80 group-hover:text-white
                        leading-snug line-clamp-2 transition-colors">
            {r.title}
          </p>
          <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white/60
                                   shrink-0 mt-0.5 transition-colors" aria-hidden="true" />
        </div>
        <p className="text-[10px] text-white/35 truncate">{r.site_name}</p>
        {r.snippet && (
          <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">
            {r.snippet}
          </p>
        )}
      </a>
    ))}
  </div>
);

// ── Main section ───────────────────────────────────────────────────────────────
const LiveScoresSection: React.FC = () => {
  const [sources,     setSources]     = useState<TinyfishSearchResult[]>([]);
  const [loadingSrc,  setLoadingSrc]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSources = useCallback(async () => {
    setLoadingSrc(true);
    try {
      const res = await tinyfishSearch('FIFA World Cup 2026 live scores results today');
      if (res?.results) {
        setSources(res.results.filter((r) => r.snippet).slice(0, 3));
        setLastUpdated(new Date());
      }
    } catch {
      // fail silently — static match data is always visible
    } finally {
      setLoadingSrc(false);
    }
  }, []);

  // Fetch on mount + every 2 minutes
  useEffect(() => {
    void fetchSources();
    const id = setInterval(() => void fetchSources(), 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchSources]);

  return (
    <section id="live-scores" aria-labelledby="scores-heading" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="live-dot" aria-hidden="true" />
              <span className="text-[#E61D25] text-xs font-black uppercase tracking-[0.2em]">
                Live Now
              </span>
            </div>
            <h2
              id="scores-heading"
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
            >
              <span className="gradient-text">Match Scores</span>
            </h2>
            <p className="text-white/50 mt-2 text-sm">
              FIFA World Cup 2026 · Quarter-Finals
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => void fetchSources()}
            disabled={loadingSrc}
            aria-label="Refresh live score sources"
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-xs
                       font-semibold text-white/60 hover:text-white transition-all
                       duration-200 hover:scale-105 disabled:opacity-40
                       disabled:cursor-not-allowed self-start sm:self-auto"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loadingSrc ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Refresh'}
          </button>
        </div>

        {/* Match cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {MATCHES.map((m, i) => (
            <MatchScoreCard key={m.id} match={m} index={i} />
          ))}
        </div>

        {/* Tinyfish web sources */}
        {sources.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white/60
                           uppercase tracking-widest mb-4">
              <span className="w-1 h-4 rounded-full bg-[#E61D25] inline-block" />
              Latest from the web
            </h3>
            <SourceStrip results={sources} />
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveScoresSection;
