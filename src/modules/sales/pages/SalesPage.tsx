// src/modules/sales/pages/SalesPage.tsx
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Receipt, TrendingUp } from "lucide-react";

const SALES_MODULES = [
  {
    label: "Proforma Invoice",
    description: "Prepare a pre-shipment quote and agreement for the client.",
    icon: Receipt,
    route: "/sales/proforma-invoice",
    color: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    label: "Sales Overview",
    description: "Track sales pipeline, clients, and revenue performance.",
    icon: TrendingUp,
    route: null,
    color: "bg-slate-50",
    iconColor: "text-slate-400",
    soon: true,
  },
];

export default function SalesPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <span className="rounded-[8px] bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">
            Sales
          </span>
          <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
            Sales
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Manage quotations, proforma invoices, and client agreements.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SALES_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.label}
                type="button"
                onClick={() => mod.route && navigate(mod.route)}
                disabled={!mod.route}
                className={`group flex flex-col items-start gap-4 rounded-[18px] border border-slate-200 bg-white p-6 text-left shadow-[0_8px_24px_rgba(22,31,54,0.05)] transition ${mod.route ? "hover:border-emerald-200 hover:shadow-[0_12px_32px_rgba(22,31,54,0.09)]" : "cursor-default opacity-60"}`}
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-[12px] ${mod.color}`}
                >
                  <Icon className={`h-5 w-5 ${mod.iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-slate-900">
                      {mod.label}
                    </span>
                    {"soon" in mod && mod.soon && (
                      <span className="rounded-[5px] bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Soon
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[13px] leading-relaxed text-slate-500">
                    {mod.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
