import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      className={`animate-pulse rounded-lg ${className}`}
    />
  );
}
