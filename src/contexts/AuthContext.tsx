import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface MockUser {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAuthenticated: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Simple in-memory user store for prototype
const userStore: Map<string, { email: string; password: string; full_name: string }> = new Map();

// Pre-seed a demo account
userStore.set("demo@krishigrow.ai", { email: "demo@krishigrow.ai", password: "demo1234", full_name: "Demo Farmer" });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(() => {
    const saved = localStorage.getItem("prototype_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    const stored = userStore.get(email.toLowerCase());
    if (!stored || stored.password !== password) {
      return { error: "Invalid email or password" };
    }
    const mockUser: MockUser = { id: crypto.randomUUID(), email: stored.email, full_name: stored.full_name };
    setUser(mockUser);
    localStorage.setItem("prototype_user", JSON.stringify(mockUser));
    return {};
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const key = email.toLowerCase();
    if (userStore.has(key)) {
      return { error: "An account with this email already exists" };
    }
    userStore.set(key, { email: key, password, full_name: fullName });
    const mockUser: MockUser = { id: crypto.randomUUID(), email: key, full_name: fullName };
    setUser(mockUser);
    localStorage.setItem("prototype_user", JSON.stringify(mockUser));
    return {};
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    localStorage.removeItem("prototype_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
