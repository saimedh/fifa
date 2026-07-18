// ─── PlayerComparePage ─────────────────────────────────────────────────────────
// Pick two players, compare them side-by-side with animated stat bars + radar chart.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, Check, ChevronDown } from 'lucide-react';
import { PLAYERS, PLAYER_MAXES } from '../data/players';
import RadarChart from '../components/RadarChart';
import type { Player } from '../types';

// ── Quick-match matchups ───────────────────────────────────────────────────────
const QUICK_PICKS = [
  { a: 'messi',    b: 'mbappe',    label: 'GOAT Debate' },
  { a: 'kane',     b: 'yamal',     label: 'Veteran vs Prodigy' },
  { a: 'ronaldo',  b: 'messi',     label: 'All-Time Rivals' },
  { a: 'bellingham', b: 'foden',   label: 'England Midfield' },
];

// ── Club prestige (for radar) ──────────────────────────────────────────────────
const PRESTIGE: Record<string, number> = {
  'Real Madrid': 10, 'FC Barcelona': 9, 'Bayern Munich': 9, 'Manchester City': 9,
  'Arsenal': 8, 'Atlético de Madrid': 8, 'Paris Saint-Germain': 8,
  'AC Milan': 7, 'Tottenham Hotspur': 6, 'PSV Eindhoven': 6,
  'Al-Nassr': 4, 'Inter Miami CF': 4, 'Santos FC': 3,
};

// ── Animated stat bar ──────────────────────────────────────────────────────────
const StatBar: React.FC<{
  label: string;
  valA: number;
  valB: number;
  max: number;
  colorA: string;
  colorB: string;
}> = ({ label, valA, valB, max, colorA, colorB }) => {
  const pctA = (valA / max) * 100;
  const pctB = (valB / max) * 100;
  const aWins = valA > valB;
  const bWins = valB > valA;

  return (
    <div className="group">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span
          className={`font-black tabular-nums w-8 text-right transition-colors ${aWins ? '' : 'text-white/40'}`}
          style={{ color: aWins ? colorA : undefined }}
        >
          {valA}
          {aWins && <span className="ml-0.5 text-[9px]">✓</span>}
        </span>
        <span className="text-white/40 font-semibold tracking-wide text-[10px] uppercase mx-3">
          {label}
        </span>
        <span
          className={`font-black tabular-nums w-8 text-left transition-colors ${bWins ? '' : 'text-white/40'}`}
          style={{ color: bWins ? colorB : undefined }}
        >
          {bWins && <span className="mr-0.5 text-[9px]">✓</span>}
          {valB}
        </span>
      </div>
      {/* Bar */}
      <div className="flex items-center gap-1">
        {/* A bar (right-aligned) */}
        <div className="flex-1 flex justify-end">
          <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden flex justify-end">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pctA}%`,
                background: colorA,
                transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          </div>
        </div>
        <div className="w-px h-3 bg-white/20 shrink-0" />
        {/* B bar (left-aligned) */}
        <div className="flex-1">
          <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pctB}%`,
                background: colorB,
                transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Player avatar with fallback ────────────────────────────────────────────────
const Avatar: React.FC<{ player: Player }> = ({ player }) => {
  const [err, setErr] = useState(false);
  const initials = player.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (err || !player.photo) {
    return (
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl mx-auto"
        style={{ background: `linear-gradient(135deg, ${player.countryColor}44, ${player.countryColor}99)` }}
        aria-label={player.name}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={player.photo}
      alt={player.name}
      className="w-24 h-24 object-cover object-top rounded-2xl shadow-xl mx-auto"
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
};

// ── Player select dropdown ─────────────────────────────────────────────────────
const PlayerSelect: React.FC<{
  value: Player;
  onChange: (p: Player) => void;
  label: string;
  excludeId: string;
}> = ({ value, onChange, label, excludeId }) => (
  <div className="flex-1 min-w-0">
    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        value={value.id}
        onChange={(e) => {
          const p = PLAYERS.find(pl => pl.id === e.target.value);
          if (p) onChange(p);
        }}
        className="appearance-none w-full bg-[var(--color-surface)] text-white font-semibold
                   text-sm px-4 py-3 pr-9 rounded-xl border border-white/10
                   hover:border-white/25 transition-colors"
        aria-label={label}
      >
        {PLAYERS.filter(p => p.id !== excludeId).map(p => (
          <option key={p.id} value={p.id}>
            {p.countryFlag} {p.name} ({p.countryCode})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const PlayerComparePage: React.FC = () => {
  const [playerA,  setPlayerA]  = useState<Player>(PLAYERS.find(p => p.id === 'messi')!);
  const [playerB,  setPlayerB]  = useState<Player>(PLAYERS.find(p => p.id === 'mbappe')!);
  const [copied,   setCopied]   = useState(false);

  const radarStats = useMemo(() => {
    const maxPrestige = 10;
    const maxAge = 40; // higher age → lower "youth" score → inverted below
    return [
      { label: 'Goals',    a: playerA.stats.goals,   b: playerB.stats.goals,   max: PLAYER_MAXES.goals },
      { label: 'Assists',  a: playerA.stats.assists, b: playerB.stats.assists, max: PLAYER_MAXES.assists },
      { label: 'Caps',     a: playerA.stats.caps,    b: playerB.stats.caps,    max: PLAYER_MAXES.caps },
      { label: 'Youth',    a: Math.max(0, maxAge - playerA.age), b: Math.max(0, maxAge - playerB.age), max: maxAge - 16 },
      { label: 'Club ✦',  a: PRESTIGE[playerA.stats.club] ?? 5, b: PRESTIGE[playerB.stats.club] ?? 5, max: maxPrestige },
    ];
  }, [playerA, playerB]);

  const share = useCallback(() => {
    const aStr = `${playerA.name}: ⚽${playerA.stats.goals} | 🎯${playerA.stats.assists} | 🛡️${playerA.stats.caps}`;
    const bStr = `${playerB.name}: ⚽${playerB.stats.goals} | 🎯${playerB.stats.assists} | 🛡️${playerB.stats.caps}`;
    const text = `🏆 FIFA 2026 Player Face-Off\n${playerA.countryFlag} ${aStr}\n${playerB.countryFlag} ${bStr}\n\nStadium Copilot — AI-Powered FIFA Experience`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [playerA, playerB]);

  const setQuick = (a: string, b: string) => {
    const pa = PLAYERS.find(p => p.id === a);
    const pb = PLAYERS.find(p => p.id === b);
    if (pa && pb) { setPlayerA(pa); setPlayerB(pb); }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50
                                hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <p className="text-[#E61D25] text-xs font-black uppercase tracking-[0.2em] mb-2">
          Player Face-Off
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8">
          <span className="gradient-text">Compare Players</span>
        </h1>

        {/* Quick picks */}
        <div className="flex gap-2 flex-wrap mb-6">
          <span className="text-xs text-white/40 font-semibold self-center">Quick picks:</span>
          {QUICK_PICKS.map(q => (
            <button
              key={q.label}
              onClick={() => setQuick(q.a, q.b)}
              className="px-3 py-1.5 rounded-full text-xs font-bold border border-white/10
                         text-white/60 hover:text-white hover:border-white/25 transition-all"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Player selectors */}
        <div className="flex gap-4 mb-8">
          <PlayerSelect value={playerA} onChange={setPlayerA} label="Player A" excludeId={playerB.id} />
          <div className="flex items-end pb-3 text-white/30 font-black text-lg">vs</div>
          <PlayerSelect value={playerB} onChange={setPlayerB} label="Player B" excludeId={playerA.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: player hero + radar */}
          <div className="glass rounded-2xl p-6">
            {/* Player avatars side by side */}
            <div className="flex items-end justify-around mb-6">
              {[playerA, playerB].map((p, idx) => (
                <div key={p.id} className="flex flex-col items-center gap-2">
                  <Avatar player={p} />
                  <div className="text-center">
                    <p className="text-sm font-extrabold text-white leading-tight">{p.name}</p>
                    <p className="text-xs text-white/40">{p.countryFlag} {p.country}</p>
                    <span
                      className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{
                        background: `${idx === 0 ? playerA.countryColor : playerB.countryColor}22`,
                        color: idx === 0 ? playerA.countryColor : playerB.countryColor,
                        border: `1px solid ${idx === 0 ? playerA.countryColor : playerB.countryColor}44`,
                      }}
                    >
                      {p.position} · #{p.number}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar */}
            <div className="flex justify-center">
              <div>
                <RadarChart
                  stats={radarStats}
                  colorA={playerA.countryColor}
                  colorB={playerB.countryColor}
                  nameA={playerA.name}
                  nameB={playerB.name}
                  size={260}
                />
                {/* Radar legend */}
                <div className="flex justify-center gap-5 mt-3">
                  {[
                    { name: playerA.name, color: playerA.countryColor, flag: playerA.countryFlag },
                    { name: playerB.name, color: playerB.countryColor, flag: playerB.countryFlag },
                  ].map(({ name, color, flag }) => (
                    <div key={name} className="flex items-center gap-1.5 text-xs text-white/60">
                      <span className="w-3 h-0.5 rounded-full" style={{ background: color }} />
                      {flag} {name.split(' ').pop()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: stat bars */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Head-to-Head Stats
              </p>
              <button
                onClick={share}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full
                           border border-white/15 text-white/60 hover:text-white hover:border-white/30
                           transition-all duration-200"
                aria-label="Share comparison"
              >
                {copied
                  ? <><Check className="w-3 h-3 text-[#3CAC3B]" /> Copied!</>
                  : <><Share2 className="w-3 h-3" /> Share</>
                }
              </button>
            </div>

            {/* Player name headers */}
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-4">
              <span style={{ color: playerA.countryColor }}>
                {playerA.countryFlag} {playerA.name.split(' ').pop()}
              </span>
              <span className="text-white/25">vs</span>
              <span style={{ color: playerB.countryColor }}>
                {playerB.name.split(' ').pop()} {playerB.countryFlag}
              </span>
            </div>

            <div className="space-y-5">
              <StatBar label="Goals"   valA={playerA.stats.goals}   valB={playerB.stats.goals}   max={PLAYER_MAXES.goals}   colorA={playerA.countryColor} colorB={playerB.countryColor} />
              <StatBar label="Assists" valA={playerA.stats.assists} valB={playerB.stats.assists} max={PLAYER_MAXES.assists} colorA={playerA.countryColor} colorB={playerB.countryColor} />
              <StatBar label="Caps"    valA={playerA.stats.caps}    valB={playerB.stats.caps}    max={PLAYER_MAXES.caps}    colorA={playerA.countryColor} colorB={playerB.countryColor} />
              <StatBar label="Age"     valA={playerA.age}           valB={playerB.age}           max={45}                   colorA={playerA.countryColor} colorB={playerB.countryColor} />
            </div>

            {/* Extra info */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[playerA, playerB].map((p, idx) => (
                <div key={p.id} className="glass rounded-xl p-3 text-center">
                  <p
                    className="text-lg font-black"
                    style={{ color: idx === 0 ? playerA.countryColor : playerB.countryColor }}
                  >
                    {p.countryFlag}
                  </p>
                  <p className="text-xs font-bold text-white mt-1">{p.stats.club}</p>
                  <p className="text-[10px] text-white/40">{p.stats.height} · {p.stats.preferredFoot} foot</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlayerComparePage;
