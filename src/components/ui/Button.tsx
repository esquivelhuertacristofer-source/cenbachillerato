import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "relative overflow-hidden bg-cen-navy text-white " +
    "hover:bg-cen-blue hover:-translate-y-1 " +
    "shadow-[0_10px_25px_rgba(11,37,69,0.15)] hover:shadow-[0_15px_35px_rgba(11,37,69,0.25)] " +
    "focus-visible:outline-cen-navy disabled:bg-cen-navy/40 disabled:shadow-none",
  secondary:
    "bg-white text-cen-navy border-2 border-cen-navy " +
    "hover:bg-cen-cool " +
    "focus-visible:outline-cen-navy",
  ghost:
    "bg-transparent text-ink hover:bg-ink-10 " +
    "focus-visible:outline-gray-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 " +
    "focus-visible:outline-red-600 disabled:bg-red-300",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl font-bold uppercase tracking-widest",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "transition-all duration-300 disabled:cursor-not-allowed disabled:translate-y-0",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-1/2 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
