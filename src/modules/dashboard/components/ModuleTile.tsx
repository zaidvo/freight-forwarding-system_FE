import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ModuleDef } from "../data/modules";

export function ModuleTile({ m }: { m: ModuleDef }) {
  const Icon = m.icon;
  const tile = (
    <div className="group flex flex-col items-center text-center">
      <div
        className={cn(
          "relative flex h-[62px] w-[62px] items-center justify-center rounded-[14px] shadow-[0_8px_18px_rgba(15,23,42,0.08)] ring-1 ring-black/5 transition-transform",
          m.ready
            ? "cursor-pointer group-hover:scale-[1.03] group-hover:shadow-[0_12px_26px_rgba(15,23,42,0.12)]"
            : "opacity-90",
        )}
        style={{
          background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}dd 100%)`,
        }}
      >
        <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
        {!m.ready && (
          <span className="absolute -right-1.5 -top-1.5 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 shadow-sm">
            Soon
          </span>
        )}
      </div>
      <div className="mt-2.5 max-w-[92px] text-[12px] font-semibold leading-tight text-slate-700 line-clamp-2">
        {m.name}
      </div>
    </div>
  );
  return m.ready && m.to ? (
    <Link to={m.to} className="block">
      {tile}
    </Link>
  ) : (
    <div>{tile}</div>
  );
}
