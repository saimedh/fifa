// ─── StadiumPage ───────────────────────────────────────────────────────────────
// SVG bird's-eye stadium seat finder with live crowd density overlay.
// Click a section to see directions, facilities, and crowd stats.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Utensils, Toilet, HeartPulse, Accessibility, X, Map, Building2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
type Facility = 'food' | 'restroom' | 'firstaid' | 'accessible';
type Tier = 'lower' | 'upper';

interface Section {
  id: string;
  label: string;
  tier: Tier;
  occupancy: number;        // 0-100
  capacity: number;
  facilities: Facility[];
  nearestGate: string;
  directions: string;
  startAngle: number;
  endAngle: number;
}

interface Venue {
  name: string;
  city: string;
  capacity: number;
  country: string;
  flag: string;
  sections: number;
}

// ── Venue configs ──────────────────────────────────────────────────────────────
const VENUES: Venue[] = [
  { name: 'MetLife Stadium',  city: 'New York / New Jersey', capacity: 82_500, country: 'USA', flag: '', sections: 20 },
  { name: 'AT&T Stadium',     city: 'Arlington, Texas',       capacity: 80_000, country: 'USA', flag: '', sections: 20 },
  { name: 'SoFi Stadium',     city: 'Inglewood, California',  capacity: 70_240, country: 'USA', flag: '', sections: 18 },
];

// ── SVG helpers ────────────────────────────────────────────────────────────────
const CX = 220, CY = 220; // SVG centre

function arcPath(rIn: number, rOut: number, a1: number, a2: number): string {
  const c = Math.cos, s = Math.sin;
  const x1 = CX + rIn  * c(a1), y1 = CY + rIn  * s(a1);
  const x2 = CX + rIn  * c(a2), y2 = CY + rIn  * s(a2);
  const x3 = CX + rOut * c(a2), y3 = CY + rOut * s(a2);
  const x4 = CX + rOut * c(a1), y4 = CY + rOut * s(a1);
  const large = a2 - a1 > Math.PI ? 1 : 0;
  return `M${x1} ${y1} A${rIn} ${rIn} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${rOut} ${rOut} 0 ${large} 0 ${x4} ${y4}Z`;
}

/** Deterministic crowd density based on section index */
function occupancy(idx: number, total: number): number {
  const base = 68 + Math.sin((idx / total) * Math.PI * 3) * 16;
  const noise = ((idx * 13 + 7) % 19) - 9;
  return Math.min(98, Math.max(48, Math.round(base + noise)));
}

function densityColor(occ: number, selected: boolean): string {
  if (selected) return '#60a5fa';
  if (occ < 60)  return '#3CAC3B';
  if (occ < 80)  return '#f59e0b';
  return '#E61D25';
}

function densityOpacity(occ: number): number {
  if (occ < 60) return 0.55;
  if (occ < 80) return 0.65;
  return 0.75;
}

const GATES = ['Gate A (North)', 'Gate B (East)', 'Gate C (South)', 'Gate D (West)'];
const DIRECTIONS: Record<string, string> = {
  'Gate A (North)': 'Head to the North concourse. Take the escalator up one level. Gate A is straight ahead through the main hall.',
  'Gate B (East)':  'Use the East entrance via the pedestrian bridge. Follow the blue signage past the food court to Gate B.',
  'Gate C (South)': 'South Gate is accessible via the main plaza. ADA lifts are available. Follow green floor markings.',
  'Gate D (West)':  'West Gate — use the stadium tunnel entrance. Nearest from the West car park. Follow red signage.',
};

function facilitySet(idx: number): Facility[] {
  const f: Facility[] = ['restroom'];
  if (idx % 4 === 0) f.push('food', 'firstaid');
  else if (idx % 2 === 0) f.push('food');
  if (idx % 7 === 0) f.push('accessible');
  return f;
}

/** Build section data for a venue */
function buildSections(n: number): Section[] {
  const GAP = 0.05;
  const span = (2 * Math.PI) / n;
  return Array.from({ length: n }, (_, i) => {
    const a1 = i * span - Math.PI / 2 + GAP / 2;
    const a2 = (i + 1) * span - Math.PI / 2 - GAP / 2;
    const gate = GATES[Math.floor((i / n) * 4) % 4];
    const occ  = occupancy(i, n);

    const upperA1 = a1;
    const upperA2 = a2;

    // We produce two sections per i: lower and upper
    return [
      {
        id: `L${(i + 1).toString().padStart(2, '0')}`,
        label: `L${i + 1}`,
        tier: 'lower',
        occupancy: occ,
        capacity: Math.round(82_500 / (n * 2)),
        facilities: facilitySet(i),
        nearestGate: gate,
        directions: DIRECTIONS[gate],
        startAngle: a1,
        endAngle:   a2,
      } as Section,
      {
        id: `U${(i + 1).toString().padStart(2, '0')}`,
        label: `U${i + 1}`,
        tier: 'upper',
        occupancy: occupancy(i + n, n * 2),
        capacity: Math.round(82_500 / (n * 2)),
        facilities: facilitySet(i + n),
        nearestGate: gate,
        directions: DIRECTIONS[gate],
        startAngle: upperA1,
        endAngle:   upperA2,
      } as Section,
    ];
  }).flat();
}

// ── Facility icons ─────────────────────────────────────────────────────────────
const FACILITY_ICONS: Record<Facility, { Icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; color: string }> = {
  food:       { Icon: Utensils,     label: 'Food & Drinks', color: '#f59e0b' },
  restroom:   { Icon: Toilet,       label: 'Restrooms',     color: '#60a5fa' },
  firstaid:   { Icon: HeartPulse,   label: 'First Aid',     color: '#E61D25' },
  accessible: { Icon: Accessibility,label: 'Accessible',    color: '#3CAC3B' },
};

// ── Stadium SVG ────────────────────────────────────────────────────────────────
const StadiumSVG: React.FC<{
  sections: Section[];
  selected: Section | null;
  onSelect: (s: Section) => void;
}> = ({ sections, selected, onSelect }) => {
  const lower = sections.filter(s => s.tier === 'lower');
  const upper = sections.filter(s => s.tier === 'upper');

  return (
    <svg
      viewBox="0 0 440 440"
      className="w-full max-w-md mx-auto"
      aria-label="Stadium seating map"
      role="img"
    >
      {/* Stadium outer ring */}
      <ellipse cx={CX} cy={CY} rx={198} ry={198} fill="rgba(14,26,48,0.6)" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

      {/* Upper tier */}
      {upper.map((sec) => (
        <path
          key={sec.id}
          d={arcPath(148, 188, sec.startAngle, sec.endAngle)}
          fill={densityColor(sec.occupancy, selected?.id === sec.id)}
          fillOpacity={densityOpacity(sec.occupancy) * 0.75}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.8"
          style={{ cursor: 'pointer', transition: 'fill 0.2s, fill-opacity 0.2s' }}
          onClick={() => onSelect(sec)}
          aria-label={`${sec.label} – ${sec.occupancy}% full`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelect(sec); }}
        />
      ))}

      {/* Lower tier */}
      {lower.map((sec) => (
        <path
          key={sec.id}
          d={arcPath(96, 142, sec.startAngle, sec.endAngle)}
          fill={densityColor(sec.occupancy, selected?.id === sec.id)}
          fillOpacity={densityOpacity(sec.occupancy)}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="0.8"
          style={{ cursor: 'pointer', transition: 'fill 0.2s, fill-opacity 0.2s' }}
          onClick={() => onSelect(sec)}
          aria-label={`${sec.label} – ${sec.occupancy}% full`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelect(sec); }}
        />
      ))}

      {/* Pitch */}
      <rect x={158} y={168} width={124} height={104} rx="10" fill="#1a5c28" opacity={0.9} />
      {/* Pitch lines */}
      <rect x={158} y={168} width={124} height={104} rx="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <line x1={220} y1={168} x2={220} y2={272} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <circle cx={220} cy={220} r={18} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <circle cx={220} cy={220} r={2.5} fill="rgba(255,255,255,0.8)" />

      {/* Gate labels */}
      {[
        { label: 'N', x: CX,     y: 18  },
        { label: 'E', x: 422,    y: CY  },
        { label: 'S', x: CX,     y: 422 },
        { label: 'W', x: 18,     y: CY  },
      ].map(({ label, x, y }) => (
        <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,255,255,0.35)" fontSize="12" fontWeight="700"
              fontFamily="Inter, sans-serif">
          {label}
        </text>
      ))}

      {/* Tier labels */}
      <text x={CX} y={CY - 114} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Inter,sans-serif">LOWER</text>
      <text x={CX} y={CY - 162} textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="Inter,sans-serif">UPPER</text>
    </svg>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const StadiumPage: React.FC = () => {
  const [venueIdx,  setVenueIdx]  = useState(0);
  const [selected,  setSelected]  = useState<Section | null>(null);
  const venue   = VENUES[venueIdx];
  const sections = useMemo(() => buildSections(venue.sections), [venue.sections]);

  // Live crowd stats
  const live     = sections.filter(s => s.occupancy >= 80).length;
  const avg      = Math.round(sections.reduce((a, s) => a + s.occupancy, 0) / sections.length);
  const occupied = Math.round((avg / 100) * venue.capacity).toLocaleString();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50
                                hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <p className="text-[#E61D25] text-xs font-black uppercase tracking-[0.2em] mb-2">
          FIFA World Cup 2026™
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2">
          <span className="gradient-text">Seat Finder</span>
        </h1>
        <p className="text-white/50 text-sm mb-8">
          Live crowd density · Click any section for directions &amp; facilities
        </p>

        {/* Venue tabs */}
        <div className="flex gap-2 flex-wrap mb-8" role="group" aria-label="Select venue">
          {VENUES.map((v, i) => (
            <button
              key={v.name}
              onClick={() => { setVenueIdx(i); setSelected(null); }}
              aria-pressed={venueIdx === i}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                venueIdx === i
                  ? 'border-[#E61D25]/50 bg-[#E61D25]/15 text-white'
                  : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              <Map className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 opacity-60" />
              {v.name}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Capacity', value: venue.capacity.toLocaleString() },
            { label: 'Occupied', value: occupied },
            { label: 'Avg Density', value: `${avg}%` },
          ].map(({ label, value }) => (
            <div key={label} className="glass rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-white/40 mb-1 font-medium">{label}</p>
              <p className="text-xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* SVG map */}
          <div className="lg:col-span-2">
            <StadiumSVG sections={sections} selected={selected} onSelect={setSelected} />

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              {[
                { color: '#3CAC3B', label: '< 60% (Low)' },
                { color: '#f59e0b', label: '60–80% (Busy)' },
                { color: '#E61D25', label: '> 80% (Full)' },
                { color: '#60a5fa', label: 'Selected' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-white/50">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="glass rounded-2xl overflow-hidden modal-panel">
                {/* Header */}
                <div
                  className="px-5 pt-5 pb-4 flex items-start justify-between"
                  style={{ background: `${densityColor(selected.occupancy, false)}18` }}
                >
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                      {selected.tier === 'lower' ? 'Lower Tier' : 'Upper Tier'}
                    </p>
                    <h2 className="text-2xl font-black text-white">Section {selected.label}</h2>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-7 h-7 rounded-full glass flex items-center justify-center
                               text-white/50 hover:text-white transition-colors"
                    aria-label="Deselect section"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Crowd bar */}
                  <div>
                    <div className="flex justify-between text-xs text-white/50 mb-1.5">
                      <span className="font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Crowd Density
                      </span>
                      <span className="font-black" style={{ color: densityColor(selected.occupancy, false) }}>
                        {selected.occupancy}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${selected.occupancy}%`,
                          background: densityColor(selected.occupancy, false),
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">
                      ~{Math.round((selected.occupancy / 100) * selected.capacity).toLocaleString()} / {selected.capacity.toLocaleString()} seats
                    </p>
                  </div>

                  {/* Nearest gate */}
                  <div className="glass rounded-xl p-3.5">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                      Nearest Gate
                    </p>
                    <p className="text-sm font-bold text-white mb-2">{selected.nearestGate}</p>
                    <p className="text-xs text-white/55 leading-relaxed">{selected.directions}</p>
                  </div>

                  {/* Facilities */}
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                      Nearby Facilities
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selected.facilities.map((f) => {
                        const { Icon, label, color } = FACILITY_ICONS[f];
                        return (
                          <div
                            key={f}
                            className="glass rounded-xl px-3 py-2.5 flex items-center gap-2"
                            style={{ borderColor: `${color}33` }}
                          >
                            <Icon className="w-4 h-4 shrink-0" style={{ color }} aria-hidden />
                            <span className="text-xs text-white/70 font-medium">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center text-white/35">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold text-sm">Click any section on the map</p>
                <p className="text-xs mt-1">to see directions, crowd density &amp; facilities</p>
              </div>
            )}
          </div>
        </div>

        {/* High-density alert */}
        {live > 0 && (
          <div className="mt-8 glass rounded-xl px-5 py-3.5 flex items-center gap-3
                          border border-[#E61D25]/30">
            <span className="live-dot" aria-hidden="true" />
            <p className="text-sm text-white/80">
              <strong className="text-[#E61D25]">{live} sections</strong> are currently over 80% capacity.
              Extra staff deployed. Expect queues at concessions.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default StadiumPage;
