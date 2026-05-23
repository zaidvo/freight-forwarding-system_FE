import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4.5 w-4.5 rounded-[4px] border-slate-300 text-blue-500 focus:ring-4 focus:ring-blue-100",
        className,
      )}
      {...props}
    />
  );
}

export default Checkbox;
