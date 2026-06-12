"use client";

/**
 * Resaltado de términos de glosario dentro de la prosa de una lectura, acotado
 * ESTRICTAMENTE al glosario de la propia materia (UAC). Recibe ya filtrado el
 * subconjunto de términos presentes (calculado en el servidor) y:
 *   - localiza cada término (palabra completa, insensible a acentos),
 *   - lo subraya con punteado en el color de la materia,
 *   - muestra su definición verbatim en un tooltip accesible, con atribución
 *     "Glosario · {materia}" para no presentarla como verdad universal.
 *
 * Sólo se resalta la PRIMERA aparición de cada término por documento (vía un
 * Set compartido) para no saturar la lectura.
 */

import { Fragment, useId, useState, type ReactNode } from "react";
import {
  encontrarMatches,
  type PreparedTerm,
} from "@/lib/glosario/matcher";

export interface GlosarioCtx {
  /** Términos presentes ya preparados (plegados + ordenados). */
  prepared: PreparedTerm[];
  /** Formas ya resaltadas en este documento (mutado en orden de aparición). */
  seen: Set<string>;
  /** Color de acento de la materia (hex). */
  accent: string;
  /** Nombre de la materia, para la atribución del tooltip. */
  materia: string;
}

// ── Tooltip individual ───────────────────────────────────────────────────────

function GlosarioTooltip({
  texto,
  definicion,
  materia,
  accent,
}: {
  texto: string;
  definicion: string;
  materia: string;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      style={{ position: "relative", display: "inline" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        role="button"
        tabIndex={0}
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        style={{
          borderBottom: `1.5px dotted ${accent}`,
          cursor: "help",
          color: "inherit",
          outline: "none",
        }}
      >
        {texto}
      </span>

      {open && (
        <span
          id={id}
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            width: "max-content",
            maxWidth: 280,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(10,15,28,0.97)",
            border: `1px solid ${accent}55`,
            boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            textAlign: "left",
            pointerEvents: "none",
            fontFamily: "var(--font-epilogue), sans-serif",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: accent,
              marginBottom: 5,
            }}
          >
            {texto}
          </span>
          <span
            style={{
              display: "block",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.86)",
              fontWeight: 400,
              fontStyle: "normal",
              letterSpacing: 0,
            }}
          >
            {definicion}
          </span>
          <span
            style={{
              display: "block",
              marginTop: 8,
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.38)",
            }}
          >
            Glosario · {materia}
          </span>
          {/* Flecha */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(10,15,28,0.97)",
            }}
          />
        </span>
      )}
    </span>
  );
}

// ── Helpers de resaltado ─────────────────────────────────────────────────────

/** Divide un string de prosa en texto plano + términos resaltados. */
function resaltarTexto(text: string, ctx: GlosarioCtx, keyBase: string): ReactNode {
  const matches = encontrarMatches(text, ctx.prepared, ctx.seen);
  if (matches.length === 0) return text;

  const piezas: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, idx) => {
    if (m.start > cursor) piezas.push(text.slice(cursor, m.start));
    piezas.push(
      <GlosarioTooltip
        key={`${keyBase}-${idx}`}
        texto={text.slice(m.start, m.end)}
        definicion={m.d}
        materia={ctx.materia}
        accent={ctx.accent}
      />,
    );
    cursor = m.end;
  });
  if (cursor < text.length) piezas.push(text.slice(cursor));
  return piezas;
}

/**
 * Procesa los `children` de un nodo de prosa (p / li): resalta los segmentos de
 * texto plano y deja intactos los elementos inline (negritas, énfasis, código,
 * enlaces). No desciende dentro de esos elementos a propósito (evita estilos
 * anidados y mantiene el comportamiento predecible).
 */
export function resaltarChildren(children: ReactNode, ctx: GlosarioCtx): ReactNode {
  if (ctx.prepared.length === 0) return children;
  if (typeof children === "string") return resaltarTexto(children, ctx, "g");
  if (Array.isArray(children)) {
    return children.map((child, i) =>
      typeof child === "string" ? (
        <Fragment key={i}>{resaltarTexto(child, ctx, `g${i}`)}</Fragment>
      ) : (
        child
      ),
    );
  }
  return children;
}
