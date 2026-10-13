"use client";

/**
 * Escena 3D del laboratorio "La célula en 3D: organelos y funciones"
 * (CNEYT-VI-P02, `celula-organelos-3d`).
 *
 * Una célula que se explora como en un documental:
 *  - La membrana es «vidrio vivo» (transmisión + irisación) y la célula está
 *    ABIERTA en cuña hacia la cámara: por el corte se ve el citoplasma con sus
 *    partículas, el núcleo partido (doble envoltura, poros, cromatina,
 *    nucléolo), el retículo rugoso tachonado de ribosomas, el Golgi en
 *    cisternas y las vesículas que viajan RE → Golgi → membrana.
 *  - Al elegir un organelo la cámara VIAJA a él, los demás se apagan y aparece
 *    su función (≤ 4 rótulos a la vez).
 *  - «Entrar a la mitocondria» cambia de escala: una mitocondria abierta con
 *    sus crestas, donde las ATP sintasas sueltan ATP.
 *
 * Toda la animación ocurre en `useFrame` mutando refs (nunca durante el
 * render). Nada de `<Text>` de drei: los rótulos son `<Html>`.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { T } from "./_kit";
import { type Modo, organeloPorId, RESUMEN_FUNCION } from "./celula-data";
import { Escenario, calidadEscena, FONDO_OSCURO } from "./_escenario";
import {
  type Pt, type FormaRadial, type EjeCorte,
  formaEsfera, formaSuper, formaCapsulaX, desplazar, planosCuna,
} from "./celula-geometrias";
import {
  type Calidad, type Corte, type ColoresCelula,
  Envoltura, Citosol, Nucleo, NUCLEO_PARTES, Mitocondria, Reticulo, Golgi, Vesiculas, Lisosoma,
  Centrosoma, Citoesqueleto, Cloroplasto, Vacuola, Nucleoide, NUCLEOIDE_PARTES, Flagelo, Pili, Vecinas,
  Puntos, puntosDentro,
} from "./celula-organelos";
import { MitocondriaInterior, MITO_PARTES } from "./celula-mitocondria";

export interface CelulaSceneProps {
  modo: Modo;
  selected: string | null;
  onSelect: (id: string) => void;
  playing: boolean;
  accent: string;
  resetNonce: number;
  /** apertura total del corte, en grados (0 = célula cerrada) */
  corte?: number;
  /** vista «por dentro de la mitocondria» */
  interior?: boolean;
  /** crestas de la mitocondria grande */
  crestas?: number;
}

/* ══════════════════════════════════════════════════════════════════════════
   Configuración por tipo de célula
   ══════════════════════════════════════════════════════════════════════════ */
const FORMA_ANIMAL = formaEsfera(3.2, 0.045, 1.2, 2);
const FORMA_VEGETAL = formaSuper(3.7, 2.7, 2.7, 5, 0.012, 1);
const PARED_VEGETAL = desplazar(FORMA_VEGETAL, 0.26);
const FORMA_VACUOLA = formaSuper(2.35, 1.65, 1.6, 2.6, 0.05, 4);
const FORMA_PROCARIOTA = formaCapsulaX(2.2, 1.25);
const PARED_PROCARIOTA = desplazar(FORMA_PROCARIOTA, 0.15);

interface CfgCelula {
  forma: FormaRadial;
  pared?: FormaRadial;
  eje: EjeCorte;
  /** acimut del centro de la cuña (= desde dónde mira la cámara) */
  alfa: number;
  cam: { azim: number; elev: number; dist: number; bajar: number };
  colores: ColoresCelula;
  vecina: string;
  citosol: string;
}
const CFG: Record<Modo, CfgCelula> = {
  animal: {
    forma: FORMA_ANIMAL, eje: "y", alfa: 0.44,
    cam: { azim: 0.44, elev: 0.3, dist: 12.6, bajar: 0.55 },
    colores: { membrana: "#e4dcff", atenuacion: "#f3c9ff", canto: "#f5d0fe", fondo: ["#2a0e2b", "#9c3d78"] },
    vecina: "#c084fc", citosol: "#f9b4d8",
  },
  vegetal: {
    forma: FORMA_VEGETAL, pared: PARED_VEGETAL, eje: "y", alfa: 0.44,
    cam: { azim: 0.44, elev: 0.32, dist: 13.4, bajar: 0.5 },
    colores: { membrana: "#e6ffd0", atenuacion: "#c8f7b0", canto: "#d9f99d", fondo: ["#0c2414", "#3d8b4c"], pared: ["#6c9840", "#d4f09a"], cantoPared: "#a8cf6a" },
    vecina: "#86efac", citosol: "#c6f6d5",
  },
  procariota: {
    forma: FORMA_PROCARIOTA, pared: PARED_PROCARIOTA, eje: "x", alfa: 0.42,
    cam: { azim: 0.3, elev: 0.36, dist: 10.6, bajar: 0.25 },
    colores: { membrana: "#d5efff", atenuacion: "#a8dcff", canto: "#bae6fd", fondo: ["#081c30", "#2a78b0"], pared: ["#7d93a8", "#c9dced"], cantoPared: "#9fb8cc" },
    vecina: "#7dd3fc", citosol: "#bfe6ff",
  },
};

/* ── Dónde va cada organelo (coordenadas de la célula, centro en 0) ───────── */
interface Pieza {
  id: string;
  pos: Pt;
  escala: number;
  /** orientar el lado abierto (+z) a la cámara, con el eje largo tangente */
  abierto?: boolean;
  /** orientar +y hacia esta dirección (Golgi: la cara trans mira a la membrana) */
  arriba?: Pt;
  /** el núcleo se corta con la cuña de la célula */
  cortado?: boolean;
  /** punto al que viaja la cámara (si no, `pos`) y distancia */
  foco?: Pt;
  dist?: number;
}

const GOLGI_A: Pt = [1.55, 0.75, -1.35];
const GOLGI_V: Pt = [2.35, -1.6, -1.2];
const NUC_V: Pt = [-2.55, 0.95, -1.1];

const LAYOUT: Record<Modo, Pieza[]> = {
  animal: [
    { id: "nucleo", pos: [0, 0.15, 0], escala: 1.15, cortado: true, dist: 6.6 },
    { id: "re", pos: [0, 0.15, 0], escala: 1, foco: [-1.05, 0.55, -1.15], dist: 4.6 },
    { id: "golgi", pos: GOLGI_A, escala: 1.05, arriba: [0.35, 1, -0.25], dist: 4.6 },
    { id: "mitocondria", pos: [2.05, -0.85, -0.9], escala: 1.12, abierto: true, dist: 2.9 },
    { id: "mitocondria", pos: [-2.45, -0.6, -0.25], escala: 1.0, abierto: true },
    { id: "mitocondria", pos: [-0.8, -2.2, -1.3], escala: 1.0, abierto: true },
    { id: "mitocondria", pos: [0.55, 2.05, -1.55], escala: 0.95, abierto: true },
    { id: "lisosoma", pos: [1.05, -1.95, -1.6], escala: 0.3, dist: 2.4 },
    { id: "lisosoma", pos: [-0.3, -1.0, -2.5], escala: 0.26 },
    { id: "lisosoma", pos: [-1.55, 1.9, -1.0], escala: 0.28 },
    { id: "ribosomas", pos: [0, 0, 0], escala: 1, foco: [1.25, -0.35, -1.7], dist: 3.2 },
  ],
  vegetal: [
    { id: "vacuola", pos: [0, -0.05, 0], escala: 1, dist: 8.6 },
    { id: "nucleo", pos: NUC_V, escala: 0.82, dist: 4.4 },
    { id: "re", pos: NUC_V, escala: 1, foco: [-1.95, 0.6, -1.9], dist: 4.2 },
    { id: "cloroplasto", pos: [1.45, 2.0, -1.35], escala: 1.0, abierto: true, dist: 3.2 },
    { id: "cloroplasto", pos: [-0.75, 2.05, -1.45], escala: 0.95, abierto: true },
    { id: "cloroplasto", pos: [0.35, -2.05, -1.45], escala: 1.0, abierto: true },
    { id: "cloroplasto", pos: [-2.1, -1.65, -1.05], escala: 0.95, abierto: true },
    { id: "cloroplasto", pos: [2.95, -0.85, -0.85], escala: 0.9, abierto: true },
    { id: "mitocondria", pos: [3.0, 1.0, -0.7], escala: 0.95, abierto: true, dist: 2.8 },
    { id: "mitocondria", pos: [-3.0, -0.6, 0.55], escala: 0.9, abierto: true },
    { id: "golgi", pos: GOLGI_V, escala: 0.82, arriba: [1, 0.25, 0.3], dist: 3.6 },
    { id: "ribosomas", pos: [0, 0, 0], escala: 1, foco: [-2.3, 1.3, -1.9], dist: 3.0 },
  ],
  procariota: [
    { id: "nucleoide", pos: [0, 0, 0], escala: 1, dist: 6.2 },
    { id: "ribosomas", pos: [0, 0, 0], escala: 1, foco: [1.6, 0.35, -0.5], dist: 3.6 },
  ],
};

/* Retículo de cada célula (constantes: las geometrías se memorizan por identidad). */
const RE_ANIMAL = { radios: [1.42, 1.62, 1.82], azim: [2.95, 5.2] as [number, number], polar: [0.55, 2.55] as [number, number], liso: { centro: [-1.6, -1.45, -0.55] as Pt, radio: 0.55 }, nRibo: 900 };
const RE_VEGETAL = { radios: [1.0, 1.16], azim: [2.4, 3.5] as [number, number], polar: [0.6, 2.4] as [number, number], liso: { centro: [0.6, -1.15, -0.6] as Pt, radio: 0.45 }, nRibo: 420 };

/** Rótulos de partes (≤ 2 por organelo), en coordenadas LOCALES de la pieza. */
const PARTES: Partial<Record<string, { t: string; p: Pt }[]>> = {
  nucleo: [{ t: "Nucléolo", p: NUCLEO_PARTES.nucleolo }, { t: "Poros nucleares", p: NUCLEO_PARTES.poro }],
  mitocondria: [{ t: "Crestas", p: [0.12, -0.1, -0.16] }, { t: "Doble membrana", p: [-0.42, 0.33, 0] }],
  golgi: [{ t: "Cisternas", p: [-0.62, 0.05, 0] }, { t: "Vesículas", p: [0.74, 0.34, 0.2] }],
  cloroplasto: [{ t: "Tilacoides (grana)", p: [-0.4, 0.06, -0.2] }, { t: "Estroma", p: [0.55, -0.14, -0.28] }],
  nucleoide: [{ t: "Plásmido (ADN extra)", p: NUCLEOIDE_PARTES.plasmido }],
};

const CENTRO = new THREE.Vector3(0, 0, 0);
/** Ancho de cada célula (con pared y flagelo), para encuadrarla en pantallas verticales. */
const ALTO: Record<Modo, number> = { animal: 7.8, vegetal: 7.4, procariota: 5.2 };
const ANCHO: Record<Modo, number> = { animal: 6.8, vegetal: 11.5, procariota: 9.4 };

/* ── Orientación de cada pieza ─────────────────────────────────────────────── */
function camaraPorDefecto(modo: Modo, factor: number): { pos: THREE.Vector3; target: THREE.Vector3 } {
  const c = CFG[modo].cam;
  // En vertical la misión tapa más escenario: la célula sube un poco más.
  const target = new THREE.Vector3(0, -c.bajar * Math.min(1, 1 / factor), 0);
  const dir = new THREE.Vector3(Math.sin(c.azim) * Math.cos(c.elev), Math.sin(c.elev), Math.cos(c.azim) * Math.cos(c.elev));
  return { pos: target.clone().addScaledVector(dir, c.dist * factor), target };
}

function cuaternion(p: Pieza, camPos: THREE.Vector3): THREE.Quaternion {
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3(...p.pos);
  if (p.arriba) return q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...p.arriba).normalize());
  if (!p.abierto) return q;
  const z = camPos.clone().sub(pos).normalize();
  const radial = pos.clone().normalize();
  let x = radial.clone().cross(z);
  if (x.lengthSq() < 0.04) x = new THREE.Vector3(1, 0, 0);
  x.addScaledVector(z, -x.dot(z)).normalize();
  const y = z.clone().cross(x).normalize();
  return q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

/* ══════════════════════════════════════════════════════════════════════════
   Rótulos
   ══════════════════════════════════════════════════════════════════════════ */
function Rotulo({ pos, titulo, sub, col, lado = "der", fuerte = false, angosto = false, alto = 0 }: {
  pos: Pt | THREE.Vector3; titulo: string; sub?: string; col: string; lado?: "der" | "izq"; fuerte?: boolean; angosto?: boolean; alto?: number;
}) {
  const largo = 34;
  const p: Pt = Array.isArray(pos) ? pos : [pos.x, pos.y, pos.z];
  // Línea guía del punto a la caja (diagonal si la caja está más arriba o abajo).
  const dx = angosto ? 0 : lado === "der" ? largo : -largo;
  const dy = angosto ? -16 : alto;
  const L = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);
  return (
    <Html position={p} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ position: "relative", width: 0, height: 0 }}>
        <span style={{ position: "absolute", left: -5, top: -5, width: 10, height: 10, borderRadius: 99, background: col, boxShadow: `0 0 0 3px rgba(5,14,30,0.65), 0 0 12px ${col}` }} />
        <span style={{ position: "absolute", top: -1, left: 0, width: L, height: 2, background: col, opacity: 0.9, transformOrigin: "0 50%", transform: `rotate(${ang}rad)` }} />
        <div
          style={{
            position: "absolute",
            top: angosto ? dy : alto,
            left: angosto ? 0 : lado === "der" ? largo : undefined,
            right: !angosto && lado === "izq" ? largo : undefined,
            transform: angosto ? "translate(-50%, -100%)" : "translateY(-50%)",
            width: "max-content",
            maxWidth: angosto ? 180 : 250,
            padding: fuerte ? "7px 12px" : "5px 10px",
            borderRadius: 10,
            background: fuerte ? "rgba(5,14,30,0.88)" : "rgba(5,14,30,0.74)",
            border: `1px solid ${col}`,
            boxShadow: "0 8px 24px -10px rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ fontSize: angosto ? 14 : fuerte ? 16 : 14, fontWeight: 800, color: fuerte ? "#fff" : col, lineHeight: 1.2, whiteSpace: "nowrap" }}>{titulo}</div>
          {sub && <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.3, marginTop: 3 }}>{sub}</div>}
        </div>
      </div>
    </Html>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Organelo: selección, atenuación y brillo de lo elegido
   ══════════════════════════════════════════════════════════════════════════ */
type Estado = "normal" | "sel" | "dim";
const GRIS = new THREE.Color("#121a28");
const HSL = { h: 0, s: 0, l: 0 };
interface MatGuardado { m: THREE.MeshStandardMaterial; base: THREE.Color; e: THREE.Color; ei: number }

function Organelo({ id, pos, escala, quat, estado, playing, quieto, suave = false, onSelect, onHover, children }: {
  id: string; pos: Pt; escala: number; quat: THREE.Quaternion; estado: Estado; playing: boolean; quieto: boolean; suave?: boolean;
  onSelect: (id: string) => void; onHover: (id: string | null) => void; children: ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const mats = useRef<MatGuardado[] | null>(null);
  const k = useRef(1);
  useFrame((state, dt) => {
    const grp = g.current;
    if (!grp) return;
    if (!mats.current) {
      const lista: MatGuardado[] = [];
      grp.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && m.color && m.emissive && !lista.some((x) => x.m === m)) lista.push({ m, base: m.color.clone(), e: m.emissive.clone(), ei: m.emissiveIntensity });
      });
      mats.current = lista;
    }
    const t = state.clock.elapsedTime;
    const meta = estado === "dim" ? 0 : estado === "sel" ? 2 : 1;
    k.current += (meta - k.current) * (1 - Math.exp(-dt * 5));
    const kk = k.current;
    for (const x of mats.current) {
      if (kk <= 1) {
        x.m.color.copy(x.base).lerp(GRIS, (1 - kk) * 0.8);
        x.m.emissive.copy(x.e);
        x.m.emissiveIntensity = x.ei * (0.2 + 0.8 * kk);
      } else {
        const s = kk - 1;
        x.m.color.copy(x.base);
        // El amarillo del Golgi satura con el brillo: al elegirlo se apaga un poco el tono.
        if (suave) { x.m.color.getHSL(HSL); x.m.color.setHSL(HSL.h, HSL.s * (1 - 0.3 * s), HSL.l * (1 - 0.1 * s)); }
        // Con textura el color base es blanco: brillarlo lo lavaría. Solo brillan los lisos.
        if (x.m.map) { x.m.emissive.copy(x.e); x.m.emissiveIntensity = x.ei; continue; }
        x.m.emissive.copy(x.m.color);
        x.m.emissiveIntensity = x.ei + s * (0.035 + 0.025 * Math.sin(t * 3));
      }
    }
    if (!quieto && playing) grp.position.y = pos[1] + Math.sin(t * 0.8 + pos[0] * 2) * 0.035;
  });
  return (
    <group
      ref={g}
      position={pos}
      quaternion={quat}
      scale={escala}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(id); }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(id); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = "default"; }}
    >
      {children}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   La célula (según el modo)
   ══════════════════════════════════════════════════════════════════════════ */
function Celula({ modo, selected, onSelect, playing, corte, calidad, angosto, camPos }: {
  modo: Modo; selected: string | null; onSelect: (id: string) => void; playing: boolean;
  corte: Corte; calidad: Calidad; angosto: boolean; camPos: THREE.Vector3;
}) {
  const cfg = CFG[modo];
  const [hover, setHover] = useState<string | null>(null);
  const pocos = calidad === "baja" || angosto;

  const piezas = useMemo(() => LAYOUT[modo].map((p) => ({ ...p, q: cuaternion(p, camPos) })), [modo, camPos]);

  // Citosol y ribosomas libres (fuera de la vacuola en la vegetal).
  const nubes = useMemo(() => {
    const fuera = (lista: THREE.Vector3[]) =>
      modo !== "vegetal" ? lista : lista.filter((p) => { const d = p.clone().normalize(); return p.length() > FORMA_VACUOLA(d) + 0.12; });
    const nC = pocos ? 260 : modo === "animal" ? 700 : 600;
    const nR = pocos ? 140 : modo === "procariota" ? 380 : 260;
    return {
      citosol: fuera(puntosDentro(cfg.forma, nC, 21, 0.05, 0.9)),
      ribo: fuera(puntosDentro(cfg.forma, nR, 31, modo === "procariota" ? 0.15 : 0.45, 0.88)),
    };
  }, [modo, cfg, pocos]);

  // Vesículas: RE → Golgi y Golgi → membrana.
  const rutas = useMemo(() => {
    if (modo === "procariota") return [];
    const G = new THREE.Vector3(...(modo === "animal" ? GOLGI_A : GOLGI_V));
    const pieza = LAYOUT[modo].find((p) => p.id === "golgi")!;
    const u = new THREE.Vector3(...pieza.arriba!).normalize();
    const out: THREE.Curve<THREE.Vector3>[] = [];
    const nSal = pocos ? 4 : 7;
    for (let i = 0; i < nSal; i++) {
      const a = (i / nSal) * Math.PI * 2;
      const lat = new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.6, Math.sin(a)).cross(u).normalize().multiplyScalar(0.28);
      const s = G.clone().addScaledVector(u, 0.42 * pieza.escala).add(lat);
      const dir = u.clone().addScaledVector(lat, 1.4).normalize();
      const e = dir.clone().multiplyScalar(cfg.forma(dir) - 0.12);
      const m = s.clone().lerp(e, 0.5).addScaledVector(lat, 1.2);
      out.push(new THREE.CatmullRomCurve3([s, m, e]));
    }
    // del retículo al lado cis del Golgi
    const nuc = new THREE.Vector3(...(modo === "animal" ? [0, 0.15, 0] as Pt : NUC_V));
    const re = modo === "animal" ? RE_ANIMAL : RE_VEGETAL;
    for (let i = 0; i < 3; i++) {
      const b = re.azim[0] + 0.08 + i * 0.05, th = 1.2 + i * 0.25, r = re.radios[re.radios.length - 1]!;
      const s = nuc.clone().add(new THREE.Vector3(Math.sin(b) * Math.sin(th) * r, Math.cos(th) * r, Math.cos(b) * Math.sin(th) * r));
      const e = G.clone().addScaledVector(u, -0.45 * pieza.escala);
      const m = s.clone().lerp(e, 0.5).add(new THREE.Vector3(0, 0.25, 0.1));
      out.push(new THREE.CatmullRomCurve3([s, m, e]));
    }
    return out;
  }, [modo, cfg, pocos]);

  const estadoDe = (id: string): Estado => {
    if (!selected || selected === "membrana" || selected === "pared") return "normal";
    return id === selected ? "sel" : "dim";
  };

  const forma3d = (p: Pieza, i: number): ReactNode => {
    switch (p.id) {
      case "nucleo": return <Nucleo corte={p.cortado ? corte : null} calidad={calidad} />;
      case "mitocondria": return <Mitocondria />;
      case "re": return <Reticulo {...(modo === "animal" ? RE_ANIMAL : RE_VEGETAL)} nRibo={pocos ? 300 : (modo === "animal" ? RE_ANIMAL : RE_VEGETAL).nRibo} />;
      case "golgi": return <Golgi />;
      case "lisosoma": return <Lisosoma semilla={i} />;
      case "cloroplasto": return <Cloroplasto />;
      case "vacuola": return <Vacuola forma={FORMA_VACUOLA} corte={corte} calidad={calidad} />;
      case "nucleoide": return <Nucleoide />;
      case "ribosomas": return <Puntos puntos={nubes.ribo} tam={modo === "procariota" ? 0.04 : 0.034} color="#eef2f8" corte={corte} emis={0.1} />;
      default: return null;
    }
  };

  // Rótulos: el elegido (con su función) + ≤ 2 partes + el que está bajo el puntero. Máx. 4.
  const def = selected ? organeloPorId(selected) : undefined;
  const pSel = selected ? piezas.find((p) => p.id === selected) : undefined;
  const ancla = (p: Pieza & { q: THREE.Quaternion }, local: Pt) =>
    new THREE.Vector3(...local).multiplyScalar(p.escala).applyQuaternion(p.q).add(new THREE.Vector3(...p.pos));
  let rotuloSel: ReactNode = null;
  let partes: ReactNode = null;
  if (def && angosto && (selected === "membrana" || selected === "pared")) {
    // En celular el rótulo del borde se saldría de la pantalla: la info ya está en el panel.
    rotuloSel = null;
  } else if (def && selected === "membrana") {
    const b = corte.alfa + corte.h * 0.98;
    const d = corte.eje === "y" ? new THREE.Vector3(Math.sin(b) * 0.8, 0.6, Math.cos(b) * 0.8) : new THREE.Vector3(0.4, Math.sin(b), Math.cos(b));
    d.normalize();
    rotuloSel = <Rotulo pos={d.multiplyScalar(cfg.forma(d))} titulo={def.nombre} sub={angosto ? undefined : RESUMEN_FUNCION.membrana} col={def.color} fuerte lado="izq" alto={-30} angosto={angosto} />;
  } else if (def && selected === "pared" && cfg.pared) {
    const d = new THREE.Vector3(-0.75, 0.55, 0.4).normalize();
    rotuloSel = <Rotulo pos={d.multiplyScalar(cfg.pared(d))} titulo={def.nombre} sub={angosto ? undefined : RESUMEN_FUNCION.pared} col={def.color} fuerte lado="izq" angosto={angosto} />;
  } else if (def && pSel) {
    const focoP = pSel.foco ? new THREE.Vector3(...pSel.foco) : new THREE.Vector3(...pSel.pos);
    const izq = focoP.x < -0.5 || def.id === "nucleoide";
    rotuloSel = <Rotulo pos={focoP} titulo={def.nombre} sub={angosto ? undefined : RESUMEN_FUNCION[def.id]} col={def.color} fuerte lado={izq ? "izq" : "der"} angosto={angosto} alto={-52} />;
    const lista = angosto ? [] : (PARTES[def.id] ?? []);
    if (def.id === "re") {
      const re = modo === "animal" ? RE_ANIMAL : RE_VEGETAL;
      const r = re.radios[0]!;
      const b = (re.azim[0] + re.azim[1]) / 2, th = 1.15;
      partes = !angosto && (
        <>
          <Rotulo pos={ancla(pSel, [Math.sin(b) * Math.sin(th) * r, Math.cos(th) * r, Math.cos(b) * Math.sin(th) * r])} titulo="RE rugoso (con ribosomas)" col="#7dd3fc" lado="izq" alto={22} />
          <Rotulo pos={ancla(pSel, re.liso.centro)} titulo="RE liso (sin ribosomas)" col="#a5e8ff" lado="izq" alto={14} />
        </>
      );
    } else if (def.id === "ribosomas" && modo !== "procariota") {
      partes = !angosto && <Rotulo pos={[-1.2, 0.85, -1.6]} titulo={modo === "animal" ? "Unidos al RE rugoso" : "Unidos al RE"} col="#e2e8f0" lado="izq" alto={18} />;
    } else if (def.id === "ribosomas") {
      partes = !angosto && <Rotulo pos={[-1.6, -0.3, -0.6]} titulo="Ribosomas 70S" col="#e2e8f0" lado="izq" alto={18} />;
    } else if (lista.length) {
      partes = (
        <>
          {lista.map((x, i) => (
            <Rotulo key={x.t} pos={ancla(pSel, x.p)} titulo={x.t} col={def.color} lado={i % 2 ? (izq ? "izq" : "der") : (izq ? "der" : "izq")} alto={i ? 40 : 30} />
          ))}
        </>
      );
    }
  }
  const pHover = hover && hover !== selected && !angosto ? piezas.find((p) => p.id === hover) : undefined;
  const defHover = pHover ? organeloPorId(pHover.id) : undefined;

  const centrosoma: Pt = [0.95, -1.05, -0.95];

  return (
    <group>
      <Envoltura
        forma={cfg.forma}
        formaPared={cfg.pared}
        corte={corte}
        colores={cfg.colores}
        calidad={calidad}
        selMemb={selected === "membrana"}
        selPared={selected === "pared"}
      />
      <Citosol puntos={nubes.citosol} color={selected && selected !== "membrana" && selected !== "pared" ? "#3a3346" : cfg.citosol} corte={corte} playing={playing} girar={modo === "animal"} tam={0.032} />

      {piezas.map((p, i) => (
        <Organelo
          key={`${modo}-${p.id}-${i}`}
          id={p.id}
          pos={p.pos}
          escala={p.escala}
          quat={p.q}
          estado={estadoDe(p.id)}
          playing={playing}
          suave={p.id === "golgi"}
          quieto={!!p.cortado || p.id === "vacuola" || p.id === "ribosomas" || p.id === "re" || p.id === "nucleoide" || p.id === "golgi"}
          onSelect={onSelect}
          onHover={setHover}
        >
          {forma3d(p, i)}
        </Organelo>
      ))}

      {rutas.length > 0 && <Vesiculas rutas={rutas} playing={playing} />}

      {modo === "animal" && (
        <>
          <group position={centrosoma}><Centrosoma /></group>
          <Citoesqueleto desde={centrosoma} forma={FORMA_ANIMAL} n={pocos ? 10 : 18} corte={corte} />
        </>
      )}
      {modo === "vegetal" && <Citoesqueleto desde={[1.2, 1.4, -1.5]} forma={FORMA_VEGETAL} n={pocos ? 6 : 12} corte={corte} color="#b7f0c0" />}
      {modo === "procariota" && (
        <>
          <Flagelo x0={-3.35} playing={playing} />
          <Pili forma={PARED_PROCARIOTA} n={pocos ? 18 : 34} />
        </>
      )}

      {rotuloSel}
      {partes}
      {pHover && defHover && (
        <Rotulo pos={pHover.foco ?? pHover.pos} titulo={defHover.nombre.replace(" (RE)", "").replace(" (nucleoide)", "")} col={defHover.color} lado={pHover.pos[0] < -0.5 ? "izq" : "der"} alto={20} />
      )}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Cámara que viaja (y se aparta cuando el alumno toma el control)
   ══════════════════════════════════════════════════════════════════════════ */
function RigCamara({ pos, target, desde, clave }: { pos: THREE.Vector3; target: THREE.Vector3; desde: THREE.Vector3 | null; clave: string }) {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const activo = useRef(true);
  const ultima = useRef<string | null>(null);
  useEffect(() => {
    if (!controls) return undefined;
    const parar = () => { activo.current = false; };
    controls.addEventListener("start", parar);
    return () => controls.removeEventListener("start", parar);
  }, [controls]);
  useFrame((state, dt) => {
    if (!controls) return;
    if (ultima.current !== clave) {
      const primera = ultima.current === null;
      ultima.current = clave;
      activo.current = true;
      if (primera) { state.camera.position.copy(desde ?? pos).multiplyScalar(desde ? 1 : 1.35); controls.target.copy(target); }
      else if (desde) state.camera.position.copy(desde);
    }
    if (!activo.current) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 2.4);
    state.camera.position.lerp(pos, k);
    controls.target.lerp(target, k);
    controls.update();
    if (state.camera.position.distanceToSquared(pos) < 1e-4 && controls.target.distanceToSquared(target) < 1e-4) activo.current = false;
  });
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
   Contenido de la escena
   ══════════════════════════════════════════════════════════════════════════ */
function Contenido(props: CelulaSceneProps & { calidad: Calidad }) {
  const { modo, selected, playing, accent, resetNonce, onSelect, calidad } = props;
  const corteGrados = props.corte ?? 110;
  const interior = !!props.interior && modo !== "procariota";
  const crestas = props.crestas ?? 6;
  const size = useThree((s) => s.size);
  const angosto = size.width < 640;
  const aspecto = size.width / Math.max(1, size.height);
  // En pantallas verticales la célula debe caber a lo ANCHO: se aleja la cámara.
  // Distancia para que la célula quepa a lo ANCHO (en vertical el campo horizontal se angosta).
  const mediaVista = Math.tan(THREE.MathUtils.degToRad(20)) * aspecto;
  // En celular, además, que quepa a lo ALTO entre la barra de modos y la misión (~60 % del escenario).
  const porAlto = angosto ? ALTO[modo] / 0.6 / (2 * Math.tan(THREE.MathUtils.degToRad(20))) / CFG[modo].cam.dist : 1;
  const factor = Math.min(2.4, Math.max(1, porAlto, ((ANCHO[modo] / 2) * 1.1) / mediaVista / CFG[modo].cam.dist));
  const factorMito = Math.min(2.4, Math.max(1, (10.4 / 2) / mediaVista / 11.5));
  const cfg = CFG[modo];
  // Al abrir el lab se ve la célula ENTERA; la cámara viaja solo cuando el alumno elige algo.
  const [selInicial] = useState(selected);
  const [enfoca, setEnfoca] = useState(false);
  if (!enfoca && selected !== selInicial) setEnfoca(true);

  const h = THREE.MathUtils.degToRad(corteGrados) / 2;
  const corte = useMemo<Corte>(() => ({ planos: planosCuna(cfg.eje, cfg.alfa, h, CENTRO), eje: cfg.eje, alfa: cfg.alfa, h }), [cfg, h]);

  const camDef = useMemo(() => camaraPorDefecto(modo, factor), [modo, factor]);
  // Las piezas «abiertas» se orientan hacia la cámara de 3/4 de escritorio (siempre la misma).
  const camOrient = useMemo(() => camaraPorDefecto(modo, 1).pos, [modo]);

  const destino = useMemo(() => {
    if (interior) {
      const target = new THREE.Vector3(0, -0.35, -0.4);
      const dir = new THREE.Vector3(0.24, 0.3, 0.92).normalize();
      const pos = target.clone().addScaledVector(dir, 11.5 * factorMito);
      return { pos, target, desde: target.clone().addScaledVector(dir, 70) };
    }
    if (!selected || !enfoca) return { ...camDef, desde: null };
      // La membrana y la pared se ven mejor con la célula entera en cuadro.
    if (selected === "membrana" || selected === "pared") return { ...camDef, desde: null };
    const p = LAYOUT[modo].find((x) => x.id === selected);
    if (!p) return { ...camDef, desde: null };
    const target = new THREE.Vector3(...(p.foco ?? p.pos));
    const rad = target.lengthSq() > 0.01 ? target.clone().normalize() : new THREE.Vector3();
    // Se mira A TRAVÉS DEL CORTE: la línea de vista sale del organelo hacia un punto
    // del eje de la cuña a su misma altura, así no cruza la pared opaca ni el canto
    // de la membrana. Si el organelo está al fondo, la cámara entra a la célula.
    const a = CFG[modo].alfa;
    const Q = CFG[modo].eje === "y"
      ? new THREE.Vector3(Math.sin(a) * 1.6, target.y + 0.45, Math.cos(a) * 1.6)
      : new THREE.Vector3(target.x + 0.4, Math.sin(a) * 1.7, Math.cos(a) * 1.7);
    const dir = Q.sub(target);
    if (dir.lengthSq() < 0.09) dir.set(Math.sin(a), 0.3, Math.cos(a));
    dir.normalize().addScaledVector(rad, 0.05).normalize();
    return { pos: target.clone().addScaledVector(dir, (p.dist ?? 3.4) * factor), target, desde: null };
  }, [interior, selected, enfoca, modo, camDef, factor, factorMito]);

  const clave = `${modo}|${enfoca ? selected : "-"}|${interior}|${resetNonce}`;
  const post = calidad !== "baja" && !angosto;

  return (
    <>
      <Escenario acento={accent} mesa={false} niebla={false} suelo={-3.7} calidad={calidad} />
      {/* Niebla a la medida de la cámara: en celular la cámara se aleja y la célula no debe hundirse en ella. */}
      <fog attach="fog" args={[FONDO_OSCURO, 15 * factor + 4, 42 * factor + 12]} />
      {/* Luz interior cálida: ilumina lo que se ve por el corte. */}
      <pointLight position={[2.4, 2.0, 4.2]} intensity={8} distance={14} decay={1.5} color="#ffe6d2" />
      <pointLight position={[-2.5, -1.5, 2.5]} intensity={4} distance={10} decay={1.6} color={accent} />

      {!interior && calidad !== "baja" && <Vecinas color={cfg.vecina} />}

      {interior ? (
        <group key="interior">
          <MitocondriaInterior crestas={crestas} playing={playing} calidad={calidad} />
          <Rotulo pos={MITO_PARTES.crestas} titulo="Membrana interna: crestas" sub={angosto ? undefined : "Aquí se produce el ATP"} col="#fdba74" fuerte lado="der" angosto={angosto} alto={-30} />
          <Rotulo pos={MITO_PARTES.matriz} titulo="Matriz" col="#fbbf24" lado="izq" angosto={angosto} alto={40} />
          {!angosto && <Rotulo pos={MITO_PARTES.externa} titulo="Membrana externa" col="#ffd0a8" lado="izq" alto={-22} />}
          {!angosto && <Rotulo pos={MITO_PARTES.adn} titulo="ADN mitocondrial (circular)" col="#d8b4fe" lado="izq" alto={30} />}
        </group>
      ) : (
        <group key={`${modo}-${resetNonce}`}>
          <Celula modo={modo} selected={selected} onSelect={onSelect} playing={playing} corte={corte} calidad={calidad} angosto={angosto} camPos={camOrient} />
        </group>
      )}

      <RigCamara pos={destino.pos} target={destino.target} desde={destino.desde} clave={clave} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={interior ? 5 : 2}
        maxDistance={interior ? 26 : 26}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={(Math.PI * 7) / 8}
      />

      {post && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.62} />
        </EffectComposer>
      )}
    </>
  );
}

/* ── Export por defecto: Canvas ───────────────────────────────────────────── */
export default function CelulaScene(props: CelulaSceneProps) {
  const [calidad, setCalidad] = useState<Calidad>(() => calidadEscena());
  const [dpr, setDpr] = useState(1.75);
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [6, 4, 14], fov: 40, near: 0.1, far: 160 }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
    >
      <PerformanceMonitor
        onDecline={() => { setDpr(1); setCalidad((c) => (c === "alta" ? "media" : c)); }}
      />
      <Contenido {...props} calidad={calidad} />
    </Canvas>
  );
}
