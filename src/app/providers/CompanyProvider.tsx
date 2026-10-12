/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";

export type CompanyId =
  | "freight-forwarding"
  | "import-export"
  | "indenting"
  | "customers";

export type Company = {
  id: CompanyId;
  name: string;
  accent: string;
};

export const COMPANIES: Company[] = [
  {
    id: "freight-forwarding",
    name: "Freight Forwarding",
    accent: "bg-emerald-500",
  },
  { id: "import-export", name: "Trading", accent: "bg-sky-500" },
  { id: "indenting", name: "Indenting", accent: "bg-amber-500" },
  { id: "customers", name: "Customers", accent: "bg-violet-500" },
];

type CompanyContextValue = {
  activeCompany: Company;
  setActiveCompanyId: (id: CompanyId) => void;
  isFreight: boolean;
  isTrading: boolean;
  isIndenting: boolean;
  isCustomers: boolean;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [activeCompanyId, setActiveCompanyId] = useState<CompanyId>(
    () =>
      (localStorage.getItem("freightos-active-company") as CompanyId) ??
      "freight-forwarding",
  );

  const activeCompany =
    COMPANIES.find((company) => company.id === activeCompanyId) ?? COMPANIES[0];

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
        isIndenting: activeCompanyId === "indenting",
        isCustomers: activeCompanyId === "customers",
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used inside <CompanyProvider>");
  return ctx;
}
