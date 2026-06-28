// src/modules/trading/components/WorkflowStepper.tsx
import type { TradingStatus } from "../types";

const STEPS: { status: TradingStatus; label: string }[] = [
  { status: "inquiry_received", label: "Inquiry" },
  { status: "quoted", label: "Quotation" },
  { status: "pi_issued", label: "Proforma Invoice" },
  { status: "po_received", label: "Purchase Order" },
  { status: "deal_confirmed", label: "Deal Confirmed" },
  { status: "shipment_created", label: "Shipment / Complete" },
];

const STATUS_ORDER: TradingStatus[] = [
  "draft",
  "inquiry_received",
  "quoted",
  "pi_issued",
  "po_received",
  "deal_confirmed",
  "shipment_created",
  "trading_completed",
];

type Props = { currentStatus: TradingStatus };

export function WorkflowStepper({ currentStatus }: Props) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-0 overflow-x-auto rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      {STEPS.map((step, i) => {
        const stepIdx = STATUS_ORDER.indexOf(step.status);
        const done = currentIdx > stepIdx;
        const active = currentIdx === stepIdx;

        return (
          <div key={step.status} className="flex flex-1 items-center min-w-0">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`text-center text-[10px] font-semibold leading-tight ${
                  active
                    ? "text-blue-600"
                    : done
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 transition ${
                  done ? "bg-emerald-300" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
