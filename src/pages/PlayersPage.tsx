// ─── PlayersPage ───────────────────────────────────────────────────────────────
// Full star-player roster for FIFA World Cup 2026.
// Features: real player photos, search, position filter, sort, profile modal.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, ArrowLeft, X, Globe, Trophy, Shield, Hand, Activity, Settings, Target, Users, Ruler, Footprints, Star } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import type { Position, Player } from '../types';
import { PLAYERS } from '../data/players';

// ── Featured spotlight IDs (top-billed players) ───────────────────────────────
const FEATURED_IDS = ['messi', 'mbappe', 'ronaldo', 'vinicius', 'bellingham'];



const POS_LABEL: Record<Position, string> = { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' };
const POS_CSS:   Record<Position, string> = { GK: 'pos-gk', DEF: 'pos-def', MID: 'pos-mid', FWD: 'pos-fwd' };

type SortKey = 'name' | 'goals' | 'caps';

// ── PlayerAvatar ───────────────────────────────────────────────────────────────
const PlayerAvatar: React.FC<{ player: Player; size: 'card' | 'modal' | 'featured' }> = ({ player, size }) => {
  const [errored, setErrored] = useState(false);
  const initials = player.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dim =
    size === 'featured' ? 'w-full h-72 sm:h-80' :
    size === 'modal'    ? 'w-full h-64' :
                          'w-full h-56';

  if (errored || !player.photo) {
    return (
      <div
        className={`${dim} flex items-center justify-center text-white font-black
                    ${size === 'modal' ? 'text-5xl' : size === 'featured' ? 'text-7xl' : 'text-5xl'}`}
        style={{ background: `linear-gradient(160deg, ${player.countryColor}55, ${player.countryColor}cc)` }}
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
      className={`${dim} object-cover object-top`}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
};

// ── FeaturedCard ───────────────────────────────────────────────────────────────
const FeaturedCard: React.FC<{ player: Player; onClick: (p: Player) => void; rank: number }> = ({ player, onClick, rank }) => (
  <article
    className="featured-player-card relative overflow-hidden rounded-2xl cursor-pointer group"
    onClick={() => onClick(player)}
    role="button"
    tabIndex={0}
    aria-label={`View ${player.name}'s profile`}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(player); }}
  >
    {/* Background glow */}
    <div
      className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40 pointer-events-none z-10"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${player.countryColor}, transparent 70%)` }}
    />
    {/* Player image */}
    <div className="relative overflow-hidden">
      <PlayerAvatar player={player} size="featured" />
      {/* Rank badge */}
      <div
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full flex items-center justify-center
                   text-sm font-black text-white shadow-xl backdrop-blur-sm border border-white/20"
        style={{ background: `linear-gradient(135deg, ${player.countryColor}cc, ${player.countryColor}66)` }}
      >
        #{rank}
      </div>
      {/* Star icon */}
      <div className="absolute top-4 right-4 z-20">
        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
      </div>
      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060d1a] via-[#060d1a]/70 to-transparent z-10" />
      {/* Country flag overlay */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <span className="text-2xl">{player.countryFlag}</span>
        <span className="text-white/60 text-xs font-semibold">{player.country}</span>
      </div>
      {/* Hover shimmer line */}
      <div
        className="absolute inset-x-0 top-0 h-px z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${player.countryColor}, transparent)` }}
      />
    </div>
    {/* Info section */}
    <div className="px-5 py-4 bg-[#0e1a30]/90 backdrop-blur-sm border-t border-white/5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-extrabold text-white text-base leading-tight truncate">{player.name}</h3>
          <p className="text-white/40 text-xs mt-0.5 truncate">{player.stats.club}</p>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 mt-0.5 ${POS_CSS[player.position]}`}>
          {player.position}
        </span>
      </div>
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <div className="text-center">
          <p className="text-white font-black text-base leading-none">{player.stats.goals}</p>
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wide">Goals</p>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="text-center">
          <p className="text-white font-black text-base leading-none">{player.stats.caps}</p>
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wide">Caps</p>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="text-center">
          <p className="text-white font-black text-base leading-none">{player.age}</p>
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wide">Age</p>
        </div>
      </div>
    </div>
  </article>
);

// ── PlayerCard ─────────────────────────────────────────────────────────────────
const PlayerCard: React.FC<{ player: Player; onClick: (p: Player) => void }> = ({ player, onClick }) => (
  <article
    className="player-card glass rounded-2xl overflow-hidden cursor-pointer group"
    onClick={() => onClick(player)}
    role="button"
    tabIndex={0}
    aria-label={`View ${player.name}'s profile`}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(player); }}
  >
    {/* Photo */}
    <div className="relative overflow-hidden">
      <PlayerAvatar player={player} size="card" />
      {/* Number badge */}
      <span
        className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center
                   text-xs font-black text-white shadow-lg border border-white/20"
        style={{ background: player.countryColor }}
      >
        {player.number}
      </span>
      {/* Country flag */}
      <span className="absolute top-3 right-3 text-lg drop-shadow-lg">{player.countryFlag}</span>
      {/* Gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0e1a30] to-transparent" />
      {/* Hover reveal stats */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3
                   opacity-0 group-hover:opacity-100 transition-all duration-300
                   bg-[#060d1a]/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4 text-white">
          <div className="text-center">
            <p className="font-black text-xl">{player.stats.goals}</p>
            <p className="text-white/50 text-[10px] uppercase tracking-wide">Goals</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="font-black text-xl">{player.stats.caps}</p>
            <p className="text-white/50 text-[10px] uppercase tracking-wide">Caps</p>
          </div>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
          style={{ background: `${player.countryColor}88`, border: `1px solid ${player.countryColor}` }}
        >
          {player.age} yrs · {player.stats.height}
        </div>
      </div>
    </div>

    {/* Info */}
    <div className="p-4">
      <h3 className="font-extrabold text-white text-sm leading-tight mb-0.5">{player.name}</h3>
      <p className="text-white/40 text-xs mb-3">{player.country} · {player.stats.club}</p>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${POS_CSS[player.position]}`}>
          {player.position}
        </span>
        <div className="flex items-center gap-3 text-xs text-white/60">
          <span title="Goals" className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400/60" /> {player.stats.goals}</span>
          <span title="Caps" className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400/60" /> {player.stats.caps}</span>
        </div>
      </div>
    </div>
  </article>
);

// ── PlayerModal ────────────────────────────────────────────────────────────────
const PlayerModal: React.FC<{ player: Player; onClose: () => void }> = ({ player, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const stats = [
    { Icon: Target,     label: 'Goals',         value: player.stats.goals },
    { Icon: Users,      label: 'Assists',        value: player.stats.assists },
    { Icon: Trophy,     label: 'Caps',           value: player.stats.caps },
    { Icon: Ruler,      label: 'Height',         value: player.stats.height },
    { Icon: Footprints, label: 'Preferred Foot', value: player.stats.preferredFoot },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,13,26,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`${player.name} profile`}
    >
      <div className="modal-panel glass rounded-3xl overflow-hidden w-full max-w-md shadow-2xl">
        {/* Full-width hero image */}
        <div className="relative overflow-hidden h-64">
          <PlayerAvatar player={player} size="modal" />
          {/* Gradient overlays */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, ${player.countryColor}22, transparent 40%, #0e1a30 100%)` }}
          />
          {/* Country / number badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 backdrop-blur-sm
                          bg-black/30 rounded-full px-3 py-1.5 border border-white/10">
            <span className="text-lg">{player.countryFlag}</span>
            <span className="text-white/80 text-xs font-semibold">{player.country}</span>
          </div>
          <div
            className="absolute top-4 right-12 w-9 h-9 rounded-full flex items-center justify-center
                       text-xs font-black text-white shadow-xl border border-white/20"
            style={{ background: player.countryColor }}
          >
            {player.number}
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center
                       justify-center text-white/60 hover:text-white hover:bg-white/10
                       transition-colors border border-white/10"
            aria-label="Close player profile"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Player info over gradient */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">{player.name}</h2>
                <p className="text-white/50 text-sm mt-0.5">{player.stats.club}</p>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border mb-1 ${POS_CSS[player.position]}`}>
                {POS_LABEL[player.position]}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-white/40 text-xs">
              <span>Age {player.age}</span>
              <span>·</span>
              <span>{player.stats.height}</span>
              <span>·</span>
              <span>{player.stats.preferredFoot} foot</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="px-6 py-5 grid grid-cols-2 gap-3">
          {stats.map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3
                         border border-white/5 hover:border-white/10 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${player.countryColor}22`, border: `1px solid ${player.countryColor}44` }}
              >
                <Icon className="w-4 h-4" style={{ color: player.countryColor }} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-white font-bold text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const POSITIONS = [
  { value: 'ALL', label: 'All Players', Icon: null },
  { value: 'GK',  label: 'GK', Icon: Hand },
  { value: 'DEF', label: 'DEF', Icon: Shield },
  { value: 'MID', label: 'MID', Icon: Settings },
  { value: 'FWD', label: 'FWD', Icon: Activity },
] as const;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name',  label: 'Name' },
  { key: 'goals', label: 'Goals' },
  { key: 'caps',  label: 'Caps' },
];

const PlayersPage: React.FC = () => {
  const [search,    setSearch]    = useState('');
  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [sortKey,   setSortKey]   = useState<SortKey>('name');
  const [sortAsc,   setSortAsc]   = useState(true);
  const [selected,  setSelected]  = useState<Player | null>(null);

  const handleSort = useCallback((key: SortKey) => {
    if (key === sortKey) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(key === 'name'); }
  }, [sortKey]);

  const featuredPlayers = useMemo(
    () => FEATURED_IDS.map((id) => PLAYERS.find((p) => p.id === id)).filter(Boolean) as Player[],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PLAYERS
      .filter((p) =>
        (posFilter === 'ALL' || p.position === posFilter) &&
        (!q || p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'name')  cmp = a.name.localeCompare(b.name);
        if (sortKey === 'goals') cmp = a.stats.goals - b.stats.goals;
        if (sortKey === 'caps')  cmp = a.stats.caps  - b.stats.caps;
        return sortAsc ? cmp : -cmp;
      });
  }, [search, posFilter, sortKey, sortAsc]);

  const showFeatured = !search && posFilter === 'ALL';

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white
                     transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-3">
          <BrandLogo size={42} />
          <div>
            <p className="text-[#E61D25] text-xs font-black uppercase tracking-[0.2em]">
              FIFA World Cup 2026™
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              <span className="gradient-text">Star Players</span>
            </h1>
          </div>
        </div>
        <p className="text-white/50 text-base mb-10 max-w-xl">
          Meet the world's best footballers competing at the 2026 World Cup across the USA, Canada &amp; Mexico.
        </p>

        {/* ── Featured Spotlight ───────────────────────────────────── */}
        {showFeatured && (
          <section className="mb-14" aria-label="Featured star players">
            <div className="flex items-center gap-3 mb-5">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <h2 className="text-base font-black text-white uppercase tracking-widest">Spotlight</h2>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {featuredPlayers.map((player, i) => (
                <FeaturedCard key={player.id} player={player} onClick={setSelected} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              aria-hidden="true"
            />
            <input
              id="player-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players or countries…"
              className="w-full bg-[var(--color-surface)] text-[var(--color-text)] text-sm
                         rounded-xl pl-10 pr-4 py-3 border border-white/10
                         hover:border-white/20 placeholder:text-white/30
                         transition-colors"
              aria-label="Search players"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40
                           hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex gap-1.5">
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold
                            border transition-all duration-200 ${
                  sortKey === key
                    ? 'border-[#E61D25]/50 bg-[#E61D25]/15 text-[#E61D25]'
                    : 'border-white/10 bg-transparent text-white/50 hover:text-white hover:border-white/20'
                }`}
                aria-pressed={sortKey === key}
              >
                {label}
                {sortKey === key && (
                  sortAsc
                    ? <ChevronUp   className="w-3 h-3" aria-hidden="true" />
                    : <ChevronDown className="w-3 h-3" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Position filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8" role="group" aria-label="Filter by position">
          {POSITIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setPosFilter(value as any)}
              aria-pressed={posFilter === value}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                posFilter === value
                  ? 'border-[#E61D25]/50 bg-[#E61D25]/15 text-white'
                  : 'border-white/10 bg-transparent text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              {Icon && <Icon className="w-4 h-4 opacity-70" />}
              {label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-white/35 text-xs">
            Showing <strong className="text-white/60">{filtered.length}</strong> of {PLAYERS.length} players
          </p>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-white/20" />
            <span className="text-white/25 text-xs">
              {[...new Set(filtered.map((p) => p.country))].length} nations
            </span>
          </div>
        </div>

        {/* Player grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-sm">No players found for "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((player) => (
              <PlayerCard key={player.id} player={player} onClick={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* Profile modal */}
      {selected && (
        <PlayerModal player={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default PlayersPage;
