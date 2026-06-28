// src/modules/trading/components/StatusBadge.tsx
import { STATUS_LABELS, STATUS_COLORS } from "../data/seed";

type Props = { status: string };

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold ${
        STATUS_COLORS[status] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
