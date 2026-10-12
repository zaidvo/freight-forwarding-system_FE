import type { IndentingDealStatus, IndentingPaymentStatus } from "../types";

export function DealStatusBadge({ status }: { status: IndentingDealStatus }) {
  const configs: Record<IndentingDealStatus, { label: string; className: string }> = {
    open: {
      label: "Open",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    closed: {
      label: "Closed",
      className: "bg-slate-100 text-slate-700 border-slate-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  const config = configs[status] ?? {
    label: status,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: IndentingPaymentStatus }) {
  const configs: Record<IndentingPaymentStatus, { label: string; className: string }> = {
    pending: {
      label: "Payment Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    partial: {
      label: "Partially Paid",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    paid: {
      label: "Fully Paid",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    overpaid: {
      label: "Overpaid",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
  };

  const config = configs[status] ?? {
    label: status,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
