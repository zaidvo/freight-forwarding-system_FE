import type { AuditAction } from "../types";

const ACTION_STYLES: Record<AuditAction, string> = {
  create: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  update: "bg-blue-50 text-blue-700 ring-blue-200",
  delete: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function ActionBadge({ action }: { action: AuditAction }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ring-1 ${ACTION_STYLES[action]}`}
    >
      {action}
    </span>
  );
}
