// src/modules/trading/components/ShipmentDecisionDialog.tsx
import { Ship, X, CheckCircle, XCircle } from "lucide-react";
import type { Deal } from "../types";

type Props = {
  open: boolean;
  deal: Deal | null;
  onClose: () => void;
  onDecide: (freightByUs: boolean) => void;
};

export function ShipmentDecisionDialog({
  open,
  deal,
  onClose,
  onDecide,
}: Props) {
  if (!open || !deal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-blue-50">
              <Ship className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Step 6
              </div>
              <h2 className="text-[17px] font-bold tracking-[-0.03em] text-slate-900">
                Shipment Decision
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Deal summary */}
        <div className="mb-5 rounded-[12px] bg-slate-50 p-4 text-[13px]">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Deal Summary
          </div>
          <div className="space-y-1 text-slate-700">
            <div>
              <span className="text-slate-400">Deal ID:</span> {deal.id}
            </div>
            <div>
              <span className="text-slate-400">Customer:</span> {deal.customer}
            </div>
            <div>
              <span className="text-slate-400">Product:</span> {deal.product} —{" "}
              {deal.quantity.toLocaleString()} units
            </div>
            <div>
              <span className="text-slate-400">Value:</span> {deal.currency}{" "}
              {deal.totalValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Question */}
        <p className="mb-5 text-[15px] font-semibold text-slate-800">
          Will freight be handled by our company?
        </p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDecide(true)}
            className="flex flex-col items-center gap-2 rounded-[16px] border-2 border-emerald-200 bg-emerald-50 p-4 text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
          >
            <CheckCircle className="h-6 w-6" />
            <span className="text-[14px] font-bold">Yes</span>
            <span className="text-center text-[11px] text-emerald-600">
              Create freight shipment automatically
            </span>
          </button>
          <button
            type="button"
            onClick={() => onDecide(false)}
            className="flex flex-col items-center gap-2 rounded-[16px] border-2 border-slate-200 bg-slate-50 p-4 text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
          >
            <XCircle className="h-6 w-6" />
            <span className="text-[14px] font-bold">No</span>
            <span className="text-center text-[11px] text-slate-500">
              Close trading deal as completed
            </span>
          </button>
        </div>

        {/* Note */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          {/* BE: Selecting YES will call POST /api/v1/freight/shipments with deal data pre-filled */}
          This decision cannot be changed after confirmation.
        </p>
      </div>
    </div>
  );
}
