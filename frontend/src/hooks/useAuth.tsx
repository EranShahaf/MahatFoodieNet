import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

interface AuthUser {
  username: string;
  id?: number;
  roles?: string[];
}

interface Session {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const SESSION_KEY = "foodienet-session";

function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(getSession);
  const user = session?.user || null;

  // Verify token on mount by fetching profile
  useEffect(() => {
    if (session?.token) {
      api.getProfile().then(data => {
        setSession({ token: session.token, user: data.user });
      }).catch(() => {
        // If profile fetch fails (e.g. invalid token), logout
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const data = await api.login(username, password);
      if (data.token) {
        // Fetch profile to get roles and id immediately upon login
        const fakeSession = { token: data.token, user: { username } };
        localStorage.setItem(SESSION_KEY, JSON.stringify(fakeSession));
        
        try {
          const profileData = await api.getProfile();
          const realSession = { token: data.token, user: profileData.user };
          localStorage.setItem(SESSION_KEY, JSON.stringify(realSession));
          setSession(realSession);
        } catch (e) {
          setSession(fakeSession);
        }
        return { success: true };
      }
      return { success: false, error: "Invalid credentials" };
    } catch (err: any) {
      return { success: false, error: "Invalid credentials. Please try again." };
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      await api.register(username, password);
      // Auto-login after successful registration
      return await login(username, password);
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to register" };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
