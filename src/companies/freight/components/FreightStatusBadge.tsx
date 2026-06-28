// src/modules/freight/components/FreightStatusBadge.tsx
import { FREIGHT_STATUS_LABELS, FREIGHT_STATUS_COLORS } from "../data/seed";

export function FreightStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold ${
        FREIGHT_STATUS_COLORS[status] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {FREIGHT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
