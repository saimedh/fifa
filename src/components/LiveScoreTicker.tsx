// ─── LiveScoreTicker ───────────────────────────────────────────────────────────
// Slim, infinitely-scrolling score bar rendered below the Navbar.
// CSS animation drives the scroll — hover pauses it.
// ──────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type { LiveMatch, MatchStatus } from '../types';

// ── Static fixture data ────────────────────────────────────────────────────────
// Reflects realistic FIFA 2026 Quarter-Final / Semi-Final timeline (July 2026).
const MATCHES: LiveMatch[] = [
  {
    id: 'qf1',
    homeTeam: { name: 'Brazil',    flag: '🇧🇷', code: 'BRA' },
    awayTeam: { name: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
    homeScore: 2, awayScore: 1,
    status: 'FT', venue: 'AT&T Stadium', round: 'Quarter-Final', date: 'Jul 5',
  },
  {
    id: 'qf2',
    homeTeam: { name: 'France',    flag: '🇫🇷', code: 'FRA' },
    awayTeam: { name: 'USA',       flag: '🇺🇸', code: 'USA' },
    homeScore: 3, awayScore: 0,
    status: 'FT', venue: 'MetLife Stadium', round: 'Quarter-Final', date: 'Jul 5',
  },
  {
    id: 'qf3',
    homeTeam: { name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
    awayTeam: { name: 'Germany',   flag: '🇩🇪', code: 'GER' },
    homeScore: 1, awayScore: 0,
    status: 'LIVE', minute: 78,
    venue: 'SoFi Stadium', round: 'Quarter-Final', date: 'Jul 6',
  },
  {
    id: 'qf4',
    homeTeam: { name: 'Spain',     flag: '🇪🇸', code: 'ESP' },
    awayTeam: { name: 'Morocco',   flag: '🇲🇦', code: 'MAR' },
    homeScore: 2, awayScore: 2,
    status: 'HT', venue: 'Levi\'s Stadium', round: 'Quarter-Final', date: 'Jul 6',
  },
  {
    id: 'sf1',
    homeTeam: { name: 'Brazil',    flag: '🇧🇷', code: 'BRA' },
    awayTeam: { name: 'France',    flag: '🇫🇷', code: 'FRA' },
    homeScore: null, awayScore: null,
    status: 'NS', venue: 'MetLife Stadium', round: 'Semi-Final', date: 'Jul 14',
  },
  {
    id: 'sf2',
    homeTeam: { name: 'TBD',       flag: '🏳️', code: 'TBD' },
    awayTeam: { name: 'TBD',       flag: '🏳️', code: 'TBD' },
    homeScore: null, awayScore: null,
    status: 'NS', venue: 'AT&T Stadium', round: 'Semi-Final', date: 'Jul 15',
  },
];

// ── Status badge ───────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<MatchStatus, { label: string; className: string }> = {
  LIVE: { label: 'LIVE', className: 'bg-[#E61D25] text-white' },
  FT:   { label: 'FT',   className: 'bg-white/15 text-white/70' },
  HT:   { label: 'HT',   className: 'bg-[#2A398D]/80 text-white' },
  NS:   { label: 'NS',   className: 'bg-white/10 text-white/50' },
};

interface TickerItemProps { match: LiveMatch }

const TickerItem: React.FC<TickerItemProps> = ({ match }) => {
  const badge = STATUS_STYLE[match.status];
  const score =
    match.homeScore !== null && match.awayScore !== null
      ? `${match.homeScore} – ${match.awayScore}`
      : 'vs';

  return (
    <div className="flex items-center gap-3 px-5 py-1.5 shrink-0 border-r border-white/8">
      {/* Status badge */}
      <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full ${badge.className}`}>
        {match.status === 'LIVE' && match.minute
          ? `${match.minute}'`
          : badge.label}
      </span>

      {/* Teams + score */}
      <span className="flex items-center gap-2 text-sm font-semibold text-white/85">
        <span>{match.homeTeam.flag}</span>
        <span className="hidden sm:inline text-white/60 text-xs">{match.homeTeam.code}</span>
        <span
          className={`font-mono font-black ${
            match.status === 'LIVE' ? 'text-[#E61D25]' : 'text-white'
          }`}
        >
          {score}
        </span>
        <span className="hidden sm:inline text-white/60 text-xs">{match.awayTeam.code}</span>
        <span>{match.awayTeam.flag}</span>
      </span>

      {/* Round label */}
      <span className="hidden md:inline text-[10px] text-white/35 font-medium tracking-wide">
        {match.round} · {match.date}
      </span>
    </div>
  );
};

// ── Ticker ─────────────────────────────────────────────────────────────────────
const LiveScoreTicker: React.FC = () => (
  <div
    className="w-full overflow-hidden border-b border-white/6 bg-[#060d1a]/90 backdrop-blur-md"
    style={{ height: '36px' }}
    aria-label="Live FIFA 2026 match scores"
    role="marquee"
    aria-live="polite"
  >
    {/* Left fade */}
    <div
      className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none"
      style={{ background: 'linear-gradient(to right, #060d1a, transparent)' }}
      aria-hidden="true"
    />

    {/* Scrolling track — content duplicated for seamless loop */}
    <div className="ticker-track h-full items-center">
      {/* Leading label */}
      <div className="flex items-center gap-2 px-4 shrink-0">
        <span className="live-dot" aria-hidden="true" />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E61D25]">
          Live Scores
        </span>
      </div>

      {MATCHES.map((m) => <TickerItem key={m.id}       match={m} />)}
      {MATCHES.map((m) => <TickerItem key={`${m.id}-2`} match={m} />)}
    </div>

    {/* Right fade */}
    <div
      className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
      style={{ background: 'linear-gradient(to left, #060d1a, transparent)' }}
      aria-hidden="true"
    />
  </div>
);

export default LiveScoreTicker;
