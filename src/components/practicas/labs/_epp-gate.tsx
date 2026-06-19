"use client";

/**
 * Compuerta de equipamiento reutilizable — "Antes de entrar: equípate".
 *
 * Pieza reutilizable del robustecimiento de laboratorios (pilar 1: EQUIPARSE).
 * Antes de operar cualquier práctica, el alumno debe identificar y ponerse el
 * equipo correcto (EPP en labs de ciencia; instrumentos en labs abstractos),
 * distinguiéndolo de los distractores. Sin equipo correcto no se entra.
 *
 * Extraído de LabSeparacionMezclas.tsx (destilación, el lab patrón) para que los
 * ~10 labs robustecidos compartan la misma compuerta — visión "estándar
 * replicable". NO importa three: seguro de usar desde cualquier shell.
 */

import { useEffect, useRef, useState } from "react";
import { T, OK } from "./_kit";

const NO = "#FF5E5E";

export interface EppItem {
  key: string;
  nombre: string;
  icono: string;
  /** true = es equipo que SÍ hay que ponerse; false = distractor. */
  ok: boolean;
  nota: string;
}

/** Conjunto estándar para labs de ciencia (3 correctos + 3 distractores). */
export const EPP_ESTANDAR: EppItem[] = [
  { key: "gafas", nombre: "Gafas de seguridad", icono: "fa-glasses", ok: true, nota: "Protegen tus ojos de salpicaduras y vapores." },
  { key: "bata", nombre: "Bata de laboratorio", icono: "fa-user-doctor", ok: true, nota: "Cubre tu ropa y tu piel de salpicaduras o calor." },
  { key: "guantes", nombre: "Guantes", icono: "fa-mitten", ok: true, nota: "Protegen tus manos del calor y los químicos." },
  { key: "mechero", nombre: "Mechero Bunsen", icono: "fa-fire", ok: false, nota: "Es una herramienta de calentamiento, no equipo de protección." },
  { key: "probeta", nombre: "Probeta graduada", icono: "fa-vial", ok: false, nota: "Sirve para medir volúmenes, no para protegerte." },
  { key: "pipeta", nombre: "Pipeta", icono: "fa-eye-dropper", ok: false, nota: "Sirve para medir y trasvasar líquidos, no para protegerte." },
];

export function EppGate({
  accent,
  rgba,
  items = EPP_ESTANDAR,
  titulo = "Antes de entrar: equípate",
  subtitulo = "Identifica el equipo de protección personal",
  intro,
  verbo = "protección personal",
  onEntrar,
}: {
  accent: string;
  rgba: string;
  items?: EppItem[];
  titulo?: string;
  subtitulo?: string;
  /** Texto de instrucción; si se omite se arma uno por defecto. */
  intro?: string;
  /** Cómo nombrar a los ítems correctos en el conteo ("protección personal"). */
  verbo?: string;
  onEntrar: () => void;
}) {
  const [puestos, setPuestos] = useState<Set<string>>(() => new Set<string>());
  const [malo, setMalo] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const correctos = items.filter((e) => e.ok).length;
  const listos = items.filter((e) => e.ok && puestos.has(e.key)).length;
  const completo = listos === correctos;

  // Limpia los temporizadores de "shake" pendientes al desmontar (evita
  // setState sobre un componente desmontado).
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  useEffect(() => {
    const set = timers.current;
    return () => { for (const t of set) clearTimeout(t); set.clear(); };
  }, []);

  const tocar = (e: EppItem) => {
    if (e.ok) {
      setPuestos((p) => (p.has(e.key) ? p : new Set(p).add(e.key)));
      setAviso(e.nota);
      setMalo(null);
    } else {
      setMalo(e.key);
      setAviso(e.nota);
      const t = setTimeout(() => {
        setMalo((m) => (m === e.key ? null : m));
        timers.current.delete(t);
      }, 480);
      timers.current.add(t);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        background: "radial-gradient(120% 90% at 50% 0%, rgba(3,16,33,0.82) 0%, rgba(2,9,20,0.94) 70%)",
        backdropFilter: "blur(8px)",
      }}
    >
      <style>{`
        @keyframes epp-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 50%{transform:translateX(6px)} 75%{transform:translateX(-4px)} }
        .epp-card { cursor:pointer; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px 10px; transition:all .14s ease; position:relative; }
        .epp-card:hover { border-color:${T.lineStrong}; color:#fff; }
        .epp-card[data-puesto="true"] { border-color:${OK}88; background:${OK}1c; color:${OK}; }
        .epp-card[data-malo="true"] { animation:epp-shake .45s ease; border-color:${NO}; background:${NO}18; color:${NO}; }
        .epp-go { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:12px 18px; background:${accent}; color:#04121f; transition:filter .15s; }
        .epp-go:hover:not(:disabled) { filter:brightness(1.08); }
        .epp-go:disabled { cursor:not-allowed; }
      `}</style>

      <div
        style={{
          width: "min(96%, 560px)",
          borderRadius: 22,
          border: `1px solid rgba(${rgba},0.4)`,
          background: "linear-gradient(180deg, rgba(8,20,40,0.97), rgba(3,12,26,0.98))",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7)",
          padding: "24px 26px 22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#04121f", background: accent }}>
            <i className="fa-solid fa-helmet-safety" />
          </span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{titulo}</div>
            <div style={{ fontSize: 12.5, color: T.text3 }}>{subtitulo}</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.5, margin: "12px 0 16px" }}>
          {intro ?? (
            <>
              En un laboratorio real, nunca se trabaja sin protección. Entre el material de abajo, selecciona solo las{" "}
              <strong style={{ color: T.text }}>{correctos}</strong> piezas de {verbo} (no los instrumentos) para acceder.
            </>
          )}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {items.map((e) => {
            const puesto = e.ok && puestos.has(e.key);
            return (
              <button key={e.key} className="epp-card" data-puesto={puesto} data-malo={malo === e.key} aria-pressed={puesto} aria-label={e.nombre} onClick={() => tocar(e)} title={e.nombre}>
                <i className={`fa-solid ${e.icono}`} style={{ fontSize: 22 }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.2, textAlign: "center" }}>{e.nombre}</span>
                {puesto && <i className="fa-solid fa-circle-check" style={{ position: "absolute", top: 7, right: 8, fontSize: 12, color: OK }} />}
              </button>
            );
          })}
        </div>

        <div style={{ minHeight: 34, display: "flex", alignItems: "center", gap: 9, margin: "14px 2px 4px", fontSize: 12.5, color: malo ? NO : T.text2, lineHeight: 1.4 }}>
          {aviso && <i className={`fa-solid ${malo ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ color: malo ? NO : accent, marginTop: 1 }} />}
          <span>{aviso ?? ""}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: completo ? OK : T.text3 }}>
            {listos}/{correctos} equipo correcto
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onEntrar} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.text3, fontWeight: 600, textDecoration: "underline" }} title="Omitir el repaso de seguridad">
              Ya lo sé, omitir
            </button>
            <button className="epp-go" onClick={onEntrar} disabled={!completo} style={{ opacity: completo ? 1 : 0.4 }}>
              <i className="fa-solid fa-door-open" style={{ marginRight: 7 }} /> Entrar al laboratorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
