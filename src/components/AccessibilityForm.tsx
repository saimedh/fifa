import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';

import { useGSAP } from '@gsap/react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Accessibility,
  Eye,
  Ear,
  PersonStanding,
  HeartPulse,
  CircleHelp,
  TriangleAlert,
  CircleCheck,
  Loader2,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { postAccessibilityRequest } from '../api';
import type { AccessibilityKind, ApiError } from '../types';

// ── Constants ──────────────────────────────────────────────────────────────────

import type { LucideProps } from 'lucide-react';

interface KindOption {
  value: AccessibilityKind;

  label: string;
  Icon: React.FC<LucideProps>;
  color: string;
  bg: string;
}

const KIND_OPTIONS: KindOption[] = [
  { value: 'wheelchair',         label: 'Wheelchair',         Icon: Accessibility,   color: '#74b9ff', bg: 'rgba(116,185,255,0.12)' },
  { value: 'visual_impairment',  label: 'Visual Impairment',  Icon: Eye,             color: '#a29bfe', bg: 'rgba(162,155,254,0.12)' },
  { value: 'hearing_impairment', label: 'Hearing Impairment', Icon: Ear,             color: '#55efc4', bg: 'rgba(85,239,196,0.12)' },
  { value: 'mobility',           label: 'Mobility',           Icon: PersonStanding,  color: '#fdcb6e', bg: 'rgba(253,203,110,0.12)' },
  { value: 'medical',            label: 'Medical',            Icon: HeartPulse,      color: '#ff7675', bg: 'rgba(255,118,117,0.12)' },
  { value: 'other',              label: 'Other',              Icon: CircleHelp,      color: '#b2bec3', bg: 'rgba(178,190,195,0.12)' },
];

const ZONES = [
  '',
  'Gate A', 'Gate B', 'Gate C', 'Gate D',
  'Section 1', 'Section 2', 'Section 3', 'Section 4',
  'Concourse North', 'Concourse South', 'Concourse East', 'Concourse West',
  'VIP Lounge', 'Media Zone', 'Parking P1', 'Parking P2',
];

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface FormState {
  kind: AccessibilityKind;
  zone: string;
  details: string;
  contact: string;
}

interface FormErrors {
  zone?: string;
  details?: string;
  contact?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

const AccessibilityForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    kind:    'wheelchair',
    zone:    '',
    details: '',
    contact: '',
  });
  const [errors, setErrors]       = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const firstErrorRef = useRef<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement | null>(null);
  const sectionRef    = useRef<HTMLElement>(null);

  // Scroll-triggered entrance
  useGSAP(() => {
    gsap.from(sectionRef.current, {
      y: 60, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
    });
  }, { scope: sectionRef });

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.zone.trim())    errs.zone    = 'Please select your zone.';
    if (!form.contact.trim()) errs.contact = 'Contact information is required.';
    return errs;
  };

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      requestAnimationFrame(() => firstErrorRef.current?.focus());
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const ticket = await postAccessibilityRequest({
        kind:    form.kind,
        zone:    form.zone,
        details: form.details,
        contact: form.contact,
      });

      setForm({ kind: 'wheelchair', zone: '', details: '', contact: '' });

      toast.custom((t) => (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={[
            'flex items-start gap-3 px-5 py-4 rounded-2xl glass border',
            'border-[var(--color-success)]/30 max-w-sm',
            t.visible ? 'fade-up' : 'opacity-0',
          ].join(' ')}
        >
          <CircleCheck className="w-6 h-6 text-[var(--color-success)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold text-[var(--color-success)] text-sm">Ticket Created!</p>
            <p className="text-[var(--color-muted)] text-xs mt-0.5">
              Ticket #{ticket.ticket_id} · ETA: {ticket.eta_minutes} min
            </p>
            <p className="text-[var(--color-muted)] text-xs">Status: {ticket.status}</p>
          </div>
        </div>
      ), { duration: 6000 });

    } catch (err) {
      const apiErr = err as ApiError;
      toast.custom((t) => (
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={[
            'flex items-start gap-3 px-5 py-4 rounded-2xl glass border',
            'border-[var(--color-error)]/30 max-w-sm',
            t.visible ? 'fade-up' : 'opacity-0',
          ].join(' ')}
        >
          <TriangleAlert className="w-6 h-6 text-[var(--color-error)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold text-[var(--color-error)] text-sm">Request Failed</p>
            <p className="text-[var(--color-muted)] text-xs mt-0.5">
              {apiErr.detail ?? 'Something went wrong. Please try again.'}
            </p>
          </div>
        </div>
      ), { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedKind = KIND_OPTIONS.find((k) => k.value === form.kind)!;

  return (
    <section
      ref={sectionRef}
      id="accessibility"
      aria-labelledby="accessibility-heading"
      className="py-20 px-4"
    >
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-5">
            <ShieldCheck className="w-4 h-4 text-[#3CAC3B]" aria-hidden="true" />
            <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">FIFA 2026 Services</span>
          </div>
          <h2
            id="accessibility-heading"
            className="text-3xl sm:text-4xl font-extrabold mb-3"
          >
            <span className="gradient-text">Accessibility</span>{' '}
            <span className="text-[var(--color-text)]">Support</span>
          </h2>
          <p className="text-[var(--color-muted)] text-lg max-w-lg mx-auto">
            Request immediate assistance — a dedicated staff member will reach you within minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── Info panel ──────────────────────────────────────── */}
          <aside className="lg:col-span-2 flex flex-col gap-4">
            {/* Response stats */}
            <div className="glass rounded-2xl p-6 border border-white/7">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-[#3CAC3B] animate-pulse" />
                <span className="text-xs font-semibold text-[#3CAC3B] uppercase tracking-widest">Live Support Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { Icon: Clock,      label: 'Avg Response', value: '< 5 min' },
                  { Icon: ShieldCheck, label: 'Availability', value: '24 / 7' },
                  { Icon: MapPin,     label: 'Coverage',     value: 'All Zones' },
                  { Icon: Phone,      label: 'Staff On Call', value: '200+' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <Icon className="w-4 h-4 text-white/30" aria-hidden="true" />
                    <p className="text-white font-bold text-sm">{value}</p>
                    <p className="text-white/35 text-[10px] uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected kind preview */}
            <div
              className="glass rounded-2xl p-6 border transition-all duration-300"
              style={{ borderColor: `${selectedKind.color}33` }}
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Selected Assistance</p>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: selectedKind.bg, border: `1px solid ${selectedKind.color}44` }}
                >
                  <selectedKind.Icon className="w-7 h-7" style={{ color: selectedKind.color }} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">{selectedKind.label}</p>
                  <p className="text-white/40 text-xs mt-1">Tap a category to change</p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="glass rounded-2xl p-6 border border-white/7">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">How It Works</p>
              {[
                { step: '01', text: 'Select your assistance type and location' },
                { step: '02', text: 'Submit the request with your contact info' },
                { step: '03', text: 'Staff dispatched to your zone within minutes' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3 mb-4 last:mb-0">
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 mt-0.5"
                    style={{ background: 'rgba(230,29,37,0.15)', color: '#E61D25', border: '1px solid rgba(230,29,37,0.3)' }}
                  >
                    {step}
                  </span>
                  <p className="text-white/55 text-sm leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Form ──────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {/* Gradient header bar */}
            <div
              className="rounded-t-3xl px-8 py-6 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(42,57,141,0.6) 0%, rgba(6,13,26,0.4) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(42,57,141,0.4)', border: '1px solid rgba(42,57,141,0.6)' }}
              >
                <Accessibility className="w-6 h-6 text-[#8fa0e8]" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Request Assistance</h3>
                <p className="text-white/40 text-xs">Complete the form below to get help instantly</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 ml-auto" aria-hidden="true" />
            </div>

            <form
              id="accessibility-form"
              onSubmit={(e) => void handleSubmit(e)}
              noValidate
              aria-label="Accessibility support request form"
              className="glass rounded-b-3xl p-6 sm:p-8 flex flex-col gap-6"
              style={{ borderTop: 'none', borderRadius: '0 0 1.5rem 1.5rem' }}
            >
              {/* Kind selector */}
              <div className="flex flex-col gap-2">
                <label
                  id="acc-kind-label"
                  htmlFor="acc-kind"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Type of Assistance <span aria-hidden="true" className="text-[var(--color-accent-orange)]">*</span>
                </label>
                <div
                  role="group"
                  aria-labelledby="acc-kind-label"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                >
                  {KIND_OPTIONS.map(({ value, label, Icon, color, bg }) => {
                    const isActive = form.kind === value;
                    return (
                      <button
                        type="button"
                        key={value}
                        id={`kind-${value}`}
                        onClick={() => handleChange('kind', value)}
                        aria-pressed={isActive}
                        className={[
                          'flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-semibold',
                          'border transition-all duration-200',
                          isActive
                            ? 'scale-[1.02] shadow-lg'
                            : 'border-white/8 bg-white/3 text-white/50 hover:border-white/15 hover:text-white/80 hover:bg-white/5',
                        ].join(' ')}
                        style={isActive ? {
                          background: bg,
                          borderColor: `${color}55`,
                          color,
                        } : {}}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={isActive ? {
                            background: `${color}22`,
                            border: `1px solid ${color}44`,
                          } : { background: 'rgba(255,255,255,0.05)' }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: isActive ? color : undefined }}
                            aria-hidden="true"
                          />
                        </div>
                        <span className="leading-tight text-center">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zone */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="acc-zone"
                  className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-white/30" aria-hidden="true" />
                  Your Zone <span aria-hidden="true" className="text-[var(--color-accent-orange)]">*</span>
                </label>
                <select
                  id="acc-zone"
                  ref={errors.zone ? (el) => { firstErrorRef.current = el; } : undefined}
                  value={form.zone}
                  onChange={(e) => handleChange('zone', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.zone}
                  aria-describedby={errors.zone ? 'acc-zone-error' : undefined}
                  className={[
                    'bg-[var(--color-surface)] text-[var(--color-text)] text-sm',
                    'rounded-xl px-4 py-3 border transition-colors',
                    errors.zone
                      ? 'border-[var(--color-error)] bg-[var(--color-error)]/5'
                      : 'border-white/10 hover:border-white/20',
                  ].join(' ')}
                >
                  <option value="">— Select your zone —</option>
                  {ZONES.slice(1).map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
                {errors.zone && (
                  <p
                    id="acc-zone-error"
                    role="alert"
                    className="text-xs text-[var(--color-error)] flex items-center gap-1"
                  >
                    <TriangleAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {errors.zone}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="acc-details"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Additional Details
                  <span className="text-[var(--color-muted)] font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  id="acc-details"
                  rows={3}
                  value={form.details}
                  onChange={(e) => handleChange('details', e.target.value)}
                  placeholder="Describe your situation or any specific needs…"
                  className="bg-[var(--color-surface)] text-[var(--color-text)] text-sm
                             rounded-xl px-4 py-3 border border-white/10 resize-none
                             placeholder:text-[var(--color-muted)]
                             hover:border-white/20 transition-colors"
                />
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="acc-contact"
                  className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-white/30" aria-hidden="true" />
                  Contact Info <span aria-hidden="true" className="text-[var(--color-accent-orange)]">*</span>
                </label>
                <input
                  id="acc-contact"
                  type="text"
                  ref={!errors.zone && errors.contact ? (el) => { firstErrorRef.current = el; } : undefined}
                  value={form.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  placeholder="Phone number or seat number"
                  aria-required="true"
                  aria-invalid={!!errors.contact}
                  aria-describedby={errors.contact ? 'acc-contact-error' : undefined}
                  className={[
                    'bg-[var(--color-surface)] text-[var(--color-text)] text-sm',
                    'rounded-xl px-4 py-3 border transition-colors',
                    'placeholder:text-[var(--color-muted)]',
                    errors.contact
                      ? 'border-[var(--color-error)] bg-[var(--color-error)]/5'
                      : 'border-white/10 hover:border-white/20',
                  ].join(' ')}
                />
                {errors.contact && (
                  <p
                    id="acc-contact-error"
                    role="alert"
                    className="text-xs text-[var(--color-error)] flex items-center gap-1"
                  >
                    <TriangleAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {errors.contact}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="acc-submit-btn"
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full py-4 rounded-2xl font-bold text-base text-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]
                           transition-all duration-200 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #2A398D 0%, #1c2a70 100%)' }}
              >
                {/* Shimmer layer */}
                <span className="absolute inset-0 shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                {isLoading ? (
                  <span className="relative flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Submitting…
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
                    <Accessibility className="w-5 h-5" aria-hidden="true" />
                    Request Assistance
                    <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccessibilityForm;
