import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useCompany } from "@/app/providers/CompanyProvider";
import { ClipboardList, FileText, Ship, ShoppingCart, TrendingUp } from "lucide-react";

type OpModule = {
  label: string;
  description: string;
  icon: React.ElementType;
  route: string;
  accent: string;
  iconColor: string;
};

const FREIGHT_OPS: OpModule[] = [
  {
    label: "Freight Operations",
    description: "View and manage active freight shipments and their status.",
    icon: Ship,
    route: "/freight",
    accent: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    label: "Packing List",
    description: "Create cargo packing details for customs and shipping.",
    icon: ClipboardList,
    route: "/operations/packing-list",
    accent: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Bill of Lading",
    description: "Prepare sea freight title documents issued by the shipping line.",
    icon: FileText,
    route: "/operations/bill-of-lading",
    accent: "bg-sky-50",
    iconColor: "text-sky-500",
  },
];

const TRADING_OPS: OpModule[] = [
  {
    label: "Trading Pipeline",
    description: "View live trading inquiries created in this workspace.",
    icon: TrendingUp,
    route: "/trading",
    accent: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    label: "New Inquiry",
    description: "Start a new buyer inquiry and kick off the trading workflow.",
    icon: ShoppingCart,
    route: "/trading/inquiry/new",
    accent: "bg-amber-50",
    iconColor: "text-amber-500",
  },
];

export default function OperationsPage() {
  const navigate = useNavigate();
  const { isFreight } = useCompany();

  const modules = isFreight ? FREIGHT_OPS : TRADING_OPS;
  const title = isFreight ? "Freight Operations" : "Trading Operations";
  const subtitle = isFreight
    ? "Manage shipment documentation, cargo tracking, and freight documents."
    : "Manage trading inquiries, quotations, deals, and shipment coordination.";
  const badgeColor = isFreight ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600";
  const hoverBorder = isFreight ? "hover:border-emerald-200" : "hover:border-sky-200";

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <span className={`rounded-[8px] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${badgeColor}`}>
            Operations
          </span>
          <h1 className="mt-2 text-[24px] font-bold tracking-[-0.04em] text-slate-950">{title}</h1>
          <p className="mt-1 max-w-2xl text-[14px] leading-6 text-slate-500">{subtitle}</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.label}
                type="button"
                onClick={() => navigate(mod.route)}
                className={[
                  "group flex flex-col items-start gap-4 rounded-[18px] border border-slate-200 bg-white p-6 text-left",
                  "shadow-[0_8px_24px_rgba(22,31,54,0.05)] transition",
                  `cursor-pointer ${hoverBorder} hover:shadow-[0_12px_32px_rgba(22,31,54,0.09)]`,
                ].join(" ")}
              >
                <div className={`grid h-11 w-11 place-items-center rounded-[12px] ${mod.accent}`}>
                  <Icon className={`h-5 w-5 ${mod.iconColor}`} />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-slate-900">{mod.label}</span>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{mod.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

