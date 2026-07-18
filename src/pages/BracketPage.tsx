// ─── BracketPage ───────────────────────────────────────────────────────────────
// Interactive FIFA 2026 knockout bracket.
// Click any match card to see venue, date, and AI-sourced analysis.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, MapPin, Calendar } from 'lucide-react';
import type { MatchStatus } from '../types';

interface BracketMatch {
  id: string;
  homeTeam: { name: string; flag: string; code: string; color: string };
  awayTeam: { name: string; flag: string; code: string; color: string };
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute?: number;
  venue: string;
  date: string;
  round: string;
  winner?: 'home' | 'away' | null;
  analysis: string;
}

const BRACKET: { qf: BracketMatch[]; sf: BracketMatch[]; final: BracketMatch[] } = {
  qf: [
    {
      id: 'qf1',
      homeTeam: { name: 'Brazil',    flag: '🇧🇷', code: 'BRA', color: '#009C3B' },
      awayTeam: { name: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG', color: '#CF0A0A' },
      homeScore: 2, awayScore: 1, status: 'FT', winner: 'home',
      venue: 'AT&T Stadium, Dallas', date: 'Jul 5, 2026', round: 'QF1',
      analysis: "Brazil's clinical finishing from Vinícius Jr and Richarlison proved the difference. England fought valiantly but Harry Kane's penalty came too late.",
    },
    {
      id: 'qf2',
      homeTeam: { name: 'France',    flag: '🇫🇷', code: 'FRA', color: '#0055A4' },
      awayTeam: { name: 'USA',       flag: '🇺🇸', code: 'USA', color: '#002868' },
      homeScore: 3, awayScore: 0, status: 'FT', winner: 'home',
      venue: 'MetLife Stadium, NY', date: 'Jul 5, 2026', round: 'QF2',
      analysis: "A dominant French display. Mbappé scored twice and Griezmann added a third. The USA's brave run ends here but they captured hearts worldwide.",
    },
    {
      id: 'qf3',
      homeTeam: { name: 'Argentina', flag: '🇦🇷', code: 'ARG', color: '#74ACDF' },
      awayTeam: { name: 'Germany',   flag: '🇩🇪', code: 'GER', color: '#FFCC00' },
      homeScore: 1, awayScore: 0, status: 'LIVE', minute: 78, winner: null,
      venue: 'SoFi Stadium, Los Angeles', date: 'Jul 6, 2026', round: 'QF3',
      analysis: "Messi's clinical penalty in the 34th minute is the difference so far. Germany pressing hard in the final 12 minutes — can Musiala find the equaliser?",
    },
    {
      id: 'qf4',
      homeTeam: { name: 'Spain',     flag: '🇪🇸', code: 'ESP', color: '#AA151B' },
      awayTeam: { name: 'Morocco',   flag: '🇲🇦', code: 'MAR', color: '#C1272D' },
      homeScore: 2, awayScore: 2, status: 'HT', winner: null,
      venue: "Levi's Stadium, San Francisco", date: 'Jul 6, 2026', round: 'QF4',
      analysis: "A breathtaking first half! Yamal's brace answered by two Moroccan counter-attack goals. Morocco's cohesive pressing is neutralising Spain's tiki-taka. Second half awaited.",
    },
  ],
  sf: [
    {
      id: 'sf1',
      homeTeam: { name: 'Brazil',    flag: '🇧🇷', code: 'BRA', color: '#009C3B' },
      awayTeam: { name: 'France',    flag: '🇫🇷', code: 'FRA', color: '#0055A4' },
      homeScore: null, awayScore: null, status: 'NS', winner: null,
      venue: 'MetLife Stadium, NY', date: 'Jul 14, 2026', round: 'SF1',
      analysis: 'Battle of the footballing giants. Brazil\'s samba flair vs France\'s ruthless efficiency. Mbappé vs Vinícius Jr will be the individual duel to watch.',
    },
    {
      id: 'sf2',
      homeTeam: { name: 'TBD', flag: '🏳️', code: '?', color: '#474A4A' },
      awayTeam: { name: 'TBD', flag: '🏳️', code: '?', color: '#474A4A' },
      homeScore: null, awayScore: null, status: 'NS', winner: null,
      venue: 'AT&T Stadium, Dallas', date: 'Jul 15, 2026', round: 'SF2',
      analysis: 'The winner of ARG/GER meets the winner of ESP/MAR. A classic European clash or a South American-African final?',
    },
  ],
  final: [
    {
      id: 'final',
      homeTeam: { name: 'TBD', flag: '🏆', code: '?', color: '#E61D25' },
      awayTeam: { name: 'TBD', flag: '🏆', code: '?', color: '#2A398D' },
      homeScore: null, awayScore: null, status: 'NS', winner: null,
      venue: 'MetLife Stadium, New York', date: 'Jul 19, 2026', round: 'FINAL',
      analysis: 'The greatest show on Earth. 82,500 fans inside MetLife Stadium. Billions watching worldwide. One team will be crowned FIFA World Cup 2026 Champions.',
    },
  ],
};

const STATUS_CFG: Record<MatchStatus, { label: string; color: string }> = {
  LIVE: { label: 'LIVE',      color: '#E61D25' },
  FT:   { label: 'Full Time', color: '#3CAC3B' },
  HT:   { label: 'Half Time', color: '#2A398D' },
  NS:   { label: 'Scheduled', color: '#474A4A' },
};

// ── Match card in bracket ──────────────────────────────────────────────────────
const MatchCard: React.FC<{
  match: BracketMatch;
  isSelected: boolean;
  onClick: () => void;
}> = ({ match, isSelected, onClick }) => {
  const cfg = STATUS_CFG[match.status];
  const isLive = match.status === 'LIVE';

  return (
    <button
      onClick={onClick}
      aria-pressed={isSelected}
      className={`w-44 glass rounded-xl overflow-hidden text-left transition-all duration-200
                  hover:scale-[1.03] hover:shadow-xl
                  ${isSelected ? 'ring-2 ring-[#E61D25] shadow-[0_0_24px_rgba(230,29,37,0.35)]' : ''}`}
    >
      {/* Status bar */}
      <div
        className="w-full h-1"
        style={{ background: isLive ? '#E61D25' : `${cfg.color}66` }}
        aria-hidden="true"
      />

      <div className="p-3 space-y-2">
        {/* Round + status */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
            {match.round}
          </span>
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
            style={{ background: `${cfg.color}22`, color: cfg.color }}
          >
            {isLive && match.minute ? `${match.minute}'` : cfg.label}
          </span>
        </div>

        {/* Home team */}
        <div className={`flex items-center justify-between gap-1
                         ${match.winner === 'home' ? 'opacity-100' : match.winner === 'away' ? 'opacity-40' : 'opacity-90'}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base">{match.homeTeam.flag}</span>
            <span className="text-xs font-bold text-white truncate">{match.homeTeam.name}</span>
          </div>
          <span className={`text-sm font-black tabular-nums shrink-0
                            ${match.winner === 'home' ? 'text-[#3CAC3B]' : 'text-white'}`}>
            {match.homeScore ?? '–'}
          </span>
        </div>

        {/* Away team */}
        <div className={`flex items-center justify-between gap-1
                         ${match.winner === 'away' ? 'opacity-100' : match.winner === 'home' ? 'opacity-40' : 'opacity-90'}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base">{match.awayTeam.flag}</span>
            <span className="text-xs font-bold text-white truncate">{match.awayTeam.name}</span>
          </div>
          <span className={`text-sm font-black tabular-nums shrink-0
                            ${match.winner === 'away' ? 'text-[#3CAC3B]' : 'text-white'}`}>
            {match.awayScore ?? '–'}
          </span>
        </div>
      </div>
    </button>
  );
};

// ── Bracket connector lines ────────────────────────────────────────────────────
const Connector: React.FC<{ position: 'top' | 'bottom' }> = ({ position }) => (
  <div className="w-5 flex-shrink-0 flex flex-col">
    {position === 'top' ? (
      <>
        <div className="flex-1 border-r-2 border-b-2 border-[#E61D25]/30 rounded-br-md" />
        <div className="flex-1" />
      </>
    ) : (
      <>
        <div className="flex-1" />
        <div className="flex-1 border-r-2 border-t-2 border-[#E61D25]/30 rounded-tr-md" />
      </>
    )}
  </div>
);

const HLine: React.FC = () => (
  <div className="w-5 flex-shrink-0 flex items-center">
    <div className="w-full h-0.5 bg-[#E61D25]/30" />
  </div>
);

// ── Detail panel ───────────────────────────────────────────────────────────────
const DetailPanel: React.FC<{ match: BracketMatch; onClose: () => void }> = ({ match, onClose }) => (
  <div className="modal-panel glass rounded-2xl p-5 w-full max-w-sm">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-[#E61D25] text-[10px] font-black uppercase tracking-widest mb-1">
          {match.round}
        </p>
        <h3 className="font-extrabold text-white text-lg leading-tight">
          {match.homeTeam.flag} {match.homeTeam.name} vs {match.awayTeam.name} {match.awayTeam.flag}
        </h3>
      </div>
      <button
        onClick={onClose}
        className="glass w-7 h-7 rounded-full flex items-center justify-center
                   text-white/50 hover:text-white transition-colors shrink-0 ml-3"
        aria-label="Close match details"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>

    <div className="flex gap-3 mb-4">
      <div className="flex items-center gap-1.5 text-xs text-white/50">
        <MapPin className="w-3.5 h-3.5 text-[#E61D25]" />
        {match.venue}
      </div>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-white/50 mb-4">
      <Calendar className="w-3.5 h-3.5 text-[#2A398D]" />
      {match.date}
    </div>

    <div className="glass rounded-xl p-4">
      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
        AI Analysis
      </p>
      <p className="text-sm text-white/75 leading-relaxed">{match.analysis}</p>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const BracketPage: React.FC = () => {
  const [selected, setSelected] = useState<BracketMatch | null>(null);

  const toggle = (m: BracketMatch) =>
    setSelected((prev) => (prev?.id === m.id ? null : m));

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50
                                hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[#E61D25] text-xs font-black uppercase tracking-[0.2em] mb-2">
            FIFA World Cup 2026™
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="gradient-text">Tournament Bracket</span>
          </h1>
          <p className="text-white/50 mt-2">
            Knockout stage · Quarter-Finals in progress
          </p>
        </div>

        {/* Bracket */}
        <div className="overflow-x-auto pb-6">
          <div className="flex items-stretch gap-0 min-w-[700px]">

            {/* ── Quarter-Finals ── */}
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 text-center">
                Quarter-Finals
              </p>
              <div className="flex flex-col gap-6">
                {BRACKET.qf.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    isSelected={selected?.id === m.id}
                    onClick={() => toggle(m)}
                  />
                ))}
              </div>
            </div>

            {/* QF→SF connectors */}
            <div className="flex flex-col">
              <div className="flex flex-col" style={{ height: '50%' }}>
                <div className="flex-1 flex flex-col">
                  <Connector position="top" />
                  <Connector position="bottom" />
                </div>
              </div>
              <div className="flex flex-col" style={{ height: '50%' }}>
                <div className="flex-1 flex flex-col">
                  <Connector position="top" />
                  <Connector position="bottom" />
                </div>
              </div>
            </div>

            {/* ── Semi-Finals ── */}
            <div className="flex flex-col justify-around">
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 text-center">
                  Semi-Finals
                </p>
                <div className="flex flex-col gap-24">
                  {BRACKET.sf.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      isSelected={selected?.id === m.id}
                      onClick={() => toggle(m)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* SF→Final connectors */}
            <div className="flex flex-col justify-around gap-24">
              <HLine />
              <HLine />
            </div>

            {/* ── Final ── */}
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 text-center">
                Final · Jul 19
              </p>
              {BRACKET.final.map((m) => (
                <div key={m.id} className="relative">
                  <MatchCard
                    match={m}
                    isSelected={selected?.id === m.id}
                    onClick={() => toggle(m)}
                  />
                  {/* Trophy glow */}
                  <div
                    className="absolute -inset-2 rounded-2xl pointer-events-none"
                    style={{ boxShadow: '0 0 40px 4px rgba(230,29,37,0.18)' }}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-8 mb-6">
          {Object.entries(STATUS_CFG).map(([k, { label, color }]) => (
            <div key={k} className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="mt-4">
            <DetailPanel match={selected} onClose={() => setSelected(null)} />
          </div>
        )}

      </div>
    </div>
  );
};

export default BracketPage;
