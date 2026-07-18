import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Star, ChevronDown, Globe, Map } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

// ── Venue data ─────────────────────────────────────────────────────────────────
interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  countryFlag: string;
  capacity: string;
  surface: string;
  opened: string;
  matches: number;
  gradient: [string, string];
  features: string[];
  description: string;
}

const VENUES: Venue[] = [
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'New York / New Jersey',
    country: 'USA',
    countryFlag: '🇺🇸',
    capacity: '82,500',
    surface: 'Natural Grass',
    opened: '2010',
    matches: 8,
    gradient: ['#E61D25', '#2A398D'],
    features: ['Final Venue', 'Retractable Roof', 'State-of-the-art LED Lighting'],
    description: 'Home of the 2026 FIFA World Cup Final. One of the largest stadiums in the NFL, reimagined for the world\'s greatest football spectacle.',
  },
  {
    id: 'sofistadium',
    name: 'SoFi Stadium',
    city: 'Los Angeles',
    country: 'USA',
    countryFlag: '🇺🇸',
    capacity: '70,240',
    surface: 'Natural Grass',
    opened: '2020',
    matches: 7,
    gradient: ['#2A398D', '#3CAC3B'],
    features: ['Translucent Roof', 'Infinity Screen', 'Hollywood setting'],
    description: 'The crown jewel of Los Angeles, SoFi Stadium brings Hollywood glamour to the beautiful game with its iconic translucent roof.',
  },
  {
    id: 'att',
    name: 'AT&T Stadium',
    city: 'Dallas',
    country: 'USA',
    countryFlag: '🇺🇸',
    capacity: '80,000',
    surface: 'Natural Grass',
    opened: '2009',
    matches: 7,
    gradient: ['#E61D25', '#3CAC3B'],
    features: ['Retractable Roof', 'World\'s Largest LED Screen', 'Climate Controlled'],
    description: 'Known as "Jerry World," this Texas giant features the world\'s largest high-definition TV screen and a retractable roof.',
  },
  {
    id: 'azteca',
    name: 'Estadio Azteca',
    city: 'Mexico City',
    country: 'Mexico',
    countryFlag: '🇲🇽',
    capacity: '87,523',
    surface: 'Natural Grass',
    opened: '1966',
    matches: 5,
    gradient: ['#3CAC3B', '#2A398D'],
    features: ['Historic Opening Venue', 'Altitude 2,240m', 'UNESCO Heritage'],
    description: 'The only stadium to host two World Cup Finals. Steeped in 60 years of history, Azteca\'s atmosphere is unmatched.',
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    country: 'USA',
    countryFlag: '🇺🇸',
    capacity: '71,000',
    surface: 'FieldTurf',
    opened: '2017',
    matches: 6,
    gradient: ['#474A4A', '#E61D25'],
    features: ['Retractable Pinwheel Roof', 'Bird\'s Eye Halo Board', 'LEED Platinum'],
    description: 'Atlanta\'s architectural marvel with a retractable pinwheel roof and the world\'s largest circular Halo Board.',
  },
  {
    id: 'gillette',
    name: 'Gillette Stadium',
    city: 'Boston',
    country: 'USA',
    countryFlag: '🇺🇸',
    capacity: '65,878',
    surface: 'Natural Grass',
    opened: '2002',
    matches: 5,
    gradient: ['#2A398D', '#E61D25'],
    features: ['New England setting', 'Lighthouse Feature', 'Fan-first Design'],
    description: 'New England\'s fortress, combining the passion of Boston sports culture with FIFA World Cup magic.',
  },
  {
    id: 'levis',
    name: "Levi's Stadium",
    city: 'San Francisco',
    country: 'USA',
    countryFlag: '🇺🇸',
    capacity: '68,500',
    surface: 'Natural Grass',
    opened: '2014',
    matches: 5,
    gradient: ['#D1D4D1', '#2A398D'],
    features: ['Silicon Valley Tech', 'Green Roof', 'Bay Area Views'],
    description: 'Silicon Valley meets the beautiful game at this tech-forward stadium with solar panels and stunning Bay Area scenery.',
  },
  {
    id: 'arrowhead',
    name: 'Arrowhead Stadium',
    city: 'Kansas City',
    country: 'USA',
    countryFlag: '🇺🇸',
    capacity: '76,416',
    surface: 'Natural Grass',
    opened: '1972',
    matches: 5,
    gradient: ['#E61D25', '#474A4A'],
    features: ['Loudest Stadium Record', 'Iconic Open Design', 'Central USA Location'],
    description: 'Holder of the Guinness World Record for loudest stadium, Arrowhead will roar for the World Cup like never before.',
  },
  {
    id: 'empower',
    name: 'Empower Field at Mile High',
    city: 'Denver',
    country: 'USA',
    countryFlag: '🇺🇸',
    capacity: '76,125',
    surface: 'Natural Grass',
    opened: '2001',
    matches: 5,
    gradient: ['#3CAC3B', '#E61D25'],
    features: ['Mile High Altitude', 'Rocky Mountain Views', 'Unique Atmosphere'],
    description: 'At 5,280 feet above sea level, "The Mile High City" offers a uniquely challenging and spectacular World Cup experience.',
  },
  {
    id: 'bc-place',
    name: 'BC Place',
    city: 'Vancouver',
    country: 'Canada',
    countryFlag: '🇨🇦',
    capacity: '54,500',
    surface: 'FieldTurf',
    opened: '1983',
    matches: 5,
    gradient: ['#E61D25', '#3CAC3B'],
    features: ['Retractable Roof', 'Downtown Location', 'Mountain Backdrop'],
    description: 'Set against the stunning North Shore Mountains, BC Place will deliver Canadian hospitality at its finest.',
  },
  {
    id: 'bmo',
    name: 'BMO Field',
    city: 'Toronto',
    country: 'Canada',
    countryFlag: '🇨🇦',
    capacity: '45,400',
    surface: 'Natural Grass',
    opened: '2007',
    matches: 4,
    gradient: ['#2A398D', '#3CAC3B'],
    features: ['Canada\'s Football Home', 'Lake Ontario Views', 'Expanded for 2026'],
    description: 'Canada\'s premier football venue, expanded specifically for FIFA 2026 to welcome the world to Toronto.',
  },
  {
    id: 'estadio-bbva',
    name: 'Estadio BBVA',
    city: 'Monterrey',
    country: 'Mexico',
    countryFlag: '🇲🇽',
    capacity: '53,500',
    surface: 'Natural Grass',
    opened: '2015',
    matches: 4,
    gradient: ['#3CAC3B', '#E61D25'],
    features: ['Cerro de la Silla Backdrop', 'Ultra-Modern Design', 'Cerrejon Green Stadium'],
    description: 'Nestled beneath the iconic Cerro de la Silla mountain, Estadio BBVA is one of the most beautiful settings in world football.',
  },
];

// ── Venue Card ─────────────────────────────────────────────────────────────────
const VenueCard: React.FC<{ venue: Venue; index: number }> = ({ venue, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [g1, g2] = venue.gradient;

  return (
    <article
      className="glass rounded-2xl overflow-hidden hover:scale-[1.015] transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Gradient header */}
      <div
        className="h-24 flex items-end p-4 relative"
        style={{ background: `linear-gradient(135deg, ${g1}44 0%, ${g2}44 100%)` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${g1}22 0%, ${g2}22 100%)` }}
        />
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{venue.country}</span>
          </div>
          <span
            className="text-xs font-black px-2.5 py-1 rounded-full"
            style={{ background: `${g1}33`, color: g1, border: `1px solid ${g1}55` }}
          >
            {venue.matches} Matches
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-extrabold text-white text-lg leading-tight mb-0.5">{venue.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
          <MapPin className="w-3 h-3" />
          {venue.city}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Capacity', value: venue.capacity, icon: <Users className="w-3 h-3" /> },
            { label: 'Surface',  value: venue.surface.split(' ')[0], icon: <Star className="w-3 h-3" /> },
            { label: 'Opened',   value: venue.opened, icon: <Star className="w-3 h-3" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white/5 rounded-lg p-2 text-center">
              <div className="flex justify-center text-white/30 mb-0.5">{icon}</div>
              <p className="text-white text-xs font-bold">{value}</p>
              <p className="text-white/30 text-[10px]">{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {venue.features.map((f) => (
            <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
              {f}
            </span>
          ))}
        </div>

        {/* Expandable description */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Hide details' : 'Show details'}
        </button>
        {expanded && (
          <p className="mt-2 text-sm text-white/55 leading-relaxed">{venue.description}</p>
        )}
      </div>
    </article>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const VenuesPage: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'USA' | 'Mexico' | 'Canada'>('All');
  const filtered = filter === 'All' ? VENUES : VENUES.filter((v) => v.country === filter);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div
        className="relative pt-20 pb-14 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(42,57,141,0.15) 0%, transparent 100%)' }}
      >
        <div className="absolute top-0 left-0 w-full h-1"
          style={{ background: 'linear-gradient(90deg, #E61D25 0%, #2A398D 50%, #3CAC3B 100%)' }} />

        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Stadium Copilot
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <BrandLogo size={48} />
            <div>
              <p className="text-[#2A398D] text-xs font-bold uppercase tracking-widest mb-1">FIFA World Cup 2026™</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Venues &amp; Stadiums</h1>
            </div>
          </div>
          <p className="text-white/60 text-lg ml-16 max-w-2xl">
            16 iconic stadiums. 3 host nations. Across more than 3,000 miles of North America.
          </p>

          {/* Country filter */}
          <div className="flex gap-3 mt-8 ml-16">
            {(['All', 'USA', 'Mexico', 'Canada'] as const).map((c) => {
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className="text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: filter === c ? '#2A398D44' : 'rgba(255,255,255,0.05)',
                    color: filter === c ? '#7b8fde' : 'rgba(255,255,255,0.45)',
                    border: `1px solid ${filter === c ? '#2A398D66' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {c !== 'All' && <Map className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
                  {c} {c !== 'All' && `(${VENUES.filter(v => v.country === c).length})`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Venues grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VenuesPage;
