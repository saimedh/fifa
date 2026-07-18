// ─── RadarChart ────────────────────────────────────────────────────────────────
// Pure SVG spider/radar chart. Zero external dependencies.
// ──────────────────────────────────────────────────────────────────────────────
import React from 'react';

export interface RadarStat {
  label: string;
  /** Raw value for player A */
  a: number;
  /** Raw value for player B */
  b: number;
  /** Maximum possible value — used for normalisation (0 → 1) */
  max: number;
}

interface RadarChartProps {
  stats: RadarStat[];
  colorA: string;
  colorB: string;
  nameA: string;
  nameB: string;
  size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
  stats, colorA, colorB, nameA, nameB, size = 280,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.36;          // polygon radius
  const lr = size * 0.47;          // label radius
  const n  = stats.length;

  /** Angle for axis i — 0 points to 12 o'clock, clockwise. */
  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;

  /** Cartesian coords for a value (0-1) on axis i. */
  const pt = (v: number, i: number): [number, number] => [
    cx + r * Math.max(0, Math.min(1, v)) * Math.cos(angle(i)),
    cy + r * Math.max(0, Math.min(1, v)) * Math.sin(angle(i)),
  ];

  const polyStr = (pts: [number, number][]) =>
    pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

  const normA = stats.map((s) => s.a / (s.max || 1));
  const normB = stats.map((s) => s.b / (s.max || 1));
  const ptsA  = normA.map((v, i) => pt(v, i));
  const ptsB  = normB.map((v, i) => pt(v, i));

  /** Concentric grid levels */
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  /** Grid polygon for a given level */
  const gridPts = (level: number) =>
    stats.map((_, i) => pt(level, i));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Radar chart comparing ${nameA} and ${nameB}`}
      role="img"
    >
      {/* Grid rings */}
      {gridLevels.map((lv) => (
        <polygon
          key={lv}
          points={polyStr(gridPts(lv))}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Axis spokes */}
      {stats.map((_, i) => {
        const [ex, ey] = pt(1, i);
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={ex} y2={ey}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
          />
        );
      })}

      {/* Player B filled polygon (behind) */}
      <polygon
        points={polyStr(ptsB)}
        fill={`${colorB}28`}
        stroke={colorB}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity={0.9}
      />

      {/* Player A filled polygon */}
      <polygon
        points={polyStr(ptsA)}
        fill={`${colorA}28`}
        stroke={colorA}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity={0.9}
      />

      {/* Data point dots */}
      {ptsA.map(([x, y], i) => (
        <circle key={`a${i}`} cx={x} cy={y} r={3.5} fill={colorA} />
      ))}
      {ptsB.map(([x, y], i) => (
        <circle key={`b${i}`} cx={x} cy={y} r={3.5} fill={colorB} />
      ))}

      {/* Axis labels */}
      {stats.map((s, i) => {
        const a = angle(i);
        const lx = cx + lr * Math.cos(a);
        const ly = cy + lr * Math.sin(a);
        const anchor =
          Math.abs(Math.cos(a)) < 0.1 ? 'middle'
          : Math.cos(a) > 0 ? 'start'
          : 'end';
        return (
          <text
            key={s.label}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="central"
            fill="rgba(255,255,255,0.55)"
            fontSize="11"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="600"
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
};

export default RadarChart;
