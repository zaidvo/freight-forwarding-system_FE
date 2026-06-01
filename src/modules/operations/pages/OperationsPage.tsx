// src/modules/operations/pages/OperationsPage.tsx
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClipboardList, Ship } from "lucide-react";

const OPERATIONS_MODULES = [
  {
    label: "Packing List",
    description: "Create cargo packing details for customs and shipping.",
    icon: ClipboardList,
    route: "/operations/packing-list",
    color: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Bill of Lading",
    description:
      "Prepare the sea freight title document issued by the shipping line.",
    icon: Ship,
    route: "/operations/bill-of-lading",
    color: "bg-sky-50",
    iconColor: "text-sky-500",
  },
];

export default function OperationsPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <span className="rounded-[8px] bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Operations
          </span>
          <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
            Operations
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Manage shipment documentation, cargo packing, and freight documents.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPERATIONS_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.route}
                type="button"
                onClick={() => navigate(mod.route)}
                className="group flex flex-col items-start gap-4 rounded-[18px] border border-slate-200 bg-white p-6 text-left shadow-[0_8px_24px_rgba(22,31,54,0.05)] transition hover:border-blue-200 hover:shadow-[0_12px_32px_rgba(22,31,54,0.09)]"
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-[12px] ${mod.color}`}
                >
                  <Icon className={`h-5 w-5 ${mod.iconColor}`} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-slate-900">
                    {mod.label}
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
