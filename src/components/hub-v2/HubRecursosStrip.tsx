"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgresoRecursosSemestre, type ProgresoTipo } from "@/lib/queries/hub-browser";
import { getTipoRecursoMeta, ORDEN_TIPOS } from "@/lib/mccems/tipos-recurso";
import "./HubRecursosStrip.css";

export default function HubRecursosStrip({
  userId,
  semestre,
}: {
  userId: string;
  semestre: number;
}) {
  const [datos, setDatos] = useState<ProgresoTipo[] | null>(null);
  const [activo, setActivo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProgresoRecursosSemestre(userId, semestre).then((d) => {
      if (!cancelled) setDatos(d);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, semestre]);

  // Mientras carga o si no hay recursos, no ocupamos espacio (nada de huecos vacíos).
  if (!datos || datos.length === 0) return null;

  const total = datos.reduce((s, c) => s + c.total, 0);
  const hechas = datos.reduce((s, c) => s + c.completadas, 0);
  const pctTotal = total > 0 ? Math.round((hechas / total) * 100) : 0;
  const ordenados = [...datos].sort(
    (a, b) => ORDEN_TIPOS.indexOf(a.tipo) - ORDEN_TIPOS.indexOf(b.tipo)
  );

  // Tipo destacado: el resaltado por hover, o el de mayor avance sin completar,
  // o el primero. Da vida al medidor central.
  const focus =
    ordenados.find((c) => c.tipo === activo) ??
    ordenados.find((c) => c.completadas < c.total) ??
    ordenados[0];
  const focusMeta = focus ? getTipoRecursoMeta(focus.tipo) : null;
  const focusPct =
    focus && focus.total > 0
      ? Math.round((focus.completadas / focus.total) * 100)
      : 0;

  return (
    <section className="hub-cockpit hub-v2-animate">
      {/* Header */}
      <div className="hub-cockpit-head">
        <div className="hub-cockpit-headtext">
          <span className="hub-cockpit-eyebrow">
            <i className="fa-solid fa-gauge-high" /> Tablero de práctica
          </span>
          <h2 className="hub-cockpit-title">Tu material de estudio</h2>
        </div>
        <Link href="/hub/recursos" className="hub-cockpit-vertodo">
          Ver todo el material <i className="fa-solid fa-arrow-right" />
        </Link>
      </div>

      <div className="hub-cockpit-panel">
        {/* ── Medidor central (avance total o tipo enfocado) ── */}
        <div
          className="hub-cockpit-gauge-wrap"
          style={
            {
              "--chip-color": focusMeta?.color ?? "#38bdf8",
              "--pct": activo ? focusPct : pctTotal,
            } as React.CSSProperties
          }
        >
          <div className="hub-cockpit-gauge">
            <div className="hub-cockpit-gauge-hole">
              <span className="hub-cockpit-gauge-num">
                {activo ? focusPct : pctTotal}
                <i>%</i>
              </span>
              <span className="hub-cockpit-gauge-cap">
                {activo ? focusMeta?.label : "del semestre"}
              </span>
            </div>
          </div>
          <div className="hub-cockpit-gauge-meta">
            {activo && focus ? (
              <>
                <span className="hub-cockpit-gauge-big">
                  {focus.completadas}
                  <span>/{focus.total}</span>
                </span>
                <span className="hub-cockpit-gauge-sub">
                  {focusMeta?.label.toLowerCase()} hechas
                </span>
              </>
            ) : (
              <>
                <span className="hub-cockpit-gauge-big">
                  {hechas}
                  <span>/{total}</span>
                </span>
                <span className="hub-cockpit-gauge-sub">actividades completadas</span>
              </>
            )}
          </div>
        </div>

        {/* ── Constelación de anillos por tipo ── */}
        <div className="hub-cockpit-ring-grid">
          {ordenados.map((c) => {
            const m = getTipoRecursoMeta(c.tipo);
            const pct = c.total > 0 ? Math.round((c.completadas / c.total) * 100) : 0;
            const completo = c.completadas >= c.total;
            return (
              <Link
                key={c.tipo}
                href={`/hub/recursos?tipo=${c.tipo}`}
                className={`hub-cockpit-node${completo ? " hub-cockpit-node--done" : ""}`}
                style={
                  { "--chip-color": m.color, "--pct": pct } as React.CSSProperties
                }
                onMouseEnter={() => setActivo(c.tipo)}
                onMouseLeave={() => setActivo(null)}
              >
                <span className="hub-cockpit-node-ring">
                  <span className="hub-cockpit-node-core">
                    {completo ? (
                      <i className="fa-solid fa-check" />
                    ) : (
                      <i className={`fa-solid ${m.icon}`} />
                    )}
                  </span>
                </span>
                <span className="hub-cockpit-node-label">{m.label}</span>
                <span className="hub-cockpit-node-count">
                  {completo ? (
                    <span className="hub-cockpit-node-done">Completo</span>
                  ) : (
                    <>
                      <strong>{c.completadas}</strong>/{c.total}
                    </>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
