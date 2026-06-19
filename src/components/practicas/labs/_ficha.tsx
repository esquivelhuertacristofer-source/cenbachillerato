"use client";

/**
 * Ficha Teórica — componente compartido de los laboratorios.
 *
 * Caja desplegable (abierta por defecto) que da al alumno acceso INMEDIATO a:
 * marco teórico, objetivos, materiales, conceptos centrales y glosario, antes y
 * durante la práctica. El contenido es 100% verbatim de la actividad ancla de
 * cada lab; aquí solo vive la presentación.
 *
 * Es la pieza reutilizable #1 del rediseño de laboratorios: cada Lab*.tsx le
 * pasa su `FichaTeoricaData` y obtiene la misma experiencia de teoría robusta.
 *
 * NO importa three: seguro de usar desde cualquier shell.
 */

import { useState, type ReactNode } from "react";
import { T } from "./_kit";

/* ── Forma de datos (la llena cada lab, verbatim) ─────────────────────── */
export interface FichaConcepto {
  termino: string;
  definicion: string;
}
export interface FichaMaterial {
  nombre: string;
  detalle?: string;
  icono?: string; // FontAwesome, ej. "fa-flask"
}
export interface FichaTeoricaData {
  /** Tema/actividad ancla de la que proviene la teoría (verbatim). */
  ancla: string;
  /** Marco teórico: párrafos verbatim de la lectura A1. */
  marcoTeorico: string[];
  objetivos: string[];
  materiales: FichaMaterial[];
  /** Conceptos centrales del laboratorio. */
  conceptos: FichaConcepto[];
  glosario: FichaConcepto[];
  /** Aplicaciones / contexto (opcional). */
  aplicaciones?: string[];
  fuente?: string;
}

type TabKey = "marco" | "objetivos" | "materiales" | "conceptos" | "glosario";

const TABS: { key: TabKey; label: string; icono: string }[] = [
  { key: "marco", label: "Marco teórico", icono: "fa-book-open" },
  { key: "objetivos", label: "Objetivos", icono: "fa-bullseye" },
  { key: "materiales", label: "Materiales", icono: "fa-toolbox" },
  { key: "conceptos", label: "Conceptos centrales", icono: "fa-lightbulb" },
  { key: "glosario", label: "Glosario", icono: "fa-spell-check" },
];

export function FichaTeorica({
  data,
  accent,
  rgba,
  defaultOpen = true,
}: {
  data: FichaTeoricaData;
  accent: string;
  rgba: string; // "r,g,b" del color de la UAC
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<TabKey>("marco");

  // Solo muestra pestañas con contenido.
  const tabs = TABS.filter((t) => {
    if (t.key === "marco") return data.marcoTeorico.length > 0;
    if (t.key === "objetivos") return data.objetivos.length > 0;
    if (t.key === "materiales") return data.materiales.length > 0;
    if (t.key === "conceptos") return data.conceptos.length > 0;
    return data.glosario.length > 0;
  });

  return (
    <div
      style={{
        borderRadius: 20,
        border: `1px solid rgba(${rgba},0.26)`,
        background: `radial-gradient(120% 120% at 0% 0%, rgba(${rgba},0.10) 0%, transparent 52%), ${T.glass}`,
        boxShadow: T.shadow,
        backdropFilter: "blur(10px)",
        overflow: "hidden",
        marginBottom: 22,
      }}
    >
      <style>{`
        .fc-tab { cursor:pointer; border:none; background:transparent; display:inline-flex; align-items:center; gap:8px;
          padding:10px 14px; border-radius:11px; font-size:13px; font-weight:800; color:${T.text2}; transition:all .15s; white-space:nowrap; }
        .fc-tab:hover { color:#fff; background:rgba(255,255,255,0.05); }
        .fc-tab[data-on="true"] { color:#04121f; }
        .fc-chip { display:inline-flex; align-items:center; gap:8px; }
      `}</style>

      {/* Cabecera (toggle) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Ocultar ficha teórica" : "Ver ficha teórica"}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#04121f",
            background: accent,
            boxShadow: `0 8px 22px -8px ${accent}`,
          }}
        >
          <i className="fa-solid fa-graduation-cap" />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 16.5, fontWeight: 900, color: T.text, lineHeight: 1.15 }}>Ficha teórica</span>
          <span style={{ display: "block", fontSize: 12.5, color: T.text2, marginTop: 3 }}>
            Marco teórico, objetivos, materiales, conceptos y glosario · <span style={{ color: accent, fontWeight: 700 }}>{data.ancla}</span>
          </span>
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: T.text3, display: "inline-flex", alignItems: "center", gap: 8 }}>
          {open ? "Ocultar" : "Ver teoría"}
          <i className={`fa-solid ${open ? "fa-chevron-up" : "fa-chevron-down"}`} style={{ fontSize: 11 }} />
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 20px 22px" }}>
          {/* Pestañas */}
          <div
            role="tablist"
            aria-label="Secciones de la ficha teórica"
            style={{
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              padding: 5,
              borderRadius: 14,
              background: T.inset,
              border: `1px solid ${T.line}`,
              marginBottom: 18,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                className="fc-tab"
                role="tab"
                id={`fc-tab-${t.key}`}
                aria-selected={tab === t.key}
                aria-controls={`fc-panel-${t.key}`}
                data-on={tab === t.key}
                onClick={() => setTab(t.key)}
                style={tab === t.key ? { background: accent, boxShadow: `0 6px 16px -6px ${accent}` } : undefined}
              >
                <i className={`fa-solid ${t.icono}`} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Contenido */}
          <div role="tabpanel" id={`fc-panel-${tab}`} aria-labelledby={`fc-tab-${tab}`}>
          {tab === "marco" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {data.marcoTeorico.map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: T.text2 }}>
                  {p}
                </p>
              ))}
              {data.aplicaciones && data.aplicaciones.length > 0 && (
                <div style={{ marginTop: 4, borderRadius: 13, border: `1px solid rgba(${rgba},0.26)`, background: `rgba(${rgba},0.07)`, padding: "13px 16px" }}>
                  <Subhead accent={accent} icono="fa-industry">Aplicaciones</Subhead>
                  <ul style={{ margin: "9px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                    {data.aplicaciones.map((a, i) => (
                      <li key={i} style={{ fontSize: 13.5, lineHeight: 1.5, color: T.text2 }}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.fuente && (
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>
                  <i className="fa-solid fa-quote-right" style={{ marginRight: 6, opacity: 0.7 }} />
                  {data.fuente}
                </p>
              )}
            </div>
          )}

          {tab === "objetivos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {data.objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#04121f",
                      background: accent,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.55, color: T.text2, paddingTop: 2 }}>{o}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "materiales" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 11 }}>
              {data.materiales.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    borderRadius: 12,
                    border: `1px solid ${T.line}`,
                    background: T.inset,
                    padding: "11px 13px",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: accent,
                      background: `rgba(${rgba},0.12)`,
                    }}
                  >
                    <i className={`fa-solid ${m.icono ?? "fa-flask"}`} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>{m.nombre}</span>
                    {m.detalle && <span style={{ display: "block", fontSize: 12, color: T.text3, marginTop: 2 }}>{m.detalle}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(tab === "conceptos" || tab === "glosario") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(tab === "conceptos" ? data.conceptos : data.glosario).map((c, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${T.line}`,
                    background: T.inset,
                    padding: "13px 16px",
                  }}
                >
                  <span style={{ display: "inline-block", fontSize: 14, fontWeight: 900, color: accent, marginBottom: 4 }}>{c.termino}</span>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: T.text2 }}>{c.definicion}</p>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

function Subhead({ children, accent, icono }: { children: ReactNode; accent: string; icono: string }) {
  return (
    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: accent }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 8 }} />
      {children}
    </p>
  );
}
