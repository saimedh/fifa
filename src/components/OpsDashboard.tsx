import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Siren,
  MapPin,
  Users,
  TrendingUp,
  RefreshCw,
  LogOut,
  TriangleAlert,
  CircleCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { postCrowdAdvisory } from '../api';
import type { CrowdSample, CrowdAdvisory, RiskLevel, ApiError } from '../types';

// ── Constants ──────────────────────────────────────────────────────────────────

const SAMPLE_ZONES: CrowdSample[] = [
  { zone: 'Gate A',          density_pct: 82, flow_rate: 340 },
  { zone: 'Gate B',          density_pct: 45, flow_rate: 180 },
  { zone: 'Concourse North', density_pct: 95, flow_rate: 20  },
  { zone: 'Section 1',       density_pct: 67, flow_rate: 120 },
  { zone: 'Concourse South', density_pct: 30, flow_rate: 200 },
  { zone: 'Parking P1',      density_pct: 15, flow_rate: 450 },
];

import type { LucideProps } from 'lucide-react';

interface RiskMeta {
  label:    string;
  cssClass: string;
  Icon:     React.FC<LucideProps>;
}

const RISK_META: Record<RiskLevel, RiskMeta> = {
  low:      { label: 'Low',      cssClass: 'risk-low',      Icon: ShieldCheck },
  moderate: { label: 'Moderate', cssClass: 'risk-moderate', Icon: ShieldAlert },
  high:     { label: 'High',     cssClass: 'risk-high',     Icon: ShieldX },
  critical: { label: 'Critical', cssClass: 'risk-critical', Icon: Siren },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

interface CounterProps {
  value:   number;
  suffix?: string;
}
const AnimatedCounter: React.FC<CounterProps> = ({ value, suffix = '' }) => {
  const elRef  = useRef<HTMLSpanElement>(null);
  const objRef = useRef({ val: 0 });

  useGSAP(() => {
    gsap.to(objRef.current, {
      val:      value,
      duration: 1.4,
      ease:     'power2.out',
      onUpdate: () => {
        if (elRef.current) {
          elRef.current.textContent = `${Math.round(objRef.current.val)}${suffix}`;
        }
      },
    });
  }, [value]);

  return <span ref={elRef} aria-label={`${value}${suffix}`}>0{suffix}</span>;
};

interface ZoneCardProps {
  advisory:  CrowdAdvisory;
  isLoading: boolean;
}
const ZoneCard: React.FC<ZoneCardProps> = ({ advisory, isLoading }) => {
  const meta    = RISK_META[advisory.risk_level];
  const { Icon } = meta;
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [advisory.risk_level]);

  return (
    <article
      ref={cardRef}
      aria-label={`Zone ${advisory.zone} — ${meta.label} risk`}
      className="glass rounded-2xl p-5 flex flex-col gap-3"
    >
      {/* Zone name + risk badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-[var(--color-text)] text-base leading-tight">
          {advisory.zone}
        </h3>
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                      border shrink-0 ${meta.cssClass}`}
          aria-label={`Risk level: ${meta.label}`}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          {meta.label}
        </span>
      </div>

      {/* Summary */}
      <p className="text-[var(--color-muted)] text-sm leading-relaxed">
        {advisory.summary}
      </p>

      {/* Recommended actions */}
      {advisory.recommended_actions.length > 0 && (
        <ul aria-label="Recommended actions" className="flex flex-col gap-1.5">
          {advisory.recommended_actions.map((action, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-[var(--color-muted)]"
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-orange)] mt-1.5 shrink-0"
                aria-hidden="true"
              />
              {action}
            </li>
          ))}
        </ul>
      )}

      {isLoading && (
        <div className="h-1 rounded-full shimmer mt-1" aria-hidden="true" />
      )}
    </article>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const OpsDashboard: React.FC = () => {
  const [apiKey, setApiKey]             = useState('');
  const [keySubmitted, setKeySubmitted] = useState(false);
  const [advisories, setAdvisories]     = useState<CrowdAdvisory[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const keyInputRef  = useRef<HTMLInputElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);

  const fetchAllAdvisories = useCallback(async (key: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        SAMPLE_ZONES.map((sample) => postCrowdAdvisory(sample, key))
      );
      setAdvisories(results);
      setLastUpdated(new Date());
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? 'Failed to fetch crowd advisories.');
      if (apiErr.status === 401 || apiErr.status === 403) {
        setKeySubmitted(false);
        setApiKey('');
        requestAnimationFrame(() => keyInputRef.current?.focus());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setKeySubmitted(true);
    await fetchAllAdvisories(apiKey);
    requestAnimationFrame(() => firstCardRef.current?.focus());
  };

  useEffect(() => {
    if (!keySubmitted || !apiKey) return;
    const id = setInterval(() => void fetchAllAdvisories(apiKey), 30_000);
    return () => clearInterval(id);
  }, [keySubmitted, apiKey, fetchAllAdvisories]);

  const criticalCount = advisories.filter((a) => a.risk_level === 'critical').length;
  const highCount     = advisories.filter((a) => a.risk_level === 'high').length;

  return (
    <section
      id="ops"
      aria-labelledby="ops-heading"
      className="py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2
            id="ops-heading"
            className="text-3xl sm:text-4xl font-extrabold mb-3"
          >
            <span className="gradient-text">Ops Dashboard</span>
          </h2>
          <p className="text-[var(--color-muted)] text-lg">
            Real-time crowd intelligence — staff access only
          </p>
        </div>

        {/* API Key gate */}
        {!keySubmitted ? (
          <div className="max-w-md mx-auto">
            <form
              id="ops-key-form"
              onSubmit={(e) => void handleKeySubmit(e)}
              aria-label="Staff authentication"
              className="glass rounded-3xl p-8 flex flex-col gap-5"
            >
              <div className="flex flex-col items-center gap-3 mb-2">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  aria-hidden="true"
                >
                  <BrandLogo size={64} />
                </div>
                <h3 className="font-bold text-lg text-[var(--color-text)]">Staff Access Required</h3>
                <p className="text-[var(--color-muted)] text-sm text-center">
                  Enter your staff API key to view live crowd advisories.
                  The key is only stored in memory during this session.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ops-api-key"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Staff API Key
                </label>
                <input
                  id="ops-api-key"
                  ref={keyInputRef}
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-…"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-describedby={error ? 'ops-key-error' : undefined}
                  aria-invalid={!!error}
                  className="bg-[var(--color-surface)] text-[var(--color-text)] text-sm
                             rounded-xl px-4 py-3 border border-white/10
                             placeholder:text-[var(--color-muted)]
                             hover:border-white/20 transition-colors"
                />
                {error && (
                  <p
                    id="ops-key-error"
                    role="alert"
                    className="text-xs text-[var(--color-error)] flex items-center gap-1"
                  >
                    <TriangleAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                id="ops-key-submit"
                disabled={isLoading || !apiKey.trim()}
                aria-busy={isLoading}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                           font-bold text-sm text-white
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:scale-[1.02] active:scale-[0.99]
                           transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #E61D25 0%, #a81019 100%)' }}
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Authenticating…</>
                  : <>Access Dashboard <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                }
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Dashboard header bar */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center
                         justify-between gap-4 mb-6 glass rounded-2xl px-5 py-4"
            >
              <div className="flex items-center gap-4 flex-wrap">
                {criticalCount > 0 && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full
                               risk-critical border text-xs font-bold"
                    role="status"
                    aria-label={`${criticalCount} critical zone${criticalCount > 1 ? 's' : ''}`}
                  >
                    <Siren className="w-3.5 h-3.5" aria-hidden="true" />
                    {criticalCount} Critical
                  </div>
                )}
                {highCount > 0 && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full
                               risk-high border text-xs font-bold"
                    role="status"
                    aria-label={`${highCount} high risk zone${highCount > 1 ? 's' : ''}`}
                  >
                    <ShieldX className="w-3.5 h-3.5" aria-hidden="true" />
                    {highCount} High Risk
                  </div>
                )}
                {criticalCount === 0 && highCount === 0 && advisories.length > 0 && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full
                               risk-low border text-xs font-bold"
                    role="status"
                  >
                    <CircleCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    All Zones Normal
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <p className="text-xs text-[var(--color-muted)]">
                    Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                )}
                <button
                  id="ops-refresh-btn"
                  onClick={() => void fetchAllAdvisories(apiKey)}
                  disabled={isLoading}
                  aria-label="Refresh crowd advisories"
                  aria-busy={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                             border border-white/10 hover:border-white/20
                             text-[var(--color-text)] hover:bg-white/5
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200"
                >
                  {isLoading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Refreshing</>
                    : <><RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Refresh</>
                  }
                </button>
                <button
                  id="ops-logout-btn"
                  onClick={() => {
                    setKeySubmitted(false);
                    setApiKey('');
                    setAdvisories([]);
                    setError(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                             border border-[var(--color-error)]/30
                             bg-[var(--color-error)]/10 text-[var(--color-error)]
                             hover:bg-[var(--color-error)]/20
                             transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-6 flex items-center gap-2 px-5 py-4 rounded-2xl
                           bg-[var(--color-error)]/10 border border-[var(--color-error)]/30
                           text-[var(--color-error)] text-sm"
              >
                <TriangleAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Crowd metrics summary */}
            {advisories.length > 0 && (
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
                aria-label="Overall crowd metrics"
              >
                {[
                  {
                    label: 'Zones Monitored',
                    value: advisories.length,
                    suffix: '',
                    Icon: MapPin,
                  },
                  {
                    label: 'Avg Density',
                    value: Math.round(
                      SAMPLE_ZONES.reduce((s, z) => s + z.density_pct, 0) / SAMPLE_ZONES.length
                    ),
                    suffix: '%',
                    Icon: Users,
                  },
                  {
                    label: 'Critical Zones',
                    value: criticalCount,
                    suffix: '',
                    Icon: Siren,
                  },
                  {
                    label: 'Total Flow',
                    value: SAMPLE_ZONES.reduce((s, z) => s + z.flow_rate, 0),
                    suffix: '/min',
                    Icon: TrendingUp,
                  },
                ].map(({ label, value, suffix, Icon: MetricIcon }) => (
                  <div key={label} className="glass rounded-2xl p-4 text-center">
                    <MetricIcon className="w-6 h-6 text-[#3CAC3B] mx-auto mb-1" aria-hidden="true" />
                    <p className="gradient-text text-2xl font-extrabold leading-none">
                      <AnimatedCounter value={value} suffix={suffix} />
                    </p>
                    <p className="text-[var(--color-muted)] text-xs mt-1">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Zone cards grid */}
            <div
              ref={firstCardRef}
              tabIndex={-1}
              role="region"
              aria-label="Zone crowd advisories"
              aria-live="polite"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {advisories.length === 0 && isLoading && (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-5 h-40 shimmer" aria-hidden="true" />
                ))
              )}
              {advisories.map((advisory) => (
                <ZoneCard key={advisory.zone} advisory={advisory} isLoading={isLoading} />
              ))}
            </div>

            <p className="mt-4 text-xs text-[var(--color-muted)] text-center">
              Auto-refreshes every 30 seconds · Risk levels determined by server-side rules
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default OpsDashboard;
