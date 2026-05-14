import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({
  hoverable = false,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        "rounded-2xl border border-ink-10 bg-white p-6 shadow-sm",
        hoverable &&
          "cursor-pointer transition-shadow duration-300 hover:shadow-md hover:shadow-[0_40px_80px_rgba(11,37,69,0.08)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = "",
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold text-ink ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = "",
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={className}>{children}</div>;
}
