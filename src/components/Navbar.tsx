import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Calendar, Building2, Users, Map, Trophy, Bot, Zap, Megaphone, BookOpen, Tv, MessageSquare } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import BrandLogo from './BrandLogo';
import LiveScoreTicker from './LiveScoreTicker';
import { ScrambleHover } from './ui/scramble-hover';

interface NavItem {
  label: string;
  href?: string;
  to?: string;
  id: string;
  children?: { label: string; to: string; Icon: React.FC<any> }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Assistant',     href: '#chat',          id: 'nav-chat' },
  { label: 'Accessibility', href: '#accessibility', id: 'nav-accessibility' },
  {
    label: 'Tournament', id: 'nav-tournament',
    children: [
      { label: 'Match Schedule',    to: '/schedule',  Icon: Calendar },
      { label: 'Venues & Stadiums', to: '/venues',    Icon: Building2 },
      { label: 'Players',           to: '/players',   Icon: Users },
      { label: 'Seat Finder',       to: '/stadium',   Icon: Map },
      { label: 'Bracket',           to: '/bracket',   Icon: Trophy },
      { label: 'AI Predictor',      to: '/predictor', Icon: Bot },
      { label: 'Player Compare',    to: '/compare',   Icon: Zap },
      { label: 'Social Wall',       to: '/social',    Icon: Megaphone },
      { label: 'Fan Guide',         to: '/fan-guide', Icon: BookOpen },
      { label: 'Media Centre',      to: '/media',     Icon: Tv },
      { label: 'Help Centre',       to: '/help',      Icon: MessageSquare },
    ],
  },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef   = useRef<HTMLLIElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navItemsRef = useRef<HTMLUListElement>(null);
  const location = useLocation();

  // Mount slide-in animation
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headerRef.current,
      { y: -80, opacity: 0 },
      { y: 0,   opacity: 1, duration: 0.7 }
    );
    if (navItemsRef.current) {
      tl.fromTo(
        Array.from(navItemsRef.current.children),
        { y: -15, opacity: 0 },
        { y: 0,   opacity: 1, duration: 0.4, stagger: 0.08 },
        '-=0.35'
      );
    }
  }, { scope: headerRef });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setMenuOpen(false); setDropOpen(false); }
  };

  return (
    <header
      ref={headerRef}
      role="banner"
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass py-3' : 'py-5 bg-transparent',
      ].join(' ')}
      onKeyDown={handleKeyDown}
    >
      <nav
        aria-label="Main navigation"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between"
      >
        {/* Logo */}
        <Link
          to="/"
          id="nav-logo"
          className="flex items-center gap-2.5 group"
          aria-label="Stadium Copilot — home"
        >
          <BrandLogo size={36} />
          <span className="font-bold text-lg tracking-tight">
            <span className="gradient-text">Stadium</span>
            <span className="text-[var(--color-text)]"> Copilot</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul ref={navItemsRef} className="hidden md:flex items-center gap-1" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id} className="relative" ref={item.children ? dropRef : undefined}>
              {item.children ? (
                <>
                  <button
                    id={item.id}
                    onClick={() => setDropOpen(!dropOpen)}
                    aria-expanded={dropOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium
                               text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5
                               transition-colors duration-200"
                  >
                    <ScrambleHover
                      scrambleSpeed={40}
                      maxIterations={8}
                      revealDirection="start"
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </ScrambleHover>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {dropOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 w-52 glass rounded-2xl py-2 shadow-2xl"
                      role="menu"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          role="menuitem"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60
                                     hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setDropOpen(false)}
                        >
                          <child.Icon className="w-4 h-4 shrink-0" />
                          <ScrambleHover
                            scrambleSpeed={30}
                            maxIterations={6}
                            revealDirection="start"
                          >
                            {child.label}
                          </ScrambleHover>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <a
                  id={item.id}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-muted)]
                             hover:text-[var(--color-text)] hover:bg-white/5
                             transition-colors duration-200"
                >
                  <ScrambleHover
                    scrambleSpeed={40}
                    maxIterations={8}
                    revealDirection="start"
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </ScrambleHover>
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* FIFA 2026 live badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E61D25]/40 bg-[#E61D25]/10">
          <span className="w-2 h-2 rounded-full bg-[#E61D25] pulse-glow" aria-hidden="true" />
          <span className="text-xs font-semibold text-[#E61D25] tracking-wide uppercase">FIFA 2026</span>
        </div>

        {/* Mobile hamburger */}
        <button
          id="nav-menu-toggle"
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen
            ? <X    className="w-6 h-6 text-[var(--color-text)]" aria-hidden="true" />
            : <Menu className="w-6 h-6 text-[var(--color-text)]" aria-hidden="true" />
          }
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden glass mt-2 mx-4 rounded-xl p-3"
        >
          <ul role="list" className="flex flex-col gap-1">
            <li>
              <a href="/#chat"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}>
                AI Assistant
              </a>
            </li>
            <li>
              <a href="/#accessibility"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}>
                Accessibility
              </a>
            </li>
            <li className="px-4 py-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Tournament</p>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Match Schedule',    to: '/schedule',  Icon: Calendar },
                  { label: 'Venues & Stadiums', to: '/venues',    Icon: Building2 },
                  { label: 'Players',           to: '/players',   Icon: Users },
                  { label: 'Seat Finder',       to: '/stadium',   Icon: Map },
                  { label: 'Bracket',           to: '/bracket',   Icon: Trophy },
                  { label: 'AI Predictor',      to: '/predictor', Icon: Bot },
                  { label: 'Player Compare',    to: '/compare',   Icon: Zap },
                  { label: 'Social Wall',       to: '/social',    Icon: Megaphone },
                  { label: 'Fan Guide',         to: '/fan-guide', Icon: BookOpen },
                  { label: 'Media Centre',      to: '/media',     Icon: Tv },
                  { label: 'Help Centre',       to: '/help',      Icon: MessageSquare },
                ].map(({ label, to, Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60
                               hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 shrink-0" />{label}
                  </Link>
                ))}
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Live score ticker */}
      <div className="relative overflow-hidden">
        <LiveScoreTicker />
      </div>
    </header>
  );
};

export default Navbar;
