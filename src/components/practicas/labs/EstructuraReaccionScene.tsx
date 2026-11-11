"use client";

/**
 * Escena 3D del laboratorio "Estructura de una reacción química" (CNEYT-III·O4).
 *
 * Tres modos; TODA la animación ocurre dentro de useFrame mutando refs (nunca en
 * el render — reglas del React Compiler):
 *  - anatomia:    arma la ecuación en 3D (reactivos · flecha · productos). Cada
 *    especie se dibuja con TANTAS moléculas como su coeficiente; según
 *    escena.foco resalta reactivos, la flecha, los productos, los coeficientes
 *    o los subíndices.
 *  - conservacion: la misma ecuación con barras de átomos por elemento a cada
 *    lado de la flecha. Si el alumno cambia un coeficiente (`libre`), las barras
 *    que dejan de coincidir se ponen naranjas.
 *  - simbologia:  un símbolo a la vez (el que elige el alumno) sobre un carrusel.
 *
 * Modelo bola-varilla: todos los átomos de la ecuación son UNA sola malla
 * instanciada y todos los enlaces OTRA (una fotosíntesis llega a ~70 esferas).
 * Cada especie reposa sobre su peana, sobre la mesa del <Escenario>.
 * Esquemática (no a escala): las fórmulas y los conteos de átomos son exactos.
 * Etiquetas con <Html> (NUNCA <Text> de drei: cuelga el chunk con Turbopack),
 * máx. 4 a la vez.
 */

import * as THREE from "three";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { ATOMO, METAL } from "./_vidrio";
import {
  type Modo,
  type Escena,
  type Reaccion,
  type Especie,
  contarAtomos,
  SIMBOLOS,
} from "./estructura-reaccion-data";

type Pt = [number, number, number];

export interface EstructuraReaccionSceneProps {
  modo: Modo;
  escena: Escena;
  reaccion: Reaccion;
  playing: boolean;
  modoColor: string;
  resetNonce: number;
  /** El alumno ya tocó un coeficiente: se muestran ambos lados y el veredicto. */
  libre: boolean;
  /** Símbolo elegido en la galería (modo simbología). */
  simbolo: number;
}

/* Colores por elemento químico (convención CPK aproximada) */
const ELEMENTO_COLOR: Record<string, string> = {
  H: "#e2e8f0",
  C: "#475569",
  O: "#ef4444",
  N: "#3b82f6",
  Cl: "#22c55e",
  Na: "#a855f7",
};

function colorElemento(el: string): string {
  return ELEMENTO_COLOR[el] ?? "#fbbf24";
}

function pillStyle(color: string, big = false): React.CSSProperties {
  return {
    padding: big ? "6px 14px" : "5px 12px",
    borderRadius: 999,
    background: "rgba(4,10,22,0.86)",
    border: `1px solid ${color}`,
    color: "#fff",
    fontSize: big ? 18 : 14,
    fontWeight: 800,
    whiteSpace: "nowrap",
    boxShadow: "0 6px 18px -8px #000",
  };
}

/* Etiqueta de tamaño fijo en píxeles (sin distanceFactor). Las `ancho` se
 * ocultan en pantallas angostas: su información ya está en el panel. */
function Etiqueta({ pos, color, children, big = false, ancho = false }: { pos: Pt; color: string; children: React.ReactNode; big?: boolean; ancho?: boolean }) {
  const w = useThree((st) => st.size.width);
  if (ancho && w < 640) return null;
  return (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={pillStyle(color, big)}>{children}</div>
    </Html>
  );
}

/* Geometrías compartidas por todas las mallas instanciadas. */
const GEO_ESFERA = new THREE.SphereGeometry(1, 24, 18);
const GEO_VARILLA = new THREE.CylinderGeometry(1, 1, 1, 10);
const GEO_PEANA = new THREE.CylinderGeometry(1, 1, 1, 40);
const GEO_BISEL = new THREE.TorusGeometry(1, 0.035, 10, 48);

/* ── Átomos de una molécula (índice 0 = centro) ─────────────────────────────── */
function atomosExpandidos(especie: Especie): string[] {
  const out: string[] = [];
  const entries = Object.entries(especie.atomos);
  // El átomo central es el «más central» químicamente: C, luego N, luego Cl/Na, luego O; H nunca.
  const pri = (el: string) => (el === "C" ? 4 : el === "N" ? 3 : el === "Cl" || el === "Na" ? 2 : el === "O" ? 1 : 0);
  entries.sort((a, b) => pri(b[0]) - pri(a[0]));
  for (const [el, n] of entries) for (let i = 0; i < n; i++) out.push(el);
  return out;
}

const R_ENLACE = 0.6;
const R_ENLACE_GRANDE = 0.9;

function radioAtomo(i: number, n: number): number {
  return i === 0 ? (n > 8 ? 0.26 : 0.3) : n > 8 ? 0.17 : 0.22;
}

/* Posición local de un átomo dentro de su molécula: geometría reconocible
 * (O₂ y CO₂ lineales, H₂O angular, CH₄ tetraédrica, moléculas grandes en esfera). */
function posLocal(i: number, n: number, centro: string): Pt {
  if (i === 0) return n === 2 ? [-R_ENLACE / 2, 0, 0] : [0, 0, 0];
  const k = i - 1;
  const m = n - 1;
  if (n === 2) return [R_ENLACE / 2, 0, 0];
  if (n === 3) {
    if (centro === "C") return [(k === 0 ? 1 : -1) * R_ENLACE, 0, 0];
    return [(k === 0 ? 1 : -1) * Math.sin(0.91) * R_ENLACE, Math.cos(0.91) * R_ENLACE, 0];
  }
  if (n === 5) {
    const t = (R_ENLACE / Math.sqrt(3)) * 1;
    const v: Pt[] = [
      [t, t, t],
      [t, -t, -t],
      [-t, t, -t],
      [-t, -t, t],
    ];
    return v[k] ?? [0, 0, 0];
  }
  if (n > 8) {
    const y = 1 - ((k + 0.5) * 2) / m;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = k * 2.39996;
    return [Math.cos(phi) * r * R_ENLACE_GRANDE, y * R_ENLACE_GRANDE, Math.sin(phi) * r * R_ENLACE_GRANDE];
  }
  const a = (k / m) * Math.PI * 2;
  return [Math.cos(a) * R_ENLACE, Math.sin(a) * R_ENLACE, ((k % 2) - 0.5) * 0.3];
}

/* Geometría de una especie: posiciones, radio horizontal (para el paso) y
 * cuánto baja por debajo de su centro (para apoyarla en la peana). */
interface Molde {
  lista: string[];
  pos: Pt[];
  rad: number[];
  rHoriz: number;
  bajo: number;
}

function moldeDe(e: Especie): Molde {
  const lista = atomosExpandidos(e);
  const n = lista.length;
  const centro = lista[0] ?? "";
  const pos = lista.map((_, i) => posLocal(i, n, centro));
  const rad = lista.map((_, i) => radioAtomo(i, n));
  let rHoriz = 0;
  let bajo = 0;
  pos.forEach((p, i) => {
    rHoriz = Math.max(rHoriz, Math.hypot(p[0], p[2]) + (rad[i] ?? 0));
    bajo = Math.max(bajo, -p[1] + (rad[i] ?? 0));
  });
  return { lista, pos, rad, rHoriz, bajo };
}

/* ── Layout de una ecuación en el eje X ───────────────────────────────────── */
interface Slot {
  tipo: "especie" | "mas" | "flecha";
  especie?: Especie;
  molde?: Molde;
  lado?: "react" | "prod";
  x: number;
  ancho: number;
  cols: number;
  esc: number; // escala de cada copia de la molécula
  paso: number; // separación entre copias
}

/* Base de las moléculas (y local) y alto de cada peana baja. */
const YB = -0.55;
const PEANA_H = 0.3;

function construirSlots(r: Reaccion): { slots: Slot[]; ancho: number } {
  const seq: Omit<Slot, "x">[] = [];
  const dimsEspecie = (e: Especie) => {
    const molde = moldeDe(e);
    const cols = e.coef <= 1 ? 1 : e.coef <= 2 ? 2 : 3;
    const esc = cols === 1 ? 1 : cols === 2 ? 0.85 : 0.7;
    const paso = (2 * molde.rHoriz + 0.12) * esc;
    return { molde, cols, esc, paso, ancho: cols * paso + 0.3 };
  };
  r.reactivos.forEach((e, i) => {
    if (i > 0) seq.push({ tipo: "mas", ancho: 0.9, cols: 1, esc: 1, paso: 1 });
    seq.push({ tipo: "especie", especie: e, lado: "react", ...dimsEspecie(e) });
  });
  seq.push({ tipo: "flecha", ancho: 1.6, cols: 1, esc: 1, paso: 1 });
  r.productos.forEach((e, i) => {
    if (i > 0) seq.push({ tipo: "mas", ancho: 0.9, cols: 1, esc: 1, paso: 1 });
    seq.push({ tipo: "especie", especie: e, lado: "prod", ...dimsEspecie(e) });
  });
  const total = seq.reduce((s, q) => s + q.ancho, 0);
  let cursor = -total / 2;
  const slots: Slot[] = seq.map((q) => {
    const x = cursor + q.ancho / 2;
    cursor += q.ancho;
    return { ...q, x };
  });
  return { slots, ancho: total };
}

/* ── Todos los átomos y todos los enlaces: DOS mallas instanciadas ─────────── */
interface AtomoInst {
  cx: number;
  cy: number;
  lx: number;
  ly: number;
  lz: number;
  radio: number;
  color: string;
  lado: "react" | "prod";
}

interface EnlaceInst {
  cx: number;
  cy: number;
  a: Pt;
  b: Pt;
  radio: number;
  lado: "react" | "prod";
}

const _o = new THREE.Object3D();
const _va = new THREE.Vector3();
const _vb = new THREE.Vector3();
const _vd = new THREE.Vector3();
const _arriba = new THREE.Vector3(0, 1, 0);

function Atomos({ reaccion, foco }: { reaccion: Reaccion; foco: Escena["foco"] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const enlacesMesh = useRef<THREE.InstancedMesh>(null);
  const t = useRef(0);
  const { slots } = useMemo(() => construirSlots(reaccion), [reaccion]);
  const { atomos, enlaces } = useMemo(() => {
    const outA: AtomoInst[] = [];
    const outE: EnlaceInst[] = [];
    for (const s of slots) {
      if (s.tipo !== "especie" || !s.especie || !s.lado || !s.molde) continue;
      const e = s.especie;
      const m = s.molde;
      const filas = Math.ceil(e.coef / s.cols);
      const paso = s.paso;
      // El bloque entero reposa sobre la peana: su parte más baja queda en YB.
      const yCentroBloque = YB + ((filas - 1) / 2) * paso + m.bajo * s.esc;
      for (let k = 0; k < e.coef; k++) {
        const col = k % s.cols;
        const fila = Math.floor(k / s.cols);
        const colsEnFila = Math.min(s.cols, e.coef - fila * s.cols);
        const cx = s.x + (col - (colsEnFila - 1) / 2) * paso;
        const cy = yCentroBloque + ((filas - 1) / 2 - fila) * paso;
        m.lista.forEach((el, i) => {
          const p = m.pos[i] ?? [0, 0, 0];
          outA.push({
            cx,
            cy,
            lx: p[0] * s.esc,
            ly: p[1] * s.esc,
            lz: p[2] * s.esc,
            radio: (m.rad[i] ?? 0.2) * s.esc,
            color: colorElemento(el),
            lado: s.lado!,
          });
          if (i > 0) {
            const p0 = m.pos[0] ?? [0, 0, 0];
            outE.push({
              cx,
              cy,
              a: [p0[0] * s.esc, p0[1] * s.esc, p0[2] * s.esc],
              b: [p[0] * s.esc, p[1] * s.esc, p[2] * s.esc],
              radio: 0.07 * s.esc,
              lado: s.lado!,
            });
          }
        });
      }
    }
    return { atomos: outA, enlaces: outE };
  }, [slots]);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new THREE.Color();
    atomos.forEach((a, i) => m.setColorAt(i, c.set(a.color)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [atomos]);

  const focoReact = foco === "reactivos";
  const focoProd = foco === "productos";
  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    t.current += dt;
    const ang = t.current * 0.5;
    const cs = Math.cos(ang);
    const sn = Math.sin(ang);
    const pulso = 1 + 0.08 * (0.5 + 0.5 * Math.sin(t.current * 3));
    const kDe = (lado: "react" | "prod") => {
      const esReact = lado === "react";
      const dim = (focoReact && !esReact) || (focoProd && esReact) ? 0.78 : 1;
      const glow = (focoReact && esReact) || (focoProd && !esReact) ? pulso : 1;
      return dim * glow;
    };
    atomos.forEach((a, i) => {
      const k = kDe(a.lado);
      _o.position.set(a.cx + (a.lx * cs + a.lz * sn) * k, a.cy + a.ly * k, -a.lx * sn + a.lz * cs);
      _o.scale.setScalar(a.radio * k);
      _o.rotation.set(0, 0, 0);
      _o.updateMatrix();
      m.setMatrixAt(i, _o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;

    const em = enlacesMesh.current;
    if (!em) return;
    enlaces.forEach((e, i) => {
      const k = kDe(e.lado);
      _va.set(e.cx + (e.a[0] * cs + e.a[2] * sn) * k, e.cy + e.a[1] * k, -e.a[0] * sn + e.a[2] * cs);
      _vb.set(e.cx + (e.b[0] * cs + e.b[2] * sn) * k, e.cy + e.b[1] * k, -e.b[0] * sn + e.b[2] * cs);
      _vd.subVectors(_vb, _va);
      const len = Math.max(0.0001, _vd.length());
      _o.position.copy(_va).addScaledVector(_vd, 0.5);
      _o.quaternion.setFromUnitVectors(_arriba, _vd.multiplyScalar(1 / len));
      _o.scale.set(e.radio * k, len, e.radio * k);
      _o.updateMatrix();
      em.setMatrixAt(i, _o.matrix);
    });
    em.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh key={`a${atomos.length}`} ref={mesh} args={[GEO_ESFERA, undefined, atomos.length]} frustumCulled={false} castShadow>
        <meshPhysicalMaterial {...ATOMO} color="#ffffff" />
      </instancedMesh>
      <instancedMesh key={`e${enlaces.length}`} ref={enlacesMesh} args={[GEO_VARILLA, undefined, Math.max(1, enlaces.length)]} frustumCulled={false} castShadow>
        <meshStandardMaterial {...METAL} color="#cbd5e1" />
      </instancedMesh>
    </>
  );
}

/* ── Peana baja con bisel metálico bajo cada especie ──────────────────────── */
function Peana({ x, radio, alto }: { x: number; radio: number; alto: number }) {
  return (
    <group position={[x, YB - 0.02, 0]}>
      {/* cuerpo: llega hasta la mesa (en conservación es una columna) */}
      <mesh geometry={GEO_PEANA} position={[0, -alto / 2, 0]} scale={[radio, alto, radio]} castShadow receiveShadow>
        <meshStandardMaterial color="#14263d" roughness={0.42} metalness={0.55} envMapIntensity={1.1} />
      </mesh>
      {/* bisel metálico del borde superior */}
      <mesh geometry={GEO_BISEL} rotation={[Math.PI / 2, 0, 0]} scale={radio}>
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* zócalo en la base */}
      <mesh geometry={GEO_PEANA} position={[0, -alto + 0.05, 0]} scale={[radio + 0.14, 0.1, radio + 0.14]} receiveShadow>
        <meshStandardMaterial {...METAL} color="#7f93ab" />
      </mesh>
    </group>
  );
}

/* ── Flecha de reacción (simple → o doble ⇌) ──────────────────────────────── */
function Flecha({ reversible, glow }: { reversible: boolean; glow: number }) {
  const grp = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (grp.current) {
      const e = 0.9 + glow * (0.3 + 0.2 * Math.sin(t.current * 4));
      grp.current.scale.setScalar(e);
    }
  });
  const color = glow > 0.1 ? "#fde047" : "#94a3b8";
  const emi = glow > 0.1 ? 0.35 : 0;
  return (
    <group ref={grp}>
      <mesh position={[-0.1, reversible ? 0.2 : 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.2, 16]} />
        <meshPhysicalMaterial {...ATOMO} color={color} emissive={color} emissiveIntensity={emi} />
      </mesh>
      <mesh position={[0.62, reversible ? 0.2 : 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.2, 0.42, 20]} />
        <meshPhysicalMaterial {...ATOMO} color={color} emissive={color} emissiveIntensity={emi} />
      </mesh>
      {reversible && (
        <>
          <mesh position={[0.1, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 1.2, 16]} />
            <meshPhysicalMaterial {...ATOMO} color={color} emissive={color} emissiveIntensity={emi} />
          </mesh>
          <mesh position={[-0.62, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <coneGeometry args={[0.2, 0.42, 20]} />
            <meshPhysicalMaterial {...ATOMO} color={color} emissive={color} emissiveIntensity={emi} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ── Signo + entre especies ───────────────────────────────────────────────── */
function Mas() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.16, 0.16]} />
        <meshPhysicalMaterial {...ATOMO} color="#f472b6" />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[0.16, 0.6, 0.16]} />
        <meshPhysicalMaterial {...ATOMO} color="#f472b6" />
      </mesh>
    </group>
  );
}

function Ecuacion({ reaccion, foco, conEtiquetas, peanaH }: { reaccion: Reaccion; foco: Escena["foco"]; conEtiquetas: boolean; peanaH: number }) {
  const { slots } = useMemo(() => construirSlots(reaccion), [reaccion]);
  const focoFlecha = foco === "flecha";
  const focoCoef = foco === "coeficientes";
  const focoSub = foco === "subindices";
  const muchas = slots.length > 5;
  const yMedio = YB + 0.95;
  return (
    <group>
      {slots.map((s, i) => {
        if (s.tipo === "mas") return <group key={i} position={[s.x, yMedio, 0]}><Mas /></group>;
        if (s.tipo === "flecha")
          return (
            <group key={i} position={[s.x, yMedio, 0]}>
              <Flecha reversible={reaccion.reversible} glow={focoFlecha ? 1 : foco === "comparar" || foco === "ecuacion" ? 0.2 : 0} />
            </group>
          );
        const e = s.especie as Especie;
        const esReact = s.lado === "react";
        const base = esReact ? "#38bdf8" : "#34d399";
        const yLab = YB - 0.02 - peanaH - 0.55;
        return (
          <React.Fragment key={i}>
            <Peana x={s.x} radio={s.ancho / 2 - 0.08} alto={peanaH} />
            {conEtiquetas && (
              <Etiqueta pos={[s.x, yLab, 0]} color={focoSub ? "#fb923c" : focoCoef ? "#fbbf24" : `${base}cc`} ancho={muchas}>
                {e.coef > 1 && (
                  <span style={{ color: "#fbbf24", fontSize: focoCoef ? 20 : 14, marginRight: 5 }}>{e.coef}</span>
                )}
                <span style={{ color: focoSub ? "#fdba74" : "#fff", fontSize: focoSub ? 16 : 14 }}>{e.formula}</span>{" "}
                <span style={{ opacity: 0.7 }}>({e.estado})</span>
              </Etiqueta>
            )}
          </React.Fragment>
        );
      })}
    </group>
  );
}

/* ── Barras de átomos por elemento (modo conservación) ────────────────────── */
function PanelConteo({ reaccion, foco, libre }: { reaccion: Reaccion; foco: Escena["foco"]; libre: boolean }) {
  const c = contarAtomos(reaccion);
  const verR = libre || foco === "reactivos" || foco === "comparar" || foco === "ecuacion";
  const verP = libre || foco === "productos" || foco === "comparar" || foco === "ecuacion";
  const n = c.elementos.length;
  const paso = 1.9;
  const ancho = (n - 1) * paso;
  const maxAt = Math.max(1, ...c.elementos.map((el) => Math.max(c.reactivos[el] ?? 0, c.productos[el] ?? 0)));
  const veredicto = libre || foco === "comparar";
  return (
    <group position={[0, SUELO_CONSERVACION + 0.02, 1.4]}>
      {c.elementos.map((el, i) => {
        const x = i * paso - ancho / 2;
        const nr = c.reactivos[el] ?? 0;
        const np = c.productos[el] ?? 0;
        const igual = nr === np;
        const col = colorElemento(el);
        const hR = (nr / maxAt) * 1.9;
        const hP = (np / maxAt) * 1.9;
        const malo = veredicto && verR && verP && !igual;
        return (
          <group key={el} position={[x, 0, 0]}>
            {verR && (
              <mesh position={[-0.4, hR / 2, 0]} castShadow>
                <boxGeometry args={[0.6, Math.max(0.05, hR), 0.45]} />
                <meshPhysicalMaterial {...ATOMO} color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.18} />
              </mesh>
            )}
            {verP && (
              <mesh position={[0.4, hP / 2, 0]} castShadow>
                <boxGeometry args={[0.6, Math.max(0.05, hP), 0.45]} />
                <meshPhysicalMaterial {...ATOMO} color={malo ? "#fb923c" : "#34d399"} emissive={malo ? "#fb923c" : "#34d399"} emissiveIntensity={0.18} />
              </mesh>
            )}
            <Etiqueta pos={[0, -0.55, 0]} color={malo ? "#fb923c" : `${col}dd`} ancho={n > 2}>
              {el}: {verR ? nr : "—"} / {verP ? np : "—"} {veredicto && verR && verP ? (igual ? "✓" : "✗") : ""}
            </Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

/* ── Carrusel de simbología: un símbolo a la vez ──────────────────────────── */
function Galeria({ simbolo }: { simbolo: number }) {
  const s = SIMBOLOS[Math.min(Math.max(0, simbolo), SIMBOLOS.length - 1)]!;
  const grp = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (grp.current) grp.current.rotation.y = Math.sin(st.clock.elapsedTime * 0.8) * 0.25;
  });
  const n = SIMBOLOS.length;
  return (
    <group>
      <group ref={grp} position={[0, 0.6, 0]}>
        <mesh>
          <boxGeometry args={[4.2, 3.0, 0.3]} />
          <meshStandardMaterial color="#0a1626" emissive={s.color} emissiveIntensity={0.18} roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[3.9, 2.7, 0.02]} />
          <meshStandardMaterial color={s.color} transparent opacity={0.1} depthWrite={false} />
        </mesh>
      </group>
      <Etiqueta pos={[0, 0.9, 0.5]} color={s.color} big>{s.simbolo}</Etiqueta>
      <Etiqueta pos={[0, -0.2, 0.5]} color={`${s.color}cc`}>{s.nombre}</Etiqueta>
      {/* tira de progreso: dónde va el alumno entre los símbolos */}
      <group position={[0, -2.1, 0]}>
        {SIMBOLOS.map((q, i) => (
          <mesh key={q.nombre} position={[(i - (n - 1) / 2) * 0.62, 0, 0]} scale={i === simbolo ? 1.5 : 1}>
            <boxGeometry args={[0.4, 0.4, 0.2]} />
            <meshStandardMaterial color={i === simbolo ? q.color : "#1e293b"} emissive={q.color} emissiveIntensity={i === simbolo ? 0.6 : 0.08} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* Alturas de la mesa por modo (mundo). */
const SUELO_CONSERVACION = -3.42;
const SUELO_SIMBOLOGIA = -2.5;

function camZ(modo: Modo, nSlots: number): number {
  return modo === "simbologia" ? 11 : nSlots > 5 ? 17 : 13.5;
}

function Contenido({ modo, escena, reaccion, modoColor, resetNonce, libre, simbolo }: EstructuraReaccionSceneProps) {
  const target: Pt = modo === "conservacion" ? [0, -1.6, 0] : [0, -0.9, 0];
  const size = useThree((st) => st.size);
  const { slots, ancho } = useMemo(() => construirSlots(reaccion), [reaccion]);

  // Escala de la ecuación para que ocupe el ancho útil de la pantalla.
  const z = camZ(modo, slots.length);
  const anchoVista = 2 * z * Math.tan((25 * Math.PI) / 180) * (size.width / Math.max(1, size.height));
  const K = Math.min(2.6, Math.max(0.4, (0.82 * anchoVista) / Math.max(1, ancho)));

  // Posición del grupo de la ecuación y altura de la mesa, por modo.
  const gy = modo === "conservacion" ? 1.5 : -0.75;
  const gz = modo === "conservacion" ? -1.2 : 0;
  const topeLocal = YB - 0.02;
  const peanaH = modo === "conservacion" ? Math.max(PEANA_H, (gy + K * topeLocal - SUELO_CONSERVACION) / K) : PEANA_H;
  const suelo = modo === "simbologia" ? SUELO_SIMBOLOGIA : gy + K * (topeLocal - peanaH);

  return (
    <>
      <Escenario acento="#38bdf8" suelo={suelo} mesa niebla />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />

      <group key={`${modo}-${reaccion.id}-${resetNonce}`}>
        {modo === "simbologia" ? (
          <Galeria simbolo={simbolo} />
        ) : (
          <>
            <group position={[0, gy, gz]} scale={K}>
              <Atomos reaccion={reaccion} foco={escena.foco} />
              <Ecuacion reaccion={reaccion} foco={escena.foco} conEtiquetas={modo === "anatomia"} peanaH={peanaH} />
            </group>
            {modo === "conservacion" && <PanelConteo reaccion={reaccion} foco={escena.foco} libre={libre} />}
          </>
        )}
      </group>

      <OrbitControls enablePan={false} minDistance={8} maxDistance={48} autoRotate={false} target={target} />
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.5} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function EstructuraReaccionScene(props: EstructuraReaccionSceneProps) {
  const nSlots = construirSlots(props.reaccion).slots.length;
  const cam: Pt = [0, 0, camZ(props.modo, nSlots)];
  return (
    <Canvas key={`${props.modo}-${nSlots}`} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
