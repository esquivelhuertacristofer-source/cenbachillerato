import type { HTMLAttributes } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info:    "border-cen-blue-soft bg-cen-cool text-cen-navy",
  success: "border-emerald-100 bg-emerald-50 text-emerald-800",
  warning: "border-amber-100 bg-amber-50 text-amber-800",
  error:   "border-red-100 bg-red-50 text-red-800",
};

const titleStyles: Record<AlertVariant, string> = {
  info:    "text-cen-navy",
  success: "text-emerald-900",
  warning: "text-amber-900",
  error:   "text-red-900",
};

export function Alert({
  variant = "info",
  title,
  children,
  className = "",
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      role="alert"
      className={[
        "rounded-2xl border px-5 py-4 animate-slide-down",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {title && (
        <p className={`mb-1 text-sm font-bold ${titleStyles[variant]}`}>{title}</p>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}
