import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Send, Loader2, Lightbulb, Siren, TriangleAlert,
  Bot, MapPin, ChevronDown, ExternalLink, Sparkles,
  User, Settings2, Navigation, UtensilsCrossed, Accessibility,
  Ticket, UsersRound, MessageCircle, UserRound, ShieldCheck,
  ClipboardList, HandHeart, Languages,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { postAssistantQuery, tinyfishSearch } from '../api';
import type {
  ChatMessage, Role, Language, Intent, ApiError, TinyfishSearchResult,
} from '../types';

// ── Constants ──────────────────────────────────────────────────────────────────

import type { LucideProps } from 'lucide-react';

type IconComponent = React.FC<LucideProps>;

const ROLES: { value: Role; label: string; Icon: IconComponent }[] = [
  { value: 'fan',       label: 'Fan',       Icon: UserRound    },
  { value: 'volunteer', label: 'Volunteer', Icon: HandHeart    },
  { value: 'staff',     label: 'Staff',     Icon: ShieldCheck  },
  { value: 'organizer', label: 'Organizer', Icon: ClipboardList},
];

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English',    flag: '🇬🇧' },
  { value: 'es', label: 'Español',    flag: '🇪🇸' },
  { value: 'fr', label: 'Français',   flag: '🇫🇷' },
  { value: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { value: 'pt', label: 'Português',  flag: '🇧🇷' },
  { value: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { value: 'ja', label: '日本語',      flag: '🇯🇵' },
  { value: 'zh', label: '中文',        flag: '🇨🇳' },
  { value: 'ko', label: '한국어',      flag: '🇰🇷' },
  { value: 'hi', label: 'हिन्दी',     flag: '🇮🇳' },
];

const ZONES = [
  'Gate A', 'Gate B', 'Gate C', 'Gate D',
  'Section 1', 'Section 2', 'Section 3', 'Section 4',
  'Concourse North', 'Concourse South', 'Concourse East', 'Concourse West',
  'VIP Lounge', 'Media Zone', 'Parking P1', 'Parking P2',
];

const INTENTS: { value: Intent; label: string; color: string; Icon: IconComponent }[] = [
  { value: 'navigation',    label: 'Navigation',    color: '#2A398D', Icon: Navigation       },
  { value: 'emergency',     label: 'Emergency',     color: '#E61D25', Icon: Siren            },
  { value: 'accessibility', label: 'Accessibility', color: '#3CAC3B', Icon: Accessibility    },
  { value: 'ticketing',     label: 'Ticketing',     color: '#7b6cf6', Icon: Ticket           },
  { value: 'food_beverage', label: 'Food & Drinks', color: '#f59e0b', Icon: UtensilsCrossed  },
  { value: 'crowd_info',    label: 'Crowd Info',    color: '#06b6d4', Icon: UsersRound       },
  { value: 'general',       label: 'General',       color: '#D1D4D1', Icon: MessageCircle    },
];

const SUGGESTIONS: { Icon: IconComponent; text: string; color: string }[] = [
  { Icon: Navigation,      text: 'How do I get to Gate B from Section 3?', color: '#2A398D' },
  { Icon: UtensilsCrossed, text: 'Where are the nearest food stalls?',      color: '#f59e0b' },
  { Icon: Accessibility,   text: 'I need wheelchair assistance',             color: '#3CAC3B' },
  { Icon: Siren,           text: 'There is a medical emergency',             color: '#E61D25' },
  { Icon: Ticket,          text: 'My ticket is not scanning',                color: '#7b6cf6' },
  { Icon: MapPin,          text: 'Where is the nearest restroom?',           color: '#06b6d4' },
];

// ── Floating particles (empty state background) ────────────────────────────────
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  color: ['#E61D25', '#2A398D', '#3CAC3B', '#ffffff'][i % 4],
  size: 3 + (i % 3) * 2,
  left: `${(i * 23 + 7) % 90}%`,
  top: `${(i * 31 + 5) % 80}%`,
  delay: `${(i * 0.4) % 2.8}s`,
  duration: `${3 + (i % 4)}s`,
}));

// ── TypingIndicator ────────────────────────────────────────────────────────────
const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3">
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ background: 'linear-gradient(135deg, #E61D25 0%, #2A398D 100%)' }}
      aria-hidden="true"
    >
      <BrandLogo size={18} />
    </div>
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-sm"
      style={{ background: 'rgba(42,57,141,0.15)', border: '1px solid rgba(42,57,141,0.25)' }}
      aria-label="Assistant is typing"
      aria-live="polite"
    >
      <span className="flex gap-1.5">
        <span className="typing-dot" style={{ background: '#7b8fde' }} />
        <span className="typing-dot" style={{ background: '#7b8fde' }} />
        <span className="typing-dot" style={{ background: '#7b8fde' }} />
      </span>
      <span className="text-xs text-[#7b8fde] font-medium">Stadium Copilot is thinking…</span>
    </div>
  </div>
);

// ── MessageBubble ──────────────────────────────────────────────────────────────
interface MessageBubbleProps { msg: ChatMessage; }

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-2.5 ${isUser ? 'msg-user' : 'msg-ai'}`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #E61D25 0%, #2A398D 100%)' }}
          aria-hidden="true"
        >
          <BrandLogo size={18} />
        </div>
      )}

      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} max-w-[78%]`}>
        {/* Bubble */}
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #E61D25 0%, #a81019 100%)',
                  borderRadius: '1rem 1rem 0.25rem 1rem',
                  color: '#fff',
                }
              : {
                  background: 'rgba(42,57,141,0.12)',
                  border: '1px solid rgba(42,57,141,0.22)',
                  borderRadius: '0.25rem 1rem 1rem 1rem',
                  color: 'var(--color-text)',
                }
          }
        >
          {msg.content}
        </div>

        {/* Suggested action */}
        {msg.suggested_action && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs w-full"
            style={{ background: 'rgba(42,57,141,0.1)', border: '1px solid rgba(42,57,141,0.25)', color: '#7b8fde' }}
          >
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {msg.suggested_action}
          </div>
        )}

        {/* Escalated */}
        {msg.escalated && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(230,29,37,0.1)', border: '1px solid rgba(230,29,37,0.3)', color: '#ff7070' }}
            role="alert"
          >
            <Siren className="w-3.5 h-3.5 shrink-0" />
            Escalated to staff
          </div>
        )}

        {/* Sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="flex flex-col gap-1.5 w-full">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 px-1">
              Live Sources
            </p>
            {msg.sources.map((src: TinyfishSearchResult) => (
              <a
                key={src.url}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-card flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-semibold text-white/80 truncate">{src.title || src.url}</span>
                  <span className="text-white/35 truncate">{src.site_name}{src.date ? ` · ${src.date}` : ''}</span>
                </span>
                <ExternalLink className="w-3 h-3 text-white/30 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <time className="text-[10px] text-white/25 px-1" dateTime={msg.timestamp.toISOString()}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>

      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(230,29,37,0.2)', border: '1px solid rgba(230,29,37,0.4)' }}
          aria-hidden="true"
        >
          <User className="w-4 h-4 text-[#E61D25]" />
        </div>
      )}
    </div>
  );
});

// ── SelectPill ──────────────────────────────────────────────────────────────────
interface SelectPillProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  accentColor?: string;
}
const SelectPill: React.FC<SelectPillProps> = ({ id, label, value, onChange, options, accentColor = '#E61D25' }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full text-xs font-medium text-white/80 pr-6 pl-3 py-2 rounded-lg cursor-pointer transition-all"
        style={{
          background: `${accentColor}12`,
          border: `1px solid ${accentColor}30`,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#0e1a30' }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: accentColor }} />
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const ChatPanel: React.FC = () => {
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState('');
  const [role, setRole]             = useState<Role>('fan');
  const [language, setLanguage]     = useState<Language>('en');
  const [zone, setZone]             = useState(ZONES[0]);
  const [intentHint, setIntentHint] = useState<Intent>('general');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  void showSettings; // consumed by the settings toggle button below

  const logRef       = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);

  // Auto-scroll chat log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Panel entrance on mount (ScrollTrigger)
  useGSAP(() => {
    gsap.from(panelRef.current, {
      y: 60, opacity: 0, scale: 0.97, duration: 1, ease: 'power3.out',
      scrollTrigger: {
        trigger: panelRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    // Section header
    const header = containerRef.current?.querySelector('.chat-section-header');
    if (header) {
      gsap.from(header, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 88%' },
      });
    }
  }, { scope: containerRef });

  // GSAP on new message
  useGSAP(
    () => {
      if (messages.length === 0) return;
      const all = logRef.current?.querySelectorAll('.msg-user, .msg-ai');
      if (all && all.length > 0) {
        const last = all[all.length - 1];
        gsap.fromTo(last,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    },
    { scope: containerRef, dependencies: [messages.length] }
  );

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id:        crypto.randomUUID(),
      role:      'user',
      content:   trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const [assistantResult, searchResult] = await Promise.allSettled([
        postAssistantQuery({ message: trimmed, language, role, zone, intent_hint: intentHint }),
        tinyfishSearch(`FIFA 2026 ${trimmed}`),
      ]);

      if (assistantResult.status === 'rejected') throw assistantResult.reason;

      const response = assistantResult.value;
      const sources: TinyfishSearchResult[] =
        searchResult.status === 'fulfilled' && searchResult.value
          ? searchResult.value.results.slice(0, 3)
          : [];

      const assistantMsg: ChatMessage = {
        id:               crypto.randomUUID(),
        role:             'assistant',
        content:          response.reply,
        suggested_action: response.suggested_action,
        escalated:        response.escalated,
        sources,
        timestamp:        new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed'))) {
        setError('Cannot reach the AI backend (http://localhost:8000). Run: cd api && uvicorn main:app --reload');
      } else {
        const apiErr = err as ApiError;
        setError(apiErr.detail ?? 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [input, isLoading, language, role, zone, intentHint]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  const welcomeShown = messages.length === 0 && !isLoading;
  const currentRole  = ROLES.find((r) => r.value === role);
  const currentIntent = INTENTS.find((i) => i.value === intentHint);

  return (
    <section
      id="chat"
      ref={containerRef}
      aria-labelledby="chat-heading"
      className="py-24 px-4"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Section header ──────────────────────────────────────────────── */}
        <div className="chat-section-header text-center mb-12">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-6"
            style={{ background: 'rgba(60,172,59,0.1)', border: '1px solid rgba(60,172,59,0.35)' }}>
            <span className="w-2 h-2 rounded-full bg-[#3CAC3B] animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#3CAC3B]">Live AI Support · FIFA 2026</span>
            <Sparkles className="w-3.5 h-3.5 text-[#3CAC3B]" />
          </div>

          <h2 id="chat-heading" className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
            <span className="gradient-text">AI Assistant</span>
          </h2>
          <p className="text-white/50 text-lg max-w-lg mx-auto leading-relaxed">
            Your intelligent stadium guide — multilingual, role-aware, and always on.
          </p>
        </div>

        {/* ── Main panel (border-beam-wrap) ───────────────────────────────── */}
        <div ref={panelRef} className="border-beam-wrap rounded-3xl">
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(8,15,30,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Aurora tint overlay */}
            <div className="aurora-bg absolute inset-0 rounded-3xl pointer-events-none opacity-60" aria-hidden="true" />

            <div className="relative flex flex-col lg:flex-row min-h-[620px]">

              {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
              <aside
                className="chat-sidebar lg:w-72 shrink-0 p-5 flex flex-col gap-5"
                aria-label="Chat context configuration"
              >
                {/* Model badge */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(230,29,37,0.08)', border: '1px solid rgba(230,29,37,0.2)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#E61D25,#2A398D)' }}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">Stadium Copilot</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Powered by Claude Sonnet</p>
                  </div>
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#3CAC3B] animate-pulse shrink-0" />
                </div>

                {/* Context selectors */}
                <div className="space-y-4">
                  <SelectPill
                    id="chat-role" label="Your Role" value={role}
                    onChange={(v) => setRole(v as Role)}
                    options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
                    accentColor="#E61D25"
                  />
                  <SelectPill
                    id="chat-language" label="Language" value={language}
                    onChange={(v) => setLanguage(v as Language)}
                    options={LANGUAGES.map((l) => ({ value: l.value, label: `${l.flag}  ${l.label}` }))}
                    accentColor="#2A398D"
                  />
                  <SelectPill
                    id="chat-zone" label="Your Zone" value={zone}
                    onChange={(v) => setZone(v)}
                    options={ZONES.map((z) => ({ value: z, label: z }))}
                    accentColor="#3CAC3B"
                  />
                  <SelectPill
                    id="chat-intent" label="Topic" value={intentHint}
                    onChange={(v) => setIntentHint(v as Intent)}
                    options={INTENTS.map((i) => ({ value: i.value, label: i.label }))}
                    accentColor="#7b6cf6"
                  />
                </div>

                {/* Active context summary */}
                <div className="mt-auto flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Active Context</p>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Role tag */}
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                      style={{ background: 'rgba(230,29,37,0.1)', border: '1px solid rgba(230,29,37,0.25)', color: '#ff7070' }}>
                      {currentRole && <currentRole.Icon className="w-2.5 h-2.5" />}
                      {currentRole?.label}
                    </span>
                    {/* Zone tag */}
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                      style={{ background: 'rgba(42,57,141,0.1)', border: '1px solid rgba(42,57,141,0.25)', color: '#7b8fde' }}>
                      <MapPin className="w-2.5 h-2.5" />{zone}
                    </span>
                    {/* Intent tag */}
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                      style={{ background: `${currentIntent?.color ?? '#fff'}15`, border: `1px solid ${currentIntent?.color ?? '#fff'}30`, color: currentIntent?.color ?? '#fff' }}>
                      {currentIntent && <currentIntent.Icon className="w-2.5 h-2.5" />}
                      {currentIntent?.label}
                    </span>
                    {/* Language tag */}
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                      style={{ background: 'rgba(60,172,59,0.1)', border: '1px solid rgba(60,172,59,0.25)', color: '#5ccf5b' }}>
                      <Languages className="w-2.5 h-2.5" />{language.toUpperCase()}
                    </span>
                  </div>
                </div>
              </aside>

              {/* ── RIGHT: CHAT AREA ─────────────────────────────────────── */}
              <div className="chat-main flex-1 flex flex-col">

                {/* Chat header bar */}
                <div className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    {/* Orbiting avatar */}
                    <div className="relative w-9 h-9 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full orbit-ring"
                        style={{ border: '1.5px dashed rgba(230,29,37,0.5)', borderTopColor: 'transparent' }} />
                      <div className="absolute inset-0 rounded-full orbit-ring-reverse"
                        style={{ border: '1px dashed rgba(42,57,141,0.4)', borderBottomColor: 'transparent' }} />
                      <div className="w-7 h-7 rounded-full flex items-center justify-center z-10"
                        style={{ background: 'linear-gradient(135deg,#E61D25,#2A398D)' }}>
                        <BrandLogo size={16} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none">Stadium Copilot</p>
                      <p className="text-[10px] text-[#3CAC3B] mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3CAC3B] inline-block animate-pulse" />
                        Online · Ready
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings((s) => !s)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    aria-label="Toggle settings"
                  >
                    <Settings2 className="w-4 h-4 text-white/30" />
                  </button>
                </div>

                {/* Message log */}
                <div
                  ref={logRef}
                  role="log"
                  aria-live="polite"
                  aria-label="Chat conversation"
                  aria-atomic="false"
                  className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 min-h-[380px] max-h-[480px]"
                >
                  {/* Welcome / empty state */}
                  {welcomeShown && (
                    <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-8 relative">
                      {/* Floating particles */}
                      {PARTICLES.map((p) => (
                        <div
                          key={p.id}
                          className="absolute rounded-full pointer-events-none"
                          aria-hidden="true"
                          style={{
                            width: p.size, height: p.size,
                            background: p.color,
                            left: p.left, top: p.top,
                            animation: `float-particle ${p.duration} ${p.delay} ease-in-out infinite`,
                            opacity: 0.4,
                          }}
                        />
                      ))}

                      {/* Avatar */}
                      <div className="relative z-10" aria-hidden="true">
                        <div className="absolute -inset-3 rounded-3xl opacity-30 animate-ping"
                          style={{ background: 'radial-gradient(circle, #E61D25 0%, transparent 70%)', animationDuration: '2.5s' }} />
                        <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg,#E61D25 0%,#2A398D 100%)', boxShadow: '0 0 40px rgba(230,29,37,0.3)' }}>
                          <BrandLogo size={44} />
                        </div>
                      </div>

                      <div className="z-10">
                        <p className="text-white font-bold text-xl mb-1">Stadium Copilot</p>
                        <p className="text-white/50 text-sm max-w-xs leading-relaxed">
                          Your AI guide for FIFA World Cup 2026™<br />
                          Select a suggestion or type your question.
                        </p>
                      </div>

                      {/* Suggestion chips */}
                      <div className="flex flex-wrap justify-center gap-2 max-w-lg z-10">
                        {SUGGESTIONS.map(({ Icon: SIcon, text, color }) => (
                          <button
                            key={text}
                            onClick={() => { setInput(text); inputRef.current?.focus(); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white
                                       hover:scale-105 transition-all duration-200 cursor-pointer group"
                            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}30` }}
                            title={text}
                          >
                            <span
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                              style={{ background: `${color}18` }}
                            >
                              <SIcon className="w-3.5 h-3.5" style={{ color }} />
                            </span>
                            <span>{text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}

                  {isLoading && <TypingIndicator />}
                </div>

                {/* Error banner */}
                {error && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mx-4 mb-2 flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'rgba(230,29,37,0.08)', border: '1px solid rgba(230,29,37,0.25)', color: '#ff7070' }}
                  >
                    <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Input area */}
                <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex gap-3 items-end">
                    <label htmlFor="chat-input" className="sr-only">Type your message</label>
                    <textarea
                      id="chat-input"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything about the stadium… (Enter to send)"
                      rows={2}
                      disabled={isLoading}
                      aria-disabled={isLoading}
                      className="flex-1 text-sm rounded-xl px-4 py-3 resize-none transition-all duration-200
                                 placeholder:text-white/25 disabled:opacity-50 disabled:cursor-not-allowed text-white/90"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        outline: 'none',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(230,29,37,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(230,29,37,0.08)'; }}
                      onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      id="chat-send-btn"
                      onClick={() => void handleSend()}
                      disabled={isLoading || !input.trim()}
                      aria-label="Send message"
                      aria-busy={isLoading ? 'true' : 'false'}
                      className="p-3.5 rounded-xl font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed
                                 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg,#E61D25 0%,#a81019 100%)' }}
                    >
                      {isLoading
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <Send className="w-5 h-5" />
                      }
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] text-white/20 text-center">
                    Enter to send · Shift+Enter for new line · Powered by Stadium Copilot AI
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ChatPanel;
