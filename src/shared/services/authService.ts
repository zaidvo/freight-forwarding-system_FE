// src/services/authService.ts
import {
  apiRequest,
  getAuthToken,
  setAuthToken,
  type BackendUser,
  type LoginResponse,
} from "./api";

// Re-export as AuthUser so AuthProvider can import it
export type AuthUser = BackendUser;

// ─── Token helpers ───────────────────────────────────────────────
const TOKEN_KEY = "freighterp_access_token";

function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Decode JWT payload to check expiry — no library needed
export function isTokenExpired(): boolean {
  const token = getAuthToken();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// ─── login ───────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.access_token);
  return data.user;
}

// ─── getMe ───────────────────────────────────────────────────────
export async function getMe(): Promise<AuthUser | null> {
  if (!getAuthToken()) return null;
  try {
    return await apiRequest<AuthUser>("/auth/me");
  } catch {
    clearAuthToken();
    return null;
  }
}

// ─── logout ──────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await apiRequest<unknown>("/auth/logout", { method: "POST" });
  } catch {
    // Always clear locally even if request fails
  } finally {
    clearAuthToken();
  }
}

// ─── forgotPassword ──────────────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
  await apiRequest<unknown>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
