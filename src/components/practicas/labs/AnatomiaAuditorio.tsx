"use client";

/**
 * Piezas visuales del simulador «Da la exposición» (LC-I-P08): el auditorio
 * ilustrado con público ficticio y la curva de atención. Todo SVG, sin imágenes
 * obligatorias: la foto es opcional y se oculta si no existe.
 */

import { useState } from "react";
import { T } from "./_kit";
import {
  MOMENTOS,
  PUBLICO,
  curvaAtencion,
  estadoPersona,
  type EleccionSim,
  type OpcionSim,
  type EstadoPersona,
} from "./anatomia-exposicion-sim";

const RUTA_FOTOS = "/media/labs-sim/anatomia-exposicion-oral";
const OKC = "#34D399";
const AMBAR = "#FFC75A";
const GRIS = "#6B7A90";
const PIELES = ["#F1C9A5", "#D9A47A", "#B97D55", "#8C5A3C", "#F4D6B8", "#C68E64"];

/** Foto con respaldo: si el archivo aún no existe, queda el degradado y el ícono. */
export function FotoOpc({ clave, icono, alto = 84 }: { clave: string; icono: string; alto?: number }) {
  const [falla, setFalla] = useState(false);
  return (
    <span
      aria-hidden
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: alto,
        borderRadius: 10,
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(91,200,255,0.22), rgba(167,139,250,0.22))",
        color: "rgba(255,255,255,0.55)",
        fontSize: 26,
      }}
    >
      <i className={`fa-solid ${icono}`} />
      {!falla && (
        <img
          src={`${RUTA_FOTOS}/${clave}.webp`}
          alt=""
          loading="lazy"
          onError={() => setFalla(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </span>
  );
}

function Persona({ x, y, i, estado, nombre }: { x: number; y: number; i: number; estado: EstadoPersona; nombre: string }) {
  const piel = PIELES[i % PIELES.length]!;
  const camisa = estado === "atento" ? OKC : estado === "distraido" ? AMBAR : GRIS;
  const dy = estado === "dormido" ? 6 : 0;
  const dx = estado === "distraido" ? 5 : 0;
  return (
    <g transform={`translate(${x} ${y})`} aria-label={`${nombre}: ${estado}`}>
      <path d="M-17 30 Q-17 6 0 6 Q17 6 17 30 Z" fill={camisa} opacity={estado === "dormido" ? 0.6 : 0.95} />
      <g style={{ transition: "transform .35s" }} transform={`translate(${dx} ${dy})`}>
        <circle cx="0" cy="-8" r="12" fill={piel} />
        <path d="M-12 -10 Q0 -26 12 -10 Q4 -16 -12 -10 Z" fill="#2B2230" />
        {estado === "dormido" ? (
          <>
            <path d="M-6 -7 h4 M2 -7 h4" stroke="#2B2230" strokeWidth="1.6" strokeLinecap="round" />
            <text x="12" y="-18" fontSize="11" fontWeight="800" fill="#cfd8e6">z</text>
            <text x="18" y="-26" fontSize="9" fontWeight="800" fill="#cfd8e6">z</text>
          </>
        ) : (
          <>
            <circle cx="-4" cy="-8" r="1.8" fill="#2B2230" />
            <circle cx="4" cy="-8" r="1.8" fill="#2B2230" />
            <path d={estado === "atento" ? "M-4 -2 Q0 1 4 -2" : "M-3 -1 h6"} stroke="#2B2230" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </>
        )}
      </g>
      {estado === "distraido" && <rect x="-6" y="14" width="12" height="16" rx="2" fill="#1a2433" stroke="#9fb3cf" strokeWidth="1" />}
    </g>
  );
}

function Pantalla({ apoyo }: { apoyo: EleccionSim["apoyo"] }) {
  return (
    <g>
      <rect x="190" y="12" width="220" height="86" rx="6" fill="#0c1c2e" stroke="#4d6a8c" strokeWidth="2" />
      {apoyo === "esquema" && (
        <g stroke="#5BC8FF" strokeWidth="2" fill="none">
          <circle cx="232" cy="55" r="15" fill="rgba(91,200,255,0.25)" />
          <circle cx="300" cy="55" r="15" fill="rgba(167,139,250,0.3)" stroke="#A78BFA" />
          <circle cx="368" cy="55" r="15" fill="rgba(52,211,153,0.3)" stroke="#34D399" />
          <path d="M248 55 H284 M316 55 H352" />
        </g>
      )}
      {apoyo === "parrafos" && (
        <g stroke="#9fb3cf" strokeWidth="3" strokeLinecap="round">
          {[28, 38, 48, 58, 68, 78].map((yy, k) => (
            <path key={yy} d={`M202 ${yy} H${k % 2 ? 392 : 398}`} />
          ))}
        </g>
      )}
      {apoyo === "ninguno" && <path d="M250 55 H350" stroke="#4d6a8c" strokeWidth="2" strokeDasharray="4 6" />}
    </g>
  );
}

function Expositor({ mirada }: { mirada: EleccionSim["mirada"] }) {
  const giro = mirada === "pared" ? 10 : 0;
  return (
    <g transform="translate(300 140)">
      <rect x="-18" y="8" width="36" height="34" rx="8" fill="#5B7FD6" />
      <g transform={`translate(${giro} ${mirada === "papel" ? 3 : 0})`}>
        <circle cx="0" cy="-6" r="13" fill="#E3B48E" />
        <path d="M-13 -8 Q0 -26 13 -8 Q4 -15 -13 -8 Z" fill="#2B2230" />
        <circle cx="-4" cy={mirada === "papel" ? -2 : -6} r="1.8" fill="#2B2230" />
        <circle cx="4" cy={mirada === "papel" ? -2 : -6} r="1.8" fill="#2B2230" />
      </g>
      {mirada === "papel" && <rect x="-14" y="16" width="28" height="20" rx="2" fill="#f4f1e6" transform="rotate(-6)" />}
      {mirada === "grupo" && (
        <g stroke="#34D399" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.8">
          <path d="M0 -2 L-120 62" />
          <path d="M0 -2 L0 72" />
          <path d="M0 -2 L120 62" />
        </g>
      )}
      {mirada === "pared" && <path d="M16 -6 L120 -6" stroke="#FF5E5E" strokeWidth="1.6" strokeDasharray="3 4" />}
    </g>
  );
}

export function AuditorioEscena({ eleccion, atencion }: { eleccion: EleccionSim; atencion: number }) {
  return (
    <div className="aex-aud">
      <svg
        viewBox="0 0 600 320"
        role="img"
        aria-label="Auditorio ilustrado con un expositor y doce personas del público, ficticias"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <linearGradient id="aexPiso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14263d" />
            <stop offset="1" stopColor="#0a1524" />
          </linearGradient>
        </defs>
        <rect width="600" height="320" fill="url(#aexPiso)" />
        <rect x="0" y="108" width="600" height="212" fill="rgba(0,0,0,0.25)" />
        <Pantalla apoyo={eleccion.apoyo} />
        <Expositor mirada={eleccion.mirada} />
        {PUBLICO.map((p, i) => {
          const fila = Math.floor(i / 6);
          const col = i % 6;
          return (
            <Persona
              key={p.id}
              i={i}
              nombre={p.nombre}
              x={70 + col * 92 + (fila ? 22 : 0)}
              y={fila ? 262 : 214}
              estado={estadoPersona(atencion, p)}
            />
          );
        })}
      </svg>
      <div className="aex-medidor" aria-hidden>
        <div style={{ width: `${Math.round(atencion * 100)}%`, background: atencion >= 0.7 ? OKC : atencion >= 0.4 ? AMBAR : "#FF5E5E" }} />
      </div>
    </div>
  );
}

export function CurvaAtencion({ eleccion, indice }: { eleccion: EleccionSim; indice: number }) {
  const c = curvaAtencion(eleccion);
  const W = 300;
  const H = 120;
  const px = (i: number) => 14 + (i / (MOMENTOS.length - 1)) * (W - 28);
  const py = (v: number) => H - 20 - v * (H - 34);
  const pts = c.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva de atención del público durante los tres minutos" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="0" y="0" width={W} height={H} rx="10" fill="rgba(2,12,28,0.5)" />
      <line x1="14" x2={W - 14} y1={py(0.7)} y2={py(0.7)} stroke={OKC} strokeDasharray="4 4" opacity="0.6" />
      <text x={W - 16} y={py(0.7) - 4} textAnchor="end" fontSize="12" fill={OKC}>70 %</text>
      <polygon points={`${px(0)},${H - 20} ${pts} ${px(c.length - 1)},${H - 20}`} fill="rgba(91,200,255,0.18)" />
      <polyline points={pts} fill="none" stroke="#5BC8FF" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1={px(indice)} x2={px(indice)} y1="6" y2={H - 20} stroke="#fff" strokeWidth="1.5" />
      <circle cx={px(indice)} cy={py(c[indice]!)} r="5" fill="#fff" />
      {MOMENTOS.map((m, i) => (
        <text key={m} x={px(i)} y={H - 4} textAnchor="middle" fontSize="12" fill={T.text2}>
          {Math.floor(m / 60)}:{String(m % 60).padStart(2, "0")}
        </text>
      ))}
    </svg>
  );
}

/** Fotos que existen para las opciones del simulador (las demás llevan solo ícono). */
const FOTOS_SIM = new Set(["apertura-pregunta", "apertura-dato", "mirada-grupo", "mirada-papel", "apoyo-esquema", "apoyo-parrafos"]);

export function OpcionesSim<K extends string>({ lista, actual, cambiar, grupo }: { lista: OpcionSim<K>[]; actual: K; cambiar: (id: K) => void; grupo: string }) {
  return (
    <div className="aex-opciones" role="radiogroup" aria-label={grupo}>
      {lista.map((o) => {
        const clave = `${grupo}-${o.id}`;
        return (
          <button key={o.id} type="button" role="radio" aria-checked={actual === o.id} className="aex-opcion" data-on={actual === o.id} onClick={() => cambiar(o.id)}>
            {FOTOS_SIM.has(clave) ? <FotoOpc clave={clave} icono={o.icono} /> : <i className={`fa-solid ${o.icono}`} aria-hidden />}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
