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
export type CompanyId = "freight-forwarding" | "import-export";

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
  { id: "import-export", name: "Import / Export", accent: "bg-sky-500" },
];

type CompanyContextValue = {
  activeCompany: Company;
  setActiveCompanyId: (id: CompanyId) => void;
  isFreight: boolean;
  isTrading: boolean;
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

  return (
    <CompanyContext.Provider
      value={{
        activeCompany,
        setActiveCompanyId: handleSetCompany,
        isFreight: activeCompanyId === "freight-forwarding",
        isTrading: activeCompanyId === "import-export",
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
