import { apiRequest, setAuthToken, type LoginResponse } from "./api";

export async function login(email: string, password: string) {
  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAuthToken(data.access_token);
  return data;
}

export async function forgotPassword(email: string) {
  await apiRequest<unknown>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
