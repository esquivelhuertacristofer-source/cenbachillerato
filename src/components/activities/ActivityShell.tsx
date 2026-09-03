"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import type { AreaColor } from "@/components/hub/hub-colors";
import { getTipoConfig } from "@/components/hub/hub-colors";
import { HubBreadcrumb } from "@/components/hub/HubBreadcrumb";
import type { ActividadConEstado } from "@/lib/queries/hub";
import {
  NarracionProvider,
  NarradorControl,
  ContenidoNarrable,
} from "@/components/activities/NarracionContext";
import { ExerciseTools, type Herramienta } from "@/components/activities/ExerciseTools";

const PHASE_LABELS = ["Activación", "Práctica", "Aplicación"];

const TIEMPO_MIN: Record<string, number> = {
  lectura: 10, quiz_multiple_opcion: 5, quiz_verdadero_falso: 4, fill_blanks: 8,
  ejercicio_matematico: 12, reflexion_escrita: 15, video_con_preguntas: 10,
  infografia: 6, debate_estructurado: 15, simulacion: 10,
  glosario_interactivo: 8, autoevaluacion: 10,
  ordenar_secuencia: 8, relacionar_columnas: 8, clasificar_categorias: 8,
  caso_decision: 12, reto_cronometrado: 6,
};

const ROMAN_TO_N: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };

const REFLEXION_Q: Record<string, [string, string]> = {
  lectura: ["¿Cuál fue la idea más importante que encontraste en el texto?", "¿Cómo conectas este contenido con lo que ya sabías?"],
  ejercicio_matematico: ["¿Cuál fue el paso más difícil del ejercicio?", "¿En qué situación real aplicarías este procedimiento?"],
  simulacion: ["¿Qué variable tuvo más impacto en los resultados?", "¿Qué pasaría si cambiaras los parámetros a sus extremos?"],
  reflexion_escrita: ["¿Cambió tu perspectiva sobre el tema al escribir?", "¿Qué pregunta nueva te surgió al reflexionar?"],
  ordenar_secuencia: ["¿Qué te ayudó a decidir qué iba primero?", "¿Dónde más te sirve reconocer el orden de un proceso?"],
  relacionar_columnas: ["¿Qué pareja te costó más y por qué?", "¿Qué tienen en común los conceptos que confundiste?"],
  clasificar_categorias: ["¿Qué criterio usaste para decidir la categoría?", "¿Qué ficha estuvo a punto de caber en dos categorías?"],
  caso_decision: ["¿Qué decisión cambiarías si volvieras a empezar?", "¿Qué te hizo elegir como elegiste la primera vez?"],
  reto_cronometrado: ["¿Qué pregunta te tomó más tiempo del que esperabas?", "¿Qué parte del tema tienes que repasar antes de repetirlo?"],
};
const REFLEXION_DEFAULT: [string, string] = [
  "¿Qué fue lo más sorprendente o desafiante de esta actividad?",
  "¿Cómo se conecta este contenido con algo que ya conocías?",
];

/**
 * Herramientas de cálculo según el área de la UAC:
 *   · Matemáticas (PM-*) → calculadora científica.
 *   · Ciencias / CNEyT (CNEYT-*) → calculadora + tabla periódica.
 * El resto de áreas no requiere herramientas de cálculo.
 */
function herramientasPorArea(uacCodigo: string): Herramienta[] {
  const area = uacCodigo.split("-")[0];
  if (area === "PM") return ["calc"];
  if (area === "CNEYT") return ["calc", "tabla"];
  return [];
}

export interface ActivityShellProps {
  titulo: string;
  /** Código de la actividad (p.ej. "CD-I-P01-A1"); el narrador lo usa para
   *  saber si esta lectura tiene grabación con la voz de la plataforma. */
  codigo?: string | null;
  tipo: string;
  color: AreaColor;
  estado: "no_iniciada" | "en_progreso" | "completada";
  backHref: string;
  uacNombre: string;
  uacCodigo: string;
  progresionNum: number;
  ordenNum: number;
  phaseLabel: string;
  actividadesProg: ActividadConEstado[];
  children: ReactNode;
  nivel_revision?: string | null;
  /** Si la actividad tiene práctica experimental, URL a su sección. */
  practicaHref?: string | null;
}

export function ActivityShell({
  titulo,
  codigo = null,
  tipo,
  color,
  estado,
  backHref,
  uacNombre,
  uacCodigo,
  progresionNum,
  ordenNum,
  phaseLabel,
  actividadesProg,
  children,
  nivel_revision,
  practicaHref,
}: ActivityShellProps) {
  const tc = getTipoConfig(tipo);
  const isCompleta = estado === "completada";
  const isBorrador = nivel_revision === "borrador";
  const herramientas = herramientasPorArea(uacCodigo);
  const tiempoMin = TIEMPO_MIN[tipo] ?? 8;
  const semestreUac = ROMAN_TO_N[uacCodigo.split("-").pop() ?? ""] ?? null;
  const reflexKey = `reflexion-${uacCodigo}-${progresionNum}-${ordenNum}`;
  const [reflexQ1, reflexQ2] = REFLEXION_Q[tipo] ?? REFLEXION_DEFAULT;
  const [reflexion, setReflexion] = useState<string>(() => {
    if (typeof window === "undefined" || !isCompleta) return "";
    try { return localStorage.getItem(reflexKey) ?? ""; } catch { return ""; }
  });

  // Navegación lineal dentro de la progresión (footer Anterior/Siguiente).
  const idx = actividadesProg.findIndex((a) => a.orden === ordenNum);
  const prevAct = idx > 0 ? actividadesProg[idx - 1] : null;
  const nextAct =
    idx >= 0 && idx < actividadesProg.length - 1 ? actividadesProg[idx + 1] : null;
  const actHref = (orden: number) =>
    `/hub/uac/${uacCodigo}/progresion/${progresionNum}/actividad/${orden}`;

  // Lista de actividades de la progresión: una sola fuente reutilizada por el
  // panel lateral (desktop) y el acordeón (móvil), para no duplicar el markup.
  const actividadLinks = actividadesProg.map((act, i) => {
    const isActive = act.orden === ordenNum;
    const isDone = act.estado === "completada";
    const tc2 = getTipoConfig(act.tipo);
    const pl = PHASE_LABELS[i] ?? `A${act.orden}`;
    return (
      <Link
        key={act.id}
        href={actHref(act.orden)}
        className="ash-sidebar-link"
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 14px",
          borderRadius: 14,
          textDecoration: "none",
          background: isActive
            ? `rgba(${color.rgba}, 0.10)`
            : "rgba(255,255,255,0.03)",
          border: isActive
            ? `1.5px solid rgba(${color.rgba}, 0.25)`
            : "1px solid rgba(255,255,255,0.06)",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13,
          background: isDone
            ? "rgba(74,222,128,0.12)"
            : isActive
              ? `rgba(${color.rgba}, 0.12)`
              : "rgba(255,255,255,0.05)",
          color: isDone ? "#4ADE80" : isActive ? color.hex : "rgba(255,255,255,0.35)",
        }}>
          {isDone
            ? <i className="fa-solid fa-check" />
            : <i className={`fa-solid ${tc2.faIcon}`} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: isActive ? color.hex : "rgba(255,255,255,0.28)",
            marginBottom: 3,
          }}>
            A{act.orden} · {pl}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600, lineHeight: 1.3,
            color: isActive ? "#fff" : isDone ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.48)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {act.titulo}
          </div>
        </div>
        {isDone && (
          <i className="fa-solid fa-circle-check" style={{ fontSize: 12, color: "#4ADE80", flexShrink: 0 }} />
        )}
      </Link>
    );
  });

  return (
    <NarracionProvider codigo={codigo}>
      <style>{`
        .ash-back:hover { color: #fff !important; transform: translateX(-3px); }
        .ash-narrador:hover { background: rgba(255,255,255,0.10) !important; border-color: rgba(255,255,255,0.20) !important; }
        .ash-narrador-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 11px; }
        .ash-narrador-eq span {
          width: 2px; border-radius: 1px; background: currentColor;
          animation: ash-eq 0.9s ease-in-out infinite;
        }
        .ash-narrador-eq span:nth-child(1) { height: 5px; animation-delay: 0s; }
        .ash-narrador-eq span:nth-child(2) { height: 11px; animation-delay: 0.18s; }
        .ash-narrador-eq span:nth-child(3) { height: 7px; animation-delay: 0.36s; }
        @keyframes ash-eq { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) {
          .ash-narrador-eq span { animation: none; transform: scaleY(0.7); }
        }
        .ash-practica:hover { filter: brightness(1.18); transform: translateY(-1px); }
        .ash-sidebar-link:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.12) !important; }

        /* ── Footer Anterior / Siguiente (visible en todas las pantallas) ── */
        .ash-foot {
          display: flex; gap: 14px;
          margin-top: 44px; padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .ash-foot-link {
          flex: 1 1 0; min-width: 0;
          display: flex; flex-direction: column; gap: 7px;
          padding: 16px 20px; border-radius: 16px; text-decoration: none;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }
        .ash-foot-link:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.16) !important;
          transform: translateY(-2px);
        }
        .ash-foot-next { align-items: flex-end; text-align: right; }
        .ash-foot-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.16em; color: rgba(255,255,255,0.40);
        }
        .ash-foot-titulo {
          max-width: 100%;
          font-size: 14px; font-weight: 700; color: #fff; line-height: 1.3;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* ── Acordeón móvil: reemplaza al panel lateral oculto en <1023px ── */
        .ash-accordion { display: none; margin-bottom: 28px; }
        .ash-accordion-summary {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 14px 18px; cursor: pointer; list-style: none;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.14em;
          color: rgba(255,255,255,0.55);
        }
        .ash-accordion-summary::-webkit-details-marker { display: none; }
        .ash-accordion[open] .ash-accordion-summary { border-radius: 14px 14px 0 0; border-bottom-color: transparent; }
        .ash-accordion[open] .ash-accordion-chevron { transform: rotate(180deg); }
        .ash-accordion-chevron { transition: transform 0.2s ease; font-size: 11px; }
        .ash-accordion-count {
          display: inline-flex; align-items: center; gap: 10px;
          color: rgba(255,255,255,0.35); font-weight: 700; letter-spacing: 0.06em;
        }
        .ash-accordion-body {
          display: flex; flex-direction: column; gap: 6px;
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.08); border-top: none;
          border-radius: 0 0 14px 14px;
          background: rgba(255,255,255,0.02);
        }

        @media (max-width: 1023px) {
          .ash-sidebar { display: none !important; }
          .ash-accordion { display: block; }
        }
        @media (max-width: 640px) {
          .ash-hero { padding: 32px 20px 36px !important; }
          .ash-nav { padding: 14px 20px !important; }
          .ash-body { padding: 28px 20px 80px !important; }
          .ash-title { font-size: 26px !important; }
          .ash-icon { width: 56px !important; height: 56px !important; font-size: 24px !important; border-radius: 16px !important; }
          .ash-foot { flex-direction: column; }
          .ash-foot-next { align-items: flex-start; text-align: left; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 85% 0%, rgba(${color.rgba}, 0.07) 0%, transparent 42%),
                     radial-gradient(circle at 10% 100%, rgba(${color.rgba}, 0.04) 0%, transparent 35%),
                     #011126`,
        fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
        color: "#fff",
      }}>

        {/* ── HERO BAND ─────────────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(180deg, rgba(${color.rgba}, 0.09) 0%, transparent 100%), #011C40`,
          borderBottom: `1px solid rgba(${color.rgba}, 0.14)`,
        }}>

          {/* Sticky nav */}
          <nav
            className="ash-nav"
            style={{
              padding: "18px 48px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: "rgba(1,17,38,0.90)",
              backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Link
              href={backHref}
              className="ash-back"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)",
                textDecoration: "none", whiteSpace: "nowrap",
                transition: "all 0.25s ease",
              }}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
              Propósito formativo {progresionNum}
            </Link>
            <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 14, fontWeight: 300 }}>·</span>
            <HubBreadcrumb
              accentHex={color.hex}
              items={[
                { label: "Hub", href: "/hub" },
                ...(semestreUac ? [{ label: `${semestreUac}.º sem`, href: `/hub/semestre/${semestreUac}` }] : []),
                { label: uacNombre, href: `/hub/uac/${uacCodigo}`, maxWidth: 140 },
                { label: `A${ordenNum} · ${phaseLabel}` },
              ]}
            />
          </nav>

          {/* Hero content */}
          <div
            className="ash-hero"
            style={{ padding: "52px 48px 48px", maxWidth: 1200, margin: "0 auto" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>

              {/* Type icon */}
              <div
                className="ash-icon"
                style={{
                  width: 80, height: 80, borderRadius: 22, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32,
                  background: `rgba(${color.rgba}, 0.10)`,
                  border: `1.5px solid rgba(${color.rgba}, 0.22)`,
                  color: color.hex,
                  boxShadow: `0 0 40px rgba(${color.rgba}, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                <i className={`fa-solid ${tc.faIcon}`} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em",
                    color: color.hex, padding: "5px 14px",
                    background: `rgba(${color.rgba}, 0.10)`,
                    border: `1px solid rgba(${color.rgba}, 0.22)`,
                    borderRadius: 999,
                  }}>
                    A{ordenNum} · {phaseLabel}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.40)", padding: "5px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 999,
                  }}>
                    <i className={`fa-solid ${tc.faIcon}`} style={{ marginRight: 6, fontSize: 9 }} />
                    {tc.label}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.10em",
                    color: "rgba(255,255,255,0.40)", padding: "5px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 999,
                  }}>
                    <i className="fa-solid fa-clock" style={{ marginRight: 5, fontSize: 9 }} />
                    ~{tiempoMin} min
                  </span>
                  <NarradorControl accentHex={color.hex} />
                  {isCompleta && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em",
                      color: "#4ADE80", padding: "5px 14px",
                      background: "rgba(74,222,128,0.10)",
                      border: "1px solid rgba(74,222,128,0.22)",
                      borderRadius: 999,
                    }}>
                      <i className="fa-solid fa-check" style={{ marginRight: 5 }} />
                      Completada
                    </span>
                  )}
                  {isBorrador && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.10em",
                      color: "#CA8A04", padding: "5px 14px",
                      background: "rgba(202,138,4,0.10)",
                      border: "1px solid rgba(202,138,4,0.25)",
                      borderRadius: 999,
                    }}>
                      <i className="fa-solid fa-pen-ruler" style={{ marginRight: 5, fontSize: 9 }} />
                      En revisión pedagógica
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="ash-title"
                  style={{
                    fontSize: "clamp(26px, 3.2vw, 46px)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {titulo}
                </h1>

                {/* Botón a la práctica experimental (solo si la actividad la tiene) */}
                {practicaHref && (
                  <Link
                    href={practicaHref}
                    className="ash-practica"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 22,
                      padding: "12px 20px",
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                      color: color.hex,
                      textDecoration: "none",
                      background: `rgba(${color.rgba}, 0.12)`,
                      border: `1.5px solid rgba(${color.rgba}, 0.30)`,
                      boxShadow: `0 0 30px rgba(${color.rgba}, 0.10)`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className="fa-solid fa-flask-vial" style={{ fontSize: 14 }} />
                    Práctica experimental
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: 11, opacity: 0.7 }} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY: content + sidebar ───────────────────────────────────── */}
        <div
          className="ash-body"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "44px 48px 100px",
            display: "flex",
            gap: 48,
            alignItems: "flex-start",
          }}
        >
          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Acordeón móvil: el panel lateral se oculta en <1023px, así que
                aquí vive la navegación de la progresión para pantallas chicas. */}
            {actividadesProg.length > 0 && (
              <details className="ash-accordion">
                <summary className="ash-accordion-summary">
                  <span>En este propósito formativo</span>
                  <span className="ash-accordion-count">
                    A{ordenNum} de {actividadesProg.length}
                    <i className="fa-solid fa-chevron-down ash-accordion-chevron" />
                  </span>
                </summary>
                <div className="ash-accordion-body">{actividadLinks}</div>
              </details>
            )}

            <ContenidoNarrable>{children}</ContenidoNarrable>

            {/* ── Reflexión metacognitiva — solo cuando la actividad está completada ── */}
            {isCompleta && (
              <div style={{
                marginTop: 36,
                borderRadius: 18,
                border: `1px solid rgba(${color.rgba}, 0.22)`,
                background: `rgba(${color.rgba}, 0.05)`,
                padding: "24px 28px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <i className="fa-solid fa-brain" style={{ color: color.hex, fontSize: 16 }} />
                  <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: color.hex }}>
                    Reflexión
                  </span>
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.5 }}>{reflexQ1}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 16px", lineHeight: 1.5 }}>{reflexQ2}</p>
                <textarea
                  rows={3}
                  value={reflexion}
                  onChange={(e) => {
                    setReflexion(e.target.value);
                    try { localStorage.setItem(reflexKey, e.target.value); } catch { /* noop */ }
                  }}
                  placeholder="Escribe tu reflexión (opcional)…"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid rgba(${color.rgba}, 0.22)`,
                    borderRadius: 12, color: "#fff", fontSize: 13,
                    padding: "12px 14px", resize: "vertical",
                    fontFamily: "inherit", lineHeight: 1.5, outline: "none",
                  }}
                />
              </div>
            )}

            {/* Footer Anterior / Siguiente — fuera del @media que oculta el
                panel lateral, así que también sirve en móvil. */}
            {actividadesProg.length > 0 && (
              <nav className="ash-foot">
                {prevAct ? (
                  <Link href={actHref(prevAct.orden)} className="ash-foot-link">
                    <span className="ash-foot-eyebrow">
                      <i className="fa-solid fa-arrow-left" /> Anterior
                    </span>
                    <span className="ash-foot-titulo">{prevAct.titulo}</span>
                  </Link>
                ) : (
                  <Link href={backHref} className="ash-foot-link">
                    <span className="ash-foot-eyebrow">
                      <i className="fa-solid fa-arrow-left" /> Volver
                    </span>
                    <span className="ash-foot-titulo">Propósito formativo {progresionNum}</span>
                  </Link>
                )}

                {nextAct ? (
                  <Link
                    href={actHref(nextAct.orden)}
                    className="ash-foot-link ash-foot-next"
                    style={{
                      background: `rgba(${color.rgba}, 0.07)`,
                      borderColor: `rgba(${color.rgba}, 0.20)`,
                    }}
                  >
                    <span className="ash-foot-eyebrow" style={{ color: color.hex }}>
                      Siguiente <i className="fa-solid fa-arrow-right" />
                    </span>
                    <span className="ash-foot-titulo">{nextAct.titulo}</span>
                  </Link>
                ) : (
                  <Link
                    href={backHref}
                    className="ash-foot-link ash-foot-next"
                    style={{
                      background: `rgba(${color.rgba}, 0.07)`,
                      borderColor: `rgba(${color.rgba}, 0.20)`,
                    }}
                  >
                    <span className="ash-foot-eyebrow" style={{ color: color.hex }}>
                      Terminar <i className="fa-solid fa-flag-checkered" />
                    </span>
                    <span className="ash-foot-titulo">Volver al propósito formativo</span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Sidebar */}
          {actividadesProg.length > 0 && (
            <aside
              className="ash-sidebar"
              style={{
                width: 248,
                flexShrink: 0,
                position: "sticky",
                top: 68,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{
                fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                letterSpacing: "0.35em", color: "rgba(255,255,255,0.25)",
                marginBottom: 8, paddingLeft: 4,
              }}>
                En esta progresión
              </div>

              {actividadLinks}

              <Link
                href={backHref}
                className="ash-sidebar-link"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginTop: 10, padding: "10px 14px",
                  borderRadius: 12, fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.10em",
                  color: "rgba(255,255,255,0.32)", textDecoration: "none",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
                Ver progresión
              </Link>
            </aside>
          )}
        </div>
      </div>

      {herramientas.length > 0 && (
        <ExerciseTools tools={herramientas} accentHex={color.hex} />
      )}
    </NarracionProvider>
  );
}
