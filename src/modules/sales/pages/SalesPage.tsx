// src/modules/sales/pages/SalesPage.tsx
//
// Company-aware Sales landing page.
//
// Freight Forwarding  → Proforma Invoice, Sales Overview (soon)
// Import / Export     → Quotation, Proforma Invoice, Purchase Order, Sales Overview (soon)

import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useCompany } from "@/app/providers/CompanyProvider";
import { Receipt, TrendingUp, FileText, ShoppingCart } from "lucide-react";

type SaleMod = {
  label: string;
  description: string;
  icon: React.ElementType;
  route: string | null;
  accent: string;
  iconColor: string;
  soon?: boolean;
};

const FREIGHT_SALES: SaleMod[] = [
  {
    label: "Proforma Invoice",
    description: "Prepare a pre-shipment quote and agreement for the client.",
    icon: Receipt,
    route: "/sales/proforma-invoice",
    accent: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    label: "Sales Overview",
    description: "Track sales pipeline, clients and revenue performance.",
    icon: TrendingUp,
    route: null,
    accent: "bg-slate-50",
    iconColor: "text-slate-400",
    soon: true,
  },
];

const TRADING_SALES: SaleMod[] = [
  {
    label: "Quotation",
    description: "Create and send quotations from buyer inquiries.",
    icon: FileText,
    route: "/trading/quotation/new",
    accent: "bg-violet-50",
    iconColor: "text-violet-500",
  },
  {
    label: "Proforma Invoice",
    description: "Generate a proforma invoice once the quotation is accepted.",
    icon: Receipt,
    route: "/trading/pi/new",
    accent: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    label: "Purchase Order",
    description: "Record and store the customer's purchase order.",
    icon: ShoppingCart,
    route: "/trading/po/new",
    accent: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    label: "Sales Overview",
    description: "Track sales pipeline, clients and revenue performance.",
    icon: TrendingUp,
    route: null,
    accent: "bg-slate-50",
    iconColor: "text-slate-400",
    soon: true,
  },
];

export default function SalesPage() {
  const navigate = useNavigate();
  const { isFreight } = useCompany();

  const modules = isFreight ? FREIGHT_SALES : TRADING_SALES;
  const badgeColor = isFreight
    ? "bg-emerald-50 text-emerald-600"
    : "bg-amber-50 text-amber-600";
  const hoverBorder = isFreight
    ? "hover:border-emerald-200"
    : "hover:border-amber-200";
  const subtitle = isFreight
    ? "Manage proforma invoices and client agreements."
    : "Manage quotations, proforma invoices, purchase orders and client agreements.";

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <span
            className={`rounded-[8px] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${badgeColor}`}
          >
            Sales
          </span>
          <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
            Sales
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">{subtitle}</p>
        </div>

        {/* Sub-module cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.label}
                type="button"
                onClick={() => mod.route && navigate(mod.route)}
                disabled={!mod.route}
                className={[
                  "group flex flex-col items-start gap-4 rounded-[18px] border border-slate-200 bg-white p-6 text-left",
                  "shadow-[0_8px_24px_rgba(22,31,54,0.05)] transition",
                  mod.route
                    ? `cursor-pointer ${hoverBorder} hover:shadow-[0_12px_32px_rgba(22,31,54,0.09)]`
                    : "cursor-default opacity-60",
                ].join(" ")}
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-[12px] ${mod.accent}`}
                >
                  <Icon className={`h-5 w-5 ${mod.iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-slate-900">
                      {mod.label}
                    </span>
                    {mod.soon && (
                      <span className="rounded-[5px] bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                    {mod.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
