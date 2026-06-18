// src/providers/AuthProvider.tsx
/* eslint-disable react-refresh/only-export-components */
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
  getMyAccess,
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
  moduleAccess: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  hasModuleAccess: (moduleSlug: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [moduleAccess, setModuleAccess] = useState<string[]>([]);

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
        const access = await getMyAccess().catch(() => ({ modules: [] }));
        if (cancelled) return;
        setModuleAccess(access.modules);
        setState({ status: "authenticated", user });
      } else {
        setModuleAccess([]);
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
        setModuleAccess([]);
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

    const access = await getMyAccess().catch(() => ({ modules: [] }));
    setModuleAccess(access.modules);
    setState({ status: "authenticated", user });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setModuleAccess([]);
    setState({ status: "unauthenticated" });
  }, []);

  const hasModuleAccess = useCallback(
    (moduleSlug: string) => moduleAccess.includes(moduleSlug),
    [moduleAccess],
  );

  const value: AuthContextValue = {
    state,
    user: state.status === "authenticated" ? state.user : null,
    moduleAccess,
    isLoading: state.status === "loading",
    isAuthenticated: state.status === "authenticated",
    hasModuleAccess,
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
