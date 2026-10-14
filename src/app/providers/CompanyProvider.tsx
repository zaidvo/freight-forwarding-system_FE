// src/providers/CompanyProvider.tsx
/* eslint-disable react-refresh/only-export-components */
//
// Lifts active company state into React context so any component
// (sidebar, dashboard, pages) can read and react to company switches.
//
// BE integration: When backend supports per-user company assignments,
// fetch available companies from GET /api/v1/companies and store here.

import { createContext, useContext, useState, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────
export type CompanyId = "freight-forwarding" | "import-export" | "indenting";

export type Company = {
  id: CompanyId;
  name: string;
  accent: string; // tailwind bg class
};

export const COMPANIES: Company[] = [
  {
    id: "freight-forwarding",
    name: "Freight Forwarding",
    accent: "bg-emerald-500",
  },
  { id: "import-export", name: "Trading", accent: "bg-sky-500" },
  { id: "indenting", name: "Indenting", accent: "bg-amber-500" },
];

/**
 * The canonical landing route for each workspace.
 *
 * When the user switches workspace via the dropdown the app navigates here,
 * clearing any sub-page from the previous workspace.  Keep this in sync with
 * AppRoutes.tsx — each value must be a valid route.
 */
export const COMPANY_DEFAULT_ROUTES: Record<CompanyId, string> = {
  "freight-forwarding": "/freight",
  "import-export": "/trading/imports",
  indenting: "/indenting",
};

type CompanyContextValue = {
  activeCompany: Company;
  /** Silent state-only update.  Used by useWorkspaceSync (URL → state). */
  setActiveCompanyId: (id: CompanyId) => void;
  /**
   * Full workspace switch: persists state AND calls navigate(defaultRoute).
   * Used by the workspace dropdown (state → URL direction).
   *
   * @param id       The workspace to switch to.
   * @param navigate A `NavigateFunction` from `useNavigate()` — passed in by
   *                 the caller so this provider stays router-agnostic.
   */
  switchCompany: (id: CompanyId, navigate: (to: string) => void) => void;
  isFreight: boolean;
  isTrading: boolean;
  isIndenting: boolean;
};

// ─── Context ─────────────────────────────────────────────────────
const CompanyContext = createContext<CompanyContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────
export function CompanyProvider({ children }: { children: ReactNode }) {
  const [activeCompanyId, setActiveCompanyId] = useState<CompanyId>(
    () =>
      (localStorage.getItem("freightos-active-company") as CompanyId) ??
      "freight-forwarding"
  );

  const activeCompany =
    COMPANIES.find((c) => c.id === activeCompanyId) ?? COMPANIES[0];

  const handleSetCompany = (id: CompanyId) => {
    localStorage.setItem("freightos-active-company", id);
    setActiveCompanyId(id);
  };

  const switchCompany = (id: CompanyId, navigate: (to: string) => void) => {
    handleSetCompany(id);
    navigate(COMPANY_DEFAULT_ROUTES[id]);
  };

  return (
    <CompanyContext.Provider
      value={{
        activeCompany,
        setActiveCompanyId: handleSetCompany,
        switchCompany,
        isFreight: activeCompanyId === "freight-forwarding",
        isTrading: activeCompanyId === "import-export",
        isIndenting: activeCompanyId === "indenting",
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────
export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used inside <CompanyProvider>");
  return ctx;
}
