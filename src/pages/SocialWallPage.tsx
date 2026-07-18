// ─── SocialWallPage ────────────────────────────────────────────────────────────
// Fan social wall: Tinyfish-powered web feed + local fan chants with upvote.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, ExternalLink, ThumbsUp, RefreshCw, MessageCircle, Globe, Search, Flag } from 'lucide-react';
import { tinyfishSearch } from '../api';
import type { TinyfishSearchResult } from '../types';

interface Chant {
  id: string;
  text: string;
  country: string;
  flag: string;
  color: string;
  votes: number;
  userVoted: boolean;
  ts: Date;
}

interface MatchTab {
  id: string;
  label: string;
  homeFlag: string;
  awayFlag: string;
  query: string;
  status: string;
}

const MATCH_TABS: MatchTab[] = [
  { id: 'qf3', label: 'ARG vs GER', homeFlag: '', awayFlag: '',
    status: '🔴 LIVE 78\'', query: 'Argentina Germany World Cup 2026 fan reactions' },
  { id: 'qf4', label: 'ESP vs MAR', homeFlag: '', awayFlag: '',
    status: '🟡 Half Time', query: 'Spain Morocco World Cup 2026 fan reactions social media' },
  { id: 'sf1', label: 'BRA vs FRA', homeFlag: '', awayFlag: '',
    status: '📅 Jul 14',  query: 'Brazil France World Cup 2026 semi final predictions fans' },
];

const SEED_CHANTS: Chant[] = [
  { id: 'c1', text: "¡Argentina, Argentina! Messi llevanos a la gloria!", country: 'Argentina', flag: '', color: '#74ACDF', votes: 284, userVoted: false, ts: new Date(Date.now() - 3 * 60000) },
  { id: 'c2', text: "Deutschland, wir glauben an euch! Come on Germany", country: 'Germany', flag: '', color: '#FFCC00', votes: 167, userVoted: false, ts: new Date(Date.now() - 8 * 60000) },
  { id: 'c3', text: "This stadium atmosphere at SoFi is absolutely ELECTRIC #FIFA2026", country: 'USA', flag: '', color: '#002868', votes: 412, userVoted: false, ts: new Date(Date.now() - 12 * 60000) },
  { id: 'c4', text: "Messi in the 78th minute still holding on Greatest ever", country: 'Argentina', flag: '', color: '#74ACDF', votes: 891, userVoted: false, ts: new Date(Date.now() - 15 * 60000) },
  { id: 'c5', text: "Allez les Bleus! Spain Morocco is unreal too", country: 'France', flag: '', color: '#0055A4', votes: 203, userVoted: false, ts: new Date(Date.now() - 22 * 60000) },
];

const COUNTRY_OPTIONS = [
  { name: 'Argentina', flag: '', color: '#74ACDF' },
  { name: 'Brazil',    flag: '', color: '#009C3B' },
  { name: 'France',    flag: '', color: '#0055A4' },
  { name: 'Germany',   flag: '', color: '#FFCC00' },
  { name: 'Spain',     flag: '', color: '#AA151B' },
  { name: 'Morocco',   flag: '', color: '#C1272D' },
  { name: 'England',   flag: '', color: '#CF0A0A' },
  { name: 'USA',       flag: '', color: '#002868' },
  { name: 'Mexico',    flag: '', color: '#006847' },
  { name: 'Canada',    flag: '', color: '#FF0000' },
  { name: 'Portugal',  flag: '', color: '#006600' },
  { name: 'Italy',     flag: '', color: '#009246' },
];

function timeAgo(d: Date): string {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

// ── Chant card ─────────────────────────────────────────────────────────────────
const ChantCard: React.FC<{ chant: Chant; onVote: (id: string) => void }> = ({ chant, onVote }) => (
  <div
    className="glass rounded-xl p-4 fade-up"
    style={{ borderLeft: `3px solid ${chant.color}66` }}
  >
    <div className="flex gap-3">
      <span className="text-2xl shrink-0 mt-0.5">{chant.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-white/80">{chant.country}</span>
          <span className="text-[10px] text-white/30">{timeAgo(chant.ts)}</span>
        </div>
        <p className="text-sm text-white/85 leading-relaxed">{chant.text}</p>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-end">
      <button
        onClick={() => onVote(chant.id)}
        disabled={chant.userVoted}
        aria-label={`Upvote this chant. Current votes: ${chant.votes}`}
        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full
                    transition-all duration-200
                    ${chant.userVoted
                      ? 'text-[#3CAC3B] bg-[#3CAC3B]/15 border border-[#3CAC3B]/40 cursor-default'
                      : 'text-white/50 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10'
                    }`}
      >
        <ThumbsUp className="w-3 h-3" />
        {chant.votes.toLocaleString()}
      </button>
    </div>
  </div>
);

// ── Web result card ────────────────────────────────────────────────────────────
const WebCard: React.FC<{ result: TinyfishSearchResult }> = ({ result }) => (
  <a
    href={result.url}
    target="_blank"
    rel="noopener noreferrer"
    className="glass rounded-xl p-4 group hover:scale-[1.01] transition-all duration-200 block"
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <p className="text-sm font-semibold text-white/80 group-hover:text-white
                    line-clamp-2 transition-colors leading-snug">
        {result.title}
      </p>
      <ExternalLink className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
    </div>
    {result.snippet && (
      <p className="text-xs text-white/50 leading-relaxed line-clamp-3 mb-2">{result.snippet}</p>
    )}
    <p className="text-[10px] text-white/30">{result.site_name}</p>
  </a>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const SocialWallPage: React.FC = () => {
  const [tabIdx,    setTabIdx]    = useState(0);
  const [chants,    setChants]    = useState<Chant[]>(() => [...SEED_CHANTS]);
  const [webFeed,   setWebFeed]   = useState<TinyfishSearchResult[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [input,     setInput]     = useState('');
  const [country,   setCountry]   = useState(COUNTRY_OPTIONS[0]);
  const [activeTab, setActiveTab] = useState<'chants' | 'web'>('chants');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const tab = MATCH_TABS[tabIdx];

  const fetchWeb = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tinyfishSearch(tab.query);
      setWebFeed(res?.results?.filter(r => r.snippet).slice(0, 6) ?? []);
    } catch { /* fail silently */ }
    finally { setLoading(false); }
  }, [tab.query]);

  useEffect(() => { void fetchWeb(); }, [fetchWeb]);

  const upvote = useCallback((id: string) => {
    setChants(prev =>
      prev.map(c => c.id === id ? { ...c, votes: c.votes + 1, userVoted: true } : c)
    );
  }, []);

  const submit = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newChant: Chant = {
      id: crypto.randomUUID(),
      text,
      country: country.name,
      flag: country.flag,
      color: country.color,
      votes: 1,
      userVoted: true,
      ts: new Date(),
    };
    setChants(prev => [newChant, ...prev]);
    setInput('');
  }, [input, country]);

  const sorted = [...chants].sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50
                                hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="live-dot" aria-hidden="true" />
          <p className="text-[#E61D25] text-xs font-black uppercase tracking-[0.2em]">Live</p>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8">
          <span className="gradient-text">Fan Social Wall</span>
        </h1>

        {/* Match tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {MATCH_TABS.map((m, i) => (
            <button
              key={m.id}
              onClick={() => { setTabIdx(i); setWebFeed([]); }}
              aria-pressed={tabIdx === i}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                tabIdx === i
                  ? 'border-[#E61D25]/50 bg-[#E61D25]/15 text-white'
                  : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              <Flag className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 opacity-60" />
              {m.label}
              <span className="ml-2 text-[10px] text-white/40">{m.status}</span>
            </button>
          ))}
        </div>

        {/* Content tabs */}
        <div className="flex gap-2 mb-6">
          {(['chants', 'web'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              aria-pressed={activeTab === t}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                activeTab === t
                  ? 'border-[#2A398D]/50 bg-[#2A398D]/20 text-white'
                  : 'border-white/10 text-white/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {t === 'chants' ? <MessageCircle className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                {t === 'chants' ? 'Fan Chants' : 'Web Feed'}
              </span>
            </button>
          ))}
          {activeTab === 'web' && (
            <button
              onClick={() => void fetchWeb()}
              disabled={loading}
              className="ml-auto flex items-center gap-1.5 text-xs text-white/40
                         hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        {activeTab === 'chants' && (
          <>
            {/* Submit chant */}
            <div className="glass rounded-2xl p-5 mb-6">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">
                Add Your Chant
              </p>
              <div className="flex gap-3 mb-3">
                <select
                  value={country.name}
                  onChange={(e) => setCountry(COUNTRY_OPTIONS.find(c => c.name === e.target.value) ?? COUNTRY_OPTIONS[0])}
                  className="bg-[var(--color-surface)] text-white text-sm px-3 py-2 rounded-xl
                             border border-white/10 hover:border-white/20 transition-colors shrink-0"
                  aria-label="Select your country"
                >
                  {COUNTRY_OPTIONS.map(c => (
                    <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
                  placeholder="Share your chant, reaction or message… (Ctrl+Enter to post)"
                  rows={3}
                  maxLength={280}
                  className="w-full bg-[var(--color-surface)] text-white text-sm
                             rounded-xl px-4 py-3 border border-white/10
                             hover:border-white/20 placeholder:text-white/25
                             resize-none transition-colors"
                  aria-label="Write a fan chant or message"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-white/30">{input.length}/280</span>
                  <button
                    onClick={submit}
                    disabled={!input.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                               bg-[#E61D25] text-white hover:bg-[#c41920] disabled:opacity-40
                               disabled:cursor-not-allowed transition-all hover:scale-105"
                    aria-label="Post chant"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Chant feed */}
            <div className="space-y-3">
              {sorted.map(c => <ChantCard key={c.id} chant={c} onVote={upvote} />)}
            </div>
          </>
        )}

        {activeTab === 'web' && (
          <div className="space-y-3">
            {loading && (
              <div className="text-center py-12 text-white/30">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
                <p className="text-sm">Fetching fan reactions from the web…</p>
              </div>
            )}
            {!loading && webFeed.length === 0 && (
              <div className="text-center py-12 text-white/30">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No web results yet — try refreshing</p>
              </div>
            )}
            {webFeed.map(r => <WebCard key={r.url} result={r} />)}
          </div>
        )}

      </div>
    </div>
  );
};

export default SocialWallPage;
