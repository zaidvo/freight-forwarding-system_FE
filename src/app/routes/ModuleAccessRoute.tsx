import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

type ModuleAccessRouteProps = {
  moduleSlug: string;
};

export default function ModuleAccessRoute({
  moduleSlug,
}: ModuleAccessRouteProps) {
  const { hasModuleAccess } = useAuth();

  if (!hasModuleAccess(moduleSlug)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
