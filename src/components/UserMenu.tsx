// ─── UserMenu ──────────────────────────────────────────────────────────────────
// Shows avatar + dropdown when logged in, "Sign In" button when logged out.
// Rendered inside the Navbar.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const UserMenu: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [showModal,    setShowModal]    = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" aria-label="Loading auth…" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          id="nav-signin"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                     bg-[#E61D25] text-white hover:bg-[#c41920]
                     transition-all duration-200 hover:scale-105"
          aria-label="Sign in to your account"
        >
          <User className="w-4 h-4" />
          Sign In
        </button>
        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // ── Logged-in state ────────────────────────────────────────────────────────
  const displayName = profile?.username
    ?? user.user_metadata?.full_name
    ?? user.email
    ?? 'Fan';
  const avatarUrl   = user.user_metadata?.avatar_url as string | undefined;
  const initials    = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={dropRef} className="relative">
      <button
        id="nav-user-menu"
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass
                   hover:bg-white/8 transition-all duration-200"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName}
               className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#E61D25] flex items-center justify-center
                          text-white text-[10px] font-black">
            {initials}
          </div>
        )}
        <span className="text-sm font-semibold text-white/80 hidden sm:block max-w-[100px] truncate">
          {displayName.split(' ')[0]}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/40 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl shadow-2xl
                     border border-white/10 z-50 overflow-hidden"
          role="menu"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-white/40 truncate">{user.email}</p>
          </div>

          {/* Links */}
          <div className="p-1.5">
            <Link
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                         text-white/70 hover:text-white hover:bg-white/8 transition-colors"
              role="menuitem"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>

            <button
              onClick={async () => { setDropdownOpen(false); await signOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                         text-[#E61D25] hover:bg-[#E61D25]/10 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
