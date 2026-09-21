"use client";

/**
 * EL TABLERO DE OBJETIVOS — lo que el laboratorio pide y lo que se gana.
 *
 * El defecto que arregla: 29 laboratorios 3D pintaban su lista de objetivos
 * derivándola del estado de la escena («done: modo === 'orbita'»). Eso tiene
 * dos consecuencias que el alumno sí nota:
 *
 *   1. Los objetivos se DESMARCABAN al cambiar de modo, porque el estado del
 *      que colgaban ya no era el mismo. Se cumplía uno y se perdía otro.
 *   2. No valían nada. Cumplir los cuatro no dejaba marca: al recargar la
 *      página el tablero volvía a cero y no había estrellas que ganar, así que
 *      tampoco razón para volver a entrar.
 *
 * Los otros 158 laboratorios ya lo resolvían con `useLogros` (memoria) y
 * `useEstrellas` (la mejor marca, en localStorage y en la base). Aquí está esa
 * misma contabilidad en una sola pieza, para que un laboratorio la use con una
 * línea y no la reimplemente cada uno a su manera.
 *
 * Cómo se ganan las estrellas —y se le dice al alumno, no se esconde—:
 *   · todos los objetivos          → 3★
 *   · dos tercios o más            → 2★
 *   · al menos uno                 → 1★
 *
 * Como `useEstrellas` guarda el MÁXIMO, volver a entrar nunca empeora la marca.
 */

import { useEffect } from "react";
import { T } from "./_kit";
import { useLogros } from "./_partida";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const OK = "#34D399";

export interface ObjetivoLab {
  txt: string;
  done: boolean;
}

export function estrellasPorObjetivos(cumplidos: number, total: number): number {
  if (cumplidos <= 0 || total <= 0) return 0;
  if (cumplidos >= total) return 3;
  return cumplidos >= Math.ceil((total * 2) / 3) ? 2 : 1;
}

export function TableroObjetivos({
  objetivos,
  retoKey,
  accent,
}: {
  objetivos: ObjetivoLab[];
  /** Clave del reto del laboratorio: `cen-<slug>-reto`. */
  retoKey: string;
  accent: string;
}) {
  const { logros, cumplidos, total } = useLogros(objetivos.map((o) => o.done));
  const { mejorEstrellas, registraEstrellas } = useEstrellas(retoKey);

  const estrellas = estrellasPorObjetivos(cumplidos, total);

  useEffect(() => {
    if (cumplidos === 0) return;
    registraEstrellas(estrellasPorObjetivos(cumplidos, total));
  }, [cumplidos, total, registraEstrellas]);

  const marca = Math.max(mejorEstrellas, estrellas);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
        {objetivos.map((o, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              fontSize: 13.5,
              color: logros[i] ? OK : T.text2,
            }}
          >
            <i className={`fa-solid ${logros[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logros[i] ? 1 : 0.3 }} />
            <span style={{ fontWeight: logros[i] ? 700 : 500 }}>{o.txt}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${T.line}`,
        }}
      >
        <span style={{ fontSize: 12.5, color: T.text3 }}>
          <strong style={{ color: cumplidos >= total ? OK : T.text2 }}>
            {cumplidos} de {total}
          </strong>{" "}
          · cumplirlos todos vale 3 estrellas
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }} aria-label={`Mejor marca: ${marca} de 3 estrellas`}>
          {[0, 1, 2].map((i) => (
            <i
              key={i}
              className="fa-solid fa-star"
              aria-hidden
              style={{
                fontSize: 15,
                color: i < marca ? accent : T.line,
                opacity: i < marca ? 1 : 0.55,
              }}
            />
          ))}
        </span>
      </div>
    </>
  );
}
