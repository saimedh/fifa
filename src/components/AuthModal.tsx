// ─── AuthModal ─────────────────────────────────────────────────────────────────
// Login / sign-up modal. Supports Google OAuth and email/password.
// Shows a graceful "not configured" state when Supabase env vars are absent.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { isConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [tab,      setTab]      = useState<'signin' | 'signup'>('signin');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);

  // Close on ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const handleGoogle = useCallback(async () => {
    setLoading(true); setError(null);
    try { await signInWithGoogle(); }
    catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, [signInWithGoogle]);

  const handleEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true); setError(null); setSuccess(null);
    const fn = tab === 'signin' ? signInWithEmail : signUpWithEmail;
    const { error: err } = await fn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (tab === 'signup') {
      setSuccess('Account created! Check your email to confirm your address.');
    } else {
      onClose();
    }
  }, [email, password, tab, signInWithEmail, signUpWithEmail, onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,13,26,0.88)', backdropFilter: 'blur(14px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to Stadium Copilot"
    >
      <div className="modal-panel glass rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-7 pb-5 relative"
             style={{ background: 'linear-gradient(135deg, rgba(230,29,37,0.12), transparent)' }}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full glass flex items-center
                       justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="text-3xl mb-3">⚽</div>
          <h2 className="text-xl font-extrabold text-white">Stadium Copilot</h2>
          <p className="text-white/50 text-sm mt-1">Sign in for personalised match experiences</p>
        </div>

        <div className="px-7 pb-7">

          {!isConfigured ? (
            /* ── Not configured state ──────────────────────────── */
            <div className="text-center py-6">
              <p className="text-4xl mb-4">🔧</p>
              <p className="text-white/70 font-semibold text-sm mb-2">Auth not yet configured</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Add <code className="text-[#E61D25]">VITE_SUPABASE_URL</code> and{' '}
                <code className="text-[#E61D25]">VITE_SUPABASE_ANON_KEY</code> to your{' '}
                <code className="text-white/60">.env</code> file to enable authentication.
              </p>
            </div>
          ) : (
            <>
              {/* ── Google button ─────────────────────────────── */}
              <button
                onClick={() => void handleGoogle()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                           bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100
                           transition-all hover:scale-[1.02] disabled:opacity-50
                           disabled:cursor-not-allowed mb-5"
                aria-label="Sign in with Google"
              >
                <Globe className="w-5 h-5 text-[#E61D25]" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30 font-medium">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* ── Tab switcher ─────────────────────────────── */}
              <div className="flex gap-1 glass rounded-xl p-1 mb-5">
                {(['signin', 'signup'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tab === t
                        ? 'bg-[#E61D25] text-white'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {t === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* ── Email/password form ─────────────────────── */}
              <form onSubmit={(e) => void handleEmail(e)} noValidate>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-[var(--color-surface)] text-white text-sm
                                 pl-10 pr-4 py-3 rounded-xl border border-white/10
                                 hover:border-white/20 placeholder:text-white/25 transition-colors"
                      aria-label="Email address"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-[var(--color-surface)] text-white text-sm
                                 pl-10 pr-10 py-3 rounded-xl border border-white/10
                                 hover:border-white/20 placeholder:text-white/25 transition-colors"
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30
                                 hover:text-white/60 transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error   && <p className="text-[#E61D25] text-xs mb-3 font-medium">{error}</p>}
                {success && <p className="text-[#3CAC3B] text-xs mb-3 font-medium">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#E61D25] text-white font-bold text-sm
                             hover:bg-[#c41920] transition-all hover:scale-[1.02]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
