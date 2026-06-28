const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

const TOKEN_KEY = "freighterp_access_token";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export type BackendUserRole = "root" | "user";
export type BackendUserStatus = "active" | "inactive";

export type BackendUser = {
  id: number;
  full_name: string;
  email: string;
  role: BackendUserRole;
  status: BackendUserStatus;
  last_login_at: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  group_ids?: number[];
};

export type BackendModule = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  route: string | null;
  is_active: boolean;
  sort_order: number;
};

export type BackendGroup = {
  id: number;
  name: string;
  description: string | null;
  module_ids: number[];
  user_ids: number[];
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: BackendUser;
};

export type CreateUserPayload = {
  full_name: string;
  email: string;
  password: string;
  role?: BackendUserRole;
};

export type UpdateUserPayload = {
  full_name?: string;
  email?: string;
  status?: BackendUserStatus;
  password?: string;
};

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const body = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { detail?: string }
    | null;

  if (!response.ok) {
    const message =
      body && "detail" in body && body.detail
        ? body.detail
        : body && "message" in body
          ? body.message
          : "Request failed";
    throw new Error(message);
  }

  if (!body || !("data" in body)) {
    return undefined as T;
  }

  return body.data as T;
}
