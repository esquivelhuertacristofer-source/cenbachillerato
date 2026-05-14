import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  "bg-cen-blue-soft text-cen-blue",
  primary:  "bg-cen-navy text-white",
  success:  "bg-emerald-100 text-emerald-700",
  warning:  "bg-amber-50 text-amber-700",
  error:    "bg-red-50 text-red-700",
  muted:    "bg-slate-100 text-slate-500",
};

export function Badge({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
        "text-[10px] font-black uppercase tracking-[0.15em]",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
