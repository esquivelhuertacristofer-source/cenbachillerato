"use client";

import React, { useEffect, useRef, useState } from "react";
import { TIPO_ICON } from "./uac-config";
import { metaDeTipo } from "./AccesosMateria";

interface Actividad {
  orden: number;
  tipo: string;
  estado: "no_iniciada" | "en_progreso" | "completada";
}

interface ProgresionCardProps {
  numero: number;
  titulo: string;
  descripcion: string | null;
  ejesArticuladores: string[] | null;
  actividades: Actividad[];
  status: "locked" | "available" | "completed";
  isLast: boolean;
  accentColor: string;
  accentRgb: string;
  /** Ruta de la imagen temática (WebP) de la materia para esta tarjeta. */
  imagenTema: string;
  onClick: () => void;
}

/** Recorte a N líneas (se quita al pulsar «Ver más»). */
function recorte(lineas: number, activo: boolean): React.CSSProperties {
  return activo
    ? {
        display: "-webkit-box",
        WebkitLineClamp: lineas,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }
    : {};
}

export default function ProgresionCard({
  numero,
  titulo,
  descripcion,
  ejesArticuladores,
  actividades,
  status,
  isLast,
  accentColor,
  accentRgb,
  imagenTema,
  onClick,
}: ProgresionCardProps) {
  const isLocked = status === "locked";
  const isDone = status === "completed";

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [auraPos, setAuraPos] = useState({ x: 50, y: 50 });

  /*
   * Mismo criterio que ProgresionHero: el título ES el propósito formativo
   * oficial (200–300 caracteres casi siempre). Como titular grande era un muro.
   * Si hay una descripción corta y distinta, ella encabeza y el propósito
   * oficial va completo debajo, a tamaño de lectura (recortado a 3 líneas con
   * «Ver más»). El propósito oficial nunca se quita.
   */
  const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  const mostrarDesc = !!descripcion && norm(descripcion) !== norm(titulo);
  const tituloCorto =
    mostrarDesc && titulo.length > 110 && descripcion!.length <= 140 ? descripcion! : null;
  const tituloLargo = !tituloCorto && titulo.length > 110;

  const [expandido, setExpandido] = useState(false);
  const [recortable, setRecortable] = useState(false);
  const refTitulo = useRef<HTMLHeadingElement>(null);
  const refProposito = useRef<HTMLParagraphElement>(null);
  const refDesc = useRef<HTMLParagraphElement>(null);

  // ¿Hay texto escondido por el recorte? Solo entonces aparece «Ver más».
  useEffect(() => {
    if (expandido || typeof ResizeObserver === "undefined") return;
    const els: HTMLElement[] = [refTitulo.current, refProposito.current, refDesc.current].filter(
      (e): e is HTMLHeadingElement | HTMLParagraphElement => e !== null,
    );
    if (els.length === 0) return;
    const ro = new ResizeObserver(() => {
      setRecortable(els.some((el) => el.scrollHeight > el.clientHeight + 2));
    });
    els.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [expandido, titulo, descripcion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    // Respetar prefers-reduced-motion: sin tilt 3D para quien lo pidió.
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTilt({ x: (y - rect.height / 2) / 1000, y: (rect.width / 2 - x) / 1000 });
    setAuraPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const chips = (ejesArticuladores ?? []).slice(0, 3);
  const hechas = actividades.filter((a) => a.estado === "completada").length;
  const recortar = !expandido;

  return (
    <div className={`flex gap-3 sm:gap-6 relative group ${isLast ? "pb-0" : "pb-6 sm:pb-8"}`}>
      {/* Timeline node */}
      <div className="flex flex-col items-center w-9 sm:w-10 shrink-0">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: isDone
              ? "2px solid #10B981"
              : isLocked
              ? "2px solid rgba(255,255,255,0.12)"
              : `2px solid ${accentColor}`,
            background: isDone
              ? "rgba(16,185,129,0.15)"
              : isLocked
              ? "rgba(255,255,255,0.04)"
              : `rgba(${accentRgb},0.15)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: isDone ? "#10B981" : isLocked ? "rgba(255,255,255,0.25)" : accentColor,
            zIndex: 1,
            transition: "all 0.3s",
            flexShrink: 0,
          }}
        >
          {isDone ? (
            <i className="fa-solid fa-check" style={{ fontSize: 14 }} />
          ) : isLocked ? (
            <i className="fa-solid fa-lock" style={{ fontSize: 13 }} />
          ) : (
            numero
          )}
        </div>
        {!isLast && (
          <div
            style={{
              width: 2,
              flex: 1,
              minHeight: 20,
              background: isDone ? "rgba(16,185,129,0.30)" : `rgba(${accentRgb},0.15)`,
              margin: "6px 0",
            }}
          />
        )}
      </div>

      {/* Tarjeta */}
      <div
        onClick={isLocked ? undefined : onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(2000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "all 1.5s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
        className={`flex-1 min-w-0 flex flex-col md:flex-row rounded-[24px] overflow-hidden relative transition-all duration-500 ${
          isLocked
            ? "opacity-40 grayscale cursor-not-allowed"
            : "cursor-pointer hover:shadow-[0_24px_56px_rgba(0,0,0,0.45)]"
        }`}
      >
        {/* Borde (capa propia para que respete el radio) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            border: isLocked
              ? "1px solid rgba(255,255,255,0.08)"
              : isDone
              ? "1px solid rgba(16,185,129,0.30)"
              : `1px solid rgba(${accentRgb},0.20)`,
            pointerEvents: "none",
            zIndex: 20,
          }}
        />

        {/* Aura del ratón */}
        {!isLocked && (
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
            style={{
              background: `radial-gradient(circle at ${auraPos.x}% ${auraPos.y}%, rgba(${accentRgb},0.12) 0%, transparent 55%)`,
            }}
          />
        )}

        {/* Panel izquierdo — foto temática de la materia */}
        <div
          className="w-full h-[120px] md:h-auto md:w-[26%] md:max-w-[280px] relative overflow-hidden shrink-0"
          style={{ background: "#011C40" }}
        >
          <img
            src={imagenTema}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(${accentRgb},0.34) 0%, rgba(1,28,64,0.20) 50%, #011C40 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(${accentRgb},0.18) 0%, transparent 60%)`,
            }}
          />

          {/* Insignia P-N */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              background: "rgba(1,28,64,0.75)",
              border: `1px solid rgba(${accentRgb},0.35)`,
              borderRadius: 10,
              padding: "4px 10px",
              fontSize: 13,
              fontWeight: 800,
              color: accentColor,
              letterSpacing: "0.04em",
            }}
          >
            P-{numero}
          </div>
        </div>

        {/* Panel derecho — contenido */}
        <div
          className="flex-1 flex flex-col justify-between relative z-10"
          style={{
            padding: "clamp(18px, 2.4vw, 28px) clamp(18px, 2.6vw, 32px)",
            background: "#011C40",
            minWidth: 0,
          }}
        >
          <div>
            {/* Etiqueta */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: isDone ? "#10B981" : accentColor,
                marginBottom: 10,
              }}
            >
              Propósito formativo {numero}
              {isDone && (
                <span style={{ marginLeft: 8, letterSpacing: "0.06em" }}>
                  · Completado
                </span>
              )}
            </div>

            {/* Titular: descripción corta si el propósito es largo; si no, el propósito */}
            <h3
              ref={refTitulo}
              style={{
                fontSize: tituloCorto
                  ? "clamp(19px, 1.7vw, 23px)"
                  : tituloLargo
                  ? "clamp(17px, 1.4vw, 19px)"
                  : "clamp(19px, 1.7vw, 23px)",
                fontWeight: tituloLargo ? 700 : 800,
                color: "#ffffff",
                margin: 0,
                lineHeight: tituloLargo ? 1.45 : 1.25,
                letterSpacing: tituloLargo ? "-0.005em" : "-0.015em",
                overflowWrap: "anywhere",
                ...(tituloLargo ? recorte(4, recortar) : {}),
              }}
            >
              {tituloCorto ?? titulo}
            </h3>

            {/* Propósito oficial completo (cuando la descripción encabeza) */}
            {tituloCorto && (
              <p
                ref={refProposito}
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.72)",
                  margin: "10px 0 0",
                  overflowWrap: "anywhere",
                  ...recorte(3, recortar),
                }}
              >
                {titulo}
              </p>
            )}

            {/* Descripción, si aporta algo distinto y no encabeza ya */}
            {mostrarDesc && !tituloCorto && (
              <p
                ref={refDesc}
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.62)",
                  margin: "10px 0 0",
                  overflowWrap: "anywhere",
                  ...recorte(3, recortar),
                }}
              >
                {descripcion}
              </p>
            )}

            {(recortable || expandido) && (
              <button
                type="button"
                aria-expanded={expandido}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandido((v) => !v);
                }}
                style={{
                  marginTop: 6,
                  padding: "4px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  color: accentColor,
                }}
              >
                {expandido ? "Ver menos" : "Ver más"}
              </button>
            )}

            {/* Ejes articuladores */}
            {chips.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {chips.map((chip, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      maxWidth: "100%",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 5,
                        height: 5,
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: accentColor,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.62)",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {chip}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fila inferior: actividades + botón */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, minWidth: 0 }}>
              {actividades.map((act, idx) => {
                const meta = metaDeTipo(act.tipo);
                const icon = TIPO_ICON[act.tipo] ?? meta.icon;
                const isDoneAct = act.estado === "completada";
                const isInProg = act.estado === "en_progreso";
                return (
                  <div
                    key={`${act.orden}-${idx}`}
                    title={`A${act.orden} · ${meta.singular}${isDoneAct ? " · completada" : ""}`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: isDoneAct
                        ? "rgba(16,185,129,0.15)"
                        : isInProg
                        ? `rgba(${accentRgb},0.15)`
                        : "rgba(255,255,255,0.05)",
                      color: isDoneAct ? "#10B981" : isInProg ? accentColor : "rgba(255,255,255,0.45)",
                      border: isDoneAct
                        ? "1px solid rgba(16,185,129,0.25)"
                        : "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border-color 0.3s",
                    }}
                  >
                    <i className={`fa-solid ${icon}`} style={{ fontSize: 13 }} />
                  </div>
                );
              })}
              {actividades.length > 0 && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.50)",
                    marginLeft: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {hechas}/{actividades.length}
                </span>
              )}
            </div>

            {/* CTA — control real de teclado (la tarjeta entera es atajo de ratón) */}
            <button
              type="button"
              disabled={isLocked}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked) onClick();
              }}
              aria-label={
                isDone
                  ? `Repasar propósito formativo ${numero}: ${titulo}`
                  : isLocked
                  ? `Propósito formativo ${numero} bloqueado: ${titulo}`
                  : `Iniciar propósito formativo ${numero}: ${titulo}`
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 22px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.02em",
                border: "none",
                cursor: isLocked ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.3s",
                background: isDone
                  ? "#10B981"
                  : isLocked
                  ? "rgba(255,255,255,0.08)"
                  : accentColor,
                color: isDone
                  ? "#fff"
                  : isLocked
                  ? "rgba(255,255,255,0.25)"
                  : "#011C40",
                boxShadow: !isLocked && !isDone
                  ? `0 10px 26px rgba(${accentRgb},0.30)`
                  : "none",
              }}
            >
              {isDone ? "Repasar" : isLocked ? "Bloqueada" : "Iniciar"}
              {!isLocked && (
                <i className="fa-solid fa-chevron-right" style={{ fontSize: 12 }} />
              )}
            </button>
          </div>
        </div>

        {/* Capa de bloqueo */}
        {isLocked && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(1,17,38,0.70)", backdropFilter: "blur(2px)" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.30)",
                  fontSize: 20,
                }}
              >
                <i className="fa-solid fa-lock" />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Propósito formativo bloqueado
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
