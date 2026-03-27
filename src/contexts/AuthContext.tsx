import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignupProfileInput {
  mobile?: string;
  state?: string;
  district?: string;
  village?: string;
  pin_code?: string;
  farm_size?: number | null;
}

interface AppUser {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, profile?: SignupProfileInput) => Promise<{ error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAuthenticated: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  resetPassword: async () => ({}),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = useCallback(async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, any> }) => {
    const fallbackName =
      authUser.user_metadata?.full_name ||
      (authUser.email ? authUser.email.split("@")[0] : "Farmer");

    await supabase.from("profiles").upsert(
      {
        user_id: authUser.id,
        full_name: fallbackName,
      },
      { onConflict: "user_id" }
    );
  }, []);

  const mapUser = useCallback(async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, any> }) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", authUser.id)
      .maybeSingle();

    return {
      id: authUser.id,
      email: authUser.email || "",
      full_name:
        profile?.full_name ||
        authUser.user_metadata?.full_name ||
        (authUser.email ? authUser.email.split("@")[0] : "Farmer"),
    } satisfies AppUser;
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session?.user) {
        await ensureProfile(data.session.user);
        const mappedUser = await mapUser(data.session.user);
        if (mounted) setUser(mappedUser);
      }
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        await ensureProfile(session.user);
        const mappedUser = await mapUser(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile, mapUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      await ensureProfile(data.user);
      const mappedUser = await mapUser(data.user);
      setUser(mappedUser);
    }

    return {};
  }, [ensureProfile, mapUser]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, profile?: SignupProfileInput) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          user_id: data.user.id,
          full_name: fullName,
          mobile_number: profile?.mobile || null,
          state: profile?.state || null,
          district: profile?.district || null,
          village: profile?.village || null,
          pin_code: profile?.pin_code || null,
          farm_size: profile?.farm_size ?? null,
        },
        { onConflict: "user_id" }
      );
    }

    if (data.session?.user) {
      const mappedUser = await mapUser(data.session.user);
      setUser(mappedUser);
      return {};
    }

    return {
      message: "Signup successful. Please verify your email before signing in.",
    };
  }, [mapUser]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, signIn, signUp, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
