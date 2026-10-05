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
 * Todos los átomos de la ecuación son UNA sola malla instanciada (una
 * fotosíntesis llega a ~70 esferas). Esquemática (no a escala): las fórmulas y
 * los conteos de átomos son exactos. Etiquetas con <Html> (NUNCA <Text> de
 * drei: cuelga el chunk con Turbopack), máx. 4 a la vez.
 */

import * as THREE from "three";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
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

/* ── Átomos de una molécula (índice 0 al centro, el resto en círculo) ───────── */
function atomosExpandidos(especie: Especie): string[] {
  const out: string[] = [];
  const entries = Object.entries(especie.atomos);
  entries.sort((a, b) => {
    const pri = (el: string) => (el === "C" ? 3 : el === "N" ? 2 : el === "Na" ? 1 : 0);
    return pri(b[0]) - pri(a[0]);
  });
  for (const [el, n] of entries) for (let i = 0; i < n; i++) out.push(el);
  return out;
}

/* Posición local de un átomo dentro de su molécula */
function posLocal(i: number, n: number): Pt {
  if (i === 0) return [0, 0, 0];
  const a = ((i - 1) / Math.max(1, n - 1)) * Math.PI * 2;
  const r = 0.5;
  return [Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 2) * 0.2];
}

/* ── Layout de una ecuación en el eje X ───────────────────────────────────── */
interface Slot {
  tipo: "especie" | "mas" | "flecha";
  especie?: Especie;
  lado?: "react" | "prod";
  x: number;
  ancho: number;
  cols: number;
  esc: number; // escala de cada copia de la molécula
}

function construirSlots(r: Reaccion): { slots: Slot[]; ancho: number } {
  const seq: Omit<Slot, "x">[] = [];
  const dimsEspecie = (e: Especie) => {
    const cols = e.coef <= 1 ? 1 : e.coef <= 2 ? 2 : 3;
    const esc = cols === 1 ? 0.95 : cols === 2 ? 0.75 : 0.58;
    return { cols, esc, ancho: cols * 1.55 * esc + 0.5 };
  };
  r.reactivos.forEach((e, i) => {
    if (i > 0) seq.push({ tipo: "mas", ancho: 1.1, cols: 1, esc: 1 });
    seq.push({ tipo: "especie", especie: e, lado: "react", ...dimsEspecie(e) });
  });
  seq.push({ tipo: "flecha", ancho: 1.9, cols: 1, esc: 1 });
  r.productos.forEach((e, i) => {
    if (i > 0) seq.push({ tipo: "mas", ancho: 1.1, cols: 1, esc: 1 });
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

/* ── Todos los átomos en UNA malla instanciada ────────────────────────────── */
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

const _o = new THREE.Object3D();

function Atomos({ reaccion, foco }: { reaccion: Reaccion; foco: Escena["foco"] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const t = useRef(0);
  const { slots } = useMemo(() => construirSlots(reaccion), [reaccion]);
  const atomos = useMemo(() => {
    const out: AtomoInst[] = [];
    for (const s of slots) {
      if (s.tipo !== "especie" || !s.especie || !s.lado) continue;
      const e = s.especie;
      const lista = atomosExpandidos(e);
      const n = lista.length;
      const filas = Math.ceil(e.coef / s.cols);
      const paso = 1.55 * s.esc;
      for (let k = 0; k < e.coef; k++) {
        const col = k % s.cols;
        const fila = Math.floor(k / s.cols);
        const colsEnFila = Math.min(s.cols, e.coef - fila * s.cols);
        const cx = s.x + (col - (colsEnFila - 1) / 2) * paso;
        const cy = ((filas - 1) / 2 - fila) * paso;
        lista.forEach((el, i) => {
          const p = posLocal(i, n);
          out.push({
            cx,
            cy,
            lx: p[0] * s.esc,
            ly: p[1] * s.esc,
            lz: p[2] * s.esc,
            radio: (i === 0 ? 0.34 : 0.26) * s.esc,
            color: colorElemento(el),
            lado: s.lado!,
          });
        });
      }
    }
    return out;
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
    atomos.forEach((a, i) => {
      const esReact = a.lado === "react";
      const dim = (focoReact && !esReact) || (focoProd && esReact) ? 0.78 : 1;
      const glow = (focoReact && esReact) || (focoProd && !esReact) ? pulso : 1;
      const k = dim * glow;
      _o.position.set(a.cx + (a.lx * cs + a.lz * sn) * k, a.cy + a.ly * k, -a.lx * sn + a.lz * cs);
      _o.scale.setScalar(a.radio * k);
      _o.rotation.set(0, 0, 0);
      _o.updateMatrix();
      m.setMatrixAt(i, _o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh key={atomos.length} ref={mesh} args={[undefined, undefined, atomos.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 18, 18]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} roughness={0.3} metalness={0.1} />
    </instancedMesh>
  );
}

/* ── Flecha de reacción (simple → o doble ⇌) ──────────────────────────────── */
function Flecha({ reversible, glow }: { reversible: boolean; glow: number }) {
  const grp = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (grp.current) {
      const e = 0.8 + glow * (0.3 + 0.2 * Math.sin(t.current * 4));
      grp.current.scale.setScalar(e);
    }
  });
  const color = glow > 0.1 ? "#fde047" : "#94a3b8";
  return (
    <group ref={grp}>
      <mesh position={[-0.1, reversible ? 0.18 : 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 1.2, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.6, reversible ? 0.18 : 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.16, 0.34, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {reversible && (
        <>
          <mesh position={[0.1, -0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 1.2, 10]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.6, -0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.16, 0.34, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
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
      <mesh>
        <boxGeometry args={[0.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.5} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Ecuacion({ reaccion, foco, conEtiquetas }: { reaccion: Reaccion; foco: Escena["foco"]; conEtiquetas: boolean }) {
  const { slots } = useMemo(() => construirSlots(reaccion), [reaccion]);
  const focoFlecha = foco === "flecha";
  const focoCoef = foco === "coeficientes";
  const focoSub = foco === "subindices";
  const muchas = slots.length > 5;
  return (
    <group>
      {slots.map((s, i) => {
        if (s.tipo === "mas") return <group key={i} position={[s.x, 0, 0]}><Mas /></group>;
        if (s.tipo === "flecha")
          return (
            <group key={i} position={[s.x, 0, 0]}>
              <Flecha reversible={reaccion.reversible} glow={focoFlecha ? 1 : foco === "comparar" || foco === "ecuacion" ? 0.2 : 0} />
            </group>
          );
        const e = s.especie as Especie;
        const esReact = s.lado === "react";
        const base = esReact ? "#38bdf8" : "#34d399";
        const filas = Math.ceil(e.coef / s.cols);
        const yLab = -((filas - 1) / 2 * 1.55 * s.esc) - 1.25;
        return conEtiquetas ? (
          <Etiqueta key={i} pos={[s.x, yLab, 0]} color={focoSub ? "#fb923c" : focoCoef ? "#fbbf24" : `${base}cc`} ancho={muchas}>
            {e.coef > 1 && (
              <span style={{ color: "#fbbf24", fontSize: focoCoef ? 20 : 14, marginRight: 5 }}>{e.coef}</span>
            )}
            <span style={{ color: focoSub ? "#fdba74" : "#fff", fontSize: focoSub ? 16 : 14 }}>{e.formula}</span>{" "}
            <span style={{ opacity: 0.7 }}>({e.estado})</span>
          </Etiqueta>
        ) : null;
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
    <group position={[0, -3.4, 0]}>
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
              <mesh position={[-0.4, hR / 2, 0]}>
                <boxGeometry args={[0.6, Math.max(0.05, hR), 0.45]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.3} roughness={0.4} />
              </mesh>
            )}
            {verP && (
              <mesh position={[0.4, hP / 2, 0]}>
                <boxGeometry args={[0.6, Math.max(0.05, hP), 0.45]} />
                <meshStandardMaterial color={malo ? "#fb923c" : "#34d399"} emissive={malo ? "#fb923c" : "#34d399"} emissiveIntensity={0.3} roughness={0.4} />
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

function Contenido({ modo, escena, reaccion, modoColor, resetNonce, libre, simbolo }: EstructuraReaccionSceneProps) {
  const target: Pt = modo === "conservacion" ? [0, -1.6, 0] : [0, -0.9, 0];
  return (
    <>
      <Escenario acento="#38bdf8" mesa={false} niebla={false} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />

      <group key={`${modo}-${reaccion.id}-${resetNonce}`}>
        {modo === "simbologia" ? (
          <Galeria simbolo={simbolo} />
        ) : (
          <>
            <group position={[0, modo === "conservacion" ? 1.3 : 0, 0]}>
              <Atomos reaccion={reaccion} foco={escena.foco} />
              <Ecuacion reaccion={reaccion} foco={escena.foco} conEtiquetas={modo === "anatomia"} />
            </group>
            {modo === "conservacion" && <PanelConteo reaccion={reaccion} foco={escena.foco} libre={libre} />}
          </>
        )}
      </group>

      <OrbitControls enablePan={false} minDistance={8} maxDistance={48} autoRotate={false} target={target} />
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function EstructuraReaccionScene(props: EstructuraReaccionSceneProps) {
  const nSlots = construirSlots(props.reaccion).slots.length;
  const z = props.modo === "simbologia" ? 11 : nSlots > 5 ? 17 : 13.5;
  const cam: Pt = [0, 0, z];
  return (
    <Canvas key={`${props.modo}-${nSlots}`} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
