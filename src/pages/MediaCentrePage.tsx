import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Newspaper, Video, Mic, Radio, ExternalLink, Camera } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

// ── Data ───────────────────────────────────────────────────────────────────────
interface NewsItem {
  id: string;
  category: string;
  categoryColor: string;
  date: string;
  title: string;
  excerpt: string;
  tag: string;
  img: string;
}

const NEWS: NewsItem[] = [
  {
    id: 'n1', category: 'Official News', categoryColor: '#E61D25',
    date: 'Jul 10, 2026', title: 'MetLife Stadium Confirmed as 2026 World Cup Final Venue',
    excerpt: 'FIFA has officially confirmed MetLife Stadium in New York/New Jersey as the venue for the grand finale of the 2026 FIFA World Cup™.',
    tag: 'Breaking',
    img: '/images/news_metlife.png',
  },
  {
    id: 'n2', category: 'Tournament Updates', categoryColor: '#2A398D',
    date: 'Jul 8, 2026', title: 'Record-Breaking Attendance as Group Stage Concludes',
    excerpt: 'The group stage of FIFA World Cup 2026 has concluded with record attendance figures, welcoming over 3.6 million fans to stadiums across North America.',
    tag: 'Featured',
    img: '/images/news_crowd.png',
  },
  {
    id: 'n3', category: 'AI & Technology', categoryColor: '#3CAC3B',
    date: 'Jul 5, 2026', title: 'Stadium Copilot AI Handles 2M+ Fan Queries',
    excerpt: 'The Stadium Copilot AI assistant has successfully handled over two million fan queries in 10 languages since the tournament\'s kick-off.',
    tag: 'Tech',
    img: '/images/news_ai.png',
  },
  {
    id: 'n4', category: 'Accessibility', categoryColor: '#f0a500',
    date: 'Jul 2, 2026', title: 'FIFA 2026 Named Most Accessible World Cup in History',
    excerpt: 'Accessibility advocates and disabled fans have praised FIFA World Cup 2026 as the most inclusive tournament to date, citing enhanced facilities and AI assistance.',
    tag: 'Impact',
    img: '/images/news_accessibility.png',
  },
  {
    id: 'n5', category: 'Official News', categoryColor: '#E61D25',
    date: 'Jun 28, 2026', title: 'Broadcast Rights Reach Record 200+ Countries',
    excerpt: 'FIFA World Cup 2026 broadcast coverage extends to more than 200 countries, with official partners delivering matches in 4K HDR to billions of viewers worldwide.',
    tag: 'Media',
    img: '/images/news_broadcast.png',
  },
  {
    id: 'n6', category: 'Tournament Updates', categoryColor: '#2A398D',
    date: 'Jun 20, 2026', title: 'Iconic Azteca Hosts Opening Ceremony to Global Acclaim',
    excerpt: 'The legendary Estadio Azteca in Mexico City hosted an unforgettable opening ceremony, with 87,000 fans witnessing the start of the greatest edition of the World Cup.',
    tag: 'Featured',
    img: '/images/news_azteca.png',
  },
];


interface BroadcastPartner {
  region: string;
  partner: string;
  type: string;
  icon: string;
}

const BROADCAST: BroadcastPartner[] = [
  { region: 'United States', partner: 'Fox Sports / Telemundo', type: 'TV + Digital', icon: '🇺🇸' },
  { region: 'United Kingdom', partner: 'BBC / ITV', type: 'TV + Digital', icon: '🇬🇧' },
  { region: 'Mexico',         partner: 'TUDN / Televisa', type: 'TV + Digital', icon: '🇲🇽' },
  { region: 'Brazil',         partner: 'Globo',           type: 'TV + Digital', icon: '🇧🇷' },
  { region: 'France',         partner: 'TF1 / M6',        type: 'TV + Digital', icon: '🇫🇷' },
  { region: 'Germany',        partner: 'ARD / ZDF',       type: 'TV + Digital', icon: '🇩🇪' },
  { region: 'Spain',          partner: 'TVE / RTVE',      type: 'TV + Digital', icon: '🇪🇸' },
  { region: 'Japan',          partner: 'NHK / DAZN',      type: 'TV + Digital', icon: '🇯🇵' },
];

// ── Components ─────────────────────────────────────────────────────────────────
const NewsCard: React.FC<{ item: NewsItem; featured?: boolean }> = ({ item, featured }) => (
  <article
    className={`glass rounded-2xl overflow-hidden hover:scale-[1.015] transition-all duration-300 group
                ${featured ? 'lg:col-span-2' : ''}`}
  >
    {/* Thumbnail */}
    <div className={`relative overflow-hidden ${featured ? 'h-56' : 'h-40'}`}>
      <img
        src={item.img}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0e1a30] via-black/20 to-transparent"
        style={{ borderBottom: `2px solid ${item.categoryColor}44` }}
      />
      {/* Badges overlaid on image bottom-left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
          style={{ background: `${item.categoryColor}55`, color: '#fff', border: `1px solid ${item.categoryColor}77` }}
        >
          {item.category}
        </span>
        <span className="text-xs font-black px-2 py-0.5 rounded bg-black/40 text-white/80 backdrop-blur-sm">
          {item.tag}
        </span>
      </div>
    </div>

    {/* Body */}
    <div className="p-5">
      <p className="text-white/30 text-xs mb-2">{item.date}</p>
      <h3 className={`font-extrabold text-white mb-2 leading-snug group-hover:text-[#E61D25] transition-colors
                      ${featured ? 'text-xl' : 'text-base'}`}>
        {item.title}
      </h3>
      <p className="text-sm text-white/55 leading-relaxed mb-4">{item.excerpt}</p>
      <button className="flex items-center gap-1.5 text-xs font-bold transition-colors"
        style={{ color: item.categoryColor }}>
        Read full article <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  </article>
);


// ── Page ───────────────────────────────────────────────────────────────────────
const MediaCentrePage: React.FC = () => (
  <div className="min-h-screen bg-[var(--color-bg)]">
    {/* Header */}
    <div
      className="relative pt-20 pb-14 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(42,57,141,0.12) 0%, transparent 100%)' }}
    >
      <div className="absolute top-0 left-0 w-full h-1"
        style={{ background: 'linear-gradient(90deg, #E61D25 0%, #2A398D 50%, #3CAC3B 100%)' }} />

      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Stadium Copilot
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <BrandLogo size={48} />
          <div>
            <p className="text-[#2A398D] text-xs font-bold uppercase tracking-widest mb-1">FIFA World Cup 2026™</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Media Centre</h1>
          </div>
        </div>
        <p className="text-white/60 text-lg ml-16 max-w-2xl">
          Official news, broadcast information, press releases, and media assets for FIFA World Cup 2026.
        </p>

        {/* Media type pills */}
        <div className="flex flex-wrap gap-3 mt-8 ml-16">
          {[
            { icon: Newspaper, label: 'Press Releases',  color: '#E61D25' },
            { icon: Video,     label: 'Broadcasts',      color: '#2A398D' },
            { icon: Camera,    label: 'Photography',     color: '#3CAC3B' },
            { icon: Mic,       label: 'Interviews',      color: '#f0a500' },
            { icon: Radio,     label: 'Radio Coverage',  color: '#9c27b0' },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Latest News */}
      <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-[#E61D25]" />
        Latest News
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {NEWS.map((item, i) => (
          <NewsCard key={item.id} item={item} featured={i === 0} />
        ))}
      </div>

      {/* Broadcast Partners */}
      <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
        <Video className="w-5 h-5 text-[#2A398D]" />
        Broadcast Partners
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {BROADCAST.map(({ region, partner, type, icon }) => (
          <div key={region} className="glass rounded-xl p-4">
            <span className="text-2xl">{icon}</span>
            <p className="font-bold text-white text-sm mt-2">{region}</p>
            <p className="text-[#2A398D] text-xs font-semibold">{partner}</p>
            <p className="text-white/30 text-xs mt-1">{type}</p>
          </div>
        ))}
      </div>

      {/* Media Accreditation CTA */}
      <div
        className="glass rounded-2xl p-8 text-center"
        style={{ borderTop: '2px solid rgba(230,29,37,0.4)', background: 'rgba(230,29,37,0.05)' }}
      >
        <Camera className="w-10 h-10 text-[#E61D25] mx-auto mb-4" />
        <h3 className="text-2xl font-extrabold text-white mb-2">Media Accreditation</h3>
        <p className="text-white/55 mb-6 max-w-md mx-auto text-sm">
          Accredited media receive full press passes, dedicated working areas, high-speed Wi-Fi, and access to post-match mixed zones at all 16 venues.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #E61D25 0%, #a81019 100%)' }}
        >
          Apply for Accreditation <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
);

export default MediaCentrePage;
