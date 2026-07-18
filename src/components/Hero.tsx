import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Bot, Accessibility, BarChart3, ArrowRight, Play } from 'lucide-react';
import BrandLogo from './BrandLogo';

// ── Feature pills ──────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Bot,           label: 'AI Assistant',  desc: 'Role-aware, multilingual', color: '#E61D25' },
  { Icon: Accessibility, label: 'Accessibility', desc: 'Instant support requests', color: '#2A398D' },
  { Icon: BarChart3,     label: 'Ops Dashboard', desc: 'Live crowd intelligence',  color: '#3CAC3B' },
];

const STATS = [
  { value: '48',   label: 'Matches',   suffix: '' },
  { value: '16',   label: 'Venues',    suffix: '' },
  { value: '3',    label: 'Countries', suffix: '' },
  { value: '3.6M', label: 'Fans',      suffix: '+' },
];

// ── Animated counter ───────────────────────────────────────────────────────────
const AnimatedStat: React.FC<{ value: string; label: string; suffix: string; delay: number }> = ({
  value, label, suffix, delay,
}) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="glass rounded-2xl p-5 text-center hover:scale-105 transition-transform duration-300"
    >
      <p
        className="gradient-text text-3xl sm:text-4xl font-extrabold leading-none mb-1 tabular-nums"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        }}
      >
        {value}{suffix}
      </p>
      <p className="text-[var(--color-muted)] text-sm font-medium tracking-wide uppercase">{label}</p>
    </div>
  );
};

// ── CSS-animated stadium background — no iframe, always works ─────────────────
const StadiumBackground: React.FC = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">

    {/* Real stadium photo background */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'url(/images/fifa_hero_banner.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
      }}
    />
    {/* Dark overlay to keep text legible and blend with CSS effects */}
    <div className="absolute inset-0" style={{ background: 'rgba(6,13,26,0.62)' }} />

    {/* Pitch green glow at bottom */}
    <div
      className="absolute bottom-0 left-0 w-full h-1/2"
      style={{
        background: 'linear-gradient(to top, rgba(26,80,26,0.55) 0%, rgba(20,60,20,0.20) 60%, transparent 100%)',
      }}
    />

    {/* Centre-circle outline */}
    <div
      className="absolute"
      style={{
        bottom: '8%', left: '50%', transform: 'translateX(-50%)',
        width: '340px', height: '170px',
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.07)',
        boxShadow: '0 0 80px 20px rgba(60,172,59,0.10)',
      }}
    />
    {/* Centre spot */}
    <div
      className="absolute rounded-full"
      style={{
        bottom: '18%', left: '50%', transform: 'translateX(-50%)',
        width: '8px', height: '8px',
        background: 'rgba(255,255,255,0.12)',
      }}
    />

    {/* Stadium arch / roof silhouette */}
    <div
      className="absolute top-0 left-1/2"
      style={{
        transform: 'translateX(-50%)',
        width: '110%', height: '55%',
        border: '2px solid rgba(255,255,255,0.04)',
        borderBottom: 'none',
        borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
        boxShadow: 'inset 0 -40px 120px rgba(42,57,141,0.10)',
      }}
    />

    {/* Floodlights ── 4 towers */}
    {[
      { top: '4%',  left: '7%',   size: 140, d: '0s',   a: 'floodlight1' },
      { top: '4%',  right: '7%',  size: 140, d: '0s',   a: 'floodlight2' },
      { top: '2%',  left: '28%',  size: 100, d: '1.2s', a: 'floodlight2' },
      { top: '2%',  right: '28%', size: 100, d: '1.2s', a: 'floodlight1' },
    ].map((fl, i) => (
      <div key={i} className="absolute" style={{ top: fl.top, left: (fl as any).left, right: (fl as any).right }}>
        <div style={{
          width: '3px', height: i < 2 ? '120px' : '90px',
          background: 'rgba(255,255,255,0.09)', margin: '0 auto',
        }} />
        <div style={{
          width: `${fl.size}px`, height: `${fl.size}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,240,180,0.22) 0%, transparent 70%)',
          filter: 'blur(18px)',
          marginLeft: `-${fl.size / 2 - 1}px`, marginTop: '-18px',
          animation: `${fl.a} ${5 + i}s ease-in-out ${fl.d} infinite alternate`,
        }} />
      </div>
    ))}

    {/* Crowd glow — left stand (red) */}
    <div className="absolute" style={{
      top: '28%', left: '-5%', width: '42%', height: '42%',
      background: 'radial-gradient(ellipse, rgba(230,29,37,0.13) 0%, transparent 70%)',
      filter: 'blur(35px)',
      animation: 'crowdGlowLeft 4s ease-in-out infinite alternate',
    }} />

    {/* Crowd glow — right stand (blue) */}
    <div className="absolute" style={{
      top: '28%', right: '-5%', width: '42%', height: '42%',
      background: 'radial-gradient(ellipse, rgba(42,57,141,0.20) 0%, transparent 70%)',
      filter: 'blur(35px)',
      animation: 'crowdGlowRight 5s ease-in-out infinite alternate-reverse',
    }} />

    {/* Pitch ambient green glow */}
    <div className="absolute" style={{
      bottom: '0', left: '50%', transform: 'translateX(-50%)',
      width: '70%', height: '32%',
      background: 'radial-gradient(ellipse, rgba(60,172,59,0.18) 0%, transparent 70%)',
      filter: 'blur(40px)',
      animation: 'pitchGlow 6s ease-in-out infinite alternate',
    }} />

    {/* Floating confetti / crowd sparks */}
    {[...Array(20)].map((_, i) => (
      <div key={i} className="absolute rounded-full" style={{
        width:  `${2 + (i % 3)}px`,
        height: `${2 + (i % 3)}px`,
        left:   `${(i * 19 + 3) % 96}%`,
        top:    `${(i * 27 + 8) % 88}%`,
        background: ['#E61D25', '#2A398D', '#3CAC3B', '#D1D4D1', '#ffffff'][i % 5],
        opacity: 0.20 + (i % 4) * 0.08,
        animation: `spark${(i % 3) + 1} ${4 + (i % 5)}s ease-in-out ${(i * 0.35) % 3}s infinite alternate`,
      }} />
    ))}

    {/* Star-field overlay */}
    <div className="star-field" />

    {/* Cinematic vignette */}
    <div className="absolute inset-0" style={{
      background: `linear-gradient(to bottom,
        rgba(6,13,26,0.50) 0%,
        rgba(6,13,26,0.18) 30%,
        rgba(6,13,26,0.52) 72%,
        rgba(6,13,26,0.94) 100%)`,
    }} />

    {/* FIFA tricolor stripe top */}
    <div className="absolute top-0 left-0 w-full h-1 z-10"
      style={{ background: 'linear-gradient(90deg, #E61D25 0%, #2A398D 50%, #3CAC3B 100%)' }}
    />
  </div>
);

// ── Hero ───────────────────────────────────────────────────────────────────────
const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const subRef       = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const statsRef     = useRef<HTMLDivElement>(null);
  const featuresRef  = useRef<HTMLDivElement>(null);
  const badgeRef     = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(badgeRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });

    if (headlineRef.current) {
      const words = headlineRef.current.querySelectorAll('.word');
      tl.fromTo(words, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.15 }, '-=0.3');
    }
    tl.fromTo(subRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5');
    tl.fromTo(ctaRef.current, { y: 24, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6 }, '-=0.4');

    if (statsRef.current) {
      tl.fromTo(
        statsRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=0.3'
      );
    }
    if (featuresRef.current) {
      tl.fromTo(
        featuresRef.current.children,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=0.2'
      );
    }
  }, { scope: containerRef });

  const headlineWords = [
    { text: 'AI-Powered', gradient: true  },
    { text: 'Stadium',    gradient: false },
    { text: 'Copilot',    gradient: false },
  ];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center
                 overflow-hidden px-4 pt-24 pb-20"
      aria-labelledby="hero-heading"
    >
      {/* ── Stadium animated background ──────────────────────────────── */}
      <StadiumBackground />

      {/* ── Content stack ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">

        {/* FIFA 2026 badge */}
        <div
          ref={badgeRef}
          className="mb-8 flex items-center gap-3 px-5 py-2.5 rounded-full
                     border border-[#E61D25]/50 bg-[#E61D25]/10
                     text-xs font-bold tracking-widest uppercase text-[#E61D25]
                     backdrop-blur-sm shadow-lg"
        >
          <BrandLogo size={22} />
          <span>FIFA World Cup 2026™ — Official GenAI Platform</span>
        </div>

        {/* Main headline */}
        <h1
          id="hero-heading"
          ref={headlineRef}
          className="text-center font-extrabold tracking-tight leading-none mb-6
                     text-5xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-2xl"
        >
          {headlineWords.map(({ text, gradient }, i) => (
            <span key={i} className="word inline-block mr-4 last:mr-0">
              {gradient
                ? <span className="gradient-text">{text}</span>
                : <span className="text-white">{text}</span>
              }
            </span>
          ))}
        </h1>

        {/* Sub-headline */}
        <p
          ref={subRef}
          className="text-center text-white/70 text-lg sm:text-xl md:text-2xl
                     max-w-2xl mb-10 leading-relaxed drop-shadow-md"
        >
          Instant AI assistance for fans, volunteers, staff &amp; organizers —
          <span className="text-[#3CAC3B] font-semibold"> multilingual</span>,
          <span className="text-[#E61D25] font-semibold"> role-aware</span>,
          <span className="text-[#7b8fde] font-semibold"> real-time</span>.
        </p>

        {/* CTA buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mb-14">
          <a
            id="hero-cta-primary"
            href="#chat"
            className="flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl
                       font-bold text-base text-white transition-all duration-300
                       hover:scale-105 hover:shadow-2xl pulse-glow"
            style={{ background: 'linear-gradient(135deg, #E61D25 0%, #a81019 100%)' }}
          >
            <Bot className="w-5 h-5" aria-hidden="true" />
            Ask the AI Assistant
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>

          <a
            id="hero-cta-secondary"
            href="#accessibility"
            className="flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl
                       font-bold text-base border border-[#2A398D]/60
                       bg-[#2A398D]/20 text-[#7b8fde] backdrop-blur-sm
                       hover:bg-[#2A398D]/35 hover:scale-105 transition-all duration-300"
          >
            <Accessibility className="w-5 h-5" aria-hidden="true" />
            Accessibility Support
          </a>

          <a
            id="hero-cta-video"
            href="#chat"
            className="flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl
                       font-bold text-base border border-white/20
                       bg-white/10 text-white backdrop-blur-sm
                       hover:bg-white/20 hover:scale-105 transition-all duration-300"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            Watch Highlights
          </a>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 w-full"
          aria-label="Tournament statistics"
        >
          {STATS.map(({ value, label, suffix }, i) => (
            <AnimatedStat key={label} value={value} label={label} suffix={suffix} delay={i * 100} />
          ))}
        </div>

        {/* Feature pills */}
        <div
          ref={featuresRef}
          className="flex flex-wrap justify-center gap-3"
          aria-label="Platform features"
        >
          {FEATURES.map(({ Icon, label, desc, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-5 py-3 glass rounded-xl
                         hover:scale-105 transition-transform duration-300 cursor-default"
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}
              >
                <Icon className="w-4 h-4" style={{ color }} aria-hidden="true" />
              </span>
              <span>
                <span className="text-sm font-semibold text-white block">{label}</span>
                <span className="text-xs text-white/50">{desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10" aria-hidden="true">
        <span className="text-xs text-white/40 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
