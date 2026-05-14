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
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
        hoverable &&
          "cursor-pointer transition-shadow duration-150 hover:shadow-md",
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
  return (
    <div className={`mb-4 ${className}`}>{children}</div>
  );
}

export function CardTitle({
  children,
  className = "",
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
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
