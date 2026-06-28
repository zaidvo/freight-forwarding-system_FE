// src/modules/dashboard/pages/DashboardPage.tsx
//
// Dashboard shows fixed 5-tile module grid (Account Management, Operations,
// Finance, Sales, Marketing) — same for both companies.
// KPI strip above the tiles is company-aware.

import { AppLayout } from "@/components/layout/AppLayout";
import { useCompany } from "@/providers/CompanyProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useTradingStore } from "@/modules/trading/store/tradingStore";
import { useFreightStore } from "@/modules/freight/store/freightStore";
import { ModuleTile } from "../components/ModuleTile";
import { FREIGHT_MODULES, TRADING_MODULES } from "../data/modules";
import {
  Ship,
  Package,
  FileText,
  HandshakeIcon,
  CheckCircle,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── KPI strip ───────────────────────────────────────────────────
type KpiCard = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
};

function KpiStrip({ kpis }: { kpis: KpiCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-[14px] border border-slate-200 bg-white px-4 py-3 shadow-[0_4px_14px_rgba(22,31,54,0.04)]"
        >
          <div
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${bg}`}
          >
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {label}
            </div>
            <div className="text-[20px] font-bold tracking-[-0.03em] text-slate-900">
              {value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { isFreight } = useCompany();
  const { user } = useAuth();
  const { inquiries, deals } = useTradingStore();
  const { shipments, inquiries: freightInquiries } = useFreightStore();

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  const freightKpis: KpiCard[] = [
    {
      label: "Total Shipments",
      value: shipments.length,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "In Transit",
      value: shipments.filter((s) => s.status === "in_transit").length,
      icon: Ship,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
    {
      label: "Completed",
      value: shipments.filter((s) => s.status === "completed").length,
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Inquiries",
      value: freightInquiries.length,
      icon: FileText,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  const tradingKpis: KpiCard[] = [
    {
      label: "Inquiries",
      value: inquiries.length,
      icon: ShoppingCart,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
    {
      label: "Quoted",
      value: inquiries.filter((i) => i.status === "quoted").length,
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Deals Confirmed",
      value: deals.filter((d) => d.status === "deal_confirmed").length,
      icon: HandshakeIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Completed",
      value: deals.filter((d) => d.status === "trading_completed").length,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-50",
    },
  ];

  const kpis = isFreight ? freightKpis : tradingKpis;
  const modules = isFreight ? FREIGHT_MODULES : TRADING_MODULES;

  return (
    <AppLayout>
      <div className="max-w-none">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[20px] font-bold tracking-[-0.03em] text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {isFreight
              ? "Manage freight operations, shipments, documents and finance."
              : "Manage the full trading pipeline from inquiry to deal confirmation."}
          </p>
        </div>

        {/* KPI strip */}
        <div className="mb-8">
          <KpiStrip kpis={kpis} />
        </div>

        {/* Module tiles — company-specific */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {modules.map((m) => (
            <ModuleTile key={m.name} m={m} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
