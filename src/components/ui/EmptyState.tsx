import type { ReactNode } from "react";
import Link from "next/link";

interface Action {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: Action;
  variant?: "dark" | "light";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "dark",
  className = "",
}: EmptyStateProps) {
  const isDark = variant === "dark";

  const containerCls = [
    "flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl",
    isDark ? "bg-white/[0.03] border border-white/[0.06]" : "bg-gray-50 border border-gray-200",
    className,
  ].join(" ");

  const titleCls = isDark
    ? "text-lg font-bold text-white/80 mb-2"
    : "text-lg font-bold text-gray-800 mb-2";

  const descCls = isDark
    ? "text-sm text-white/40 max-w-xs leading-relaxed"
    : "text-sm text-gray-500 max-w-xs leading-relaxed";

  const btnCls = isDark
    ? "mt-6 px-5 py-2.5 bg-[#D4A574] text-[#011C40] rounded-xl font-bold text-sm hover:bg-[#c89560] transition-colors"
    : "mt-6 px-5 py-2.5 bg-[#1E40AF] text-white rounded-xl font-bold text-sm hover:bg-[#1e3a8a] transition-colors";

  return (
    <div className={containerCls}>
      {icon && (
        <div className={`text-4xl mb-4 ${isDark ? "opacity-40" : "opacity-50"}`}>
          {icon}
        </div>
      )}
      <p className={titleCls}>{title}</p>
      <p className={descCls}>{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href} className={btnCls}>
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={btnCls}>
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
