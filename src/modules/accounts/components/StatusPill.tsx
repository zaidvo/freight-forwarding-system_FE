import type { UserStatus } from "../types";
import { cn } from "@/lib/utils";

const MAP: Record<UserStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
};

export function StatusPill({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        MAP[status],
      )}
    >
      {status}
    </span>
  );
}
