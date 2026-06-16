// src/modules/dashboard/pages/DashboardPage.tsx
//
// Company-aware dashboard.
// Reads activeCompany from CompanyProvider.
// Freight company → shows freight KPIs + freight module tiles.
// Trading company → shows trading pipeline KPIs + trading module tiles.
//
// BE integration:
//   GET /api/v1/dashboard/freight-stats → replace useTradingStore/useFreightStore counts
//   GET /api/v1/dashboard/trading-stats → same

import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCompany } from "@/providers/CompanyProvider";
import { useTradingStore } from "@/modules/trading/store/tradingStore";
import { useFreightStore } from "@/modules/freight/store/freightStore";
import {
  Ship,
  Users,
  TrendingUp,
  Package,
  FileText,
  HandshakeIcon,
  CheckCircle,
  ClipboardList,
  Receipt,
  Wallet,
  BarChart3,
  ShoppingCart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ModuleTileProps = {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  to?: string;
  soon?: boolean;
};

function ModuleTile({
  label,
  description,
  icon: Icon,
  color,
  iconBg,
  to,
  soon,
}: ModuleTileProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      disabled={soon || !to}
      onClick={() => to && navigate(to)}
      className={`flex flex-col items-start gap-3 rounded-[18px] border border-slate-200 bg-white p-5 text-left shadow-[0_8px_24px_rgba(22,31,54,0.05)] transition ${
        soon || !to
          ? "cursor-default opacity-50"
          : "hover:border-slate-300 hover:shadow-[0_12px_32px_rgba(22,31,54,0.09)]"
      }`}
    >
      <div
        className={`grid h-11 w-11 place-items-center rounded-[12px] ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-slate-900">
            {label}
          </span>
          {soon && (
            <span className="rounded-[5px] bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Soon
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
          {description}
        </div>
      </div>
    </button>
  );
}

type KpiCard = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
};

function KpiCard({ label, value, icon: Icon, color, bg }: KpiCard) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </div>
          <div className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-slate-900">
            {value}
          </div>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-[12px] ${bg}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Freight Dashboard ───────────────────────────────────────────
function FreightDashboard() {
  const { shipments, inquiries } = useFreightStore();

  const kpis: KpiCard[] = [
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
      value: inquiries.length,
      icon: FileText,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  const modules: ModuleTileProps[] = [
    {
      label: "Freight Operations",
      description: "Manage shipments end-to-end",
      icon: Ship,
      color: "text-emerald-500",
      iconBg: "bg-emerald-50",
      to: "/freight",
    },
    {
      label: "Packing List",
      description: "Create cargo packing details",
      icon: ClipboardList,
      color: "text-blue-500",
      iconBg: "bg-blue-50",
      to: "/operations/packing-list",
    },
    {
      label: "Bill of Lading",
      description: "Sea freight title document",
      icon: FileText,
      color: "text-sky-500",
      iconBg: "bg-sky-50",
      to: "/operations/bill-of-lading",
    },
    {
      label: "Account Management",
      description: "Users, roles & permissions",
      icon: Users,
      color: "text-blue-500",
      iconBg: "bg-blue-50",
      to: "/accounts",
    },
    {
      label: "Finance",
      description: "Payments and P&L",
      icon: Wallet,
      color: "text-green-500",
      iconBg: "bg-green-50",
      soon: true,
    },
    {
      label: "Reports",
      description: "Analytics and exports",
      icon: BarChart3,
      color: "text-purple-500",
      iconBg: "bg-purple-50",
      soon: true,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <ModuleTile key={m.label} {...m} />
        ))}
      </div>
    </>
  );
}

// ─── Trading Dashboard ───────────────────────────────────────────
function TradingDashboard() {
  const { inquiries, deals } = useTradingStore();

  const kpis: KpiCard[] = [
    {
      label: "Total Inquiries",
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

  const modules: ModuleTileProps[] = [
    {
      label: "Trading Pipeline",
      description: "Inquiries to deal confirmation",
      icon: TrendingUp,
      color: "text-sky-500",
      iconBg: "bg-sky-50",
      to: "/trading",
    },
    {
      label: "New Inquiry",
      description: "Start a new trading inquiry",
      icon: ShoppingCart,
      color: "text-amber-500",
      iconBg: "bg-amber-50",
      to: "/trading/inquiry/new",
    },
    {
      label: "Proforma Invoice",
      description: "Generate PI from quotation",
      icon: Receipt,
      color: "text-purple-500",
      iconBg: "bg-purple-50",
      to: "/sales/proforma-invoice",
    },
    {
      label: "Freight Shipments",
      description: "Shipments from trading deals",
      icon: Ship,
      color: "text-emerald-500",
      iconBg: "bg-emerald-50",
      to: "/freight",
    },
    {
      label: "Account Management",
      description: "Users, roles & permissions",
      icon: Users,
      color: "text-blue-500",
      iconBg: "bg-blue-50",
      to: "/accounts",
    },
    {
      label: "Finance",
      description: "Payments and P&L",
      icon: Wallet,
      color: "text-green-500",
      iconBg: "bg-green-50",
      soon: true,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <ModuleTile key={m.label} {...m} />
        ))}
      </div>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { isFreight, activeCompany } = useCompany();

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div
            className={`inline-flex items-center rounded-[8px] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
              isFreight
                ? "bg-emerald-50 text-emerald-600"
                : "bg-sky-50 text-sky-600"
            }`}
          >
            {activeCompany.name}
          </div>
          <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
            {isFreight
              ? "Freight Forwarding Dashboard"
              : "Trading Operations Dashboard"}
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {isFreight
              ? "Overview of your freight operations, shipments and tracking."
              : "Overview of your trading pipeline, deals and inquiries."}
          </p>
        </div>

        {isFreight ? <FreightDashboard /> : <TradingDashboard />}
      </div>
    </AppLayout>
  );
}
