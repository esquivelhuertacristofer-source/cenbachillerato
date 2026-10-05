"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/hooks";
import { TIPOS_RECURSO, getTipoRecursoMeta, type TipoRecursoMeta } from "@/lib/mccems/tipos-recurso";
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
  /** Banda horizontal a todo el ancho (bajo el hero) en lugar de panel lateral. */
  horizontal?: boolean;
}

/**
 * Los 5 tipos manipulables (2026-09) aún no viven en `TIPOS_RECURSO`; sin esto
 * cada uno caía en el fallback y la rejilla mostraba «Otros 0/2», «Otros 0/1»,
 * «Otros 0/1»… repetidos. Aquí reciben nombre propio en español.
 */
const TIPOS_EXTRA: TipoRecursoMeta[] = [
  { tipo: "ordenar_secuencia",     label: "Ordenar",        singular: "Ordenar",        icon: "fa-arrow-down-1-9",    color: "#C084FC" },
  { tipo: "relacionar_columnas",   label: "Relacionar",     singular: "Relacionar",     icon: "fa-arrows-left-right", color: "#22D3EE" },
  { tipo: "clasificar_categorias", label: "Clasificar",     singular: "Clasificar",     icon: "fa-layer-group",       color: "#FACC15" },
  { tipo: "caso_decision",         label: "Casos",          singular: "Caso",           icon: "fa-signs-post",        color: "#E879F9" },
  { tipo: "reto_cronometrado",     label: "Reto con tiempo", singular: "Reto con tiempo", icon: "fa-stopwatch",       color: "#FB7185" },
];

const TODOS_LOS_TIPOS = [...TIPOS_RECURSO, ...TIPOS_EXTRA];
const META_POR_TIPO = new Map(TODOS_LOS_TIPOS.map((t) => [t.tipo, t]));

/** Clave única para todo tipo sin nombre: se agrupan en UN solo «Otros». */
const CLAVE_OTROS = "otro";

/** Etiqueta, ícono y color de un tipo de actividad (nunca un «Otros» por tipo). */
export function metaDeTipo(tipo: string): TipoRecursoMeta {
  return META_POR_TIPO.get(tipo) ?? getTipoRecursoMeta(CLAVE_OTROS);
}

/** Orden canónico de los tipos para que el mosaico sea estable y legible. */
const PESO_TIPO = new Map(TODOS_LOS_TIPOS.map((t, i) => [t.tipo, i]));

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
      const clave = META_POR_TIPO.has(act.tipo) ? act.tipo : CLAVE_OTROS;
      const cur =
        acc.get(clave) ?? { total: 0, completadas: 0, primera: null, pendiente: null };
      cur.total += 1;
      if (act.estado === "completada") cur.completadas += 1;
      const aqui: Destino = { numero: prog.numero, orden: act.orden };
      if (!cur.primera) cur.primera = aqui;
      if (!cur.pendiente && act.estado !== "completada") cur.pendiente = aqui;
      acc.set(clave, cur);
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

export default function AccesosMateria({ progresiones, codigoUAC, accent, horizontal = false }: Props) {
  const reducedMotion = useReducedMotion();
  const tipos = agregarPorTipo(progresiones);

  if (tipos.length === 0) return null;

  return (
    <motion.aside
      className={`uac-mosaico${horizontal ? " uac-mosaico--horizontal" : ""}`}
      initial={reducedMotion ? {} : { opacity: 0, y: 18, scale: horizontal ? 1 : 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springs.smooth, delay: 0.05 + stagger.fast * 3 }}
    >
      <div className="uac-mosaico-head">
        <i className="fa-solid fa-table-cells-large" style={{ color: accent, fontSize: 14 }} />
        <span>Contenido de la materia</span>
        {horizontal && <span className="uac-mosaico-head-line" aria-hidden />}
      </div>

      <div className="uac-mosaico-grid">
        {tipos.map((t) => {
          const meta = metaDeTipo(t.tipo);
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
                      <i className="fa-solid fa-circle-check" style={{ color: "#4ADE80", fontSize: 12 }} />{" "}
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
        <i className="fa-solid fa-compass" style={{ fontSize: 13 }} />
        Centro de recursos
        <i className="fa-solid fa-arrow-right" style={{ fontSize: 12, marginLeft: "auto", opacity: 0.7 }} />
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
