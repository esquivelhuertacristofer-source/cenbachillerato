"use client";

/**
 * Piezas comunes de las cuatro escalas del viaje del paquete: el reloj del
 * envío (compartido entre escalas aunque se monten y desmonten), el mando de
 * la cámara, las etiquetas <Html> legibles y las texturas de los números de
 * los paquetes. NO usa <Text> de drei (cuelga Turbopack).
 */

import * as THREE from "three";
import { createContext, useContext, type ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export type Pt = [number, number, number];

export const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
export const OK = "#34d399";
export const NO = "#f87171";
export const AMARILLO = "#fbbf24";

/* ── Reloj del envío ──────────────────────────────────────────────────── */

/**
 * Segundos desde que salió el envío actual. −1: no hay envío (todo en reposo).
 * Lo escribe la escena raíz en cada cuadro; las escalas solo lo leen.
 */
export interface RelojEnvio {
  t: number;
}
export const RelojCtx = createContext<RelojEnvio>({ t: -1 });
export const useReloj = () => useContext(RelojCtx);

/* ── Mando de la cámara ───────────────────────────────────────────────── */

/**
 * Las escalas piden a dónde mirar escribiendo aquí. `vuelo` = segundos que la
 * cámara sigue acercándose sola; `sigue` = la escala manda en cada cuadro
 * (p. ej. el globo acompaña al pulso). Si el alumno arrastra, se suelta.
 */
export interface MandoCamara {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  vuelo: number;
  sigue: boolean;
  /** true desde que el alumno tomó la cámara en esta escala. */
  libre: boolean;
}
export const CamaraCtx = createContext<MandoCamara | null>(null);
export const useMando = () => useContext(CamaraCtx);

/* ── Calidad ──────────────────────────────────────────────────────────── */

/** Celular, tableta o pantalla angosta: menos objetos y sin postproceso. */
export function esDebil(ancho: number): boolean {
  if (ancho < 640) return true;
  if (typeof window === "undefined") return false;
  return !!window.matchMedia?.("(pointer: coarse)").matches;
}

export const DetallesCtx = createContext(false);

/* ── Etiquetas ────────────────────────────────────────────────────────── */

/**
 * Etiqueta legible (≥ 14 px, tamaño fijo en pantalla). `sec` = secundaria: solo
 * con «Ver detalles» y nunca en el celular. `ancha` = se oculta en el celular.
 */
export function Etiqueta3D({ pos, children, col, sec = false, ancha = false }: { pos: Pt; children: ReactNode; col?: string; sec?: boolean; ancha?: boolean }) {
  const detalles = useContext(DetallesCtx);
  const angosto = useThree((st) => st.size.width) < 640;
  if ((sec && (!detalles || angosto)) || (ancha && angosto)) return null;
  return (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(3,9,20,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: 14,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 22px -10px #000",
          backdropFilter: "blur(6px)",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/* ── Texturas de los paquetes numerados ───────────────────────────────── */

const cacheNumeros = new Map<string, THREE.CanvasTexture>();

/** Cara de un paquete: su número de orden grande, con un marco del color del modo. */
export function texturaNumero(n: number, color: string): THREE.CanvasTexture {
  const clave = `${n}-${color}`;
  const ya = cacheNumeros.get(clave);
  if (ya) return ya;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "rgba(4,12,26,0.9)";
  g.fillRect(10, 10, 108, 108);
  g.strokeStyle = color;
  g.lineWidth = 4;
  g.strokeRect(18, 18, 92, 92);
  g.fillStyle = "#ffffff";
  g.font = "900 70px system-ui, -apple-system, Segoe UI, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  cacheNumeros.set(clave, t);
  return t;
}

/** Ruido determinista (mulberry32) para texturas y posiciones. */
export function prng(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Curva suave 0–1 (entrada y salida lentas). */
export const facil = (x: number) => {
  const p = Math.min(1, Math.max(0, x));
  return p * p * (3 - 2 * p);
};

/* ── Mutaciones fuera del render ──────────────────────────────────────────
 * El reloj, el mando de la cámara y los uniformes son objetos mutables que se
 * tocan en cada cuadro (useFrame). Se modifican con estas funciones para que
 * quede explícito que NO es estado de React. */

export function fijarU(mat: THREE.ShaderMaterial, nombre: string, valor: unknown): void {
  const u = mat.uniforms[nombre];
  if (u) u.value = valor;
}
export function sumarU(mat: THREE.ShaderMaterial, nombre: string, d: number): void {
  const u = mat.uniforms[nombre];
  if (u) u.value = (u.value as number) + d;
}

export function pasoReloj(r: RelojEnvio, reinicia: boolean, activo: boolean, dt: number): void {
  if (reinicia) r.t = 0;
  if (!activo) r.t = -1;
  else if (r.t >= 0) r.t += Math.min(dt, 0.1);
}

/** Una escala pide encuadre: la cámara se acerca sola durante `vuelo` segundos. */
export function pedirEncuadre(m: MandoCamara, pos: THREE.Vector3, target: THREE.Vector3, vuelo: number): void {
  m.pos.copy(pos);
  m.target.copy(target);
  m.vuelo = Math.max(m.vuelo, vuelo);
}
export function nuevoEncuadre(m: MandoCamara, pos: THREE.Vector3, target: THREE.Vector3): void {
  m.pos.copy(pos);
  m.target.copy(target);
  m.vuelo = 2.4;
  m.libre = false;
}
export function soltarCamara(m: MandoCamara): void {
  m.vuelo = 0;
  m.libre = true;
}
export function fijarSigue(m: MandoCamara, sigue: boolean): void {
  m.sigue = sigue;
}
/** Descuenta tiempo de vuelo; devuelve si la cámara todavía debe moverse sola. */
export function gastarVuelo(m: MandoCamara, dt: number): boolean {
  if (m.vuelo <= 0) return false;
  m.vuelo -= dt;
  return true;
}

/** Asigna una propiedad de un objeto de three (escena, cámara…) fuera del render. */
export function asignar<T extends object, K extends keyof T>(obj: T, k: K, v: T[K]): void {
  obj[k] = v;
}
