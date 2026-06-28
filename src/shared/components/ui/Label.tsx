import type { LabelHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-[13px] font-semibold text-slate-700", className)}
      {...props}
    />
  );
}

export default Label;
