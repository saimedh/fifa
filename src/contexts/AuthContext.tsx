// ─── AuthContext ───────────────────────────────────────────────────────────────
// Provides auth state, Google/email sign-in, profile CRUD throughout the app.
// Gracefully degrades when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are unset.
// ──────────────────────────────────────────────────────────────────────────────
import React, {
  createContext, useContext, useEffect, useState, useCallback,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthContextType {
  /** Supabase Auth user object, or null if logged out. */
  user: User | null;
  /** Extended profile row from `public.profiles`. */
  profile: UserProfile | null;
  loading: boolean;
  /** False when Supabase env vars are not set — auth features disabled. */
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, loading: false, isConfigured: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return (data as UserProfile) ?? null;
}

async function ensureProfile(user: User): Promise<UserProfile | null> {
  if (!supabase) return null;
  // Upsert: creates profile row on first login
  const { data } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, username: user.user_metadata?.full_name ?? null, language: 'en' },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    .select('*')
    .maybeSingle();
  return (data as UserProfile) ?? await fetchProfile(user.id);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    // Hydrate from session on first load
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) setProfile(await ensureProfile(u));
      setLoading(false);
    });

    // Subscribe to future auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setProfile(u ? await ensureProfile(u) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>) => {
    if (!supabase || !user) return;
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .maybeSingle();
    if (data) setProfile(data as UserProfile);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isConfigured: isSupabaseConfigured,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      signOut, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
