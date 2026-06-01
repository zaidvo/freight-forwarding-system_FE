// src/providers/AuthProvider.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  isTokenExpired,
  type AuthUser,
} from "@/services/authService";

// ─── Context shape ───────────────────────────────────────────────
type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };

type AuthContextValue = {
  state: AuthState;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  // On mount: verify existing token with backend
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Fast path: no token at all
      if (isTokenExpired()) {
        if (!cancelled) setState({ status: "unauthenticated" });
        return;
      }

      // Verify with backend
      const user = await getMe();
      if (cancelled) return;

      if (user && user.status === "active") {
        setState({ status: "authenticated", user });
      } else {
        setState({ status: "unauthenticated" });
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Token expiry watcher — check every 30s, auto-logout when expired
  useEffect(() => {
    if (state.status !== "authenticated") return;

    const interval = setInterval(() => {
      if (isTokenExpired()) {
        setState({ status: "unauthenticated" });
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [state.status]);

  const login = useCallback(async (email: string, password: string) => {
    const user = await apiLogin(email, password);

    if (user.status !== "active") {
      throw new Error(
        "Your account is inactive or suspended. Please contact your administrator.",
      );
    }

    setState({ status: "authenticated", user });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ status: "unauthenticated" });
  }, []);

  const value: AuthContextValue = {
    state,
    user: state.status === "authenticated" ? state.user : null,
    isLoading: state.status === "loading",
    isAuthenticated: state.status === "authenticated",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
