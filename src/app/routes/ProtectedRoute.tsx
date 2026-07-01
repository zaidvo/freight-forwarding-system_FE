// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

/**
 * Wraps all routes that require authentication.
 * - While auth is loading → show a full-screen spinner
 * - Not authenticated → redirect to /login, preserving intended destination
 * - Authenticated → render the child route
 */
export default function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(79,124,255,0.08),_transparent_28%),linear-gradient(180deg,#fbfcff_0%,#f4f6fb_100%)]">
        <div className="flex flex-col items-center gap-4">
          {/* Logo mark */}
          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-blue-500 shadow-[0_10px_20px_rgba(59,130,246,0.24)]">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          {/* Spinner */}
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
          <p className="text-[13px] text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the URL they tried to visit so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
