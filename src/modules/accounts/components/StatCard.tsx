import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  note: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  note,
}: StatCardProps) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </div>
          <div className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-slate-900">
            {value}
          </div>
          <div className="mt-1 text-[12px] text-slate-400">{note}</div>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-2xl ${accent}`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
