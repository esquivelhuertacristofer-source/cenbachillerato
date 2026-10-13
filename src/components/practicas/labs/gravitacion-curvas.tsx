"use client";

/**
 * Curvas del laboratorio de Gravitación (SVG, sin dependencias):
 *  · "fuerza"  — F/F₀ contra r/r₀: la curva 1/r². El punto del alumno se mueve
 *    sobre ella; las marcas fijas son el problema (1, 1) y el doble (2, ¼).
 *  · "periodo" — T (h) contra la altura (km): 3.ª ley de Kepler. La línea de
 *    24 h la cruza en 35 786 km: la órbita geoestacionaria.
 * Una sola serie por curva: el título la nombra; el texto va en tinta neutra.
 */

import { resolverOrbita, R_MIN, R_MAX, R_DEF, ALT_MIN, ALT_MAX, ALT_GEO, fmt1, fmt2 } from "./gravitacion-data";

const W = 320, H = 170;
const M = { l: 40, r: 12, t: 12, b: 34 };
const IW = W - M.l - M.r, IH = H - M.t - M.b;
const TINTA = "rgba(226,232,240,0.85)";
const TENUE = "rgba(226,232,240,0.18)";

interface Def {
  titulo: string; ejeX: string; ejeY: string;
  x0: number; x1: number; y0: number; y1: number;
  f: (x: number) => number;
  ticksX: number[]; ticksY: number[];
  fmtX: (x: number) => string; fmtY: (y: number) => string;
  marcas: { x: number; y: number; txt: string }[];
  linea?: { y: number; txt: string };
}

const DEFS: Record<"fuerza" | "periodo", Def> = {
  fuerza: {
    titulo: "Fuerza contra distancia (1/r²)",
    ejeX: "r / r del problema", ejeY: "F / F₀",
    x0: R_MIN / R_DEF, x1: R_MAX / R_DEF, y0: 0, y1: 4,
    f: (x) => 1 / (x * x),
    ticksX: [0.5, 1, 1.5, 2], ticksY: [0, 1, 2, 3, 4],
    fmtX: (x) => fmt1(x), fmtY: (y) => fmt1(y),
    marcas: [{ x: 1, y: 1, txt: "problema" }, { x: 2, y: 0.25, txt: "doble: ¼" }],
  },
  periodo: {
    titulo: "Período contra altura (Kepler)",
    ejeX: "altura (miles de km)", ejeY: "T (h)",
    x0: ALT_MIN / 1000, x1: ALT_MAX / 1000, y0: 0, y1: 40,
    f: (x) => resolverOrbita(x * 1000).Th,
    ticksX: [10000, 20000, 30000, 40000, 50000], ticksY: [0, 12, 24, 36],
    fmtX: (x) => String(Math.round(x / 1000)), fmtY: (y) => String(Math.round(y)),
    marcas: [{ x: ALT_GEO / 1000, y: 23.93, txt: "35 786 km" }],
    linea: { y: 24, txt: "24 h" },
  },
};

export function CurvaGravitacion({ tipo, x, y, col }: { tipo: "fuerza" | "periodo"; x: number; y: number; col: string }) {
  const d = DEFS[tipo];
  const sx = (v: number) => M.l + ((v - d.x0) / (d.x1 - d.x0)) * IW;
  const sy = (v: number) => M.t + IH - ((Math.min(v, d.y1) - d.y0) / (d.y1 - d.y0)) * IH;
  const pts: string[] = [];
  const n = 80;
  for (let i = 0; i <= n; i++) {
    const xv = d.x0 + ((d.x1 - d.x0) * i) / n;
    pts.push(`${sx(xv).toFixed(1)},${sy(d.f(xv)).toFixed(1)}`);
  }
  const fuera = y > d.y1;
  const yTexto = tipo === "fuerza" ? `${fmt2(y)}×` : `${fmt1(y)} h`;
  return (
    <figure style={{ margin: 0, display: "grid", gap: 4 }}>
      <figcaption style={{ fontSize: 14, fontWeight: 800, color: TINTA }}>{d.titulo}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${d.titulo}. Valor actual: ${yTexto}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {d.ticksY.map((t) => (
          <g key={`y${t}`}>
            <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke={TENUE} strokeWidth={1} />
            <text x={M.l - 6} y={sy(t) + 4} textAnchor="end" fontSize={12} fill={TINTA}>{d.fmtY(t)}</text>
          </g>
        ))}
        {d.ticksX.map((t) => (
          <text key={`x${t}`} x={sx(t)} y={H - M.b + 16} textAnchor="middle" fontSize={12} fill={TINTA}>{d.fmtX(t)}</text>
        ))}
        <text x={M.l + IW / 2} y={H - 4} textAnchor="middle" fontSize={12} fill={TINTA}>{d.ejeX}</text>
        <text x={10} y={M.t + IH / 2} textAnchor="middle" fontSize={12} fill={TINTA} transform={`rotate(-90 10 ${M.t + IH / 2})`}>{d.ejeY}</text>
        {d.linea && (
          <g>
            <line x1={M.l} x2={W - M.r} y1={sy(d.linea.y)} y2={sy(d.linea.y)} stroke="#ffffff" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.7} />
            <text x={M.l + 4} y={sy(d.linea.y) - 5} textAnchor="start" fontSize={12} fill={TINTA}>{d.linea.txt}</text>
          </g>
        )}
        <polyline points={pts.join(" ")} fill="none" stroke={col} strokeWidth={2} strokeLinejoin="round" opacity={0.85} />
        {d.marcas.map((mk) => (
          <g key={mk.txt}>
            <circle cx={sx(mk.x)} cy={sy(mk.y)} r={4} fill="#0b1626" stroke="#ffffff" strokeWidth={1.5} />
            <text x={sx(mk.x) + (sx(mk.x) > M.l + IW * 0.7 ? -7 : 7)} y={sy(mk.y) - 9}
              textAnchor={sx(mk.x) > M.l + IW * 0.7 ? "end" : "start"} fontSize={12} fill={TINTA}>{mk.txt}</text>
          </g>
        ))}
        <circle cx={sx(Math.min(d.x1, Math.max(d.x0, x)))} cy={sy(y)} r={6.5} fill={col} stroke="#0b1626" strokeWidth={2} />
        {fuera && <text x={sx(x) + 9} y={M.t + 12} fontSize={12} fill={TINTA}>▲ {yTexto}</text>}
      </svg>
    </figure>
  );
}
