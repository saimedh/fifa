import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ticket, Train, MapPin, Heart, AlertCircle, Smartphone, ChevronDown, ChevronRight } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

// ── Data ───────────────────────────────────────────────────────────────────────
interface FaqItem {
  q: string;
  a: string;
}

interface Section {
  id: string;
  Icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  title: string;
  subtitle: string;
  faqs: FaqItem[];
  tips: string[];
}

const SECTIONS: Section[] = [
  {
    id: 'tickets',
    Icon: Ticket,
    color: '#E61D25',
    title: 'Ticketing',
    subtitle: 'Everything you need to know about purchasing, transferring and presenting your tickets.',
    tips: ['Buy only from FIFA official channels to avoid fraud', 'Download tickets to your phone before matchday', 'Arrive at least 90 minutes before kick-off'],
    faqs: [
      { q: 'How do I buy tickets?', a: 'All tickets are sold exclusively through the FIFA Ticketing portal at tickets.fifa.com. No physical tickets are issued — all tickets are digital.' },
      { q: 'Can I transfer my ticket?', a: 'Yes, tickets can be transferred to another FIFA+ account holder up to 24 hours before the match. Both parties must be registered.' },
      { q: 'What ID do I need?', a: 'The ticket holder must present a valid government-issued photo ID (passport, driver\'s license) matching the name on the ticket.' },
      { q: 'What if I lose my phone?', a: 'Visit the Ticket Help Desk at the venue at least 2 hours before kick-off with your ID and booking confirmation.' },
    ],
  },
  {
    id: 'transport',
    Icon: Train,
    color: '#2A398D',
    title: 'Getting There',
    subtitle: 'Public transit options, parking, and travel tips for every host city.',
    tips: ['Use public transport where possible — parking is limited', 'Check city-specific transit apps before matchday', 'Allocate extra travel time on matchdays'],
    faqs: [
      { q: 'Is there parking at the stadiums?', a: 'Limited parking is available at most venues. We strongly recommend using public transit, shuttles, or rideshare services to reduce congestion.' },
      { q: 'Are there shuttle services?', a: 'Yes, official FIFA shuttle buses will run from designated city centres to all venues. Check the venue\'s transport page for schedules.' },
      { q: 'Can I use rideshare apps?', a: 'Yes, designated rideshare drop-off/pick-up zones are clearly marked at each venue. Follow signage upon arrival.' },
      { q: 'Are there bicycle facilities?', a: 'Secure bike parking is available at most venues. Check the specific venue page for details.' },
    ],
  },
  {
    id: 'accessibility',
    Icon: Heart,
    color: '#3CAC3B',
    title: 'Accessibility',
    subtitle: 'FIFA 2026 is committed to being the most accessible World Cup ever.',
    tips: ['Request accessibility services at least 48h before matchday', 'Use the AI Assistant for real-time help inside venues', 'All stadiums have companion seating available'],
    faqs: [
      { q: 'Are wheelchair spaces available?', a: 'Yes, all 16 venues have dedicated wheelchair viewing areas with companion seating. Book via the accessibility portal at time of ticket purchase.' },
      { q: 'Are there hearing loops?', a: 'Induction loop systems are installed throughout all venues. Check in at the accessibility desk for equipment rental.' },
      { q: 'Can I bring a guide dog?', a: 'Yes, registered assistance dogs are welcome at all venues. Please bring your dog\'s certification documentation.' },
      { q: 'Is there accessible parking?', a: 'Accessible parking bays are available directly adjacent to all venues and are free of charge with a valid disability permit.' },
    ],
  },
  {
    id: 'rules',
    Icon: AlertCircle,
    color: '#f0a500',
    title: 'Stadium Rules',
    subtitle: 'What you can and cannot bring. Know before you go.',
    tips: ['Bags must be no larger than 30cm x 30cm x 15cm', 'Outside food and drink is not permitted', 'Drones and professional cameras are prohibited'],
    faqs: [
      { q: 'What items are banned?', a: 'Prohibited items include: weapons, pyrotechnics, laser pointers, professional photography equipment, umbrellas (regular size), large bags, and outside food/drink.' },
      { q: 'Can I bring a camera?', a: 'Compact cameras and smartphones are permitted. Professional cameras with detachable lenses longer than 8cm are not allowed.' },
      { q: 'Is smoking allowed?', a: 'Smoking and vaping are prohibited inside all stadium perimeters. Designated smoking areas are located in the outer concourse.' },
      { q: 'What about flags and banners?', a: 'National flags and banners up to 2m x 1.5m are permitted. They must not contain commercial or political messages.' },
    ],
  },
  {
    id: 'app',
    Icon: Smartphone,
    color: '#9c27b0',
    title: 'Digital Experience',
    subtitle: 'Your AI companion and digital tools for the ultimate FIFA experience.',
    tips: ['Download the FIFA+ app for live match commentary and stats', 'Use Stadium Copilot AI for real-time navigation help', 'Connect to venue WiFi for enhanced AR experiences'],
    faqs: [
      { q: 'What is Stadium Copilot?', a: 'Stadium Copilot is the official AI assistant for FIFA World Cup 2026. It answers your questions in 10+ languages, helps with navigation, accessibility, and emergency situations in real-time.' },
      { q: 'Is there WiFi at venues?', a: 'Yes, all 16 venues have high-density fan WiFi. Connect to "FIFA-FanZone-2026" — no password required.' },
      { q: 'What languages are supported?', a: 'The AI assistant supports English, Spanish, French, Arabic, Portuguese, German, Japanese, Chinese, Korean, and Hindi.' },
      { q: 'Can I use AR features?', a: 'Yes, the FIFA+ app offers augmented reality features including player stats overlays and live crowd heat maps when connected to venue WiFi.' },
    ],
  },
];

// ── Accordion Item ─────────────────────────────────────────────────────────────
const AccordionItem: React.FC<{ faq: FaqItem; color: string }> = ({ faq, color }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        className="flex items-start justify-between w-full py-4 text-left gap-3 hover:opacity-90 transition-opacity"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white/85 flex-1">{faq.q}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 mt-0.5 transition-transform"
          style={{ color, transform: open ? 'rotate(180deg)' : '' }}
        />
      </button>
      {open && (
        <p className="text-sm text-white/55 leading-relaxed pb-4">{faq.a}</p>
      )}
    </div>
  );
};

// ── Section Card ───────────────────────────────────────────────────────────────
const SectionCard: React.FC<{ section: Section; index: number }> = ({ section, index }) => {
  const { Icon, color, title, subtitle, faqs, tips } = section;

  return (
    <div
      id={section.id}
      className="glass rounded-2xl overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div
        className="p-6"
        style={{ borderBottom: `1px solid ${color}22`, background: `${color}0d` }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}22`, border: `1px solid ${color}44` }}
          >
            <Icon className="w-5 h-5" style={{ color } as React.CSSProperties} />
          </div>
          <h2 className="text-xl font-extrabold text-white">{title}</h2>
        </div>
        <p className="text-sm text-white/55 leading-relaxed">{subtitle}</p>

        {/* Tips */}
        <div className="mt-4 space-y-2">
          {tips.map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-xs text-white/60">
              <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="px-6">
        {faqs.map((faq) => (
          <AccordionItem key={faq.q} faq={faq} color={color} />
        ))}
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const FanGuidePage: React.FC = () => (
  <div className="min-h-screen bg-[var(--color-bg)]">
    {/* Header */}
    <div
      className="relative pt-20 pb-14 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(60,172,59,0.12) 0%, transparent 100%)' }}
    >
      <div className="absolute top-0 left-0 w-full h-1"
        style={{ background: 'linear-gradient(90deg, #E61D25 0%, #2A398D 50%, #3CAC3B 100%)' }} />

      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Stadium Copilot
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <BrandLogo size={48} />
          <div>
            <p className="text-[#3CAC3B] text-xs font-bold uppercase tracking-widest mb-1">FIFA World Cup 2026™</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Fan Guide</h1>
          </div>
        </div>
        <p className="text-white/60 text-lg ml-16 max-w-xl">
          Your complete guide to experiencing FIFA World Cup 2026.
          Everything from tickets to transport, accessibility to apps.
        </p>

        {/* Quick jump */}
        <div className="flex flex-wrap gap-2 mt-8 ml-16">
          {SECTIONS.map(({ id, title, color }) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
              style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
            >
              {title}
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* Location info bar */}
    <div className="max-w-4xl mx-auto px-4 mb-10">
      <div className="glass rounded-2xl p-5 flex flex-wrap gap-6">
        {[
          { flag: '🇺🇸', country: 'United States', venues: '11 venues', dates: 'Jun–Jul 2026' },
          { flag: '🇲🇽', country: 'Mexico',         venues: '3 venues',  dates: 'Jun 2026' },
          { flag: '🇨🇦', country: 'Canada',         venues: '2 venues',  dates: 'Jun 2026' },
        ].map(({ flag, country, venues, dates }) => (
          <div key={country} className="flex items-center gap-3">
            <span className="text-2xl">{flag}</span>
            <div>
              <p className="font-bold text-white text-sm">{country}</p>
              <p className="text-xs text-white/40">{venues} · {dates}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-auto text-xs text-white/40">
          <MapPin className="w-3.5 h-3.5" />
          <span>3 nations · 16 stadiums · 48 matches</span>
        </div>
      </div>
    </div>

    {/* Sections */}
    <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">
      {SECTIONS.map((section, i) => (
        <SectionCard key={section.id} section={section} index={i} />
      ))}
    </div>
  </div>
);

export default FanGuidePage;
