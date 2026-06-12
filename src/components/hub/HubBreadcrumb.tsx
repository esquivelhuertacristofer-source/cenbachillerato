import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export interface BreadcrumbItem {
  label: ReactNode;
  /** Si se define (y no es el último crumb), se renderiza como enlace. */
  href?: string;
  /** Ancho máximo del crumb en px antes de truncar con elipsis. */
  maxWidth?: number;
}

export interface HubBreadcrumbProps {
  items: BreadcrumbItem[];
  /** Color del último crumb (acento de la materia). Default: rgba(255,255,255,0.65). */
  accentHex?: string;
  /** Separador entre crumbs. "slash" (default, hub oscuro) o "chevron". */
  separator?: "slash" | "chevron";
  /** Overrides del contenedor (p.ej. fontSize en Biblioteca). */
  style?: CSSProperties;
}

const LINK_COLOR = "rgba(255,255,255,0.28)";
const SEP_COLOR = "rgba(255,255,255,0.16)";
const LAST_COLOR = "rgba(255,255,255,0.65)";

/**
 * Migas de pan compartidas del hub. Fuente única para los breadcrumbs que
 * antes estaban duplicados ad-hoc en ProgresionClient, ActivityShell y
 * PracticaRunner. Sin "use client": funciona igual en componentes de servidor
 * (Biblioteca) y de cliente (runners). No usa hooks.
 */
export function HubBreadcrumb({ items, accentHex, separator = "slash", style }: HubBreadcrumbProps) {
  const gap = separator === "chevron" ? 8 : 5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap, fontSize: 11, overflow: "hidden", minWidth: 0, ...style }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const linkable = Boolean(item.href) && !isLast;
        return (
          <span key={i} style={{ display: "flex", alignItems: "center", gap, minWidth: 0 }}>
            {i > 0 &&
              (separator === "chevron" ? (
                <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: SEP_COLOR }} aria-hidden />
              ) : (
                <span style={{ color: SEP_COLOR }} aria-hidden>
                  /
                </span>
              ))}
            {linkable ? (
              <Link
                href={item.href as string}
                style={{
                  color: LINK_COLOR,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: item.maxWidth ?? 160,
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                style={{
                  color: isLast ? accentHex ?? LAST_COLOR : LINK_COLOR,
                  fontWeight: isLast ? 700 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: item.maxWidth ?? (isLast ? 220 : 160),
                }}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default HubBreadcrumb;
