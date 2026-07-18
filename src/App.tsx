import React, { useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Bot, Shield, Globe, Zap, Mail, MessageCircle, Video, Share2,
  MapPin, Phone, ChevronRight, Heart, Trophy, Map
} from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatPanel from './components/ChatPanel';
import AccessibilityForm from './components/AccessibilityForm';
import BrandLogo from './components/BrandLogo';
import LiveScoresSection from './components/LiveScoresSection';

// ── Pages (code-split — each page is a separate JS chunk) ──────────────────────
const MatchSchedulePage  = lazy(() => import('./pages/MatchSchedulePage'));
const VenuesPage         = lazy(() => import('./pages/VenuesPage'));
const FanGuidePage       = lazy(() => import('./pages/FanGuidePage'));
const MediaCentrePage    = lazy(() => import('./pages/MediaCentrePage'));
const HelpCentrePage     = lazy(() => import('./pages/HelpCentrePage'));
const PlayersPage        = lazy(() => import('./pages/PlayersPage'));
const StadiumPage        = lazy(() => import('./pages/StadiumPage'));
const SocialWallPage     = lazy(() => import('./pages/SocialWallPage'));
const MatchPredictorPage = lazy(() => import('./pages/MatchPredictorPage'));
const BracketPage        = lazy(() => import('./pages/BracketPage'));
const PlayerComparePage  = lazy(() => import('./pages/PlayerComparePage'));

// Register GSAP plugins
gsap.registerPlugin(useGSAP, ScrollTrigger);

// ── Page loading fallback ──────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    aria-label="Loading page"
    aria-busy="true"
  >
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl animate-pulse"
        style={{ background: 'linear-gradient(135deg,#E61D25,#2A398D)' }}
      />
      <p className="text-white/40 text-sm">Loading…</p>
    </div>
  </div>
);

// ── Section divider ────────────────────────────────────────────────────────────
const SectionDivider: React.FC = () => (
  <div aria-hidden="true" className="max-w-7xl mx-auto px-4">
    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

// ── Footer link lists ──────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  platform: [
    { label: 'AI Assistant',      href: '#chat' },
    { label: 'Accessibility',     href: '#accessibility' },
    { label: 'Live Analytics',    href: '#' },
  ],
  tournament: [
    { label: 'Match Schedule',    to: '/schedule' },
    { label: 'Venues & Stadiums', to: '/venues' },
    { label: 'Players',           to: '/players' },
    { label: 'Seat Finder',       to: '/stadium' },
    { label: 'Tournament Bracket', to: '/bracket' },
    { label: 'Match Predictor',   to: '/predictor' },
    { label: 'Player Compare',    to: '/compare' },
    { label: 'Social Wall',       to: '/social' },
    { label: 'Fan Guide',         to: '/fan-guide' },
    { label: 'Media Centre',      to: '/media' },
  ],
  support: [
    { label: 'Help Centre',        to: '/help' },
    { label: 'Accessibility Info', href: '#accessibility' },
    { label: 'Contact Us',         href: 'mailto:support@fifacopilot.ai' },
    { label: 'Privacy Policy',     href: '#' },
  ],
};

const HOST_COUNTRIES = [
  { name: 'United States', venues: '11 Venues' },
  { name: 'Mexico',        venues: '3 Venues'  },
  { name: 'Canada',        venues: '2 Venues'  },
];

const SOCIAL_LINKS = [
  { Icon: MessageCircle, label: 'Twitter / X', href: '#', color: '#1d9bf0' },
  { Icon: Video,         label: 'YouTube',     href: '#', color: '#E61D25' },
  { Icon: Share2,        label: 'Instagram',   href: '#', color: '#e1306c' },
];

const TECH_BADGES = [
  { Icon: Bot,    label: 'Claude Sonnet',    color: '#E61D25' },
  { Icon: Shield, label: 'WCAG AA',          color: '#3CAC3B' },
  { Icon: Globe,  label: 'Multilingual',     color: '#2A398D' },
  { Icon: Zap,    label: 'Real-time AI',     color: '#D1D4D1' },
];

// ── Static style constants (hoisted to avoid re-creating objects each render) ──
const STYLE_FOOTER_GLOW = {
  background: 'radial-gradient(ellipse, rgba(230,29,37,0.07) 0%, transparent 70%)',
  filter: 'blur(40px)',
} as const;

const STYLE_FOOTER_STRIPE = {
  background: 'linear-gradient(90deg, #E61D25 0%, #2A398D 50%, #3CAC3B 100%)',
} as const;

// ── Footer ─────────────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  return (
    <footer role="contentinfo" className="relative overflow-hidden border-t border-white/8">

      {/* Background decorative glows */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 pointer-events-none"
        aria-hidden="true"
        style={STYLE_FOOTER_GLOW}
      />

      {/* FIFA stripe top accent */}
      <div
        className="w-full h-1"
        style={STYLE_FOOTER_STRIPE}
        aria-hidden="true"
      />

      {/* ── Main footer grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <BrandLogo size={38} />
              <div>
                <p className="gradient-text font-extrabold text-xl leading-none">Stadium Copilot</p>
                <p className="text-white/40 text-xs mt-0.5 tracking-wide">FIFA World Cup 2026™</p>
              </div>
            </div>

            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-xs">
              Your AI-powered operations partner for the greatest football
              tournament on Earth — serving fans, staff &amp; organizers across
              3 nations and 16 world-class venues.
            </p>

            {/* Host countries */}
            <div className="flex flex-col gap-2 mb-6">
              {HOST_COUNTRIES.map(({ name, venues }) => (
                <div key={name} className="flex items-center gap-3 text-sm">
                  <Map className="w-4 h-4 text-white/50" />
                  <span className="text-white/70 font-medium">{name}</span>
                  <span className="text-white/35 text-xs">— {venues}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center
                             hover:scale-110 transition-transform duration-200"
                  style={{ borderColor: `${color}33` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </a>
              ))}
              <a
                href="mailto:support@fifacopilot.ai"
                aria-label="Email support"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center
                           hover:scale-110 transition-transform duration-200"
              >
                <Mail className="w-4 h-4 text-white/50" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#E61D25] inline-block" />
              Platform
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.platform.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-white/50 hover:text-white text-sm flex items-center gap-1.5
                               group transition-colors duration-200"
                  >
                    <ChevronRight className="w-3 h-3 text-[#E61D25] group-hover:translate-x-0.5 transition-transform" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tournament links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#2A398D] inline-block" />
              Tournament
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.tournament.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-white/50 hover:text-white text-sm flex items-center gap-1.5
                               group transition-colors duration-200"
                  >
                    <ChevronRight className="w-3 h-3 text-[#2A398D] group-hover:translate-x-0.5 transition-transform" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#3CAC3B] inline-block" />
              Support
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map(({ label, to, href }) => (
                <li key={label}>
                  {to ? (
                    <Link
                      to={to}
                      className="text-white/50 hover:text-white text-sm flex items-center gap-1.5
                                 group transition-colors duration-200"
                    >
                      <ChevronRight className="w-3 h-3 text-[#3CAC3B] group-hover:translate-x-0.5 transition-transform" />
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      className="text-white/50 hover:text-white text-sm flex items-center gap-1.5
                                 group transition-colors duration-200"
                    >
                      <ChevronRight className="w-3 h-3 text-[#3CAC3B] group-hover:translate-x-0.5 transition-transform" />
                      {label}
                    </a>
                  )}
                </li>
              ))}

              {/* Contact info */}
              <div className="mt-6 space-y-2">
                <a href="mailto:support@fifacopilot.ai"
                   className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  support@fifacopilot.ai
                </a>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  USA · Mexico · Canada
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  24/7 AI Support
                </div>
              </div>
            </ul>
          </div>
        </div>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-3 mb-10">
          {TECH_BADGES.map(({ Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: `${color}15`,
                border: `1px solid ${color}30`,
                color,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>
            © 2026 Stadium Copilot. Built for FIFA World Cup 2026™.
            All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-[#E61D25] fill-current" />
            <span>for the beautiful game</span>
            <Trophy className="w-4 h-4 text-[#3CAC3B]" />
          </p>
        </div>
      </div>
    </footer>
  );
};

// ── FIFA Image Gallery ────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  { src: '/images/fifa_hero_banner.png',  alt: 'FIFA World Cup 2026 stadium night', label: 'Opening Night' },
  { src: '/images/news_metlife.png',      alt: 'MetLife Stadium Final',             label: 'The Final Venue' },
  { src: '/images/news_azteca.png',       alt: 'Estadio Azteca opening ceremony',  label: 'Azteca Opening' },
  { src: '/images/news_crowd.png',        alt: 'Record crowd celebrations',         label: 'Record Crowds' },
  { src: '/images/fifa_trophy.png',       alt: 'FIFA World Cup trophy',             label: 'The Trophy' },
  { src: '/images/news_ai.png',           alt: 'AI technology at FIFA 2026',        label: 'AI-Powered Experience' },
];

const LANDING_NEWS = [
  {
    img: '/images/news_metlife.png',
    category: 'Official News', color: '#E61D25',
    date: 'Jul 10, 2026',
    title: 'MetLife Stadium Confirmed as 2026 World Cup Final Venue',
    excerpt: 'FIFA has officially confirmed MetLife Stadium in New York/New Jersey as the grand finale venue.',
    to: '/media',
  },
  {
    img: '/images/news_crowd.png',
    category: 'Tournament Updates', color: '#2A398D',
    date: 'Jul 8, 2026',
    title: 'Record-Breaking Attendance as Group Stage Concludes',
    excerpt: 'Over 3.6 million fans welcomed to stadiums across North America in record-setting group stage.',
    to: '/media',
  },
  {
    img: '/images/news_ai.png',
    category: 'AI & Technology', color: '#3CAC3B',
    date: 'Jul 5, 2026',
    title: 'Stadium Copilot AI Handles 2M+ Fan Queries',
    excerpt: 'The AI assistant has handled over two million fan queries in 10 languages since kick-off.',
    to: '/media',
  },
];

const FifaGallery: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const mosaicRef  = useRef<HTMLDivElement>(null);
  const newsRef    = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Section header reveal
      gsap.from(headerRef.current, {
        y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      });

      // Mosaic stagger
      if (mosaicRef.current) {
        gsap.from(Array.from(mosaicRef.current.children), {
          y: 60, opacity: 0, scale: 0.92, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: mosaicRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        });
      }

      // News cards stagger
      if (newsRef.current) {
        gsap.from(Array.from(newsRef.current.children), {
          y: 50, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: newsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
  <section ref={sectionRef} aria-labelledby="gallery-heading" className="py-20 px-4">
    <div className="max-w-7xl mx-auto">

      {/* ── Section header */}
      <div ref={headerRef} className="text-center mb-12">
        <p className="text-[#E61D25] text-xs font-bold uppercase tracking-widest mb-3">FIFA World Cup 2026™</p>
        <h2 id="gallery-heading" className="text-3xl sm:text-4xl font-extrabold mb-3">
          <span className="gradient-text">Gallery</span>
          <span className="text-white"> &amp; News</span>
        </h2>
        <p className="text-white/50 max-w-xl mx-auto">
          Live moments, iconic venues and the latest from across North America.
        </p>
      </div>

      {/* ── Photo mosaic */}
      <div ref={mosaicRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-16">
        {GALLERY_IMAGES.map(({ src, alt, label }, i) => (
          <div
            key={src}
            className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
              i === 0 ? 'sm:col-span-2 row-span-2' : ''
            }`}
            style={{ minHeight: i === 0 ? '320px' : '150px' }}
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ position: 'absolute', inset: 0, height: '100%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold
                          translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                          transition-all duration-300">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── News strip */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-[#E61D25] inline-block" />
          Latest News
        </h3>
        <Link to="/media"
          className="text-xs font-bold text-[#E61D25] hover:text-white flex items-center gap-1 transition-colors">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div ref={newsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {LANDING_NEWS.map(({ img, category, color, date, title, excerpt, to }) => (
          <Link
            key={title}
            to={to}
            className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 group block"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={img}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a30] via-transparent to-transparent" />
              <span
                className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${color}33`, color, border: `1px solid ${color}55` }}
              >
                {category}
              </span>
            </div>
            <div className="p-5">
              <p className="text-white/35 text-xs mb-2">{date}</p>
              <h4 className="font-bold text-white text-sm leading-snug mb-2 group-hover:text-[#E61D25] transition-colors">{title}</h4>
              <p className="text-white/50 text-xs leading-relaxed">{excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  </section>
  );
};


// ── Landing Page (main scrollable sections) ────────────────────────────────────
const LandingPage: React.FC = () => (
  <>
    <div id="landing-content">
      <Hero />
      <SectionDivider />
      <LiveScoresSection />
      <SectionDivider />
      <ChatPanel />
      <SectionDivider />
      <AccessibilityForm />
      <SectionDivider />
      <FifaGallery />
    </div>
    <Footer />
  </>
);

// ── App ────────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                     focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg
                     focus:bg-[var(--color-focus)] focus:text-black focus:font-bold"
        >
          Skip to main content
        </a>

        <Navbar />

        <main id="main-content" className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"          element={<LandingPage />} />
              <Route path="/schedule"  element={<MatchSchedulePage />} />
              <Route path="/venues"    element={<VenuesPage />} />
              <Route path="/players"   element={<PlayersPage />} />
              <Route path="/stadium"   element={<StadiumPage />} />
              <Route path="/social"    element={<SocialWallPage />} />
              <Route path="/predictor" element={<MatchPredictorPage />} />
              <Route path="/bracket"   element={<BracketPage />} />
              <Route path="/compare"   element={<PlayerComparePage />} />
              <Route path="/fan-guide" element={<FanGuidePage />} />
              <Route path="/media"     element={<MediaCentrePage />} />
              <Route path="/help"      element={<HelpCentrePage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
