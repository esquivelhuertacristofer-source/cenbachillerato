"use client";

import React, { useState } from "react";
import { TIPO_ICON } from "./uac-config";

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTilt({ x: (y - rect.height / 2) / 1000, y: (rect.width / 2 - x) / 1000 });
    setAuraPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const chips = (ejesArticuladores ?? []).slice(0, 3);

  return (
    <div className={`flex gap-8 relative group ${isLast ? "pb-0" : "pb-12"}`}>
      {/* Timeline node */}
      <div className="flex flex-col items-center w-10 shrink-0">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
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
            fontSize: 13,
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
            <i className="fa-solid fa-lock" style={{ fontSize: 12 }} />
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

      {/* Mission card */}
      <div
        onClick={isLocked ? undefined : onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(2000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "all 1.5s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
        className={`flex-1 flex flex-col md:flex-row min-h-[280px] rounded-[48px] overflow-hidden relative transition-all duration-500 ${
          isLocked
            ? "opacity-40 grayscale cursor-not-allowed"
            : "cursor-pointer hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Override border via inline style on the wrapper */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "48px",
            border: isLocked
              ? "1px solid rgba(255,255,255,0.08)"
              : isDone
              ? "1px solid rgba(16,185,129,0.30)"
              : `1px solid rgba(${accentRgb},0.20)`,
            pointerEvents: "none",
            zIndex: 20,
          }}
        />

        {/* Mouse aura */}
        {!isLocked && (
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
            style={{
              background: `radial-gradient(circle at ${auraPos.x}% ${auraPos.y}%, rgba(${accentRgb},0.12) 0%, transparent 55%)`,
            }}
          />
        )}

        {/* Left panel — thematic photo of the subject */}
        <div
          className="w-full md:w-[35%] min-h-[220px] md:min-h-full relative overflow-hidden shrink-0"
          style={{ background: "#011C40" }}
        >
          {/* Foto temática (licencia libre, WebP optimizado) */}
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

          {/* Tinte de acento + degradado para legibilidad y fusión con el panel */}
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

          {/* Número de progresión badge */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              background: `rgba(${accentRgb},0.15)`,
              border: `1px solid rgba(${accentRgb},0.30)`,
              borderRadius: 10,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 800,
              color: accentColor,
              letterSpacing: "0.1em",
            }}
          >
            P-{numero}
          </div>
        </div>

        {/* Right panel — content */}
        <div
          className="flex-1 flex flex-col justify-between relative z-10"
          style={{
            padding: "40px 48px",
            background: "#011C40",
            minWidth: 0,
          }}
        >
          <div>
            {/* Label */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.5em",
                color: isDone ? "#10B981" : accentColor,
                marginBottom: 16,
              }}
            >
              PROPÓSITO FORMATIVO {numero} · CEN BACHILLERATO
            </div>

            {/* Title */}
            <h4
              style={{
                fontSize: "clamp(22px,2.5vw,32px)",
                fontWeight: 900,
                color: "#ffffff",
                marginBottom: 8,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {titulo}
            </h4>

            {/* Chips */}
            {chips.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {chips.map((chip, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: accentColor,
                        boxShadow: `0 0 6px ${accentColor}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {chip}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {descripcion && (
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.50)",
                  lineHeight: 1.65,
                  maxWidth: "100%",
                  marginBottom: 24,
                }}
              >
                {descripcion}
              </p>
            )}
          </div>

          {/* Bottom row: activity icons + CTA */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Activity type icons */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {actividades.map((act, idx) => {
                const icon = TIPO_ICON[act.tipo] ?? "fa-star";
                const isDoneAct = act.estado === "completada";
                const isInProg = act.estado === "en_progreso";
                return (
                  <div
                    key={`${act.orden}-${idx}`}
                    title={`A${act.orden}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: isDoneAct
                        ? "rgba(16,185,129,0.15)"
                        : isInProg
                        ? `rgba(${accentRgb},0.15)`
                        : "rgba(255,255,255,0.05)",
                      color: isDoneAct ? "#10B981" : isInProg ? accentColor : "rgba(255,255,255,0.30)",
                      border: isDoneAct
                        ? "1px solid rgba(16,185,129,0.25)"
                        : "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      transition: "border-color 0.3s",
                    }}
                  >
                    <i className={`fa-solid ${icon}`} style={{ fontSize: 13 }} />
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 36px",
                borderRadius: 28,
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: 12,
                letterSpacing: "0.12em",
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
                  ? `0 16px 40px rgba(${accentRgb},0.35)`
                  : "none",
              }}
            >
              {isDone ? "Repasar" : isLocked ? "Bloqueada" : "Iniciar"}
              {!isLocked && (
                <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} />
              )}
            </button>
          </div>
        </div>

        {/* Locked overlay */}
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
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.20)",
                  fontSize: 22,
                }}
              >
                <i className="fa-solid fa-lock" />
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.4em",
                  color: "rgba(255,255,255,0.30)",
                }}
              >
                Propósito formativo Bloqueado
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
