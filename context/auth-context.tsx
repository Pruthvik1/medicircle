import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '@/lib/supabase';
import type { AuthUser, UserRole } from '@/lib/schemas/auth';

// Keeps the splash screen (node 424:26410) visible for a beat even though
// restoring the session usually resolves almost instantly — without this the
// logo just flashes on screen instead of being visible.
const MIN_SPLASH_MS = 1500;

type AuthContextValue = {
  isHydrating: boolean;
  user: AuthUser | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function toAuthUser(session: Session): Promise<AuthUser> {
  const { user } = session;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) console.warn('[auth] could not load profile:', profileError.message);

  // profiles.role is the source of truth; fall back to the role chosen at
  // sign-up, then to patient.
  const metaRole = user.user_metadata?.role as UserRole | undefined;
  const role = (profile?.role as UserRole | undefined) ?? metaRole ?? 'patient';
  let needsOnboarding = false;
  if (role === 'doctor') {
    const { data: doctor } = await supabase
      .from('doctors')
      .select('clinic_id')
      .eq('id', user.id)
      .maybeSingle();
    needsOnboarding = !doctor?.clinic_id;
  }

  const email = user.email ?? '';
  return {
    id: user.id,
    email,
    name: profile?.full_name || email.split('@')[0],
    role,
    needsOnboarding,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    const apply = async (session: Session | null) => {
      const next = session ? await toAuthUser(session) : null;
      if (!cancelled) setUser(next);
    };

    (async () => {
      const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS));
      const [{ data }] = await Promise.all([supabase.auth.getSession(), minDelay]);
      await apply(data.session);
      if (!cancelled) setIsHydrating(false);
    })();

    // Fires on sign in, sign out and token refresh. Defer the profile query
    // out of the callback — supabase-js can deadlock if it awaits inside it.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void apply(session), 0);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data.session ? await toAuthUser(data.session) : null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isHydrating,
      user,
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshUser,
    }),
    [isHydrating, user, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
