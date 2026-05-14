import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function Skeleton({
  lines,
  className = "",
  ...props
}: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={[
              "animate-pulse rounded-lg bg-ink-10",
              i === lines - 1 ? "h-3 w-3/4" : "h-3 w-full",
            ].join(" ")}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      {...props}
      className={[
        "animate-pulse rounded-lg bg-ink-10",
        className,
      ].join(" ")}
    />
  );
}
