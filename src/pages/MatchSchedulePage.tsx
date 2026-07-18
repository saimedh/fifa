import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Trophy, Filter } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

// ── Match Data ─────────────────────────────────────────────────────────────────
interface Match {
  id: string;
  date: string;
  time: string;
  group?: string;
  round: string;
  home: { name: string; flag: string; code: string };
  away: { name: string; flag: string; code: string };
  venue: string;
  city: string;
  country: string;
}

const MATCHES: Match[] = [
  // Group Stage samples
  { id: 'g1',  date: 'Jun 11', time: '19:00', group: 'A', round: 'Group Stage', home: { name: 'Mexico',      flag: '🇲🇽', code: 'MEX' }, away: { name: 'Canada',      flag: '🇨🇦', code: 'CAN' }, venue: 'Estadio Azteca',         city: 'Mexico City',   country: '🇲🇽' },
  { id: 'g2',  date: 'Jun 12', time: '15:00', group: 'A', round: 'Group Stage', home: { name: 'USA',         flag: '🇺🇸', code: 'USA' }, away: { name: 'England',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' }, venue: 'MetLife Stadium',         city: 'New York',      country: '🇺🇸' },
  { id: 'g3',  date: 'Jun 13', time: '19:00', group: 'B', round: 'Group Stage', home: { name: 'Brazil',      flag: '🇧🇷', code: 'BRA' }, away: { name: 'Argentina',   flag: '🇦🇷', code: 'ARG' }, venue: 'AT&T Stadium',            city: 'Dallas',        country: '🇺🇸' },
  { id: 'g4',  date: 'Jun 14', time: '15:00', group: 'B', round: 'Group Stage', home: { name: 'France',      flag: '🇫🇷', code: 'FRA' }, away: { name: 'Germany',     flag: '🇩🇪', code: 'GER' }, venue: 'SoFi Stadium',            city: 'Los Angeles',   country: '🇺🇸' },
  { id: 'g5',  date: 'Jun 15', time: '19:00', group: 'C', round: 'Group Stage', home: { name: 'Spain',       flag: '🇪🇸', code: 'ESP' }, away: { name: 'Portugal',    flag: '🇵🇹', code: 'POR' }, venue: 'Arrowhead Stadium',       city: 'Kansas City',   country: '🇺🇸' },
  { id: 'g6',  date: 'Jun 16', time: '15:00', group: 'C', round: 'Group Stage', home: { name: 'Netherlands', flag: '🇳🇱', code: 'NED' }, away: { name: 'Belgium',     flag: '🇧🇪', code: 'BEL' }, venue: 'Levi\'s Stadium',          city: 'San Francisco', country: '🇺🇸' },
  { id: 'g7',  date: 'Jun 17', time: '19:00', group: 'D', round: 'Group Stage', home: { name: 'Japan',       flag: '🇯🇵', code: 'JPN' }, away: { name: 'South Korea', flag: '🇰🇷', code: 'KOR' }, venue: 'Empower Field',           city: 'Denver',        country: '🇺🇸' },
  { id: 'g8',  date: 'Jun 18', time: '15:00', group: 'D', round: 'Group Stage', home: { name: 'Morocco',     flag: '🇲🇦', code: 'MAR' }, away: { name: 'Senegal',     flag: '🇸🇳', code: 'SEN' }, venue: 'Estadio BBVA',            city: 'Monterrey',     country: '🇲🇽' },
  { id: 'g9',  date: 'Jun 19', time: '19:00', group: 'E', round: 'Group Stage', home: { name: 'Italy',       flag: '🇮🇹', code: 'ITA' }, away: { name: 'Croatia',     flag: '🇭🇷', code: 'CRO' }, venue: 'Mercedes-Benz Stadium',   city: 'Atlanta',       country: '🇺🇸' },
  { id: 'g10', date: 'Jun 20', time: '15:00', group: 'E', round: 'Group Stage', home: { name: 'Uruguay',     flag: '🇺🇾', code: 'URU' }, away: { name: 'Colombia',    flag: '🇨🇴', code: 'COL' }, venue: 'Gillette Stadium',        city: 'Boston',        country: '🇺🇸' },
  { id: 'g11', date: 'Jun 21', time: '19:00', group: 'F', round: 'Group Stage', home: { name: 'Australia',   flag: '🇦🇺', code: 'AUS' }, away: { name: 'Nigeria',     flag: '🇳🇬', code: 'NGA' }, venue: 'BC Place',                city: 'Vancouver',     country: '🇨🇦' },
  { id: 'g12', date: 'Jun 22', time: '15:00', group: 'F', round: 'Group Stage', home: { name: 'Saudi Arabia',flag: '🇸🇦', code: 'KSA' }, away: { name: 'Iran',        flag: '🇮🇷', code: 'IRN' }, venue: 'BMO Field',               city: 'Toronto',       country: '🇨🇦' },
  // Knockout
  { id: 'r16a', date: 'Jul 1',  time: '19:00', round: 'Round of 16',   home: { name: 'TBD', flag: '🏳️', code: 'TBD' }, away: { name: 'TBD', flag: '🏳️', code: 'TBD' }, venue: 'MetLife Stadium',       city: 'New York',    country: '🇺🇸' },
  { id: 'r16b', date: 'Jul 2',  time: '15:00', round: 'Round of 16',   home: { name: 'TBD', flag: '🏳️', code: 'TBD' }, away: { name: 'TBD', flag: '🏳️', code: 'TBD' }, venue: 'SoFi Stadium',          city: 'Los Angeles', country: '🇺🇸' },
  { id: 'qfa',  date: 'Jul 8',  time: '19:00', round: 'Quarter-Final', home: { name: 'TBD', flag: '🏳️', code: 'TBD' }, away: { name: 'TBD', flag: '🏳️', code: 'TBD' }, venue: 'AT&T Stadium',          city: 'Dallas',      country: '🇺🇸' },
  { id: 'sfa',  date: 'Jul 14', time: '19:00', round: 'Semi-Final',    home: { name: 'TBD', flag: '🏳️', code: 'TBD' }, away: { name: 'TBD', flag: '🏳️', code: 'TBD' }, venue: 'MetLife Stadium',       city: 'New York',    country: '🇺🇸' },
  { id: 'final',date: 'Jul 19', time: '18:00', round: 'Final',         home: { name: 'TBD', flag: '🏳️', code: 'TBD' }, away: { name: 'TBD', flag: '🏳️', code: 'TBD' }, venue: 'MetLife Stadium',       city: 'New York',    country: '🇺🇸' },
];

const ROUNDS = ['All', 'Group Stage', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'];
const ROUND_COLORS: Record<string, string> = {
  'Group Stage':  '#2A398D',
  'Round of 16':  '#3CAC3B',
  'Quarter-Final':'#E61D25',
  'Semi-Final':   '#9c27b0',
  'Final':        '#f0a500',
};

// ── Match Card ─────────────────────────────────────────────────────────────────
const MatchCard: React.FC<{ match: Match; index: number }> = ({ match, index }) => {
  const color = ROUND_COLORS[match.round] ?? '#E61D25';
  return (
    <article
      className="glass rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 cursor-default"
      style={{
        animationDelay: `${index * 60}ms`,
        borderTop: `2px solid ${color}55`,
      }}
    >
      {/* Round + date row */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
        >
          {match.round}{match.group ? ` — Group ${match.group}` : ''}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Calendar className="w-3 h-3" />
          {match.date}
          <Clock className="w-3 h-3 ml-1" />
          {match.time}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-3xl">{match.home.flag}</span>
          <span className="font-bold text-sm text-white text-center">{match.home.name}</span>
          <span className="text-xs text-white/40">{match.home.code}</span>
        </div>
        <div className="text-white/20 font-black text-xl">VS</div>
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-3xl">{match.away.flag}</span>
          <span className="font-bold text-sm text-white text-center">{match.away.name}</span>
          <span className="text-xs text-white/40">{match.away.code}</span>
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-1.5 text-xs text-white/40 border-t border-white/5 pt-3">
        <MapPin className="w-3 h-3 shrink-0" />
        <span>{match.venue}, {match.city} {match.country}</span>
      </div>
    </article>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const MatchSchedulePage: React.FC = () => {
  const [activeRound, setActiveRound] = useState('All');

  const filtered = activeRound === 'All'
    ? MATCHES
    : MATCHES.filter((m) => m.round === activeRound);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero header */}
      <div
        className="relative pt-20 pb-14 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(230,29,37,0.12) 0%, rgba(6,13,26,0) 100%)',
        }}
      >
        {/* FIFA stripe */}
        <div className="absolute top-0 left-0 w-full h-1"
          style={{ background: 'linear-gradient(90deg, #E61D25 0%, #2A398D 50%, #3CAC3B 100%)' }} />

        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stadium Copilot
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <BrandLogo size={48} />
            <div>
              <p className="text-[#E61D25] text-xs font-bold uppercase tracking-widest mb-1">FIFA World Cup 2026™</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Match Schedule</h1>
            </div>
          </div>
          <p className="text-white/60 text-lg ml-16 max-w-2xl">
            48 matches across 16 venues in the USA, Mexico &amp; Canada.
            Every game, every moment — all right here.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-8 ml-16">
            {[
              { label: 'Total Matches', value: '48', icon: '⚽' },
              { label: 'Group Stage',   value: '36', icon: '📅' },
              { label: 'Knockout',      value: '12', icon: '🏆' },
              { label: 'Nations',       value: '48', icon: '🌍' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="glass rounded-xl px-4 py-2.5 text-center min-w-[90px]">
                <p className="text-xl font-black gradient-text">{icon} {value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 glass border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto">
          <Filter className="w-4 h-4 text-white/40 shrink-0" />
          {ROUNDS.map((round) => {
            const color = round === 'All' ? '#E61D25' : ROUND_COLORS[round];
            const isActive = activeRound === round;
            return (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
                style={{
                  background: isActive ? `${color}33` : 'transparent',
                  color: isActive ? color : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${isActive ? `${color}55` : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {round}
              </button>
            );
          })}
        </div>
      </div>

      {/* Match grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {activeRound === 'Final' && (
          <div className="text-center mb-10">
            <Trophy className="w-12 h-12 text-[#f0a500] mx-auto mb-3" />
            <h2 className="text-3xl font-extrabold text-[#f0a500]">The Grand Final</h2>
            <p className="text-white/50 mt-1">MetLife Stadium, New York — July 19, 2026</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchSchedulePage;
