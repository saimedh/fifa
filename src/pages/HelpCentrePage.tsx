import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, MessageCircle, ChevronDown, Bot, Mail, Phone } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

// ── Data ───────────────────────────────────────────────────────────────────────
interface FaqItem {
  q: string;
  a: string;
}

interface HelpSection {
  id: string;
  label: string;
  color: string;
  faqs: FaqItem[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'general',
    label: 'General',
    color: '#E61D25',
    faqs: [
      { q: 'What is Stadium Copilot?', a: 'Stadium Copilot is the official AI-powered operations and fan experience platform for FIFA World Cup 2026. It provides real-time assistance to fans, volunteers, staff, and organizers across all 16 venues.' },
      { q: 'Is Stadium Copilot free to use?', a: 'Yes, Stadium Copilot is completely free for all fans and visitors. No registration or login is required for the AI assistant.' },
      { q: 'What languages does it support?', a: 'The AI assistant supports 10 languages: English, Spanish, French, Arabic, Portuguese, German, Japanese, Chinese, Korean, and Hindi.' },
      { q: 'How accurate is the AI assistant?', a: 'Stadium Copilot is powered by Claude Sonnet — Anthropic\'s advanced AI model. While it\'s highly accurate, always verify critical safety information with on-site staff.' },
    ],
  },
  {
    id: 'tickets',
    label: 'Tickets',
    color: '#2A398D',
    faqs: [
      { q: 'I lost my digital ticket. What do I do?', a: 'Go to the official FIFA Ticketing website at tickets.fifa.com and log in to your account. Your ticket will be re-downloadable. Alternatively, visit the venue\'s Ticket Help Desk with your photo ID and booking confirmation.' },
      { q: 'Can I get a refund on my ticket?', a: 'Tickets are non-refundable except in case of match cancellation. If a match is cancelled (not postponed), FIFA will provide full refunds automatically.' },
      { q: 'My name is wrong on the ticket. Can I fix it?', a: 'Contact the FIFA Ticketing support team at ticketing@fifa.com at least 7 days before the match with your booking reference and photo ID.' },
    ],
  },
  {
    id: 'venue',
    label: 'At The Venue',
    color: '#3CAC3B',
    faqs: [
      { q: 'What time should I arrive?', a: 'We recommend arriving at least 90 minutes before kick-off. Allow extra time if you\'re using public transport on matchdays, as systems can be very busy.' },
      { q: 'Where can I find the accessibility desk?', a: 'Each venue has clearly signed Accessibility Assistance Desks located near the main entrance gates. Staff are available from 3 hours before kick-off.' },
      { q: 'Is there WiFi inside the stadium?', a: 'Yes, all 16 venues have high-density fan WiFi. Connect to "FIFA-FanZone-2026" — no password required. Use Stadium Copilot for real-time AI help.' },
      { q: 'Where are the first aid stations?', a: 'First aid stations are located at each gate entrance and inside each level of the stadium. Stadium Copilot can give you the nearest station in real-time.' },
    ],
  },
  {
    id: 'ai',
    label: 'AI Assistant',
    color: '#9c27b0',
    faqs: [
      { q: 'What can I ask the AI assistant?', a: 'You can ask about navigation, finding facilities, accessibility support requests, emergency help, food and beverage options, match information, transport options, and general FIFA World Cup 2026 questions.' },
      { q: 'How do I request accessibility support?', a: 'Either ask the AI assistant "I need accessibility help" or use the Accessibility Support form on this website. Stadium staff will be dispatched to assist you.' },
      { q: 'Is my conversation data saved?', a: 'No. Stadium Copilot does not store personal data. Chat history exists only during your active session and is cleared when you close or refresh the page.' },
      { q: 'What if the AI gives wrong information?', a: 'While we strive for accuracy, always verify critical information with on-site staff. Use the escalation feature in the chat — it immediately connects you with human staff.' },
    ],
  },
];

// ── Accordion ──────────────────────────────────────────────────────────────────
const HelpAccordion: React.FC<{ faq: FaqItem; color: string }> = ({ faq, color }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        className="flex items-start justify-between w-full py-4 text-left gap-3"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white/85 flex-1">{faq.q}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 mt-0.5 transition-transform duration-200"
          style={{ color, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <p className="text-sm text-white/55 leading-relaxed pb-4">{faq.a}</p>
      )}
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const HelpCentrePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [search, setSearch] = useState('');

  const current = HELP_SECTIONS.find((s) => s.id === activeSection) ?? HELP_SECTIONS[0];
  const filtered = search.trim()
    ? HELP_SECTIONS.flatMap((s) =>
        s.faqs
          .filter((f) =>
            f.q.toLowerCase().includes(search.toLowerCase()) ||
            f.a.toLowerCase().includes(search.toLowerCase())
          )
          .map((f) => ({ ...f, color: s.color, label: s.label }))
      )
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div
        className="relative pt-20 pb-14 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(230,29,37,0.10) 0%, transparent 100%)' }}
      >
        <div className="absolute top-0 left-0 w-full h-1"
          style={{ background: 'linear-gradient(90deg, #E61D25 0%, #2A398D 50%, #3CAC3B 100%)' }} />

        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Stadium Copilot
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <BrandLogo size={48} />
            <div>
              <p className="text-[#E61D25] text-xs font-bold uppercase tracking-widest mb-1">FIFA World Cup 2026™</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Help Centre</h1>
            </div>
          </div>

          {/* Search */}
          <div className="ml-16 relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3
                         text-sm text-white placeholder:text-white/30
                         hover:border-white/20 focus:border-[#E61D25]/50 transition-colors outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Search results */}
        {filtered !== null ? (
          <div>
            <p className="text-sm text-white/40 mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>
            {filtered.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <p className="text-white/40 mb-4">No results found. Try the AI assistant for a direct answer.</p>
                <Link to="/#chat"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #E61D25 0%, #a81019 100%)' }}>
                  <Bot className="w-4 h-4" />Ask AI Assistant
                </Link>
              </div>
            ) : (
              <div className="glass rounded-2xl px-6">
                {filtered.map((f) => (
                  <HelpAccordion key={f.q} faq={{ q: f.q, a: f.a }} color={f.color} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="hidden sm:flex flex-col gap-1 w-40 shrink-0">
              {HELP_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: activeSection === s.id ? `${s.color}22` : 'transparent',
                    color: activeSection === s.id ? s.color : 'rgba(255,255,255,0.45)',
                    borderLeft: activeSection === s.id ? `2px solid ${s.color}` : '2px solid transparent',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Mobile tabs */}
            <div className="sm:hidden flex gap-2 mb-4 overflow-x-auto">
              {HELP_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: activeSection === s.id ? `${s.color}33` : 'rgba(255,255,255,0.05)',
                    color: activeSection === s.id ? s.color : 'rgba(255,255,255,0.4)',
                    border: `1px solid ${activeSection === s.id ? `${s.color}55` : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* FAQ content */}
            <div className="flex-1 min-w-0">
              <div className="glass rounded-2xl px-6 mb-6">
                {current.faqs.map((faq) => (
                  <HelpAccordion key={faq.q} faq={faq} color={current.color} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Still need help */}
        <div className="glass rounded-2xl p-8 mt-10">
          <h2 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#E61D25]" />
            Still need help?
          </h2>
          <p className="text-white/55 text-sm mb-6">Our AI assistant is available 24/7 for instant support. You can also reach our human team via email.</p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/#chat"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #E61D25 0%, #a81019 100%)' }}
            >
              <Bot className="w-4 h-4" />Ask AI Assistant
            </Link>
            <a
              href="mailto:support@fifacopilot.ai"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
            >
              <Mail className="w-4 h-4" />Email Support
            </a>
            <a
              href="tel:+18002026"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
            >
              <Phone className="w-4 h-4" />1-800-FIFA-26
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCentrePage;
