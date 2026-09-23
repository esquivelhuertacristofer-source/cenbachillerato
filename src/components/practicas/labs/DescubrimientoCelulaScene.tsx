"use client";

/**
 * Escena 3D del laboratorio "El descubrimiento de la célula" (CNEYT-VI-P10).
 * Cuatro vistas:
 *
 *  - instrumentos: el instrumento de cada época (ojo, microscopio de Hooke,
 *    lente de Leeuwenhoek, acromático del siglo XIX, óptico moderno y
 *    electrónico) junto al círculo de lo que se ve por el ocular. La imagen se
 *    dibuja a escala real de micrómetros en un lienzo y se desenfoca según la
 *    resolución efectiva del instrumento.
 *  - medicion: microscopio moderno con revólver que gira, ocular intercambiable
 *    y calibrador sobre la imagen.
 *  - teoria: el templo de la teoría celular; cada evidencia es un tambor que se
 *    apila en su pilar y la línea del tiempo marca los años.
 *  - pasteur: los matraces de cuello recto y de cuello de cisne.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { VIDRIO_FINO } from "./_vidrio";
import {
  type InstrumentoId,
  type MuestraId,
  type ObjetivoX,
  type OcularX,
  type FasePasteur,
  instrumento,
  muestra as muestraDe,
  resolucionEfectiva,
  campoUm,
  abbeUm,
  hash2,
  mulberry32,
  longitud,
  num,
  OBJETIVOS_REV,
  MISIONES,
  DIECIOCHOAVO_PULGADA_UM,
  HITOS,
  PILARES,
  PILAR_DEF,
  CIMIENTOS,
  DIAS_REPOSO,
  DIAS_ROTO,
  T_REPOSO,
  T_ROTO,
  turbidez,
} from "./descubrimiento-celula-data";

export type VistaDescubrimiento = "instrumentos" | "medicion" | "teoria" | "pasteur";

export interface DescubrimientoSceneProps {
  vista: VistaDescubrimiento;
  modoColor: string;
  resetNonce: number;
  // Instrumentos
  instrumentoId: InstrumentoId;
  ajusteId: string;
  muestraId: MuestraId;
  // Medición
  objetivo: ObjetivoX;
  ocular: OcularX;
  misionId: string;
  calibradorMm: number;
  // Teoría
  ordenados: string[];
  colocados: string[];
  seleccionado: string | null;
  errorNonce: number;
  // Pasteur
  fasePasteur: FasePasteur;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Lienzo: lo que se ve por el ocular, a escala real
 * ════════════════════════════════════════════════════════════════════════ */

const N = 768;
type Ctx = CanvasRenderingContext2D;
interface V2 {
  s: number; // px por µm
  cx: number;
  cy: number;
  w: number; // media ventana en µm
}
const X = (v: V2, x: number) => N / 2 + (x - v.cx) * v.s;
const Y = (v: V2, y: number) => N / 2 + (y - v.cy) * v.s;
const TAU = Math.PI * 2;

/** Grosor de línea: nunca menos de medio píxel; si es más fino, se aclara. */
function grosor(ctx: Ctx, um: number, s: number) {
  const px = um * s;
  if (px >= 0.5) {
    ctx.lineWidth = px;
    ctx.globalAlpha = 1;
  } else {
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = Math.max(0.08, px / 0.5);
  }
}

function fondo(ctx: Ctx, v: V2, gris: boolean) {
  ctx.fillStyle = "#4a3b2e";
  ctx.fillRect(0, 0, N, N);
  // Portaobjetos de 75 × 25 mm con su cubreobjetos de 22 mm.
  ctx.fillStyle = gris ? "#bfc3c6" : "#dde6ea";
  ctx.fillRect(X(v, -37500), Y(v, -12500), 75000 * v.s, 25000 * v.s);
  if (22000 * v.s < N * 3) {
    ctx.strokeStyle = "rgba(120,150,170,0.55)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(X(v, -11000), Y(v, -11000), 22000 * v.s, 22000 * v.s);
  }
}

/* ── Corcho ─────────────────────────────────────────────────────────── */
function corcho(ctx: Ctx, v: V2) {
  const R = 1500;
  ctx.beginPath();
  for (let k = 0; k <= 64; k++) {
    const a = (k / 64) * TAU;
    const rr = R * (0.9 + 0.1 * hash2(k % 64, 3, 5));
    if (k === 0) ctx.moveTo(X(v, Math.cos(a) * rr), Y(v, Math.sin(a) * rr));
    else ctx.lineTo(X(v, Math.cos(a) * rr), Y(v, Math.sin(a) * rr));
  }
  ctx.fillStyle = "#c39a5e";
  ctx.fill();
  const p = 24;
  if (p * v.s < 2.5) return;
  const r = p / Math.sqrt(3);
  const dy = 1.5 * r;
  const j0 = Math.max(-Math.ceil(R / dy), Math.floor((v.cy - v.w) / dy) - 1);
  const j1 = Math.min(Math.ceil(R / dy), Math.ceil((v.cy + v.w) / dy) + 1);
  const i0 = Math.max(-Math.ceil(R / p) - 1, Math.floor((v.cx - v.w) / p) - 1);
  const i1 = Math.min(Math.ceil(R / p) + 1, Math.ceil((v.cx + v.w) / p) + 1);
  if ((j1 - j0) * (i1 - i0) > 60000) return;
  const vert = (vx: number, vy: number): [number, number] => {
    const kx = Math.round(vx / (p / 2));
    const ky = Math.round(vy / (r / 2));
    return [vx + (hash2(kx, ky, 1) - 0.5) * 0.3 * p, vy + (hash2(kx, ky, 2) - 0.5) * 0.3 * p];
  };
  ctx.beginPath();
  for (let j = j0; j <= j1; j++) {
    const off = j & 1 ? p / 2 : 0;
    for (let i = i0; i <= i1; i++) {
      const cx = i * p + off;
      const cy = j * dy;
      const rr = R * (0.9 + 0.1 * hash2(Math.floor(((Math.atan2(cy, cx) + Math.PI) / TAU) * 64) % 64, 3, 5));
      if (cx * cx + cy * cy > rr * rr * 0.97) continue;
      for (let k = 0; k < 6; k++) {
        const a = Math.PI / 6 + (k * Math.PI) / 3;
        const [vx, vy] = vert(cx + r * Math.cos(a), cy + r * Math.sin(a));
        if (k === 0) ctx.moveTo(X(v, vx), Y(v, vy));
        else ctx.lineTo(X(v, vx), Y(v, vy));
      }
      ctx.closePath();
    }
  }
  ctx.fillStyle = "#ead3a0";
  ctx.fill();
  ctx.strokeStyle = "#5e3814";
  grosor(ctx, 1.5, v.s);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/* ── Agua de estanque ───────────────────────────────────────────────── */
function paramecio(ctx: Ctx, v: V2, x: number, y: number, ang: number) {
  ctx.save();
  ctx.translate(X(v, x), Y(v, y));
  ctx.rotate(ang);
  ctx.scale(v.s, v.s);
  const lw = (um: number) => Math.max(um, 0.6 / v.s);
  if (v.s >= 1) {
    ctx.beginPath();
    for (let k = 0; k < 180; k++) {
      const t = (k / 180) * TAU;
      const px = 100 * Math.cos(t);
      const py = 30 * Math.sin(t) * (px > 0 ? 0.85 : 1);
      const nx = Math.cos(t) / 100;
      const ny = Math.sin(t) / 30;
      const nl = Math.hypot(nx, ny);
      ctx.moveTo(px, py);
      ctx.lineTo(px + (nx / nl) * 9, py + (ny / nl) * 9);
    }
    ctx.strokeStyle = "rgba(92,115,70,0.75)";
    ctx.lineWidth = lw(0.25);
    ctx.stroke();
  }
  ctx.beginPath();
  for (let k = 0; k <= 72; k++) {
    const t = (k / 72) * TAU;
    const px = 100 * Math.cos(t);
    const py = 30 * Math.sin(t) * (px > 0 ? 0.85 : 1);
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  const g = ctx.createRadialGradient(-10, -6, 4, 0, 0, 100);
  g.addColorStop(0, "#dfe9c2");
  g.addColorStop(1, "#b3c78a");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "#5d7439";
  ctx.lineWidth = lw(1.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-12, 6);
  ctx.quadraticCurveTo(15, 24, 38, 14);
  ctx.strokeStyle = "rgba(93,116,57,0.8)";
  ctx.lineWidth = lw(1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-4, 2, 22, 12, 0.1, 0, TAU);
  ctx.fillStyle = "#9bb27a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, -6, 4, 0, TAU);
  ctx.fillStyle = "#7f9960";
  ctx.fill();
  for (const vx of [-64, 60]) {
    ctx.beginPath();
    ctx.arc(vx, -5, 7, 0, TAU);
    ctx.fillStyle = "#eef8f4";
    ctx.fill();
    ctx.strokeStyle = "#8fa872";
    ctx.lineWidth = lw(0.8);
    ctx.stroke();
  }
  ctx.fillStyle = "#86a063";
  for (let k = 0; k < 9; k++) {
    ctx.beginPath();
    ctx.arc((hash2(k, 1, 31) - 0.5) * 130, (hash2(k, 2, 31) - 0.5) * 34, 3.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function estanque(ctx: Ctx, v: V2) {
  const R = 2500;
  ctx.beginPath();
  ctx.arc(X(v, 0), Y(v, 0), R * v.s, 0, TAU);
  ctx.fillStyle = "#cfe5e6";
  ctx.fill();
  ctx.strokeStyle = "rgba(90,130,140,0.5)";
  ctx.lineWidth = Math.max(1, 40 * v.s);
  ctx.stroke();
  if (2 * v.s >= 1) {
    const G = 14;
    const i0 = Math.floor((v.cx - v.w) / G) - 1;
    const i1 = Math.ceil((v.cx + v.w) / G) + 1;
    const j0 = Math.floor((v.cy - v.w) / G) - 1;
    const j1 = Math.ceil((v.cy + v.w) / G) + 1;
    if ((i1 - i0) * (j1 - j0) < 90000) {
      ctx.beginPath();
      for (let i = i0; i <= i1; i++)
        for (let j = j0; j <= j1; j++) {
          if (hash2(i, j, 7) > 0.5) continue;
          const x = (i + hash2(i, j, 8)) * G;
          const y = (j + hash2(i, j, 9)) * G;
          if (x * x + y * y > R * R) continue;
          if (Math.abs(x) < 115 && Math.abs(y) < 40) continue;
          const a = hash2(i, j, 10) * Math.PI;
          ctx.moveTo(X(v, x - Math.cos(a) * 0.7), Y(v, y - Math.sin(a) * 0.7));
          ctx.lineTo(X(v, x + Math.cos(a) * 0.7), Y(v, y + Math.sin(a) * 0.7));
        }
      ctx.strokeStyle = "#3f5a61";
      ctx.lineCap = "round";
      grosor(ctx, 0.6, v.s);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineCap = "butt";
    }
  }
  if (8 * v.s >= 1.5) {
    const GA = 45;
    const a0 = Math.floor((v.cx - v.w) / GA) - 1;
    const a1 = Math.ceil((v.cx + v.w) / GA) + 1;
    const b0 = Math.floor((v.cy - v.w) / GA) - 1;
    const b1 = Math.ceil((v.cy + v.w) / GA) + 1;
    if ((a1 - a0) * (b1 - b0) < 40000) {
      ctx.beginPath();
      const cloro: [number, number][] = [];
      for (let i = a0; i <= a1; i++)
        for (let j = b0; j <= b1; j++) {
          if (hash2(i, j, 15) > 0.12) continue;
          const x = (i + hash2(i, j, 16)) * GA;
          const y = (j + hash2(i, j, 17)) * GA;
          if (x * x + y * y > R * R || (Math.abs(x) < 125 && Math.abs(y) < 50)) continue;
          ctx.moveTo(X(v, x + 4), Y(v, y));
          ctx.arc(X(v, x), Y(v, y), 4 * v.s, 0, TAU);
          cloro.push([x, y]);
        }
      ctx.fillStyle = "#7fb069";
      ctx.fill();
      ctx.strokeStyle = "#3f6b2a";
      grosor(ctx, 0.5, v.s);
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (v.s >= 2) {
        ctx.beginPath();
        for (const [x, y] of cloro) {
          ctx.moveTo(X(v, x + 1.2), Y(v, y + 0.8));
          ctx.ellipse(X(v, x - 0.6), Y(v, y + 0.8), 2.2 * v.s, 1.4 * v.s, 0.5, 0, TAU);
        }
        ctx.fillStyle = "#2f6b1f";
        ctx.fill();
      }
    }
  }
  if (200 * v.s < 1) return;
  const G = 700;
  for (let i = Math.floor((v.cx - v.w - 150) / G); i <= Math.ceil((v.cx + v.w + 150) / G); i++)
    for (let j = Math.floor((v.cy - v.w - 150) / G); j <= Math.ceil((v.cy + v.w + 150) / G); j++) {
      if (i === 0 && j === 0) continue;
      if (hash2(i, j, 11) > 0.35) continue;
      const x = (i + 0.2 + hash2(i, j, 12) * 0.6) * G - G / 2;
      const y = (j + 0.2 + hash2(i, j, 13) * 0.6) * G - G / 2;
      if (x * x + y * y > (R - 150) * (R - 150) || Math.hypot(x, y) < 380) continue;
      paramecio(ctx, v, x, y, hash2(i, j, 14) * TAU);
    }
  paramecio(ctx, v, 0, 0, 0);
}

/* ── Epidermis de cebolla ───────────────────────────────────────────── */
function cebolla(ctx: Ctx, v: V2) {
  const AX = 3000;
  const AY = 2000;
  ctx.fillStyle = "#e6cb86";
  ctx.fillRect(X(v, -AX), Y(v, -AY), 2 * AX * v.s, 2 * AY * v.s);
  const H = 50;
  const L = 250;
  if (H * v.s < 2) return;
  const j0 = Math.max(-Math.round(AY / H), Math.floor((v.cy - v.w) / H) - 1);
  const j1 = Math.min(Math.round(AY / H) - 1, Math.ceil((v.cy + v.w) / H) + 1);
  const tonos = ["#f2de9e", "#ecd28a", "#f5e5b0"];
  const celdas: { x: number; y: number; i: number; j: number }[] = [];
  for (let j = j0; j <= j1; j++) {
    const off = j === 0 ? -L / 2 : -hash2(0, j, 3) * L;
    const i0 = Math.floor((v.cx - v.w - off) / L) - 1;
    const i1 = Math.ceil((v.cx + v.w - off) / L) + 1;
    for (let i = i0; i <= i1; i++) {
      const x = off + i * L;
      if (x < -AX || x + L > AX) continue;
      celdas.push({ x, y: j * H - H / 2, i, j });
    }
  }
  if (celdas.length > 40000) return;
  tonos.forEach((t, k) => {
    ctx.beginPath();
    for (const c of celdas) if (Math.floor(hash2(c.i, c.j, 4) * 3) === k) ctx.rect(X(v, c.x), Y(v, c.y), L * v.s, H * v.s);
    ctx.fillStyle = t;
    ctx.fill();
  });
  ctx.beginPath();
  for (const c of celdas) ctx.rect(X(v, c.x), Y(v, c.y), L * v.s, H * v.s);
  ctx.strokeStyle = "#946326";
  grosor(ctx, 2, v.s);
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (15 * v.s < 1.2) return;
  const nucleos = celdas.map((c) => {
    const centro = c.i === 0 && c.j === 0;
    return { x: c.x + L / 2 + (centro ? 60 : (hash2(c.i, c.j, 5) - 0.5) * 160), y: c.y + H / 2 + (centro ? 0 : (hash2(c.i, c.j, 6) - 0.5) * 16) };
  });
  ctx.beginPath();
  for (const n of nucleos) {
    ctx.moveTo(X(v, n.x + 7.5), Y(v, n.y));
    ctx.ellipse(X(v, n.x), Y(v, n.y), 7.5 * v.s, 5.5 * v.s, 0, 0, TAU);
  }
  ctx.fillStyle = "#b07632";
  ctx.fill();
  ctx.strokeStyle = "#734612";
  grosor(ctx, 0.6, v.s);
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (3 * v.s < 1.5) return;
  ctx.beginPath();
  for (const n of nucleos)
    for (const d of [-2.6, 2.4]) {
      ctx.moveTo(X(v, n.x + d + 1.5), Y(v, n.y - 0.6));
      ctx.arc(X(v, n.x + d), Y(v, n.y - 0.6), 1.5 * v.s, 0, TAU);
    }
  ctx.fillStyle = "#5a360c";
  ctx.fill();
}

/* ── Células de mejilla ─────────────────────────────────────────────── */
function mejilla(ctx: Ctx, v: V2) {
  const R = 2000;
  ctx.beginPath();
  ctx.arc(X(v, 0), Y(v, 0), R * v.s, 0, TAU);
  ctx.fillStyle = "rgba(120,170,220,0.22)";
  ctx.fill();
  if (60 * v.s < 2) return;
  const G = 75;
  const cel: { x: number; y: number; n: number; r: number[]; a0: number; k: number[] }[] = [];
  const i0 = Math.floor((v.cx - v.w) / G) - 1;
  const i1 = Math.ceil((v.cx + v.w) / G) + 1;
  const j0 = Math.floor((v.cy - v.w) / G) - 1;
  const j1 = Math.ceil((v.cy + v.w) / G) + 1;
  if ((i1 - i0) * (j1 - j0) > 30000) return;
  for (let i = i0; i <= i1; i++)
    for (let j = j0; j <= j1; j++) {
      const x = i * G + (hash2(i, j, 21) - 0.5) * 40;
      const y = j * G + (hash2(i, j, 22) - 0.5) * 40;
      if (x * x + y * y > R * R || hash2(i, j, 23) > 0.45 || Math.hypot(x, y) < 88) continue;
      const n = 7 + Math.floor(hash2(i, j, 24) * 3);
      cel.push({ x, y, n, a0: hash2(i, j, 25) * TAU, r: Array.from({ length: n }, (_, q) => (26 + hash2(i, j, 26) * 7) * (0.85 + 0.25 * hash2(i + q, j, 27))), k: [i, j] });
    }
  cel.push({ x: 0, y: 0, n: 8, a0: 0, r: [30, 28.5, 29, 28, 30, 28.8, 29.5, 28.2], k: [0, 0] });
  ctx.beginPath();
  for (const c of cel) {
    for (let q = 0; q < c.n; q++) {
      const a = c.a0 + (q / c.n) * TAU;
      const px = c.x + Math.cos(a) * c.r[q]!;
      const py = c.y + Math.sin(a) * c.r[q]!;
      if (q === 0) ctx.moveTo(X(v, px), Y(v, py));
      else ctx.lineTo(X(v, px), Y(v, py));
    }
    ctx.closePath();
  }
  ctx.fillStyle = "rgba(140,184,228,0.55)";
  ctx.fill();
  ctx.strokeStyle = "#4f7fb8";
  grosor(ctx, 0.9, v.s);
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (v.s >= 1) {
    ctx.beginPath();
    for (const c of cel) {
      const a = c.a0 + 1.1;
      ctx.moveTo(X(v, c.x + Math.cos(a) * 18), Y(v, c.y + Math.sin(a) * 18));
      ctx.quadraticCurveTo(X(v, c.x + 6), Y(v, c.y - 12), X(v, c.x + Math.cos(a + 1.6) * 20), Y(v, c.y + Math.sin(a + 1.6) * 20));
    }
    ctx.strokeStyle = "rgba(79,127,184,0.45)";
    grosor(ctx, 0.6, v.s);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (7 * v.s >= 1) {
    ctx.beginPath();
    for (const c of cel) {
      const centro = c.x === 0 && c.y === 0;
      const nx = c.x + (centro ? -8 : (hash2(c.k[0]!, c.k[1]!, 28) - 0.5) * 16);
      const ny = c.y + (centro ? 4 : (hash2(c.k[0]!, c.k[1]!, 29) - 0.5) * 16);
      ctx.moveTo(X(v, nx + 3.5), Y(v, ny));
      ctx.arc(X(v, nx), Y(v, ny), 3.5 * v.s, 0, TAU);
    }
    ctx.fillStyle = "#23409a";
    ctx.fill();
  }
  if (v.s >= 1.2) {
    ctx.beginPath();
    for (const c of cel) {
      if (hash2(c.k[0]!, c.k[1]!, 30) > 0.5) continue;
      const bx = c.x + (hash2(c.k[0]!, c.k[1]!, 31) - 0.5) * 36;
      const by = c.y + (hash2(c.k[0]!, c.k[1]!, 32) - 0.5) * 36;
      for (let q = 0; q < 10; q++) {
        const qx = bx + (hash2(q, c.k[0]!, 33) - 0.5) * 7;
        const qy = by + (hash2(q, c.k[1]!, 34) - 0.5) * 7;
        ctx.moveTo(X(v, qx + 0.5), Y(v, qy));
        ctx.arc(X(v, qx), Y(v, qy), 0.5 * v.s, 0, TAU);
      }
    }
    ctx.fillStyle = "#1c2b66";
    ctx.fill();
  }
}

/* ── Bacterias con bacteriófagos ────────────────────────────────────── */
function fago(ctx: Ctx, v: V2, x: number, y: number, ang: number) {
  ctx.save();
  ctx.translate(X(v, x), Y(v, y));
  ctx.rotate(ang);
  ctx.scale(v.s, v.s);
  const lw = Math.max(0.006, 0.5 / v.s);
  // Fibras de la cola
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-0.05, 0.02);
  ctx.moveTo(0, 0);
  ctx.lineTo(0.05, 0.02);
  ctx.strokeStyle = "#3b1424";
  ctx.lineWidth = lw;
  ctx.stroke();
  // Cola
  ctx.fillStyle = "#4b1a2e";
  ctx.fillRect(-0.011, -0.11, 0.022, 0.11);
  // Cabeza (icosaedro alargado, 85 × 110 nm)
  ctx.beginPath();
  const cy = -0.11 - 0.055;
  ctx.moveTo(0, cy - 0.055);
  ctx.lineTo(0.0425, cy - 0.03);
  ctx.lineTo(0.0425, cy + 0.03);
  ctx.lineTo(0, cy + 0.055);
  ctx.lineTo(-0.0425, cy + 0.03);
  ctx.lineTo(-0.0425, cy - 0.03);
  ctx.closePath();
  ctx.fillStyle = "#6d2744";
  ctx.fill();
  ctx.restore();
}

function bacterias(ctx: Ctx, v: V2) {
  const R = 600;
  ctx.beginPath();
  ctx.arc(X(v, 0), Y(v, 0), R * v.s, 0, TAU);
  ctx.fillStyle = "rgba(210,90,130,0.12)";
  ctx.fill();
  if (2 * v.s < 1.2) return;
  const G = 5;
  const rods: { x: number; y: number; a: number; i: number; j: number }[] = [{ x: 0, y: 0, a: 0, i: 0, j: 0 }];
  const i0 = Math.floor((v.cx - v.w) / G) - 1;
  const i1 = Math.ceil((v.cx + v.w) / G) + 1;
  const j0 = Math.floor((v.cy - v.w) / G) - 1;
  const j1 = Math.ceil((v.cy + v.w) / G) + 1;
  if ((i1 - i0) * (j1 - j0) > 60000) return;
  for (let i = i0; i <= i1; i++)
    for (let j = j0; j <= j1; j++) {
      if (hash2(i, j, 41) > 0.42) continue;
      const x = (i + hash2(i, j, 42)) * G;
      const y = (j + hash2(i, j, 43)) * G;
      if (x * x + y * y > R * R || Math.hypot(x, y) < 4.5) continue;
      rods.push({ x, y, a: hash2(i, j, 44) * Math.PI, i, j });
    }
  if (v.s < 30) {
    ctx.beginPath();
    for (const b of rods) {
      ctx.moveTo(X(v, b.x - Math.cos(b.a) * 0.6), Y(v, b.y - Math.sin(b.a) * 0.6));
      ctx.lineTo(X(v, b.x + Math.cos(b.a) * 0.6), Y(v, b.y + Math.sin(b.a) * 0.6));
    }
    ctx.strokeStyle = "#cf5279";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(0.8, 0.8 * v.s);
    ctx.stroke();
    ctx.lineCap = "butt";
  } else {
    for (const b of rods) {
      if (Math.abs(b.x - v.cx) > v.w + 2 || Math.abs(b.y - v.cy) > v.w + 2) continue;
      ctx.save();
      ctx.translate(X(v, b.x), Y(v, b.y));
      ctx.rotate(b.a);
      ctx.scale(v.s, v.s);
      const capsula = (inset: number) => {
        const r = 0.4 - inset;
        ctx.beginPath();
        ctx.moveTo(-0.6, -r);
        ctx.lineTo(0.6, -r);
        ctx.arc(0.6, 0, r, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(-0.6, r);
        ctx.arc(-0.6, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
        ctx.closePath();
      };
      capsula(0);
      ctx.fillStyle = "#c2567a";
      ctx.fill();
      ctx.strokeStyle = "#4a1729";
      ctx.lineWidth = Math.max(0.008, 0.6 / v.s);
      ctx.stroke();
      capsula(0.03);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0.05, 0.02, 0.5, 0.17, 0.08, 0, TAU);
      ctx.fillStyle = "rgba(255,225,235,0.35)";
      ctx.fill();
      if (v.s >= 60) {
        ctx.beginPath();
        const rnd = mulberry32(Math.imul(b.i, 73856093) ^ Math.imul(b.j, 19349663) ^ 0x5bd1e995);
        for (let q = 0; q < 380; q++) {
          const rx = (rnd() - 0.5) * 1.8;
          const ry = (rnd() - 0.5) * 0.64;
          if (Math.abs(rx) > 0.6 && (Math.abs(rx) - 0.6) ** 2 + ry * ry > 0.33 * 0.33) continue;
          if (Math.abs(ry) < 0.12 && Math.abs(rx) < 0.4) continue;
          ctx.moveTo(rx + 0.01, ry);
          ctx.arc(rx, ry, 0.01, 0, TAU);
        }
        ctx.fillStyle = "#3d0f22";
        ctx.fill();
      }
      ctx.restore();
    }
  }
  if (v.s < 6) return;
  for (const b of rods) {
    if (Math.abs(b.x - v.cx) > v.w + 2 || Math.abs(b.y - v.cy) > v.w + 2) continue;
    if (!(b.i === 0 && b.j === 0) && hash2(b.i, b.j, 47) > 0.6) continue;
    const k = 4 + Math.floor(hash2(b.i, b.j, 48) * 4);
    for (let q = 0; q < k; q++) {
      const lado = q % 2 === 0 ? -1 : 1;
      const px = (hash2(q, b.i + 3, 49 + b.j) - 0.5) * 1.1;
      const c = Math.cos(b.a);
      const s = Math.sin(b.a);
      const lx = px;
      const ly = lado * 0.4;
      const wx = b.x + lx * c - ly * s;
      const wy = b.y + lx * s + ly * c;
      fago(ctx, v, wx, wy, b.a + (lado < 0 ? 0 : Math.PI));
    }
  }
  const GF = 2.5;
  for (let i = Math.floor((v.cx - v.w) / GF) - 1; i <= Math.ceil((v.cx + v.w) / GF) + 1; i++)
    for (let j = Math.floor((v.cy - v.w) / GF) - 1; j <= Math.ceil((v.cy + v.w) / GF) + 1; j++) {
      if (hash2(i, j, 51) > 0.18) continue;
      const x = (i + hash2(i, j, 52)) * GF;
      const y = (j + hash2(i, j, 53)) * GF;
      if (Math.hypot(x, y) < 1.4 || x * x + y * y > R * R) continue;
      fago(ctx, v, x, y, hash2(i, j, 54) * TAU);
    }
}

function barraBonita(campo: number): number {
  const obj = campo * 0.22;
  const p = Math.pow(10, Math.floor(Math.log10(obj)));
  const m = obj / p;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
}

interface CampoOpts {
  muestra: MuestraId;
  aumento: number;
  resUm: number;
  gris: boolean;
  centro: [number, number];
  regla: boolean;
  barraHooke: boolean;
  /** Semiejes (µm) del marco que señala el objeto a medir. */
  marco: [number, number] | null;
}

function dibujarCampo(ctx: Ctx, off: HTMLCanvasElement, o: CampoOpts) {
  const campo = campoUm(o.aumento);
  const v: V2 = { s: N / campo, cx: o.centro[0], cy: o.centro[1], w: campo / 2 };
  const oc = off.getContext("2d");
  if (!oc) return;
  oc.globalAlpha = 1;
  fondo(oc, v, o.gris);
  if (o.muestra === "corcho") corcho(oc, v);
  else if (o.muestra === "estanque") estanque(oc, v);
  else if (o.muestra === "cebolla") cebolla(oc, v);
  else if (o.muestra === "mejilla") mejilla(oc, v);
  else bacterias(oc, v);

  const efectiva = resolucionEfectiva({ aumento: o.aumento, resUm: o.resUm });
  const sigma = Math.min(60, 0.6 * efectiva * v.s);
  ctx.globalAlpha = 1;
  ctx.fillStyle = o.gris ? "#bfc3c6" : "#dde6ea";
  ctx.fillRect(0, 0, N, N);
  const filtro = `${o.gris ? "grayscale(1) contrast(1.25) " : ""}${sigma > 0.35 ? `blur(${sigma.toFixed(2)}px)` : ""}`.trim();
  if ("filter" in ctx) ctx.filter = filtro || "none";
  ctx.drawImage(off, 0, 0);
  if ("filter" in ctx) ctx.filter = "none";

  if (o.barraHooke) {
    const L = DIECIOCHOAVO_PULGADA_UM * v.s;
    ctx.fillStyle = "rgba(250,204,21,0.30)";
    ctx.fillRect(N / 2 - L / 2, N / 2 - 13, L, 26);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.strokeRect(N / 2 - L / 2, N / 2 - 13, L, 26);
  }
  if (o.marco) {
    ctx.save();
    ctx.setLineDash([10, 7]);
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(N / 2, N / 2, o.marco[0] * v.s * 1.18 + 8, o.marco[1] * v.s * 1.18 + 8, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  if (o.regla) {
    // Regla de la imagen aumentada: 180 mm de campo aparente → N px.
    const pxMm = N / 180;
    const y0 = N * 0.8;
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillRect(N / 2 - 70 * pxMm, y0 - 4, 140 * pxMm, 46);
    ctx.strokeStyle = "#0f172a";
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 19px system-ui, sans-serif";
    ctx.textAlign = "center";
    for (let mm = -70; mm <= 70; mm++) {
      const x = N / 2 + mm * pxMm;
      const h = mm % 10 === 0 ? 18 : mm % 5 === 0 ? 12 : 6;
      ctx.lineWidth = mm % 10 === 0 ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y0 - 4);
      ctx.lineTo(x, y0 - 4 + h);
      ctx.stroke();
      if (mm % 20 === 0) ctx.fillText(`${mm + 70}`, x, y0 + 36);
    }
    ctx.textAlign = "left";
    ctx.fillText("mm", N / 2 + 71 * pxMm - 6, y0 + 12);
  }
  // Viñeta del ocular
  const g = ctx.createRadialGradient(N / 2, N / 2, N * 0.36, N / 2, N / 2, N * 0.5);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, N, N);
}

const R_CAMPO = 1.78;

function Campo({ pos, opts, modoColor, calibradorMm, titulo }: { pos: Pt; opts: CampoOpts; modoColor: string; calibradorMm: number | null; titulo: string }) {
  const lienzo = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = N;
    c.height = N;
    return c;
  }, []);
  const fuera = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = N;
    c.height = N;
    return c;
  }, []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(lienzo);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [lienzo]);
  const clave = `${opts.muestra}|${opts.aumento}|${opts.resUm}|${opts.gris}|${opts.centro.join(",")}|${opts.regla}|${opts.barraHooke}|${opts.marco?.join(",") ?? ""}`;
  const ultima = useRef("");
  const material = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (ultima.current === clave) return;
    ultima.current = clave;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return;
    dibujarCampo(ctx, fuera, opts);
    const mapa = material.current?.map;
    if (mapa) mapa.needsUpdate = true;
  });

  const campo = campoUm(opts.aumento);
  const barra = barraBonita(campo);
  const largoBarra = (barra / campo) * 2 * R_CAMPO;

  return (
    <group position={pos}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.06]}>
        <cylinderGeometry args={[R_CAMPO + 0.22, R_CAMPO + 0.22, 0.1, 64]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh>
        <circleGeometry args={[R_CAMPO, 96]} />
        <meshBasicMaterial ref={material} map={tex} toneMapped={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[R_CAMPO + 0.08, 0.1, 16, 96]} />
        <meshStandardMaterial color="#b08d57" metalness={0.85} roughness={0.28} />
      </mesh>
      <Etiqueta pos={[0, R_CAMPO + 0.48, 0]} df={10} col={`${modoColor}aa`} fs={12.5}>
        <i className="fa-solid fa-eye" style={{ color: modoColor }} />
        {titulo}
      </Etiqueta>
      {/* Barra de escala */}
      <group position={[0, -R_CAMPO - 0.42, 0]}>
        <mesh>
          <boxGeometry args={[largoBarra, 0.06, 0.02]} />
          <meshBasicMaterial color="#f8fafc" toneMapped={false} />
        </mesh>
        {[-1, 1].map((l) => (
          <mesh key={l} position={[(l * largoBarra) / 2, 0, 0]}>
            <boxGeometry args={[0.03, 0.2, 0.02]} />
            <meshBasicMaterial color="#f8fafc" toneMapped={false} />
          </mesh>
        ))}
        <Etiqueta pos={[0, -0.32, 0]} df={10} fs={11}>
          {longitud(barra)} · campo de {longitud(campo)}
        </Etiqueta>
      </group>
      {calibradorMm !== null && <Calibrador mm={calibradorMm} />}
    </group>
  );
}

function Calibrador({ mm }: { mm: number }) {
  const izq = useRef<THREE.Mesh>(null);
  const der = useRef<THREE.Mesh>(null);
  const linea = useRef<THREE.Mesh>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const actual = useRef(mm);
  useFrame((_, dt) => {
    actual.current += (mm - actual.current) * suave(dt, 0.2);
    const medio = (actual.current / 180) * R_CAMPO;
    if (izq.current) izq.current.position.x = -medio;
    if (der.current) der.current.position.x = medio;
    if (linea.current) linea.current.scale.x = Math.max(0.001, medio * 2);
    if (lectura.current) lectura.current.textContent = `${num(actual.current, 1)} mm en la imagen`;
  });
  return (
    <group position={[0, 0, 0.02]}>
      <mesh ref={izq}>
        <boxGeometry args={[0.018, 0.4, 0.01]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </mesh>
      <mesh ref={der}>
        <boxGeometry args={[0.018, 0.4, 0.01]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </mesh>
      <mesh ref={linea} position={[0, 0.19, 0]}>
        <boxGeometry args={[1, 0.012, 0.01]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </mesh>
      <Etiqueta pos={[0, R_CAMPO - 0.32, 0.02]} df={8} col="#ef4444aa" fs={11}>
        <i className="fa-solid fa-ruler-horizontal" style={{ color: "#fca5a5" }} />
        <span ref={lectura}>{num(mm, 1)} mm en la imagen</span>
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Instrumentos
 * ════════════════════════════════════════════════════════════════════════ */

const LATON = "#b8914a";
const ORO = "#d4a843";

function Mesa() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[9.6, 0.16, 4.2]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.02, 4.0]} />
        <meshStandardMaterial color="#1b2a3c" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Portaobjetos({ pos, rot = 0 }: { pos: Pt; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.75, 0.02, 0.25]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.1, 0.004, 0.1]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
    </group>
  );
}

function OjoModelo() {
  const ojo = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ojo.current) ojo.current.rotation.z = -0.35 + Math.sin(clock.elapsedTime * 0.7) * 0.04;
  });
  return (
    <group>
      <group ref={ojo} position={[-0.5, 1.9, 0]} rotation={[0, -0.75, -0.35]}>
        <mesh castShadow>
          <sphereGeometry args={[0.62, 40, 30]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0.56, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.26, 0.26, 0.08, 32]} />
          <meshStandardMaterial color="#7c4a1e" roughness={0.4} />
        </mesh>
        <mesh position={[0.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 0.04, 24]} />
          <meshStandardMaterial color="#020617" roughness={0.2} />
        </mesh>
        <mesh position={[0.45, 0, 0]}>
          <sphereGeometry args={[0.3, 24, 18]} />
          <meshPhysicalMaterial {...VIDRIO_FINO} opacity={0.25} roughness={0.05} />
        </mesh>
      </group>
      {/* línea de visión */}
      <mesh position={[0.25, 1.1, 0.1]} rotation={[0, 0, 0.95]}>
        <cylinderGeometry args={[0.012, 0.012, 1.6, 6]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.5} />
      </mesh>
      <mesh position={[1.0, 0.25, 0.2]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <Portaobjetos pos={[1.0, 0.51, 0.2]} rot={0.3} />
      <Etiqueta pos={[-0.4, 2.95, 0]} df={10} fs={10.5}>
        El ojo distingue ≈ 0.1 mm a 25 cm
      </Etiqueta>
    </group>
  );
}

function MicroHooke() {
  const llama = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (llama.current) llama.current.scale.y = 1 + 0.15 * Math.sin(clock.elapsedTime * 11);
  });
  const segmentos = [0, 1, 2, 3];
  return (
    <group rotation={[0, 0.45, 0]}>
      {/* base de madera */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.16, 40]} />
        <meshStandardMaterial color="#5b3a1e" roughness={0.6} />
      </mesh>
      <mesh position={[-0.55, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.5, 14]} />
        <meshStandardMaterial color={LATON} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-0.55, 2.35, 0]}>
        <sphereGeometry args={[0.1, 18, 14]} />
        <meshStandardMaterial color={ORO} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[-0.33, 2.3, 0]} rotation={[0, 0, Math.PI / 2 + 0.25]}>
        <cylinderGeometry args={[0.035, 0.035, 0.45, 10]} />
        <meshStandardMaterial color={LATON} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* tubo forrado de cuero, inclinado */}
      <group position={[0, 1.45, 0]} rotation={[0, 0, -0.22]}>
        {segmentos.map((k) => {
          const r = 0.25 - k * 0.035;
          const y = -0.55 + k * 0.5;
          return (
            <group key={k} position={[0, y, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[r, r, 0.5, 28]} />
                <meshStandardMaterial color={k % 2 === 0 ? "#6b2a1f" : "#5a2418"} roughness={0.55} />
              </mesh>
              <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[r + 0.005, 0.022, 8, 28]} />
                <meshStandardMaterial color={ORO} metalness={0.9} roughness={0.25} />
              </mesh>
            </group>
          );
        })}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.07, 0.11, 0.22, 20]} />
          <meshStandardMaterial color={ORO} metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[0.12, 0.05, 0.32, 20]} />
          <meshStandardMaterial color={LATON} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
      {/* soporte de la muestra */}
      <mesh position={[0.28, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </mesh>
      <mesh position={[0.28, 0.46, 0]}>
        <boxGeometry args={[0.14, 0.02, 0.1]} />
        <meshStandardMaterial color="#c39a5e" />
      </mesh>
      {/* lámpara de aceite y globo de agua */}
      <group position={[1.55, 0, 0.1]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.22, 0.4, 20]} />
          <meshStandardMaterial color={LATON} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.0, 8]} />
          <meshStandardMaterial color={LATON} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh ref={llama} position={[0, 0.52, 0]}>
          <coneGeometry args={[0.06, 0.2, 14]} />
          <meshBasicMaterial color="#fbbf24" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.6, 0]} intensity={0.9} distance={3} color="#fbbf24" />
      </group>
      <group position={[0.85, 0.72, 0.05]}>
        <mesh>
          <sphereGeometry args={[0.26, 28, 20]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.35} roughness={0.05} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.36, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 0.36, 8]} />
          <meshStandardMaterial color={LATON} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      <mesh position={[0.56, 0.6, 0.02]} rotation={[0, 0, 1.2]}>
        <coneGeometry args={[0.08, 0.6, 16, 1, true]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Etiqueta pos={[0.9, 1.35, 0.1]} df={10} fs={10}>
        Lámpara y globo de agua
      </Etiqueta>
    </group>
  );
}

function MicroLeeuwenhoek() {
  const grupo = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (grupo.current) grupo.current.rotation.y = 0.35 + Math.sin(clock.elapsedTime * 0.4) * 0.3;
  });
  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.12, 32]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 10]} />
        <meshStandardMaterial color="#475569" metalness={0.6} />
      </mesh>
      <group ref={grupo} position={[0, 1.65, 0]} scale={1.45}>
        {/* placa de latón */}
        <mesh castShadow>
          <boxGeometry args={[0.62, 1.3, 0.03]} />
          <meshStandardMaterial color="#d6ad5c" metalness={0.55} roughness={0.42} />
        </mesh>
        {[0.325, -0.325].map((y) => (
          <mesh key={y} position={[0, 0.65 * Math.sign(y), 0]} rotation={[y > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.31, 0.31, 0.03, 30, 1, false, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#d6ad5c" metalness={0.55} roughness={0.42} />
          </mesh>
        ))}
        {/* lente */}
        <mesh position={[0, 0.5, 0.022]}>
          <sphereGeometry args={[0.045, 20, 16]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.5} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.5, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.012, 8, 24]} />
          <meshStandardMaterial color={ORO} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* tornillo largo y porta-muestra */}
        <mesh position={[0, -0.2, -0.14]}>
          <cylinderGeometry args={[0.028, 0.028, 1.0, 12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.72, -0.14]}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
          <meshStandardMaterial color={LATON} metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.3, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.1]} />
          <meshStandardMaterial color={LATON} metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.42, -0.07]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.53, -0.07]}>
          <sphereGeometry args={[0.02, 12, 10]} />
          <meshStandardMaterial color="#67e8f9" transparent opacity={0.75} />
        </mesh>
        <mesh position={[0.2, 0.1, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.18, 10]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.85} />
        </mesh>
      </group>
      <Etiqueta pos={[0, 2.85, 0.3]} df={10} fs={10.5}>
        <i className="fa-solid fa-circle-dot" style={{ color: "#7dd3fc" }} />
        Una sola lente de ≈ 1 mm
      </Etiqueta>
    </group>
  );
}

/** Microscopio compuesto de pie (siglo XIX de latón o moderno). */
function MicroCompuesto({ moderno, objetivo, ocular }: { moderno: boolean; objetivo: ObjetivoX; ocular: OcularX }) {
  const rev = useRef<THREE.Group>(null);
  const idx = Math.max(
    0,
    OBJETIVOS_REV.findIndex((o) => o.x === objetivo),
  );
  const giro = useRef(-(idx * Math.PI) / 2);
  useFrame((_, dt) => {
    const destino = -(idx * Math.PI) / 2;
    giro.current += (destino - giro.current) * suave(dt, 0.08);
    if (rev.current) rev.current.rotation.y = giro.current;
  });
  const cuerpo = moderno ? "#e7e5e0" : LATON;
  const oscuro = moderno ? "#22262e" : "#3a2a1c";
  const met = moderno ? 0.1 : 0.85;
  const rug = moderno ? 0.45 : 0.28;
  return (
    <group rotation={[0, -0.75, 0]}>
      {/* pie */}
      {moderno ? (
        <mesh position={[0, 0.12, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.24, 1.55]} />
          <meshStandardMaterial color={cuerpo} roughness={rug} />
        </mesh>
      ) : (
        <mesh position={[0, 0.05, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.55, 0.08, 12, 32, Math.PI * 1.35]} />
          <meshStandardMaterial color={cuerpo} metalness={met} roughness={rug} />
        </mesh>
      )}
      {moderno && (
        <mesh position={[0, 0.25, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.1, 24]} />
          <meshBasicMaterial color="#fef9c3" toneMapped={false} />
        </mesh>
      )}
      {/* brazo */}
      <mesh position={[0, 1.15, -0.62]} rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.24, 1.9, 0.3]} />
        <meshStandardMaterial color={moderno ? cuerpo : oscuro} metalness={moderno ? 0.1 : 0.4} roughness={0.4} />
      </mesh>
      {/* platina */}
      <mesh position={[0, 1.0, 0.2]} castShadow>
        <boxGeometry args={[0.95, 0.06, 0.9]} />
        <meshStandardMaterial color="#111827" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.0, -0.25]}>
        <boxGeometry args={[0.3, 0.06, 0.4]} />
        <meshStandardMaterial color={oscuro} roughness={0.5} />
      </mesh>
      <Portaobjetos pos={[0, 1.04, 0.25]} />
      {!moderno && (
        <mesh position={[0, 0.5, 0.25]} rotation={[-0.7, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 28]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.08} />
        </mesh>
      )}
      {moderno && (
        <mesh position={[0, 0.84, 0.25]}>
          <cylinderGeometry args={[0.12, 0.1, 0.22, 20]} />
          <meshStandardMaterial color={oscuro} roughness={0.4} />
        </mesh>
      )}
      {/* tornillos de enfoque */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.2, 0.75, -0.6]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 24]} />
            <meshStandardMaterial color={oscuro} roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0, l * 0.07, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.07, 20]} />
            <meshStandardMaterial color={moderno ? "#94a3b8" : ORO} roughness={0.35} metalness={0.5} />
          </mesh>
        </group>
      ))}
      {/* revólver */}
      <group position={[0, 1.62, 0.25]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.3, 0.12, 32]} />
          <meshStandardMaterial color={moderno ? "#cbd5e1" : LATON} metalness={0.7} roughness={0.25} />
        </mesh>
        <group ref={rev} position={[0, 0, -0.18]}>
          {OBJETIVOS_REV.map((o, k) => {
            const a = (k * Math.PI) / 2;
            const largo = 0.2 + k * 0.05;
            return (
              <group key={o.x} position={[Math.sin(a) * 0.18, -0.06, Math.cos(a) * 0.18]} rotation={[Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22]}>
                <mesh position={[0, -largo / 2, 0]} castShadow>
                  <cylinderGeometry args={[0.055, 0.075, largo, 18]} />
                  <meshStandardMaterial color={moderno ? "#d1d5db" : LATON} metalness={0.85} roughness={0.2} />
                </mesh>
                <mesh position={[0, -largo * 0.55, 0]}>
                  <cylinderGeometry args={[0.078, 0.078, 0.025, 18]} />
                  <meshStandardMaterial color={moderno ? o.color : ORO} emissive={moderno ? o.color : "#000"} emissiveIntensity={moderno ? 0.25 : 0} />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>
      {/* tubo y cabezal */}
      {moderno ? (
        <group position={[0, 2.02, 0.05]}>
          <mesh castShadow>
            <boxGeometry args={[0.46, 0.6, 0.62]} />
            <meshStandardMaterial color={cuerpo} roughness={rug} />
          </mesh>
          {[-1, 1].map((l) => (
            <group key={l} position={[l * 0.11, 0.42, 0.28]} rotation={[-0.7, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.06, 0.06, 0.34, 18]} />
                <meshStandardMaterial color="#1f2937" roughness={0.35} />
              </mesh>
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[ocular === 15 ? 0.075 : 0.068, 0.068, ocular === 15 ? 0.12 : 0.08, 18]} />
                <meshStandardMaterial color={ocular === 15 ? "#f59e0b" : "#374151"} roughness={0.35} emissive={ocular === 15 ? "#f59e0b" : "#000"} emissiveIntensity={0.25} />
              </mesh>
            </group>
          ))}
        </group>
      ) : (
        <group position={[0, 2.3, 0.05]} rotation={[-0.08, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.13, 0.13, 1.2, 28]} />
            <meshStandardMaterial color={LATON} metalness={0.9} roughness={0.22} />
          </mesh>
          {[-0.5, 0, 0.45].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.135, 0.02, 8, 28]} />
              <meshStandardMaterial color={ORO} metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.09, 0.1, 0.2, 20]} />
            <meshStandardMaterial color="#1f2937" roughness={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function MicroElectronico() {
  const pantalla = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (pantalla.current) pantalla.current.color.setRGB(0.35 + 0.08 * Math.sin(clock.elapsedTime * 2), 0.95, 0.45);
  });
  const anillos = [0.9, 1.35, 1.8, 2.25, 2.7, 3.15];
  return (
    <group scale={0.82} position={[0, 0, -0.2]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.9, 1.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
      {Array.from({ length: 8 }, (_, k) => (
        <mesh key={k} position={[-1.05 + k * 0.1, 0.72, 0.56]}>
          <boxGeometry args={[0.05, 0.05, 0.01]} />
          <meshBasicMaterial color={k % 3 === 0 ? "#22c55e" : k % 3 === 1 ? "#f59e0b" : "#38bdf8"} toneMapped={false} />
        </mesh>
      ))}
      {/* cámara de observación */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.5, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.15, 0.58]} rotation={[0.1, 0, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshBasicMaterial ref={pantalla} color="#86efac" toneMapped={false} />
      </mesh>
      {/* columna */}
      {anillos.map((y, k) => (
        <mesh key={y} position={[0, y + 0.45, 0]} castShadow>
          <cylinderGeometry args={[k % 2 === 0 ? 0.36 : 0.3, k % 2 === 0 ? 0.36 : 0.3, 0.45, 28]} />
          <meshStandardMaterial color={k % 2 === 0 ? "#f1f5f9" : "#cbd5e1"} metalness={0.3} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 3.95, 0]}>
        <sphereGeometry args={[0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.45, 3.7, 0]} rotation={[0, 0, -0.9]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 10]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
      <Etiqueta pos={[0.95, 3.95, 0]} df={10} fs={10}>
        <i className="fa-solid fa-bolt" style={{ color: "#fde047" }} />
        Cañón de electrones
      </Etiqueta>
      <Etiqueta pos={[-1.2, 2.2, 0.2]} df={10} fs={10}>
        Lentes magnéticas
      </Etiqueta>
      <Etiqueta pos={[0, 0.2, 0.9]} df={10} fs={10}>
        Pantalla fluorescente
      </Etiqueta>
    </group>
  );
}

function Instrumento({ id, objetivo, ocular }: { id: InstrumentoId; objetivo: ObjetivoX; ocular: OcularX }) {
  if (id === "ojo") return <OjoModelo />;
  if (id === "hooke") return <MicroHooke />;
  if (id === "leeuwenhoek") return <MicroLeeuwenhoek />;
  if (id === "acromatico") return <MicroCompuesto moderno={false} objetivo={40} ocular={10} />;
  if (id === "moderno") return <MicroCompuesto moderno objetivo={objetivo} ocular={ocular} />;
  return <MicroElectronico />;
}

function EscenaInstrumentos({ instrumentoId, ajusteId, muestraId, modoColor }: { instrumentoId: InstrumentoId; ajusteId: string; muestraId: MuestraId; modoColor: string }) {
  const ins = instrumento(instrumentoId);
  const a = ins.ajustes.find((x) => x.id === ajusteId) ?? ins.ajustes[0]!;
  const m = muestraDe(muestraId);
  const obj = (a.objetivo ?? 40) as ObjetivoX;
  const oc = (a.ocular === 15 ? 15 : 10) as OcularX;
  return (
    <group position={[0, -1.3, 0]}>
      <Mesa />
      <group position={[-2.55, 0, 0.2]}>
        <Instrumento id={instrumentoId} objetivo={obj} ocular={oc} />
      </group>
      <Campo
        pos={[2.15, 2.45, 0.3]}
        opts={{ muestra: muestraId, aumento: a.aumento, resUm: a.resUm, gris: ins.enGris, centro: [0, 0], regla: false, barraHooke: false, marco: null }}
        modoColor={modoColor}
        calibradorMm={null}
        titulo={`${m.etq} · ${num(a.aumento)}×`}
      />
    </group>
  );
}

function EscenaMedicion({ objetivo, ocular, misionId, calibradorMm, modoColor }: { objetivo: ObjetivoX; ocular: OcularX; misionId: string; calibradorMm: number; modoColor: string }) {
  const mision = MISIONES.find((x) => x.id === misionId) ?? MISIONES[0]!;
  const rev = OBJETIVOS_REV.find((o) => o.x === objetivo) ?? OBJETIVOS_REV[0]!;
  const aumento = objetivo * ocular;
  const m = muestraDe(mision.muestra);
  return (
    <group position={[0, -1.3, 0]}>
      <Mesa />
      <group position={[-2.5, 0, 0.3]} scale={1.15}>
        <MicroCompuesto moderno objetivo={objetivo} ocular={ocular} />
      </group>
      <Etiqueta pos={[-2.5, 3.55, 0.3]} df={10} col={`${modoColor}aa`} fs={11.5}>
        <i className="fa-solid fa-microscope" style={{ color: modoColor }} />
        Ocular {ocular}× · objetivo {objetivo}× (AN {rev.na})
      </Etiqueta>
      <Campo
        pos={[2.15, 2.45, 0.3]}
        opts={{ muestra: mision.muestra, aumento, resUm: abbeUm(rev.na), gris: false, centro: mision.centro, regla: true, barraHooke: mision.pide === "hooke", marco: mision.marcoUm ?? null }}
        modoColor={modoColor}
        calibradorMm={mision.realUm ? calibradorMm : null}
        titulo={`${m.etq} · ocular ${ocular}× · objetivo ${objetivo}×`}
      />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Teoría celular
 * ════════════════════════════════════════════════════════════════════════ */

const X_PILAR: Record<string, number> = { estructural: -2.2, funcional: 0, origen: 2.2 };
const BASE_Y = 0.65;
const ALTO = 0.72;
const FLOTA: Pt = [4.15, 1.9, 0.9];
const T_X0 = -4.3;
const T_X1 = 4.3;
const T_Z = -1.25;
const T_Y = 4.6;
const anioX = (anio: number) => T_X0 + ((anio - 1650) / 250) * (T_X1 - T_X0);

function Tambor({ id, slot }: { id: string; slot: number }) {
  const h = HITOS.find((x) => x.id === id)!;
  const col = PILAR_DEF[h.pilar].color;
  const ref = useRef<THREE.Group>(null);
  const dest = useMemo(() => new THREE.Vector3(X_PILAR[h.pilar] ?? 0, BASE_Y + slot * ALTO + ALTO / 2, 0), [h.pilar, slot]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.lerp(dest, suave(dt, 0.07));
  });
  return (
    <group ref={ref} position={FLOTA}>
      <mesh castShadow>
        <cylinderGeometry args={[0.36, 0.36, ALTO - 0.03, 24]} />
        <meshStandardMaterial color={col} roughness={0.35} emissive={col} emissiveIntensity={0.18} />
      </mesh>
      {[0.36, -0.36].map((y) => (
        <mesh key={y} position={[0, y * 0.97, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.37, 0.02, 8, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
      ))}
      <Html position={[0, 0, 0.4]} center distanceFactor={10} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "2px 7px", borderRadius: 6, background: "rgba(4,10,22,0.86)", border: `1px solid ${col}`, color: "#fff", fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>
          {h.etqAnio} · {h.quien.split(" ").slice(-1)[0]}
        </div>
      </Html>
    </group>
  );
}

function Flotante({ id, errorNonce }: { id: string; errorNonce: number }) {
  const h = HITOS.find((x) => x.id === id)!;
  const ref = useRef<THREE.Group>(null);
  const nonce = useRef(errorNonce);
  const sacude = useRef(0);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }, dt) => {
    if (nonce.current !== errorNonce) {
      nonce.current = errorNonce;
      sacude.current = 0.6;
    }
    sacude.current = Math.max(0, sacude.current - dt);
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.8;
      ref.current.position.x = FLOTA[0] + Math.sin(clock.elapsedTime * 40) * 0.08 * (sacude.current / 0.6);
      ref.current.position.y = FLOTA[1] + Math.sin(clock.elapsedTime * 1.6) * 0.08;
    }
    if (mat.current) mat.current.emissive.set(sacude.current > 0 ? "#ef4444" : "#a78bfa");
  });
  return (
    <group>
      <group ref={ref} position={FLOTA}>
        <mesh castShadow>
          <cylinderGeometry args={[0.36, 0.36, ALTO - 0.03, 24]} />
          <meshStandardMaterial ref={mat} color="#e2e8f0" roughness={0.35} emissive="#a78bfa" emissiveIntensity={0.35} />
        </mesh>
      </group>
      <Html position={[FLOTA[0], FLOTA[1] + 0.9, FLOTA[2]]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 170, padding: "7px 10px", borderRadius: 10, background: "rgba(4,10,22,0.9)", border: "1px solid #a78bfa", color: "#fff", fontSize: 11, fontWeight: 800, lineHeight: 1.3, textAlign: "center" }}>
          <div style={{ fontSize: 9.5, color: "#c4b5fd", letterSpacing: "0.08em" }}>¿QUÉ POSTULADO SOSTIENE?</div>
          {h.etqAnio} · {h.quien}
        </div>
      </Html>
    </group>
  );
}

function Pin({ x, nivel, color, texto }: { x: number; nivel: number; color: string; texto: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.y += (0 - ref.current.position.y) * suave(dt, 0.1);
  });
  const alto = 0.22 + nivel * 0.27;
  return (
    <group ref={ref} position={[x, 1.6, 0]}>
      <mesh position={[0, alto / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, alto, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.07, 14, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Html position={[0, alto + 0.08, 0]} center distanceFactor={7} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "2px 6px", borderRadius: 6, background: "rgba(4,10,22,0.88)", border: `1px solid ${color}`, color: "#fff", fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>{texto}</div>
      </Html>
    </group>
  );
}

function EscenaTeoria({ ordenados, colocados, seleccionado, errorNonce, modoColor }: { ordenados: string[]; colocados: string[]; seleccionado: string | null; errorNonce: number; modoColor: string }) {
  const completo = colocados.length === HITOS.length;
  const techo = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!techo.current) return;
    const destino = completo ? 0 : 3.5;
    techo.current.position.y += (destino - techo.current.position.y) * suave(dt, 0.05);
    techo.current.visible = completo || techo.current.position.y < 3.4;
  });

  // Marcas de la línea del tiempo: primero el orden del A2 c, luego las evidencias colocadas.
  const marcas: { id: string; anio: number; color: string; texto: string }[] = [];
  ordenados.forEach((id) => {
    const h = HITOS.find((x) => x.id === id)!;
    marcas.push({ id, anio: h.anio, color: "#e2e8f0", texto: `${h.etqAnio} ${h.quien.split(" ").slice(-1)[0]}` });
  });
  colocados.forEach((id) => {
    if (ordenados.includes(id)) {
      const k = marcas.findIndex((mm) => mm.id === id);
      if (k >= 0) marcas[k]!.color = PILAR_DEF[HITOS.find((x) => x.id === id)!.pilar].color;
      return;
    }
    const h = HITOS.find((x) => x.id === id)!;
    marcas.push({ id, anio: h.anio, color: PILAR_DEF[h.pilar].color, texto: `${h.etqAnio} ${h.quien.split(" ").slice(-1)[0]}` });
  });
  const ordenX = [...marcas].sort((a, b) => a.anio - b.anio);
  const niveles = new Map<string, number>();
  const ultimoX: number[] = [];
  ordenX.forEach((mm) => {
    const x = anioX(mm.anio);
    let n = 0;
    while (ultimoX[n] !== undefined && x - ultimoX[n]! < 0.95) n++;
    ultimoX[n] = x;
    niveles.set(mm.id, n);
  });

  const porPilar: Record<string, string[]> = { estructural: [], funcional: [], origen: [] };
  colocados.forEach((id) => {
    const h = HITOS.find((x) => x.id === id)!;
    porPilar[h.pilar]!.push(id);
  });

  return (
    <group position={[0, -1.9, 0]}>
      <mesh position={[0, -0.06, 0.6]} receiveShadow>
        <boxGeometry args={[11, 0.1, 6.4]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Escalinata: los cimientos son los microscopios */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.4, 0.24, 2.7]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 0.24, 2.3]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <Html position={[0, 0.14, 1.36]} center distanceFactor={10} zIndexRange={[16, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: "#94a3b8" }}>CIMIENTOS:</span>
          {CIMIENTOS.map((c) => (
            <span key={c.anio} style={{ padding: "2px 6px", borderRadius: 6, background: "rgba(4,10,22,0.85)", border: "1px solid #64748b", color: "#e2e8f0", fontSize: 9, fontWeight: 800 }}>
              {c.anio} {c.etq}
            </span>
          ))}
        </div>
      </Html>
      {PILARES.map((p) => {
        const x = X_PILAR[p]!;
        const def = PILAR_DEF[p];
        return (
          <group key={p}>
            <mesh position={[x, 0.555, 0]} castShadow>
              <boxGeometry args={[0.95, 0.15, 0.95]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
            </mesh>
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[x, BASE_Y + k * ALTO + ALTO / 2, 0]}>
                <cylinderGeometry args={[0.36, 0.36, ALTO - 0.05, 20, 1, true]} />
                <meshBasicMaterial color={def.color} transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} wireframe />
              </mesh>
            ))}
            <mesh position={[x, BASE_Y + 3 * ALTO + 0.07, 0]} castShadow>
              <boxGeometry args={[1.0, 0.14, 1.0]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
            </mesh>
            <Html position={[x, 0.56, 0.62]} center distanceFactor={10} zIndexRange={[17, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ padding: "3px 8px", borderRadius: 8, background: "rgba(4,10,22,0.9)", border: `1px solid ${def.color}`, color: "#fff", fontSize: 10.5, fontWeight: 900, whiteSpace: "nowrap" }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: def.color, marginRight: 5 }} />
                {def.etq} · {porPilar[p]!.length}/3
              </div>
            </Html>
            {porPilar[p]!.map((id, slot) => (
              <Tambor key={id} id={id} slot={slot} />
            ))}
          </group>
        );
      })}
      {/* Techo */}
      <group ref={techo} position={[0, 3.5, 0]} visible={false}>
        <mesh position={[0, BASE_Y + 3 * ALTO + 0.29, 0]} castShadow>
          <boxGeometry args={[6.2, 0.3, 1.3]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
        </mesh>
        <group position={[0, BASE_Y + 3 * ALTO + 0.44 + 0.33, 0]} scale={[3.55, 0.66, 1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1, 1, 1.2, 3]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.45} />
          </mesh>
        </group>
        <Etiqueta pos={[0, BASE_Y + 3 * ALTO + 0.62, 0.7]} df={9} col={`${modoColor}`} fs={13}>
          <i className="fa-solid fa-landmark" style={{ color: modoColor }} />
          TEORÍA CELULAR
        </Etiqueta>
      </group>
      {seleccionado && !colocados.includes(seleccionado) && <Flotante id={seleccionado} errorNonce={errorNonce} />}

      {/* Línea del tiempo, detrás y arriba del templo */}
      <group position={[0, T_Y, T_Z]}>
        <mesh>
          <boxGeometry args={[T_X1 - T_X0, 0.03, 0.05]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        {[1650, 1700, 1750, 1800, 1850, 1900].map((an) => (
          <group key={an} position={[anioX(an), 0, 0]}>
            <mesh>
              <boxGeometry args={[0.02, 0.14, 0.05]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
            <Html position={[0, -0.2, 0]} center distanceFactor={7} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 800 }}>{an}</div>
            </Html>
          </group>
        ))}
        {marcas.map((mm) => (
          <Pin key={mm.id} x={anioX(mm.anio)} nivel={niveles.get(mm.id) ?? 0} color={mm.color} texto={mm.texto} />
        ))}
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Experimento de Pasteur
 * ════════════════════════════════════════════════════════════════════════ */

const CURVA_CISNE = new THREE.CatmullRomCurve3(
  [
    [0, -0.1, 0],
    [0, 0.3, 0],
    [0.08, 0.62, 0],
    [0.32, 0.72, 0],
    [0.52, 0.45, 0],
    [0.66, 0.26, 0],
    [0.84, 0.3, 0],
    [0.98, 0.62, 0],
    [1.1, 1.05, 0],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
);
const GEO_CISNE = new THREE.TubeGeometry(CURVA_CISNE, 80, 0.065, 12, false);
const U_BAJO: Pt = [0.66, 0.26, 0];
const BOCA_CISNE: Pt = [1.1, 1.05, 0];
const N_POLVO = 26;
const N_MICROBIOS = 60;
const Y_MATRAZ = 1.85;
const R_MATRAZ = 0.55;

function Matraz({ x, tipo, fase }: { x: number; tipo: "recto" | "cisne"; fase: FasePasteur }) {
  const liquido = useRef<THREE.MeshStandardMaterial>(null);
  const superficie = useRef<THREE.MeshStandardMaterial>(null);
  const microbios = useRef<THREE.InstancedMesh>(null);
  const polvo = useRef<THREE.InstancedMesh>(null);
  const atrapado = useRef<THREE.InstancedMesh>(null);
  const llama = useRef<THREE.Mesh>(null);
  const estado = useRef<HTMLSpanElement>(null);
  const dias = useRef(0);
  const diasRoto = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const claro = useMemo(() => new THREE.Color("#f6c56b"), []);
  const turbio = useMemo(() => new THREE.Color("#e3d6c3"), []);
  const roto = tipo === "cisne" && (fase === "roto" || fase === "finRoto");
  useFrame(({ clock }, dt) => {
    const d = Math.min(dt, 0.25);
    if (fase === "listo" || fase === "hirviendo") {
      dias.current = 0;
      diasRoto.current = 0;
    } else if (fase === "reposo") dias.current = Math.min(DIAS_REPOSO, dias.current + (d * DIAS_REPOSO) / (T_REPOSO / 1000));
    else dias.current = DIAS_REPOSO;
    if (fase === "roto") diasRoto.current = Math.min(DIAS_ROTO, diasRoto.current + (d * DIAS_ROTO) / (T_ROTO / 1000));
    else if (fase === "finRoto") diasRoto.current = DIAS_ROTO;
    else diasRoto.current = 0;
    const expuesto = tipo === "recto" ? dias.current : roto ? diasRoto.current : 0;
    const t = turbidez(expuesto);
    if (liquido.current) {
      liquido.current.color.lerpColors(claro, turbio, t);
      liquido.current.opacity = 0.55 + 0.4 * t;
    }
    if (superficie.current) {
      superficie.current.color.lerpColors(claro, turbio, t);
      superficie.current.opacity = 0.6 + 0.35 * t;
    }
    if (llama.current) {
      llama.current.visible = fase === "hirviendo";
      llama.current.scale.y = 1 + 0.2 * Math.sin(clock.elapsedTime * 14);
    }
    const mic = microbios.current;
    if (mic) {
      for (let i = 0; i < N_MICROBIOS; i++) {
        const a = hash2(i, 1, 61) * TAU + clock.elapsedTime * 0.2 * (hash2(i, 2, 61) - 0.5);
        const r = Math.sqrt(hash2(i, 3, 61)) * 0.42;
        const yy = -hash2(i, 4, 61) * 0.4 - 0.05;
        obj.position.set(Math.cos(a) * r, yy, Math.sin(a) * r);
        obj.scale.setScalar(i / N_MICROBIOS < t ? 0.024 + 0.014 * hash2(i, 5, 61) : 0.0001);
        obj.updateMatrix();
        mic.setMatrixAt(i, obj.matrix);
      }
      mic.instanceMatrix.needsUpdate = true;
    }
    const aire = fase === "reposo" || fase === "fin" || fase === "roto" || fase === "finRoto";
    const pv = polvo.current;
    if (pv) {
      for (let i = 0; i < N_POLVO; i++) {
        const p = (clock.elapsedTime * 0.35 + hash2(i, 7, 62)) % 1;
        const entra = tipo === "recto" || roto;
        const bocaX = tipo === "recto" || roto ? 0 : BOCA_CISNE[0];
        const bocaY = tipo === "recto" ? R_MATRAZ + 1.0 : roto ? R_MATRAZ + 0.4 : R_MATRAZ + BOCA_CISNE[1] - 0.1;
        const finY = entra ? 0.02 : bocaY;
        const y0 = 3.2;
        const yy = y0 + (finY - y0) * p;
        const cerca = Math.max(0, (yy - bocaY) / (y0 - bocaY));
        obj.position.set(bocaX + (hash2(i, 8, 62) - 0.5) * 0.9 * cerca, yy, (hash2(i, 9, 62) - 0.5) * 0.5 * cerca);
        obj.scale.setScalar(aire ? 0.022 : 0.0001);
        obj.updateMatrix();
        pv.setMatrixAt(i, obj.matrix);
      }
      pv.instanceMatrix.needsUpdate = true;
    }
    const at = atrapado.current;
    if (at) {
      const f = tipo === "cisne" && !roto ? Math.min(1, dias.current / 12) : 0;
      for (let i = 0; i < 18; i++) {
        obj.position.set(U_BAJO[0] + (hash2(i, 1, 63) - 0.5) * 0.12, R_MATRAZ + U_BAJO[1] - 0.03 + hash2(i, 2, 63) * 0.04, (hash2(i, 3, 63) - 0.5) * 0.06);
        obj.scale.setScalar(i / 18 < f ? 0.02 : 0.0001);
        obj.updateMatrix();
        at.setMatrixAt(i, obj.matrix);
      }
      at.instanceMatrix.needsUpdate = true;
    }
    if (estado.current) estado.current.textContent = t > 0.5 ? "turbio: hay microbios" : fase === "listo" ? "caldo sin hervir" : fase === "hirviendo" ? "hirviendo" : "claro: sin microbios";
  });

  return (
    <group position={[x, 0, 0]}>
      {/* mechero y aro */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 0.44, 18]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh ref={llama} position={[0, 1.28, 0]} visible={false}>
        <coneGeometry args={[0.09, 0.3, 16, 1, true]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.025, 8, 30]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
      </mesh>
      {[0, 1, 2].map((k) => {
        const a = (k / 3) * TAU;
        return (
          <mesh key={k} position={[Math.cos(a) * 0.36, 1.04, Math.sin(a) * 0.36]}>
            <cylinderGeometry args={[0.015, 0.015, 0.68, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.8} />
          </mesh>
        );
      })}
      <group position={[0, Y_MATRAZ, 0]}>
        {/* vidrio */}
        <mesh>
          <sphereGeometry args={[R_MATRAZ, 36, 28]} />
          <meshPhysicalMaterial {...VIDRIO_FINO} opacity={0.18} roughness={0.05} depthWrite={false} />
        </mesh>
        {/* caldo */}
        <mesh>
          <sphereGeometry args={[R_MATRAZ - 0.03, 32, 20, 0, TAU, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial ref={liquido} color="#f6c56b" transparent opacity={0.55} roughness={0.2} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[R_MATRAZ - 0.03, 32]} />
          <meshStandardMaterial ref={superficie} color="#f6c56b" transparent opacity={0.6} roughness={0.2} depthWrite={false} />
        </mesh>
        <instancedMesh ref={microbios} args={[undefined, undefined, N_MICROBIOS]} frustumCulled={false}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#6b4f2a" />
        </instancedMesh>
        {/* cuello */}
        {tipo === "recto" ? (
          <mesh position={[0, R_MATRAZ + 0.45, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 1.0, 16, 1, true]} />
            <meshPhysicalMaterial {...VIDRIO_FINO} opacity={0.3} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ) : roto ? (
          <>
            <mesh position={[0, R_MATRAZ + 0.14, 0]}>
              <cylinderGeometry args={[0.065, 0.07, 0.5, 16, 1, true]} />
              <meshPhysicalMaterial {...VIDRIO_FINO} opacity={0.3} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <group position={[0.9, -Y_MATRAZ + 0.76, 0.35]} rotation={[Math.PI / 2, 0, 0.5]} scale={0.8}>
              <mesh geometry={GEO_CISNE}>
                <meshPhysicalMaterial {...VIDRIO_FINO} opacity={0.35} roughness={0.05} depthWrite={false} />
              </mesh>
            </group>
          </>
        ) : (
          <mesh geometry={GEO_CISNE} position={[0, R_MATRAZ, 0]}>
            <meshPhysicalMaterial {...VIDRIO_FINO} opacity={0.32} roughness={0.05} depthWrite={false} />
          </mesh>
        )}
        <instancedMesh ref={atrapado} args={[undefined, undefined, 18]} frustumCulled={false}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#57534e" />
        </instancedMesh>
      </group>
      <instancedMesh ref={polvo} args={[undefined, undefined, N_POLVO]} position={[0, Y_MATRAZ, 0]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color="#a8a29e" emissive="#78716c" emissiveIntensity={0.3} />
      </instancedMesh>
      <Etiqueta pos={[0, 0.98, 0.85]} df={9} col={tipo === "recto" ? "#f87171aa" : "#34d399aa"} fs={11.5}>
        <i className="fa-solid fa-flask" style={{ color: tipo === "recto" ? "#fca5a5" : "#6ee7b7" }} />
        {tipo === "recto" ? "Cuello recto" : roto ? "Cuello de cisne roto" : "Cuello de cisne"} · <span ref={estado}>caldo sin hervir</span>
      </Etiqueta>
      {tipo === "cisne" && !roto && (fase === "reposo" || fase === "fin") && (
        <Etiqueta pos={[U_BAJO[0] - 0.2, Y_MATRAZ + R_MATRAZ + 1.25, 0.2]} df={10} fs={10}>
          El polvo queda atrapado en la curva
        </Etiqueta>
      )}
    </group>
  );
}

function EscenaPasteur({ fase }: { fase: FasePasteur }) {
  const contador = useRef<HTMLSpanElement>(null);
  const dias = useRef(0);
  const diasRoto = useRef(0);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.25);
    if (fase === "listo" || fase === "hirviendo") {
      dias.current = 0;
      diasRoto.current = 0;
    } else if (fase === "reposo") dias.current = Math.min(DIAS_REPOSO, dias.current + (d * DIAS_REPOSO) / (T_REPOSO / 1000));
    else dias.current = DIAS_REPOSO;
    if (fase === "roto") diasRoto.current = Math.min(DIAS_ROTO, diasRoto.current + (d * DIAS_ROTO) / (T_ROTO / 1000));
    else if (fase === "finRoto") diasRoto.current = DIAS_ROTO;
    if (contador.current)
      contador.current.textContent =
        fase === "listo"
          ? "Caldo nutritivo listo"
          : fase === "hirviendo"
            ? "Hirviendo: se matan los microbios"
            : fase === "roto" || fase === "finRoto"
              ? `Cuello roto · día ${Math.floor(diasRoto.current)} de ${DIAS_ROTO}`
              : `Reposo · día ${Math.floor(dias.current)} de ${DIAS_REPOSO}`;
  });
  return (
    <group position={[0, -0.8, 0]}>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.1, 2.6]} />
        <meshStandardMaterial color="#5b4636" roughness={0.7} />
      </mesh>
      {[-2.9, 2.9].map((x) =>
        [-1.1, 1.1].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.28, z]}>
            <boxGeometry args={[0.12, 0.6, 0.12]} />
            <meshStandardMaterial color="#3f2f24" />
          </mesh>
        )),
      )}
      <Matraz x={-1.45} tipo="recto" fase={fase} />
      <Matraz x={1.05} tipo="cisne" fase={fase} />
      <Etiqueta pos={[-0.2, 4.0, -0.4]} df={9} col="#a78bfaaa" fs={14}>
        <i className="fa-solid fa-calendar-day" style={{ color: "#c4b5fd" }} />
        <span ref={contador}>Caldo nutritivo listo</span>
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function DescubrimientoCelulaScene(p: DescubrimientoSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "teoria") return { pos: [0, 4.0, 10.8], target: [0, 0.8, 0.2] };
    if (vista === "pasteur") return { pos: [0.2, 2.8, 7.2], target: [-0.1, 1.1, 0] };
    return { pos: [0.1, 1.9, 9.6], target: [0, 0.95, 0] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 18, 40]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 9, 6]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "instrumentos" && <EscenaInstrumentos instrumentoId={p.instrumentoId} ajusteId={p.ajusteId} muestraId={p.muestraId} modoColor={modoColor} />}
      {vista === "medicion" && <EscenaMedicion objetivo={p.objetivo} ocular={p.ocular} misionId={p.misionId} calibradorMm={p.calibradorMm} modoColor={modoColor} />}
      {vista === "teoria" && <EscenaTeoria ordenados={p.ordenados} colocados={p.colocados} seleccionado={p.seleccionado} errorNonce={p.errorNonce} modoColor={modoColor} />}
      {vista === "pasteur" && <EscenaPasteur fase={p.fasePasteur} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={3.5} maxDistance={18} maxPolarAngle={Math.PI * 0.5} minPolarAngle={Math.PI * 0.08} minAzimuthAngle={-Math.PI * 0.45} maxAzimuthAngle={Math.PI * 0.45} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.96} luminanceSmoothing={0.5} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
