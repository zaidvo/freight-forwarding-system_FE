// src/modules/dashboard/pages/DashboardPage.tsx
//
// Restores original ModuleTile grid style.
// Company-aware: different modules + KPIs per company.
// KPI row sits above the tile grid.
//
// BE integration:
//   GET /api/v1/dashboard/stats → replace useTradingStore/useFreightStore counts

import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCompany } from "@/providers/CompanyProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useTradingStore } from "@/modules/trading/store/tradingStore";
import { useFreightStore } from "@/modules/freight/store/freightStore";
import { ModuleTile } from "../components/ModuleTile";
import type { ModuleDef } from "../data/modules";
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

// ─── Module definitions per company ──────────────────────────────
const FREIGHT_MODULES: ModuleDef[] = [
  {
    name: "Freight Operations",
    icon: Ship,
    color: "#10b981",
    to: "/freight",
    ready: true,
  },
  {
    name: "Packing List",
    icon: ClipboardList,
    color: "#3b82f6",
    to: "/operations/packing-list",
    ready: true,
  },
  {
    name: "Bill of Lading",
    icon: FileText,
    color: "#0ea5e9",
    to: "/operations/bill-of-lading",
    ready: true,
  },
  {
    name: "Account Management",
    icon: Users,
    color: "#3b82f6",
    to: "/accounts",
    ready: true,
  },
  { name: "Finance", icon: Wallet, color: "#059669", ready: false },
  { name: "Reports", icon: BarChart3, color: "#c026d3", ready: false },
];

const TRADING_MODULES: ModuleDef[] = [
  {
    name: "Trading Pipeline",
    icon: TrendingUp,
    color: "#0ea5e9",
    to: "/trading",
    ready: true,
  },
  {
    name: "New Inquiry",
    icon: ShoppingCart,
    color: "#f59e0b",
    to: "/trading/inquiry/new",
    ready: true,
  },
  {
    name: "Proforma Invoice",
    icon: Receipt,
    color: "#8b5cf6",
    to: "/sales/proforma-invoice",
    ready: true,
  },
  {
    name: "Freight Shipments",
    icon: Ship,
    color: "#10b981",
    to: "/freight",
    ready: true,
  },
  {
    name: "Account Management",
    icon: Users,
    color: "#3b82f6",
    to: "/accounts",
    ready: true,
  },
  { name: "Finance", icon: Wallet, color: "#059669", ready: false },
  { name: "Reports", icon: BarChart3, color: "#c026d3", ready: false },
];

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

  const modules = isFreight ? FREIGHT_MODULES : TRADING_MODULES;
  const kpis = isFreight ? freightKpis : tradingKpis;

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
              ? "Freight forwarding operations, shipments and tracking."
              : "Trading pipeline — inquiries, deals and freight coordination."}
          </p>
        </div>

        {/* KPI strip */}
        <div className="mb-8">
          <KpiStrip kpis={kpis} />
        </div>

        {/* Module tiles — same grid as original */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {modules.map((m) => (
            <ModuleTile key={m.name} m={m} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
