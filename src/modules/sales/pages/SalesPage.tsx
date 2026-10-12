// src/modules/sales/pages/SalesPage.tsx
//
// Company-aware Sales landing page.
// Freight Forwarding  → Proforma Invoice
// Import / Export     → Import Shipments, Quotation, Proforma Invoice, Purchase Order

import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useCompany } from "@/app/providers/CompanyProvider";
import { Receipt, FileText, ShoppingCart, Ship } from "lucide-react";

type SaleMod = {
  label: string;
  description: string;
  icon: React.ElementType;
  route: string;
  accent: string;
  iconColor: string;
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
];

const TRADING_SALES: SaleMod[] = [
  {
    label: "Import Shipments",
    description: "Manage the complete import lifecycle and document flow.",
    icon: Ship,
    route: "/trading/imports",
    accent: "bg-sky-50",
    iconColor: "text-sky-500",
  },
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
                onClick={() => navigate(mod.route)}
                className={[
                  "group flex flex-col items-start gap-4 rounded-[18px] border border-slate-200 bg-white p-6 text-left",
                  "shadow-[0_8px_24px_rgba(22,31,54,0.05)] transition",
                  `cursor-pointer ${hoverBorder} hover:shadow-[0_12px_32px_rgba(22,31,54,0.09)]`,
                ].join(" ")}
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-[12px] ${mod.accent}`}
                >
                  <Icon className={`h-5 w-5 ${mod.iconColor}`} />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-slate-900">
                    {mod.label}
                  </span>
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
