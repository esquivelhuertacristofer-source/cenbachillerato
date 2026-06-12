"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/hooks";
import { TIPOS_RECURSO, getTipoRecursoMeta } from "@/lib/mccems/tipos-recurso";
import type { ProgresionBrowser } from "@/lib/queries/hub-browser";

interface Destino {
  numero: number;
  orden: number;
}

interface TipoAgg {
  tipo: string;
  total: number;
  completadas: number;
  /** Primera actividad pendiente de este tipo; si todas están hechas, la primera. */
  destino: Destino;
}

interface Props {
  progresiones: ProgresionBrowser[];
  codigoUAC: string;
  accent: string;
}

/** Orden canónico de los tipos para que el mosaico sea estable y legible. */
const PESO_TIPO = new Map(TIPOS_RECURSO.map((t, i) => [t.tipo, i]));

/**
 * Agrega las actividades de toda la materia por tipo y calcula, para cada uno,
 * el destino directo (primera pendiente, o la primera si ya está todo hecho).
 */
function agregarPorTipo(progresiones: ProgresionBrowser[]): TipoAgg[] {
  const acc = new Map<
    string,
    { total: number; completadas: number; primera: Destino | null; pendiente: Destino | null }
  >();

  for (const prog of progresiones) {
    for (const act of prog.actividades) {
      const cur =
        acc.get(act.tipo) ?? { total: 0, completadas: 0, primera: null, pendiente: null };
      cur.total += 1;
      if (act.estado === "completada") cur.completadas += 1;
      const aqui: Destino = { numero: prog.numero, orden: act.orden };
      if (!cur.primera) cur.primera = aqui;
      if (!cur.pendiente && act.estado !== "completada") cur.pendiente = aqui;
      acc.set(act.tipo, cur);
    }
  }

  return [...acc.entries()]
    .map(([tipo, v]) => ({
      tipo,
      total: v.total,
      completadas: v.completadas,
      destino: v.pendiente ?? v.primera!,
    }))
    .sort((a, b) => (PESO_TIPO.get(a.tipo) ?? 99) - (PESO_TIPO.get(b.tipo) ?? 99));
}

export default function AccesosMateria({ progresiones, codigoUAC, accent }: Props) {
  const reducedMotion = useReducedMotion();
  const tipos = agregarPorTipo(progresiones);

  if (tipos.length === 0) return null;

  return (
    <motion.aside
      className="uac-mosaico"
      initial={reducedMotion ? {} : { opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springs.smooth, delay: 0.05 + stagger.fast * 3 }}
    >
      <div className="uac-mosaico-head">
        <i className="fa-solid fa-table-cells-large" style={{ color: accent, fontSize: 13 }} />
        <span>Contenido de la materia</span>
      </div>

      <div className="uac-mosaico-grid">
        {tipos.map((t) => {
          const meta = getTipoRecursoMeta(t.tipo);
          const hecho = t.completadas >= t.total;
          return (
            <Link
              key={t.tipo}
              href={`/hub/uac/${codigoUAC}/progresion/${t.destino.numero}/actividad/${t.destino.orden}`}
              className="uac-mosaico-tile"
              title={`${meta.label} · ${t.completadas}/${t.total} completadas`}
            >
              <span
                className="uac-mosaico-ico"
                style={{
                  background: `rgba(${hexToRgb(meta.color)}, 0.12)`,
                  border: `1px solid rgba(${hexToRgb(meta.color)}, 0.22)`,
                  color: meta.color,
                }}
              >
                <i className={`fa-solid ${meta.icon}`} />
              </span>
              <span className="uac-mosaico-tile-body">
                <span className="uac-mosaico-tile-label">{meta.label}</span>
                <span className="uac-mosaico-tile-count">
                  {hecho ? (
                    <>
                      <i className="fa-solid fa-circle-check" style={{ color: "#4ADE80", fontSize: 9 }} />{" "}
                      {t.total}
                    </>
                  ) : (
                    `${t.completadas}/${t.total}`
                  )}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <Link href="/hub/recursos" className="uac-mosaico-foot">
        <i className="fa-solid fa-compass" style={{ fontSize: 12 }} />
        Centro de recursos
        <i className="fa-solid fa-arrow-right" style={{ fontSize: 10, marginLeft: "auto", opacity: 0.7 }} />
      </Link>
    </motion.aside>
  );
}

/** Convierte un hex "#RRGGBB" a "r, g, b" para usar en rgba(). */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
