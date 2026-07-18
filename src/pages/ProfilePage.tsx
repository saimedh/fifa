// ─── ProfilePage ───────────────────────────────────────────────────────────────
// Fan profile: preferences, chat history, accessibility request history.
// Redirects to / if user is not logged in.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, User, Wrench, Accessibility, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { ChatHistoryRow, AccessibilityRequestRecord } from '../types';
import { PLAYERS } from '../data/players';

const TEAMS = [
  'Argentina', 'Brazil', 'France', 'Germany', 'Spain', 'England',
  'Portugal', 'Morocco', 'USA', 'Mexico', 'Canada', 'Italy',
  'Uruguay', 'Belgium',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
];

const STATUS_COLORS: Record<string, string> = {
  pending:     '#f59e0b',
  in_progress: '#60a5fa',
  resolved:    '#3CAC3B',
};

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, loading, isConfigured } = useAuth();

  const [username,    setUsername]    = useState('');
  const [favTeam,     setFavTeam]     = useState('');
  const [favPlayerId, setFavPlayerId] = useState('');
  const [language,    setLanguage]    = useState('en');
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatHistoryRow[]>([]);
  const [a11yReqs,    setA11yReqs]    = useState<AccessibilityRequestRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Hydrate form from profile
  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '');
      setFavTeam(profile.favorite_team ?? '');
      setFavPlayerId(profile.favorite_player_id ?? '');
      setLanguage(profile.language ?? 'en');
    }
  }, [profile]);

  // Load history
  useEffect(() => {
    if (!supabase || !user) return;
    setLoadingData(true);
    void Promise.allSettled([
      supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('accessibility_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]).then(([chatRes, a11yRes]) => {
      if (chatRes.status === 'fulfilled' && chatRes.value.data)
        setChatHistory(chatRes.value.data as ChatHistoryRow[]);
      if (a11yRes.status === 'fulfilled' && a11yRes.value.data)
        setA11yReqs(a11yRes.value.data as AccessibilityRequestRecord[]);
      setLoadingData(false);
    });
  }, [user]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await updateProfile({ username, favorite_team: favTeam, favorite_player_id: favPlayerId, language: language as 'en' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [username, favTeam, favPlayerId, language, updateProfile]);

  const clearHistory = useCallback(async () => {
    if (!supabase || !user || !confirm('Clear all chat history?')) return;
    await supabase.from('chat_history').delete().eq('user_id', user.id);
    setChatHistory([]);
  }, [user]);

  if (loading) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-white/40">Loading…</div>;
  }

  if (!user) return <Navigate to="/" replace />;

  if (!isConfigured) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-white font-bold mb-2">Supabase not configured</p>
          <p className="text-white/50 text-sm">Add Supabase env vars to enable profiles.</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.username ?? user.user_metadata?.full_name ?? user.email ?? 'Fan';
  const avatarUrl   = user.user_metadata?.avatar_url as string | undefined;
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const favPlayer   = PLAYERS.find(p => p.id === favPlayerId);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50
                                hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        {/* Hero */}
        <div className="flex items-center gap-5 mb-10">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName}
                 className="w-20 h-20 rounded-2xl object-cover shadow-xl" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#E61D25] flex items-center justify-center
                            text-white text-3xl font-black shadow-xl">
              {initials}
            </div>
          )}
          <div>
            <p className="text-[#E61D25] text-xs font-black uppercase tracking-[0.2em] mb-1">
              My Profile
            </p>
            <h1 className="text-3xl font-extrabold text-white">{displayName}</h1>
            <p className="text-white/40 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Preferences ─────────────────────────────────────── */}
          <div className="glass rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-white mb-5">
              <User className="w-4 h-4 text-[#E61D25]" /> Preferences
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={displayName}
                  className="w-full bg-[var(--color-surface)] text-white text-sm px-4 py-2.5
                             rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                  Favourite Team
                </label>
                <select
                  value={favTeam}
                  onChange={(e) => setFavTeam(e.target.value)}
                  className="w-full bg-[var(--color-surface)] text-white text-sm px-4 py-2.5
                             rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                >
                  <option value="">— None —</option>
                  {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                  Favourite Player
                </label>
                <select
                  value={favPlayerId}
                  onChange={(e) => setFavPlayerId(e.target.value)}
                  className="w-full bg-[var(--color-surface)] text-white text-sm px-4 py-2.5
                             rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                >
                  <option value="">— None —</option>
                  {PLAYERS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.countryFlag} {p.name}
                    </option>
                  ))}
                </select>
                {favPlayer && (
                  <p className="text-xs text-white/40 mt-1">
                    {favPlayer.country} · {favPlayer.stats.club}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[var(--color-surface)] text-white text-sm px-4 py-2.5
                             rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>

              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                           bg-[#E61D25] text-white font-bold text-sm hover:bg-[#c41920]
                           transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Accessibility requests */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-base font-extrabold text-white mb-4 flex items-center">
                <Accessibility className="w-5 h-5 mr-2 opacity-60" /> My Requests
              </h2>
              {loadingData && <p className="text-white/30 text-sm">Loading…</p>}
              {!loadingData && a11yReqs.length === 0 && (
                <p className="text-white/30 text-sm">No accessibility requests yet.</p>
              )}
              <div className="space-y-2">
                {a11yReqs.map(r => (
                  <div key={r.id} className="glass rounded-xl px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white/80">{r.request_type}</p>
                      <p className="text-[10px] text-white/40">
                        {new Date(r.created_at).toLocaleDateString()}
                        {r.location ? ` · ${r.location}` : ''}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: `${STATUS_COLORS[r.status] ?? '#888'}22`,
                        color: STATUS_COLORS[r.status] ?? '#888',
                      }}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat history */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 opacity-60" /> Chat History
                </h2>
                {chatHistory.length > 0 && (
                  <button
                    onClick={() => void clearHistory()}
                    className="flex items-center gap-1.5 text-xs text-[#E61D25] hover:opacity-80 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              {loadingData && <p className="text-white/30 text-sm">Loading…</p>}
              {!loadingData && chatHistory.length === 0 && (
                <p className="text-white/30 text-sm">No saved chat messages yet.</p>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {chatHistory.map(row => (
                  <div
                    key={row.id}
                    className={`px-3 py-2 rounded-xl text-xs ${
                      row.role === 'user'
                        ? 'bg-[#2A398D]/20 text-white/70 text-right'
                        : 'glass text-white/60'
                    }`}
                  >
                    <p className="line-clamp-2">{row.content}</p>
                    <p className="text-white/25 mt-0.5">
                      {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
