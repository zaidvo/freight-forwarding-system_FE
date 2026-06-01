// src/routes/GuestRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Wraps routes that only guests should see (e.g. /login).
 * If user is already authenticated → redirect to dashboard.
 * While loading → render nothing (ProtectedRoute handles the spinner).
 */
export default function GuestRoute() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
