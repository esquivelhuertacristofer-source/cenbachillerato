"use client";

/**
 * Escena 3D del laboratorio "Química orgánica en la industria" (CNEYT-IV).
 * Tres vistas:
 *
 *  - sintesis: confórmeros reales de PubChem frente a frente. Al reaccionar, los
 *    enlaces que se rompen se encienden en rojo y se encogen, los fragmentos se
 *    mueven como cuerpos rígidos hasta su lugar en los productos y los enlaces
 *    nuevos crecen en verde. La fermentación ocurre dentro de una levadura.
 *  - polimeros: una cadena en zigzag crece unidad por unidad; en la condensación
 *    cada enlace nuevo suelta una molécula de agua. A un lado, la muestra del
 *    material que resulta según el largo de la cadena.
 *  - productos: la molécula del producto gira en su pedestal con su grupo
 *    funcional resaltado; los productos clasificados vuelan a su industria.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza con dt real. NO se usa
 * <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Modo,
  type ReaccionId,
  type PolimeroId,
  type GrupoId,
  type ObjetoId,
  type Industria,
  type MolId,
  REACCIONES,
  REACCIONES_GEO,
  POLIMEROS,
  PRODUCTOS,
  MOLS,
  GRUPOS_MOL,
  GRUPOS,
  INDUSTRIAS,
  construirCadena,
} from "./organica-industria-data";

export type FaseSintesis = "listo" | "reaccionando" | "hecho";

export interface OrganicaIndustriaSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Síntesis
  reaccion: ReaccionId;
  corrida: number;
  fase: FaseSintesis;
  // Polímeros
  polimero: PolimeroId;
  unidades: number;
  nivel: number;
  extraEtq: string | null;
  // Productos
  productoId: string;
  resaltar: GrupoId | null;
  resaltarOk: boolean;
  clasificados: string[];
}

type Pt = [number, number, number];

/* ── Constantes y temporales de módulo ─────────────────────────────────── */

const COLOR_EL: Record<string, string> = { C: "#6b7686", H: "#e8edf4", O: "#ef4444", N: "#3b82f6" };
const RADIO_EL: Record<string, number> = { C: 0.36, H: 0.23, O: 0.34, N: 0.35 };
const COLOR_ENLACE = "#c9d2de";
const ROJO = "#f87171";
const VERDE = "#4ade80";

const GEO_ESFERA = new THREE.SphereGeometry(1, 22, 16);
const GEO_CIL = new THREE.CylinderGeometry(1, 1, 1, 12);
const O3 = new THREE.Object3D();
const VA = new THREE.Vector3();
const VB = new THREE.Vector3();
const VP = new THREE.Vector3();
const VREF = new THREE.Vector3();
const EJE_Y = new THREE.Vector3(0, 1, 0);
const QA = new THREE.Quaternion();
const QB = new THREE.Quaternion();
const COL = new THREE.Color();
const COL2 = new THREE.Color();

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

function ponerEsfera(m: THREE.InstancedMesh, i: number, x: number, y: number, z: number, r: number) {
  O3.position.set(x, y, z);
  O3.quaternion.identity();
  O3.scale.setScalar(Math.max(r, 1e-5));
  O3.updateMatrix();
  m.setMatrixAt(i, O3.matrix);
}

function ocultar(m: THREE.InstancedMesh, i: number) {
  O3.position.set(0, -999, 0);
  O3.scale.setScalar(1e-5);
  O3.updateMatrix();
  m.setMatrixAt(i, O3.matrix);
}

/** Pone un cilindro entre a y b; `frac` encoge el enlace desde su centro; `off` lo desplaza en perpendicular. */
function ponerCilindro(m: THREE.InstancedMesh, i: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number, frac: number, off: number) {
  VA.set(bx - ax, by - ay, bz - az);
  const L = VA.length();
  if (L < 1e-6 || frac <= 0.002) {
    ocultar(m, i);
    return;
  }
  VA.divideScalar(L);
  VREF.set(0, 0, 1);
  if (Math.abs(VA.z) > 0.9) VREF.set(0, 1, 0);
  VP.crossVectors(VA, VREF).normalize();
  O3.position.set((ax + bx) / 2 + VP.x * off, (ay + by) / 2 + VP.y * off, (az + bz) / 2 + VP.z * off);
  O3.quaternion.setFromUnitVectors(EJE_Y, VA);
  O3.scale.set(r, L * frac, r);
  O3.updateMatrix();
  m.setMatrixAt(i, O3.matrix);
}

/** Dibuja un enlace (sencillo o doble) en los huecos `slot` y `slot+1`. */
function ponerEnlace(m: THREE.InstancedMesh, slot: number, pos: Float32Array, a: number, b: number, orden: number, frac: number, color: THREE.Color) {
  const ax = pos[a * 3]!;
  const ay = pos[a * 3 + 1]!;
  const az = pos[a * 3 + 2]!;
  const bx = pos[b * 3]!;
  const by = pos[b * 3 + 1]!;
  const bz = pos[b * 3 + 2]!;
  if (orden >= 2) {
    ponerCilindro(m, slot, ax, ay, az, bx, by, bz, 0.058, frac, 0.095);
    ponerCilindro(m, slot + 1, ax, ay, az, bx, by, bz, 0.058, frac, -0.095);
    m.setColorAt(slot + 1, color);
  } else {
    ponerCilindro(m, slot, ax, ay, az, bx, by, bz, 0.085, frac, 0);
    ocultar(m, slot + 1);
  }
  m.setColorAt(slot, color);
}

function prepararColor(m: THREE.InstancedMesh) {
  if (m.instanceColor) return;
  for (let i = 0; i < m.count; i++) m.setColorAt(i, COL.set("#ffffff"));
  (m.material as THREE.Material).needsUpdate = true;
}

function terminar(m: THREE.InstancedMesh) {
  m.instanceMatrix.needsUpdate = true;
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
}

function Etiqueta({ pos, children, col, fs = 12, df = 10 }: { pos: Pt; children: ReactNode; col?: string; fs?: number; df?: number }) {
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

/** Fórmula con subíndices reales (<sub>): algunas fuentes no traen los dígitos subíndice Unicode. */
function Formula({ f }: { f: string }) {
  return (
    <span>
      {f.split(/(\d+)/).map((x, i) =>
        /^\d+$/.test(x) ? (
          <sub key={i} style={{ fontSize: "0.72em", verticalAlign: "-0.25em", lineHeight: 0 }}>
            {x}
          </sub>
        ) : (
          <span key={i}>{x}</span>
        ),
      )}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Molécula estática (confórmero o fragmento de cadena)
 * ════════════════════════════════════════════════════════════════════════ */

function MoleculaEstatica({
  el,
  xyz,
  b,
  escala,
  halo,
  haloColor,
  girar = 0,
  opacidad = 1,
}: {
  el: string;
  xyz: number[];
  b: number[];
  escala: number;
  halo: number[] | null;
  haloColor: string;
  girar?: number;
  opacidad?: number;
}) {
  const n = el.length;
  const nb = b.length / 3;
  const grupo = useRef<THREE.Group>(null);
  const atomos = useRef<THREE.InstancedMesh>(null);
  const enlaces = useRef<THREE.InstancedMesh>(null);
  const halos = useRef<THREE.InstancedMesh>(null);
  const pos = useMemo(() => Float32Array.from(xyz), [xyz]);
  const enHalo = useMemo(() => new Set(halo ?? []), [halo]);
  const haloCol = useMemo(() => new THREE.Color(haloColor), [haloColor]);
  useFrame(({ clock }, dt) => {
    if (grupo.current && girar) grupo.current.rotation.y += dt * girar;
    const A = atomos.current;
    const E = enlaces.current;
    const Hm = halos.current;
    if (!A || !E || !Hm) return;
    prepararColor(A);
    prepararColor(E);
    prepararColor(Hm);
    const pulso = 1 + 0.12 * Math.sin(clock.elapsedTime * 4);
    for (let i = 0; i < n; i++) {
      const e = el[i]!;
      ponerEsfera(A, i, pos[i * 3]!, pos[i * 3 + 1]!, pos[i * 3 + 2]!, RADIO_EL[e] ?? 0.3);
      A.setColorAt(i, COL.set(COLOR_EL[e] ?? "#ffffff"));
      if (enHalo.has(i)) {
        ponerEsfera(Hm, i, pos[i * 3]!, pos[i * 3 + 1]!, pos[i * 3 + 2]!, (RADIO_EL[e] ?? 0.3) * 1.95 * pulso);
        Hm.setColorAt(i, haloCol);
      } else ocultar(Hm, i);
    }
    COL2.set(COLOR_ENLACE);
    for (let k = 0; k < nb; k++) {
      const a = b[k * 3]!;
      const c = b[k * 3 + 1]!;
      const o = b[k * 3 + 2]!;
      ponerEnlace(E, k * 2, pos, a, c, o, 1, enHalo.has(a) && enHalo.has(c) ? haloCol : COL2);
    }
    terminar(A);
    terminar(E);
    terminar(Hm);
  });
  return (
    <group ref={grupo} scale={escala}>
      <instancedMesh ref={atomos} args={[GEO_ESFERA, undefined, n]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.32} metalness={0.12} transparent={opacidad < 1} opacity={opacidad} />
      </instancedMesh>
      <instancedMesh ref={enlaces} args={[GEO_CIL, undefined, nb * 2]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.35} metalness={0.4} transparent={opacidad < 1} opacity={opacidad} />
      </instancedMesh>
      <instancedMesh ref={halos} args={[GEO_ESFERA, undefined, n]} frustumCulled={false}>
        <meshBasicMaterial transparent opacity={0.26} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. REACTOR DE SÍNTESIS
 * ════════════════════════════════════════════════════════════════════════ */

const ESCALA_SINTESIS = 0.53;
const ACERCA = 2.4;
const T_ROMPE = 1.0;
const T_MUEVE = 2.0;
const D_MUEVE = 1.6;
const T_FORMA = 3.0;
const T_PRODUCTOS = 3.6;

function Matraz({ color, activo }: { color: string; activo: boolean }) {
  const burbujas = useRef<THREE.InstancedMesh>(null);
  const semillas = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ x: Math.sin(i * 12.9898) * 0.45, z: Math.cos(i * 78.233) * 0.45, fase: (i * 0.618) % 1 })), []);
  useFrame(({ clock }) => {
    const m = burbujas.current;
    if (!m) return;
    semillas.forEach((s, i) => {
      const p = (clock.elapsedTime * 0.7 + s.fase) % 1;
      if (activo) ponerEsfera(m, i, s.x * (1 - p * 0.4), 0.55 + p * 0.75, s.z * (1 - p * 0.4), 0.05 + p * 0.03);
      else ocultar(m, i);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.24, 1.6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.02, 32]} />
        <meshStandardMaterial color={activo ? "#f97316" : "#475569"} emissive={activo ? "#f97316" : "#000"} emissiveIntensity={activo ? 1.1 : 0} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.72, 32, 24]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.22} roughness={0.05} metalness={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.62, 28, 20, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.9, 20, 1, true]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.25} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <instancedMesh ref={burbujas} args={[GEO_ESFERA, undefined, 14]} frustumCulled={false}>
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.7} />
      </instancedMesh>
    </group>
  );
}

function EscenaSintesis({ reaccion, corrida, fase, modoColor }: { reaccion: ReaccionId; corrida: number; fase: FaseSintesis; modoColor: string }) {
  const g = REACCIONES_GEO[reaccion];
  const r = REACCIONES.find((x) => x.id === reaccion)!;
  const esFerm = reaccion === "fermentacion";
  const n = g.el.length;
  const nbR = g.bR.length / 4;
  const nbP = g.bP.length / 4;
  const atomos = useRef<THREE.InstancedMesh>(null);
  const halos = useRef<THREE.InstancedMesh>(null);
  const enlaces = useRef<THREE.InstancedMesh>(null);
  const levadura = useRef<THREE.Group>(null);
  const t = useRef(0);
  const ultima = useRef(corrida);
  const pos = useRef<Float32Array>(new Float32Array(n * 3));
  const etqR = useRef<(HTMLDivElement | null)[]>([]);
  const etqP = useRef<(HTMLDivElement | null)[]>([]);
  const etqRompe = useRef<(HTMLDivElement | null)[]>([]);
  const etqForma = useRef<(HTMLDivElement | null)[]>([]);
  const marca = useMemo(() => new Set(g.marca), [g]);
  const colModo = useMemo(() => new THREE.Color(modoColor), [modoColor]);

  const lado = (i: number) => (esFerm ? 0 : g.molR[i] === 0 ? -1 : 1);

  const etiquetas = useMemo(() => {
    const grupoDe = (arr: number[], mol: number[], k: number, desplaza: boolean) => {
      const ids = mol.map((m, i) => (m === k ? i : -1)).filter((i) => i >= 0);
      if (!ids.length) return null;
      let cx = 0;
      let cz = 0;
      let minY = Infinity;
      ids.forEach((i) => {
        cx += arr[i * 3]! + (desplaza ? (esFerm ? 0 : g.molR[i] === 0 ? -1 : 1) * ACERCA : 0);
        cz += arr[i * 3 + 2]!;
        minY = Math.min(minY, arr[i * 3 + 1]!);
      });
      return [cx / ids.length, minY - 1.6, cz / ids.length] as Pt;
    };
    const nombresP = esFerm ? [r.p, r.p, r.q, r.q] : [r.p, r.q];
    const nombresR = r.b ? [r.a, r.b] : [r.a];
    const reactivos = nombresR.map((t2, k) => ({ t: t2, p: grupoDe(g.s, g.molR, k, true) })).filter((x) => x.p);
    const productos = nombresP.map((t2, k) => ({ t: t2, p: grupoDe(g.e, g.molP, k, false) })).filter((x) => x.p);
    const rotos: { t: string; p: Pt }[] = [];
    const nuevos: { t: string; p: Pt }[] = [];
    if (!esFerm) {
      for (let k = 0; k < nbR; k++) {
        if (!g.bR[k * 4 + 3]) continue;
        const a = g.bR[k * 4]!;
        const b = g.bR[k * 4 + 1]!;
        const d = lado(a) * ACERCA;
        const d2 = lado(b) * ACERCA;
        rotos.push({ t: `${g.el[a]}–${g.el[b]}`, p: [(g.s[a * 3]! + d + g.s[b * 3]! + d2) / 2, (g.s[a * 3 + 1]! + g.s[b * 3 + 1]!) / 2 + 1.5, (g.s[a * 3 + 2]! + g.s[b * 3 + 2]!) / 2] });
      }
      for (let k = 0; k < nbP; k++) {
        if (!g.bP[k * 4 + 3]) continue;
        const a = g.bP[k * 4]!;
        const b = g.bP[k * 4 + 1]!;
        nuevos.push({ t: `${g.el[a]}–${g.el[b]}`, p: [(g.e[a * 3]! + g.e[b * 3]!) / 2, (g.e[a * 3 + 1]! + g.e[b * 3 + 1]!) / 2 + 1.5, (g.e[a * 3 + 2]! + g.e[b * 3 + 2]!) / 2] });
      }
    }
    return { reactivos, productos, rotos, nuevos };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, r, esFerm]);

  useFrame(({ clock }, dt) => {
    if (ultima.current !== corrida) {
      ultima.current = corrida;
      t.current = 0;
    }
    if (fase === "listo") t.current = 0;
    else if (fase === "hecho") t.current = 99;
    else t.current += Math.min(dt, 0.1);
    const T = t.current;
    const P = pos.current;
    const A = atomos.current;
    const E = enlaces.current;
    const Hm = halos.current;
    if (!A || !E || !Hm) return;
    prepararColor(A);
    prepararColor(E);
    prepararColor(Hm);

    const acerca = 1 - ease(T / T_ROMPE);
    const u = ease((T - T_MUEVE) / D_MUEVE);
    const mezcla = ease((u - 0.7) / 0.3);
    const flota = fase === "listo" ? Math.sin(clock.elapsedTime * 1.3) * 0.12 : 0;
    for (let i = 0; i < n; i++) {
      const sx = g.s[i * 3]! + lado(i) * ACERCA * acerca;
      const sy = g.s[i * 3 + 1]! + flota * lado(i);
      const sz = g.s[i * 3 + 2]!;
      let x = sx;
      let y = sy;
      let z = sz;
      if (u > 0) {
        const f = g.frag[i]!;
        const o = f * 10;
        QB.set(g.fr[o + 1]!, g.fr[o + 2]!, g.fr[o + 3]!, g.fr[o]!);
        QA.identity().slerp(QB, u);
        VB.set(g.s[i * 3]! - g.fr[o + 4]!, g.s[i * 3 + 1]! - g.fr[o + 5]!, g.s[i * 3 + 2]! - g.fr[o + 6]!).applyQuaternion(QA);
        const rx = g.fr[o + 4]! + (g.fr[o + 7]! - g.fr[o + 4]!) * u + VB.x;
        const ry = g.fr[o + 5]! + (g.fr[o + 8]! - g.fr[o + 5]!) * u + VB.y;
        const rz = g.fr[o + 6]! + (g.fr[o + 9]! - g.fr[o + 6]!) * u + VB.z;
        x = rx + (g.e[i * 3]! - rx) * mezcla;
        y = ry + (g.e[i * 3 + 1]! - ry) * mezcla;
        z = rz + (g.e[i * 3 + 2]! - rz) * mezcla;
        if (esFerm) {
          // Los átomos viajan por dentro de la levadura: arco hacia el centro.
          const arco = Math.sin(u * Math.PI) * 0.55;
          x *= 1 - arco;
          y *= 1 - arco;
          z *= 1 - arco;
        }
      }
      P[i * 3] = x;
      P[i * 3 + 1] = y;
      P[i * 3 + 2] = z;
      const e = g.el[i]!;
      ponerEsfera(A, i, x, y, z, RADIO_EL[e] ?? 0.3);
      A.setColorAt(i, COL.set(COLOR_EL[e] ?? "#ffffff"));
      const pulso = 1 + 0.15 * Math.sin(clock.elapsedTime * 5);
      if (marca.has(i) && (T < T_MUEVE || T >= T_PRODUCTOS)) {
        ponerEsfera(Hm, i, x, y, z, (RADIO_EL[e] ?? 0.3) * (esFerm ? 1.6 : 2.1) * pulso);
        Hm.setColorAt(i, T >= T_PRODUCTOS ? COL.set(esFerm ? "#fbbf24" : VERDE) : esFerm ? COL.set("#fbbf24") : colModo);
      } else ocultar(Hm, i);
    }

    let slot = 0;
    for (let k = 0; k < nbR; k++) {
      const a = g.bR[k * 4]!;
      const b = g.bR[k * 4 + 1]!;
      const o = g.bR[k * 4 + 2]!;
      const rompe = g.bR[k * 4 + 3] === 1;
      if (T >= T_PRODUCTOS || (rompe && T >= T_MUEVE)) {
        ocultar(E, slot);
        ocultar(E, slot + 1);
      } else if (rompe) {
        const frac = 1 - ease((T - T_ROMPE) / (T_MUEVE - T_ROMPE));
        const brillo = 0.55 + 0.45 * Math.sin(clock.elapsedTime * (T > 0 ? 14 : 4));
        COL.set(COLOR_ENLACE).lerp(COL2.set(ROJO), T > 0 ? 1 : 0.6 + 0.4 * brillo);
        ponerEnlace(E, slot, P, a, b, o, Math.max(frac, 0.001), COL);
      } else ponerEnlace(E, slot, P, a, b, o, 1, COL2.set(COLOR_ENLACE));
      slot += 2;
    }
    for (let k = 0; k < nbP; k++) {
      const a = g.bP[k * 4]!;
      const b = g.bP[k * 4 + 1]!;
      const o = g.bP[k * 4 + 2]!;
      const forma = g.bP[k * 4 + 3] === 1;
      if (forma && T >= T_FORMA) ponerEnlace(E, slot, P, a, b, o, ease((T - T_FORMA) / 0.9), COL.set(VERDE));
      else if (!forma && T >= T_PRODUCTOS) ponerEnlace(E, slot, P, a, b, o, 1, COL2.set(COLOR_ENLACE));
      else {
        ocultar(E, slot);
        ocultar(E, slot + 1);
      }
      slot += 2;
    }
    terminar(A);
    terminar(E);
    terminar(Hm);

    etqR.current.forEach((d) => {
      if (d) d.style.opacity = T < 1.6 ? "1" : "0";
    });
    etqP.current.forEach((d) => {
      if (d) d.style.opacity = T >= 3.9 ? "1" : "0";
    });
    etqRompe.current.forEach((d) => {
      if (d) d.style.opacity = T < 1.9 ? "1" : "0";
    });
    etqForma.current.forEach((d) => {
      if (d) d.style.opacity = T >= 3.5 ? "1" : "0";
    });
    if (levadura.current) {
      const s = 1 + 0.03 * Math.sin(clock.elapsedTime * 1.8) + (T > T_MUEVE && T < T_PRODUCTOS + 0.5 ? 0.06 * Math.sin(T * 12) : 0);
      levadura.current.scale.setScalar(s);
    }
  });

  const caja = (txt: ReactNode, col: string, fs = 11) => (
    <div
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        background: "rgba(4,10,22,0.86)",
        border: `1px solid ${col}`,
        color: "#fff",
        fontSize: fs,
        fontWeight: 800,
        whiteSpace: "nowrap",
        transition: "opacity .35s",
      }}
    >
      {txt}
    </div>
  );

  return (
    <group>
      <group scale={ESCALA_SINTESIS} position={[0, -0.2, 0]}>
        {esFerm && (
          <group ref={levadura}>
            <mesh>
              <sphereGeometry args={[4.6, 40, 30]} />
              <meshBasicMaterial color="#fcd34d" transparent opacity={0.045} depthWrite={false} />
            </mesh>
            <mesh position={[3.3, 3.3, -0.6]}>
              <sphereGeometry args={[1.7, 28, 20]} />
              <meshBasicMaterial color="#fcd34d" transparent opacity={0.045} depthWrite={false} />
            </mesh>
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[4.6, 0.05, 8, 96]} />
              <meshBasicMaterial color="#fcd34d" transparent opacity={0.35} />
            </mesh>
            <Html position={[0, 5.4, 0]} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ padding: "3px 9px", borderRadius: 999, background: "rgba(4,10,22,0.8)", border: "1px solid #fcd34daa", color: "#fde68a", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>
                Levadura (Saccharomyces cerevisiae)
              </div>
            </Html>
            <mesh position={[-1.6, -2.2, -2.2]}>
              <sphereGeometry args={[1.1, 24, 18]} />
              <meshStandardMaterial color="#a16207" transparent opacity={0.2} depthWrite={false} />
            </mesh>
          </group>
        )}
        <instancedMesh key={`a-${reaccion}`} ref={atomos} args={[GEO_ESFERA, undefined, n]} castShadow frustumCulled={false}>
          <meshStandardMaterial roughness={0.3} metalness={0.12} />
        </instancedMesh>
        <instancedMesh key={`b-${reaccion}`} ref={enlaces} args={[GEO_CIL, undefined, (nbR + nbP) * 2]} frustumCulled={false}>
          <meshStandardMaterial roughness={0.35} metalness={0.4} toneMapped={false} />
        </instancedMesh>
        <instancedMesh key={`h-${reaccion}`} ref={halos} args={[GEO_ESFERA, undefined, n]} frustumCulled={false}>
          <meshBasicMaterial transparent opacity={0.28} depthWrite={false} toneMapped={false} />
        </instancedMesh>

        {etiquetas.reactivos.map((x, k) => (
          <Html key={`r${k}`} position={x.p!} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div
              ref={(d) => {
                etqR.current[k] = d;
              }}
            >
              {caja(
                <>
                  {x.t.nombre} · <Formula f={x.t.formula} />
                </>,
                "rgba(255,255,255,0.25)",
                11.5,
              )}
            </div>
          </Html>
        ))}
        {etiquetas.productos.map((x, k) => (
          <Html key={`p${k}`} position={x.p!} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div
              ref={(d) => {
                etqP.current[k] = d;
              }}
              style={{ opacity: 0 }}
            >
              {caja(
                <>
                  {x.t.nombre} · <Formula f={x.t.formula} />
                </>,
                k === 0 ? `${VERDE}aa` : "rgba(255,255,255,0.25)",
                11.5,
              )}
            </div>
          </Html>
        ))}
        {etiquetas.rotos.length > 0 && (
          <group>
            {etiquetas.rotos.map((x, k) => (
              <Html key={`x${k}`} position={x.p} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                <div
                  ref={(d) => {
                    etqRompe.current[k] = d;
                  }}
                  style={{ display: "flex", gap: 4 }}
                >
                  {caja(`✂ ${x.t}`, ROJO, 10.5)}
                </div>
              </Html>
            ))}
          </group>
        )}
        {etiquetas.nuevos.map((x, k) => (
          <Html key={`n${k}`} position={x.p} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div
              ref={(d) => {
                etqForma.current[k] = d;
              }}
              style={{ opacity: 0 }}
            >
              {caja(`+ ${x.t}`, VERDE, 10.5)}
            </div>
          </Html>
        ))}
      </group>
      <group position={[8.2, -3.3, -5.2]} scale={1.05}>
        <Matraz color={esFerm ? "#fde047" : reaccion === "ester" ? "#fef08a" : "#e2e8f0"} activo={fase === "reaccionando"} />
        <Etiqueta pos={[0, -0.45, 1.1]} fs={10.5} df={11}>
          <i className="fa-solid fa-temperature-half" style={{ color: "#fb923c" }} />
          {r.industria === "farmaceutica" ? "Matraz" : esFerm ? "Biorreactor" : "Matraz a reflujo"}
        </Etiqueta>
      </group>
      <mesh position={[0, -3.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#0b1628" roughness={0.9} />
      </mesh>
      <mesh position={[0, -3.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.6, 5.7, 96]} />
        <meshBasicMaterial color={modoColor} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Objetos cotidianos (productos y muestras)
 * ════════════════════════════════════════════════════════════════════════ */

function Objeto({ tipo, color }: { tipo: ObjetoId | "gas" | "liquido" | "cera" | "quebradizo" | "engrane"; color?: string }) {
  switch (tipo) {
    case "tableta":
      return (
        <group>
          {[
            [-0.35, 0.09, 0.1, 0],
            [0.3, 0.09, -0.15, 0.6],
            [0.05, 0.27, 0.05, 0.3],
          ].map(([x, y, z, ry], k) => (
            <group key={k} position={[x!, y!, z!]} rotation={[k === 2 ? 0.35 : 0, ry!, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.38, 0.38, 0.16, 32]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.081, 0]}>
                <boxGeometry args={[0.6, 0.01, 0.04]} />
                <meshStandardMaterial color="#cbd5e1" />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "grageas":
      return (
        <group>
          {[-0.4, 0, 0.4].map((x, k) => (
            <mesh key={k} position={[x, 0.2, k * 0.15 - 0.15]} rotation={[Math.PI / 2, 0, 0.4 * k]} castShadow>
              <capsuleGeometry args={[0.17, 0.42, 8, 16]} />
              <meshStandardMaterial color={k === 1 ? "#fb923c" : "#f97316"} roughness={0.25} metalness={0.1} />
            </mesh>
          ))}
        </group>
      );
    case "frasco":
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 1, 32]} />
            <meshStandardMaterial color="#b45309" transparent opacity={0.85} roughness={0.15} />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.22, 32]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.55, 0.43]}>
            <boxGeometry args={[0.55, 0.4, 0.01]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, 0.55, 0.44]}>
            <boxGeometry args={[0.1, 0.26, 0.01]} />
            <meshBasicMaterial color="#16a34a" />
          </mesh>
          <mesh position={[0, 0.55, 0.445]}>
            <boxGeometry args={[0.26, 0.1, 0.01]} />
            <meshBasicMaterial color="#16a34a" />
          </mesh>
        </group>
      );
    case "vainas":
      return (
        <group>
          {[-0.18, 0, 0.18].map((x, k) => (
            <mesh key={k} position={[x, 0.08, 0]} rotation={[0, 0, Math.PI / 2 + (k - 1) * 0.12]} castShadow>
              <capsuleGeometry args={[0.055, 1.3, 6, 12]} />
              <meshStandardMaterial color="#3b2412" roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0.1, 0.18, 0.35]}>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshStandardMaterial color="#fef9c3" roughness={0.6} />
          </mesh>
        </group>
      );
    case "caramelo":
      return (
        <group position={[0, 0.3, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 24, 18]} />
            <meshStandardMaterial color="#facc15" roughness={0.15} metalness={0.1} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.42, 0, 0]} rotation={[0, 0, (s * Math.PI) / 2]}>
              <coneGeometry args={[0.22, 0.3, 12]} />
              <meshStandardMaterial color="#fde047" roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    case "refresco":
      return (
        <group>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 1.2, 32]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.22, 0]}>
            <cylinderGeometry args={[0.32, 0.36, 0.05, 32]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.65, 0.365]}>
            <boxGeometry args={[0.36, 0.08, 0.01]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>
      );
    case "botella":
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 1.1, 32]} />
            <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.45} roughness={0.05} />
          </mesh>
          <mesh position={[0, 1.28, 0]}>
            <cylinderGeometry args={[0.12, 0.34, 0.38, 32]} />
            <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.45} roughness={0.05} />
          </mesh>
          <mesh position={[0, 1.53, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.12, 20]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.345, 0.345, 0.3, 32, 1, true]} />
            <meshStandardMaterial color="#16a34a" side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    case "carrete":
      return (
        <group position={[0, 0.5, 0]}>
          {[-0.42, 0.42].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow>
              <cylinderGeometry args={[0.46, 0.46, 0.07, 32]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
          ))}
          <mesh>
            <cylinderGeometry args={[0.36, 0.36, 0.78, 32]} />
            <meshStandardMaterial color={color ?? "#e2e8f0"} roughness={0.35} />
          </mesh>
        </group>
      );
    case "bolsa":
      return (
        <group position={[0, 0.62, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 1.05, 0.12]} />
            <meshPhysicalMaterial color="#f1f5f9" transparent opacity={0.75} roughness={0.5} />
          </mesh>
          {[-0.25, 0.25].map((x) => (
            <mesh key={x} position={[x, 0.62, 0]}>
              <torusGeometry args={[0.14, 0.03, 8, 20, Math.PI]} />
              <meshPhysicalMaterial color="#f1f5f9" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      );
    case "engrane":
      return (
        <group position={[0, 0.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.22, 32]} />
            <meshStandardMaterial color="#f5f5f4" roughness={0.45} />
          </mesh>
          {Array.from({ length: 10 }, (_, k) => {
            const a = (k / 10) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(a) * 0.56, 0, Math.sin(a) * 0.56]} rotation={[0, -a, 0]}>
                <boxGeometry args={[0.18, 0.22, 0.14]} />
                <meshStandardMaterial color="#f5f5f4" roughness={0.45} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      );
    case "gas":
      return (
        <group position={[0, 0.6, 0]}>
          {Array.from({ length: 10 }, (_, k) => (
            <mesh key={k} position={[Math.sin(k * 2.1) * 0.45, Math.cos(k * 1.3) * 0.35, Math.sin(k * 3.7) * 0.35]}>
              <sphereGeometry args={[0.07, 12, 10]} />
              <meshStandardMaterial color="#cbd5e1" transparent opacity={0.7} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.7, 24, 18]} />
            <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.08} depthWrite={false} />
          </mesh>
        </group>
      );
    case "liquido":
      return (
        <group>
          <mesh position={[0, 0.03, 0]} scale={[1, 0.08, 1]}>
            <sphereGeometry args={[0.6, 28, 16]} />
            <meshPhysicalMaterial color="#fde68a" transparent opacity={0.75} roughness={0.05} />
          </mesh>
          <mesh position={[0.1, 0.55, 0]} scale={[1, 1.35, 1]}>
            <sphereGeometry args={[0.13, 18, 14]} />
            <meshPhysicalMaterial color="#fde68a" transparent opacity={0.8} roughness={0.05} />
          </mesh>
        </group>
      );
    case "cera":
      return (
        <group>
          {[
            [0, 0.18, 0, 0.5],
            [-0.36, 0.1, 0.25, 0.25],
            [0.35, 0.08, 0.2, 0.18],
          ].map(([x, y, z, s], k) => (
            <mesh key={k} position={[x!, y!, z!]} rotation={[0.2 * k, 0.5 * k, 0.1]} castShadow>
              <boxGeometry args={[s!, s! * 0.7, s!]} />
              <meshStandardMaterial color="#f5f0dc" roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    case "quebradizo":
    default:
      return (
        <group>
          {[
            [-0.25, 0.04, 0, 0.3],
            [0.2, 0.04, 0.1, -0.5],
            [0.02, 0.04, -0.28, 1.2],
          ].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x!, y!, z!]} rotation={[0, r!, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.06, 3]} />
              <meshStandardMaterial color="#e7e5e4" roughness={0.6} />
            </mesh>
          ))}
        </group>
      );
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. PLANTA DE POLÍMEROS
 * ════════════════════════════════════════════════════════════════════════ */

const RITMO = 1.7;

const RESERVAS: Record<PolimeroId, { mol: MolId; p: Pt }[]> = {
  pe: [
    { mol: "etileno", p: [-4.6, 2.9, -4] },
    { mol: "etileno", p: [-1.6, 3.5, -5] },
    { mol: "etileno", p: [1.8, 3.3, -4.6] },
    { mol: "etileno", p: [4.8, 2.9, -4] },
  ],
  pet: [
    { mol: "tereftalico", p: [-4.2, 3.1, -4.4] },
    { mol: "etilenglicol", p: [-1.2, 3.4, -5] },
    { mol: "tereftalico", p: [1.8, 3.3, -4.8] },
    { mol: "etilenglicol", p: [4.7, 2.9, -4.2] },
  ],
  nylon: [
    { mol: "adipico", p: [-4.2, 3.1, -4.4] },
    { mol: "hmda", p: [-0.9, 3.5, -5] },
    { mol: "adipico", p: [2.4, 3.3, -4.8] },
    { mol: "hmda", p: [5.2, 2.9, -4.2] },
  ],
};

function muestraDe(pol: PolimeroId, nivel: number): { tipo: Parameters<typeof Objeto>[0]["tipo"]; color?: string } {
  if (pol === "pe") return [{ tipo: "gas" as const }, { tipo: "liquido" as const }, { tipo: "cera" as const }, { tipo: "quebradizo" as const }, { tipo: "bolsa" as const }, { tipo: "carrete" as const, color: "#f8fafc" }][Math.min(nivel, 5)]!;
  if (nivel <= 1) return { tipo: "cera" };
  if (nivel === 2) return { tipo: "quebradizo" };
  if (nivel === 3) return { tipo: "carrete", color: pol === "pet" ? "#93c5fd" : "#fda4af" };
  return pol === "pet" ? { tipo: "botella" } : { tipo: "engrane" };
}

function Reserva({ mol, p, i }: { mol: MolId; p: Pt; i: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = p[1] + Math.sin(clock.elapsedTime * 0.8 + i * 1.7) * 0.18;
    ref.current.rotation.x = clock.elapsedTime * 0.2 + i;
    ref.current.rotation.z = clock.elapsedTime * 0.15 + i * 0.5;
  });
  const g = MOLS[mol];
  return (
    <group ref={ref} position={p}>
      <MoleculaEstatica el={g.el} xyz={g.xyz} b={g.b} escala={0.3} halo={null} haloColor="#fff" />
    </group>
  );
}

function EscenaPolimeros({ polimero, unidades, nivel, extraEtq, modoColor }: { polimero: PolimeroId; unidades: number; nivel: number; extraEtq: string | null; modoColor: string }) {
  const pol = POLIMEROS.find((x) => x.id === polimero)!;
  const maxV = pol.maxVisibles;
  const cad = useMemo(() => construirCadena(polimero, maxV), [polimero, maxV]);
  const n = cad.el.length;
  const nb = cad.b.length;
  const nU = cad.uniones.length;
  const largo = cad.paso * maxV;
  const escala = Math.min(0.46, 11.5 / largo);
  const x0 = -largo / 2;
  const atomos = useRef<THREE.InstancedMesh>(null);
  const enlaces = useRef<THREE.InstancedMesh>(null);
  const aguaO = useRef<THREE.InstancedMesh>(null);
  const aguaH = useRef<THREE.InstancedMesh>(null);
  const punta = useRef<THREE.Mesh>(null);
  const prog = useRef<Float32Array>(new Float32Array(maxV));
  const agua = useRef<Float32Array>(new Float32Array(nU).fill(-1));
  const pos = useRef<Float32Array>(new Float32Array(n * 3));
  const union = useMemo(() => new Set(cad.union), [cad]);
  const colModo = useMemo(() => new THREE.Color(modoColor), [modoColor]);
  const condensacion = pol.tipo === "condensacion";

  useFrame(({ clock }, dt) => {
    const A = atomos.current;
    const E = enlaces.current;
    if (!A || !E) return;
    prepararColor(A);
    prepararColor(E);
    const pr = prog.current;
    const paso = Math.min(dt, 0.1) * RITMO;
    for (let u = 0; u < maxV; u++) {
      if (u < unidades && (u === 0 || pr[u - 1]! > 0.98)) pr[u] = Math.min(1, pr[u]! + paso);
    }
    for (let u = maxV - 1; u >= 0; u--) {
      if (u >= unidades && (u === maxV - 1 || pr[u + 1]! < 0.02)) pr[u] = Math.max(0, pr[u]! - paso * 2.5);
    }
    const P = pos.current;
    for (let i = 0; i < n; i++) {
      const u = cad.unidad[i]!;
      const pu = pr[u]!;
      const q = 1 - ease(pu);
      const res = cad.residuo[i]!;
      const ox = polimero === "pe" ? 7 : res === 0 ? -3 : 3;
      const oy = polimero === "pe" ? 6 : res === 0 ? 8 : -8;
      const p = cad.p[i]!;
      const x = x0 + p[0] + ox * q;
      const y = p[1] + oy * q + Math.sin(clock.elapsedTime * 3 + i) * 0.15 * q;
      const z = p[2] + 2.5 * q;
      P[i * 3] = x;
      P[i * 3 + 1] = y;
      P[i * 3 + 2] = z;
      const e = cad.el[i]!;
      if (pu <= 0.001) ocultar(A, i);
      else ponerEsfera(A, i, x, y, z, (RADIO_EL[e] ?? 0.3) * Math.min(1, 0.35 + pu));
      A.setColorAt(i, COL.set(COLOR_EL[e] ?? "#ffffff"));
    }
    for (let k = 0; k < nb; k++) {
      const [a, b, o] = cad.b[k]!;
      const pa = pr[cad.unidad[a]!]!;
      const pb = pr[cad.unidad[b]!]!;
      if (union.has(k)) {
        const f = ease((Math.min(pa, pb) - 0.82) / 0.18);
        if (f <= 0) {
          ocultar(E, k * 2);
          ocultar(E, k * 2 + 1);
        } else ponerEnlace(E, k * 2, P, a, b, o, f, colModo);
      } else if (pa > 0.02 && pb > 0.02) ponerEnlace(E, k * 2, P, a, b, o, 1, COL2.set(COLOR_ENLACE));
      else {
        ocultar(E, k * 2);
        ocultar(E, k * 2 + 1);
      }
    }
    terminar(A);
    terminar(E);

    const W = agua.current;
    const O = aguaO.current;
    const Hh = aguaH.current;
    if (O && Hh) {
      for (let j = 0; j < nU; j++) {
        const un = cad.uniones[j]!;
        const pu = pr[un.unidad]!;
        if (condensacion && W[j]! < 0 && pu >= 0.9) W[j] = 0;
        if (pu < 0.5) W[j] = -1;
        if (W[j]! >= 0 && W[j]! < 50) W[j] = W[j]! + Math.min(dt, 0.1);
        const tw = W[j]!;
        if (tw >= 0 && tw < 2.6) {
          const s = Math.min(1, tw * 4) * (1 - ease((tw - 1.8) / 0.8));
          const wx = x0 + un.p[0];
          const wy = un.p[1] + 1.2 + tw * 3.2;
          const wz = un.p[2] + 1.2 + tw * 0.6;
          ponerEsfera(O, j, wx, wy, wz, 0.34 * s);
          ponerEsfera(Hh, j * 2, wx + 0.6, wy + 0.45, wz, 0.22 * s);
          ponerEsfera(Hh, j * 2 + 1, wx - 0.6, wy + 0.45, wz, 0.22 * s);
        } else {
          ocultar(O, j);
          ocultar(Hh, j * 2);
          ocultar(Hh, j * 2 + 1);
        }
      }
      O.instanceMatrix.needsUpdate = true;
      Hh.instanceMatrix.needsUpdate = true;
    }
    if (punta.current) {
      let ultimo = -1;
      for (let u = 0; u < maxV; u++) if (pr[u]! > 0.5) ultimo = u;
      punta.current.visible = !condensacion && ultimo >= 0;
      punta.current.position.set(x0 + (ultimo + 1) * cad.paso - 0.4, 0.3, 0);
      punta.current.scale.setScalar(0.55 + 0.12 * Math.sin(clock.elapsedTime * 6));
    }
  });

  const muestra = muestraDe(polimero, nivel);
  return (
    <group>
      <group scale={escala} position={[0, 0.6, 0]}>
        <instancedMesh ref={atomos} args={[GEO_ESFERA, undefined, n]} castShadow frustumCulled={false}>
          <meshStandardMaterial roughness={0.3} metalness={0.12} />
        </instancedMesh>
        <instancedMesh ref={enlaces} args={[GEO_CIL, undefined, nb * 2]} frustumCulled={false}>
          <meshStandardMaterial roughness={0.35} metalness={0.4} toneMapped={false} />
        </instancedMesh>
        <instancedMesh ref={aguaO} args={[GEO_ESFERA, undefined, Math.max(1, nU)]} frustumCulled={false}>
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.6} />
        </instancedMesh>
        <instancedMesh ref={aguaH} args={[GEO_ESFERA, undefined, Math.max(2, nU * 2)]} frustumCulled={false}>
          <meshStandardMaterial color="#e0f2fe" emissive="#bae6fd" emissiveIntensity={0.3} />
        </instancedMesh>
        <mesh ref={punta} visible={false}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.45} toneMapped={false} />
        </mesh>
      </group>
      {extraEtq && (
        <Etiqueta pos={[5.2, 1.9, 0]} col={`${modoColor}aa`} fs={11} df={11}>
          <i className="fa-solid fa-ellipsis" style={{ color: modoColor }} />
          {extraEtq}
        </Etiqueta>
      )}
      <Etiqueta pos={condensacion ? [-4.2, -0.9, 0.6] : [2.4, -0.8, 0.6]} fs={10.5} df={11} col={`${modoColor}88`}>
        <i className="fa-solid fa-link" style={{ color: modoColor }} />
        {condensacion ? `Enlaces ${pol.enlace.split(" ")[0]} en color` : "Punta activa de la cadena"}
      </Etiqueta>
      {RESERVAS[polimero].map((r, k) => (
        <Reserva key={`${polimero}-${k}`} mol={r.mol} p={r.p} i={k} />
      ))}
      <Etiqueta pos={[3.4, 4.6, -4.6]} fs={11} df={11}>
        <i className="fa-solid fa-flask" style={{ color: modoColor }} />
        Monómeros: {pol.monomeros.map((m) => m.nombre).join(" + ")}
      </Etiqueta>
      {/* Muestra del material que resulta */}
      <group position={[5.6, -3.3, -0.6]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.95, 1.05, 0.6, 40]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.61, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.93, 0.03, 8, 64]} />
          <meshBasicMaterial color={modoColor} />
        </mesh>
        <Etiqueta pos={[0, 2.35, 0]} fs={10.5} df={11} col={`${modoColor}88`}>
          <i className="fa-solid fa-cube" style={{ color: modoColor }} />
          Material resultante
        </Etiqueta>
        <group position={[0, 0.62, 0]} key={`${polimero}-${nivel}`}>
          <Objeto tipo={muestra.tipo} color={muestra.color} />
        </group>
      </group>
      <mesh position={[0, -3.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#0d1426" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. DEL GRUPO FUNCIONAL AL PRODUCTO
 * ════════════════════════════════════════════════════════════════════════ */

/** Exhibidores altos al fondo: su charola queda por encima de la molécula en pantalla. */
const ALTO_PUESTO = 5.6;
const PUESTOS: Record<Industria, Pt> = {
  farmaceutica: [-6.6, -3.3, -7.5],
  alimentaria: [0, -3.3, -8.2],
  materiales: [6.6, -3.3, -7.5],
};
const INDUSTRIAS_ORDEN: Industria[] = ["farmaceutica", "alimentaria", "materiales"];
const POS_PRODUCTO: Pt = [-6.6, -3.3, -1.4];

function moleculaDeProducto(id: string): { el: string; xyz: number[]; b: number[]; grupos: Partial<Record<GrupoId, number[]>>; radio: number } {
  const pr = PRODUCTOS.find((p) => p.id === id) ?? PRODUCTOS[0]!;
  if (pr.mol === "pet" || pr.mol === "nylon") {
    const c = construirCadena(pr.mol, 1);
    let cx = 0;
    let cy = 0;
    c.p.forEach((q) => {
      cx += q[0];
      cy += q[1];
    });
    cx /= c.p.length;
    cy /= c.p.length;
    const xyz = c.p.flatMap((q) => [q[0] - cx, q[1] - cy, q[2]]);
    const idx = c.grupo.map((gr, i) => (gr ? i : -1)).filter((i) => i >= 0);
    const radio = Math.max(...c.p.map((q) => Math.hypot(q[0] - cx, q[1] - cy, q[2])));
    return { el: c.el.join(""), xyz, b: c.b.flat(), grupos: { [pr.grupo]: idx }, radio };
  }
  const g = MOLS[pr.mol as MolId];
  let radio = 0;
  for (let i = 0; i < g.el.length; i++) radio = Math.max(radio, Math.hypot(g.xyz[i * 3]!, g.xyz[i * 3 + 1]!, g.xyz[i * 3 + 2]!));
  return { el: g.el, xyz: g.xyz, b: g.b, grupos: GRUPOS_MOL[pr.mol as MolId] ?? {}, radio };
}

function ObjetoVolador({ objeto, destino, desde, escala }: { objeto: ObjetoId; destino: Pt; desde: Pt; escala: number }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current) return;
    t.current = Math.min(1, t.current + Math.min(dt, 0.1) * 0.9);
    const u = ease(t.current);
    ref.current.position.set(desde[0] + (destino[0] - desde[0]) * u, desde[1] + (destino[1] - desde[1]) * u + Math.sin(u * Math.PI) * 2.2, desde[2] + (destino[2] - desde[2]) * u);
    ref.current.rotation.y = u * Math.PI * 2;
  });
  return (
    <group ref={ref} position={desde} scale={escala}>
      <Objeto tipo={objeto} />
    </group>
  );
}

function EscenaProductos({ productoId, resaltar, resaltarOk, clasificados, modoColor }: { productoId: string; resaltar: GrupoId | null; resaltarOk: boolean; clasificados: string[]; modoColor: string }) {
  const pr = PRODUCTOS.find((p) => p.id === productoId) ?? PRODUCTOS[0]!;
  const mol = useMemo(() => moleculaDeProducto(productoId), [productoId]);
  const escala = Math.min(0.85, 2.7 / mol.radio);
  const halo = resaltar ? (mol.grupos[resaltar] ?? null) : null;
  const pedestal = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (pedestal.current) (pedestal.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + 0.12 * Math.sin(clock.elapsedTime * 2);
  });
  const yaEsta = clasificados.includes(pr.id);
  return (
    <group>
      <group position={[0, -0.2, 1.2]}>
        <MoleculaEstatica key={productoId} el={mol.el} xyz={mol.xyz} b={mol.b} escala={escala} halo={halo} haloColor={resaltarOk ? VERDE : "#fbbf24"} girar={0.35} />
      </group>
      <mesh position={[0, -3.0, 1.2]} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.7, 0.6, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh ref={pedestal} position={[0, -2.69, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.38, 0.03, 8, 72]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.25} />
      </mesh>
      <Etiqueta pos={[-3.9, 1.6, 1.2]} col={`${modoColor}aa`} fs={12} df={11}>
        <i className="fa-solid fa-atom" style={{ color: modoColor }} />
        {pr.molEtq} · <Formula f={pr.formula} />
      </Etiqueta>
      {resaltar && (
        <Etiqueta pos={[3.9, 1.6, 1.2]} col={resaltarOk ? `${VERDE}aa` : "#fbbf24aa"} fs={12} df={11}>
          {halo && halo.length ? `${GRUPOS[resaltar].etq} ${GRUPOS[resaltar].formula}` : `Sin ${GRUPOS[resaltar].etq.toLowerCase()}`}
        </Etiqueta>
      )}

      {INDUSTRIAS_ORDEN.map((ind) => {
        const p = PUESTOS[ind];
        const d = INDUSTRIAS[ind];
        return (
          <group key={ind} position={p}>
            <mesh position={[0, ALTO_PUESTO / 2 - 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.5, ALTO_PUESTO - 0.6, 0.5]} />
              <meshStandardMaterial color="#1b2740" roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0, ALTO_PUESTO - 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.4, 0.6, 1.7]} />
              <meshStandardMaterial color="#172236" roughness={0.5} metalness={0.2} />
            </mesh>
            <mesh position={[0, ALTO_PUESTO + 0.01, 0.86]}>
              <boxGeometry args={[3.44, 0.04, 0.04]} />
              <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0.9} />
            </mesh>
            <Etiqueta pos={[0, ALTO_PUESTO + 1.5, 0]} col={`${d.color}aa`} fs={12} df={11}>
              <i className={`fa-solid ${d.icono}`} style={{ color: d.color }} />
              {d.etq}
            </Etiqueta>
          </group>
        );
      })}
      {clasificados.map((id) => {
        const x = PRODUCTOS.find((q) => q.id === id)!;
        const hermanos = PRODUCTOS.filter((q) => q.industria === x.industria);
        const k = hermanos.findIndex((q) => q.id === id);
        const base = PUESTOS[x.industria];
        const destino: Pt = [base[0] + (k - 1) * 1.05, base[1] + ALTO_PUESTO, base[2]];
        return <ObjetoVolador key={id} objeto={x.objeto} destino={destino} desde={id === productoId ? POS_PRODUCTO : destino} escala={0.72} />;
      })}
      {!yaEsta && (
        <group position={POS_PRODUCTO}>
          <mesh position={[0, 0.2, 0]} receiveShadow>
            <cylinderGeometry args={[1.0, 1.1, 0.4, 40]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <group position={[0, 0.41, 0]} scale={1.05}>
            <Objeto tipo={pr.objeto} />
          </group>
          <Etiqueta pos={[0, 2.4, 0]} fs={11} df={11}>
            {pr.etq}
          </Etiqueta>
        </group>
      )}
      <mesh position={[0, -3.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[11, 64]} />
        <meshStandardMaterial color="#0d1426" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function OrganicaIndustriaScene(p: OrganicaIndustriaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "sintesis") return { pos: [0, 2.6, 12.6], target: [0, -0.7, 0] };
    if (vista === "polimeros") return { pos: [0, 2.2, 13.4], target: [0, -0.4, 0] };
    return { pos: [0, 4.2, 14.5], target: [0, 0.2, -1] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento="#38bdf8" suelo={-3.28} />
      <pointLight position={[-6, 3, 5]} intensity={18} color={modoColor} />

      {vista === "sintesis" && <EscenaSintesis key={p.reaccion} reaccion={p.reaccion} corrida={p.corrida} fase={p.fase} modoColor={modoColor} />}
      {vista === "polimeros" && <EscenaPolimeros key={p.polimero} polimero={p.polimero} unidades={p.unidades} nivel={p.nivel} extraEtq={p.extraEtq} modoColor={modoColor} />}
      {vista === "productos" && <EscenaProductos productoId={p.productoId} resaltar={p.resaltar} resaltarOk={p.resaltarOk} clasificados={p.clasificados} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={5} maxDistance={24} maxPolarAngle={Math.PI * 0.52} minPolarAngle={Math.PI * 0.12} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.7} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
