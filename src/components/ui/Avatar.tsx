import type { HTMLAttributes } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: AvatarSize;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  src,
  size = "md",
  className = "",
  ...props
}: AvatarProps) {
  const label = name ? initials(name) : "?";

  if (src) {
    return (
      <div
        {...props}
        className={[
          "overflow-hidden rounded-full bg-cen-blue-soft",
          sizeStyles[size],
          className,
        ].join(" ")}
      >
        <img src={src} alt={name ?? "avatar"} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      {...props}
      aria-label={name ?? "avatar"}
      className={[
        "flex items-center justify-center rounded-full bg-cen-navy font-bold text-white",
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {label}
    </div>
  );
}
