import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-500 text-white shadow-[0_10px_20px_rgba(59,130,246,0.18)] hover:bg-blue-600",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-[0_4px_14px_rgba(22,31,54,0.04)] hover:bg-slate-50",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-rose-500 text-white shadow-[0_10px_20px_rgba(244,63,94,0.14)] hover:bg-rose-600",
  soft: "bg-blue-50 text-blue-700 hover:bg-blue-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-11 px-5 text-[14px]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

export default Button;
