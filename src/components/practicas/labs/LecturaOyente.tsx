"use client";

/**
 * Piezas visuales de «Leer en voz alta» (LC-I-P07): la oyente ficticia con su
 * medidor de comprensión, la onda de la lectura y la melodía de la partitura.
 * Todo SVG; la foto es opcional y se oculta si el archivo aún no existe.
 */

import { useState, type ReactNode } from "react";
import { T } from "./_kit";
import { MARCA_INFO, type FragmentoRitmo, type Marca, type PuntoTexto } from "./lectura-voz-alta-data";
import { duracionMaxima, ondaDe, oyente } from "./lectura-voz-alta-sim";

const RUTA_FOTOS = "/media/labs-sim/lectura-en-voz-alta";
const OKC = "#34D399";
const AMBAR = "#FFC75A";
const ROJO = "#FF5E5E";

/** Foto con respaldo: degradado e ícono si el archivo no existe. */
export function FotoLectura({ clave, icono, alto = 120 }: { clave: string; icono: string; alto?: number }) {
  const [falla, setFalla] = useState(false);
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        height: alto,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 34,
        color: "rgba(255,255,255,0.5)",
        background: "linear-gradient(135deg, rgba(91,200,255,0.2), rgba(167,139,250,0.2))",
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
    </div>
  );
}

/** Oyente ficticia: su cara y su medidor cambian con el ritmo y las pausas. */
export function OyenteEscena({ frag, ppm, pausa }: { frag: FragmentoRitmo; ppm: number; pausa: number }) {
  const r = oyente(frag, ppm, pausa);
  const col = r.estado === "sigue" ? OKC : r.estado === "regular" ? AMBAR : ROJO;
  const boca = r.estado === "sigue" ? "M-9 8 Q0 17 9 8" : r.estado === "regular" ? "M-8 11 h16" : "M-8 14 Q0 6 8 14";
  return (
    <div className="lva-oyente">
      <svg viewBox="0 0 120 120" role="img" aria-label={`Mariana, oyente ficticia: ${r.estado === "sigue" ? "sigue la lectura" : r.estado === "regular" ? "se distrae un poco" : "se perdió"}`} style={{ width: 120, maxWidth: "30%", height: "auto", flexShrink: 0 }}>
        <rect width="120" height="120" rx="16" fill="rgba(2,12,28,0.55)" />
        <path d="M22 120 Q22 78 60 78 Q98 78 98 120 Z" fill="#5B7FD6" />
        <circle cx="60" cy="52" r="28" fill="#E3B48E" />
        <path d="M32 50 Q60 14 88 50 Q74 34 32 50 Z" fill="#2B2230" />
        <circle cx="49" cy="50" r="3" fill="#2B2230" />
        <circle cx="71" cy="50" r="3" fill="#2B2230" />
        <g transform="translate(60 56)">
          <path d={boca} stroke="#2B2230" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
        {r.estado === "perdida" && (
          <g fill={ROJO} fontWeight="900" fontSize="18">
            <text x="92" y="30">?</text>
            <text x="12" y="38">?</text>
          </g>
        )}
        {r.estado === "regular" && <path d="M40 40 L56 42 M64 42 L80 40" stroke="#2B2230" strokeWidth="2" strokeLinecap="round" />}
      </svg>
      <div style={{ display: "grid", gap: 8, minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, fontWeight: 800, color: T.text2 }}>
          <span>Comprensión de la oyente (simulación)</span>
          <strong style={{ color: col, fontVariantNumeric: "tabular-nums" }}>{r.total} %</strong>
        </div>
        <div className="lva-medidor" aria-hidden>
          <div style={{ width: `${r.total}%`, background: col }} />
        </div>
        <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.45 }}>{r.frase}</div>
      </div>
    </div>
  );
}

/** La lectura como onda: barras = palabras, huecos = silencios. */
export function OndaLectura({ frag, ppm, pausa }: { frag: FragmentoRitmo; ppm: number; pausa: number }) {
  const { barras, pausas, duracion } = ondaDe(frag, ppm, pausa);
  const W = 600;
  const H = 90;
  const escala = (W - 8) / duracionMaxima(frag);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Onda de la lectura: cada barra es una palabra y cada hueco un silencio" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, background: "rgba(2,12,28,0.5)" }}>
      {pausas.map((p, i) => (
        <rect key={`p${i}`} x={4 + p.t0 * escala} y={H / 2 - 4} width={Math.max(1, (p.t1 - p.t0) * escala)} height="8" rx="3" fill="rgba(255,199,90,0.35)" />
      ))}
      {barras.map((b, i) => {
        const h = b.h * (H - 24);
        return <rect key={i} x={4 + b.t0 * escala} y={(H - h) / 2} width={Math.max(1.4, (b.t1 - b.t0) * escala)} height={h} rx="1.5" fill="#5BC8FF" />;
      })}
      <text x="8" y={H - 6} fontSize="13" fill={T.text2}>0 s</text>
      <text x={Math.min(W - 8, 4 + duracion * escala)} y={H - 6} fontSize="13" fill="#fff" textAnchor="end">
        {duracion.toFixed(1)} s
      </text>
    </svg>
  );
}

/** Melodía de la partitura: se vuelve expresiva conforme se colocan las marcas. */
export function MelodiaPartitura({ tokens, puntos, puestos }: { tokens: string[]; puntos: PuntoTexto[]; puestos: Record<string, true> }) {
  const colocadas = new Map<number, PuntoTexto>();
  for (const p of puntos) if (puestos[p.id]) colocadas.set(p.token, p);
  const unidades = (p: PuntoTexto | undefined): number => (p?.marca === "pausaLarga" ? 3 : p?.marca === "pausaBreve" ? 1.5 : 0);
  let total = 0;
  for (let i = 0; i < tokens.length; i++) total += 1 + unidades(colocadas.get(i));
  const W = 600;
  const H = 76;
  const u = (W - 8) / total;
  let x = 4;
  const piezas: ReactNode[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const p = colocadas.get(i);
    const marca: Marca | undefined = p?.marca;
    const alto = marca === "enfasis" ? 46 : 20;
    const col = marca === "enfasis" ? MARCA_INFO.enfasis.color : "#5BC8FF";
    const cy = marca === "entonacion" ? (p!.direccion === "baja" ? 42 : 24) : 38;
    piezas.push(<rect key={`b${i}`} x={x} y={cy - alto / 2} width={Math.max(1.5, u * 0.8)} height={alto} rx="1.5" fill={col} />);
    if (marca === "entonacion") {
      const sube = p!.direccion !== "baja";
      piezas.push(
        <path key={`e${i}`} d={sube ? `M${x - 6} 56 L${x + 6} 46` : `M${x - 6} 46 L${x + 6} 56`} stroke={MARCA_INFO.entonacion.color} strokeWidth="2.5" strokeLinecap="round" />
      );
    }
    x += u;
    const hueco = unidades(p) * u;
    if (hueco > 0) {
      piezas.push(<rect key={`h${i}`} x={x + 1} y={35} width={Math.max(1, hueco - 2)} height="6" rx="3" fill={MARCA_INFO[marca as Marca].color} opacity="0.7" />);
      x += hueco;
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Melodía de tu lectura: pausas como huecos, énfasis como barras altas, entonación como flechas" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, background: "rgba(2,12,28,0.5)" }}>
      {piezas}
    </svg>
  );
}
