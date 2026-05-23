import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-700 shadow-[0_4px_14px_rgba(22,31,54,0.03)] outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;
