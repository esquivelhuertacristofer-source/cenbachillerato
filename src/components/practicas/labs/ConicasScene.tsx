"use client";

/**
 * Escena 3D — "Cónicas: circunferencia y parábola como lugares geométricos"
 * (PM-IV-P07-A1).
 *
 * Un PLANO CARTESIANO flotante (rejilla en z = 0, ejes X e Y) que se puede
 * orbitar. Según el modo:
 *
 *  · CIRCUNFERENCIA — se dibuja la curva (x−h)²+(y−k)²=r², el CENTRO, un punto P
 *    que recorre la curva con su RADIO (siempre = r: ahí se ve el "lugar
 *    geométrico de los puntos equidistantes del centro") y un punto de prueba Q
 *    cuya distancia al centro lo clasifica dentro / sobre / fuera.
 *
 *  · PARÁBOLA — se dibuja x²=4py, el FOCO (0,p), la DIRECTRIZ y=−p y el VÉRTICE.
 *    Un punto P recorre la parábola mostrando que su distancia al foco es IGUAL a
 *    su distancia a la directriz (la definición). Opcional: la PROPIEDAD FOCAL
 *    (rayos paralelos al eje que se reflejan al foco), base del GTM y las antenas.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y la animación de P llega como prop `fase` (0..1) desde el
 * shell; useFrame solo late en un ref (cosmético).
 */

import * as THREE from "three";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo, calcCirc, calcParab, curvaCirc, curvaParab, puntoParab, distanciasParab,
  PARAB_HALF, fmtNum2, fmtPar,
} from "./conicas-data";

export interface ConicasSceneProps {
  modo: Modo;
  // circunferencia
  h: number; k: number; r: number; qx: number; qy: number;
  // parábola
  p: number;
  // común
  fase: number;            // 0..1, posición del punto móvil P
  mostrarFocal: boolean;   // parábola: propiedad focal (rayos)
  accent: string;
  autoRotate: boolean;
  pausado: boolean;
  resetNonce: number;
}

type Pt = [number, number, number];

const CENTRO_COL = "#f5d36b";
const RADIO_COL = "#34D399";
const Q_DENTRO = "#34D399", Q_SOBRE = "#fbbf24", Q_FUERA = "#fb7185";
const FOCO_COL = "#f5d36b";
const DIR_COL = "#fb7185";
const VERT_COL = "#60a5fa";
const DFOCO_COL = "#34D399";
const DDIR_COL = "#c4b5fd";
const RAY_COL = "#7dd3fc";
const AXIS_COL = "#7dd3fc";
const GRID_COL = "#1f3a4d";

const G = 8;                // semirango del plano: −8 … +8
const U = 0.5;             // unidades de escena por unidad del plano
const YMAX = 7.4;          // tope vertical para trazar la parábola dentro del plano

/** Lleva un punto del plano (gx, gy) a coordenadas de escena (z = 0). */
const S = (gx: number, gy: number): Pt => [gx * U, gy * U, 0];
/** Lleva una lista de puntos del plano a puntos de escena. */
const SL = (pts: [number, number][]): Pt[] => pts.map(([x, y]) => S(x, y));

/* ── Etiqueta flotante reutilizable ──────────────────────────────────────── */
function Etiqueta({
  pos, color, children, size = 12, bg = "rgba(6,16,31,0.82)",
}: {
  pos: Pt; color: string; children: React.ReactNode; size?: number; bg?: string;
}) {
  return (
    <Html position={pos} center distanceFactor={13} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 9, background: bg,
        border: `1px solid ${color}66`, color: "#fff", fontWeight: 700, fontSize: size,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Esfera-marcador (punto del plano) ───────────────────────────────────── */
function Marcador({ p, color, radio = 0.15 }: { p: Pt; color: string; radio?: number }) {
  return (
    <mesh position={p} castShadow>
      <sphereGeometry args={[radio, 24, 24]} />
      <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={1.6} toneMapped={false} />
    </mesh>
  );
}

/* ── Rejilla del plano cartesiano (líneas en z = 0) ──────────────────────── */
function Rejilla() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (let i = -G; i <= G; i++) {
      pts.push(i * U, -G * U, 0, i * U, G * U, 0);
      pts.push(-G * U, i * U, 0, G * U, i * U, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={GRID_COL} transparent opacity={0.55} />
    </lineSegments>
  );
}

/* ── Ejes X, Y + origen ───────────────────────────────────────────────────── */
function Ejes() {
  return (
    <>
      <Line points={[S(-G, 0), S(G, 0)]} color={AXIS_COL} lineWidth={2.2} />
      <Line points={[S(0, -G), S(0, G)]} color={AXIS_COL} lineWidth={2.2} />
      <Etiqueta pos={S(G, 0)} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">x</Etiqueta>
      <Etiqueta pos={S(0, G)} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">y</Etiqueta>
      <mesh position={S(0, 0)}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={AXIS_COL} emissive={AXIS_COL} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
    </>
  );
}

/* ── CIRCUNFERENCIA ───────────────────────────────────────────────────────── */
function EscenaCirc({ h, k, r, qx, qy, fase, accent }: {
  h: number; k: number; r: number; qx: number; qy: number; fase: number; accent: string;
}) {
  const c = useMemo(() => calcCirc(h, k, r, qx, qy), [h, k, r, qx, qy]);
  const curva = useMemo(() => SL(curvaCirc(h, k, r)), [h, k, r]);

  // punto P que recorre la circunferencia (lugar geométrico)
  const ang = fase * Math.PI * 2;
  const Pg: [number, number] = [h + r * Math.cos(ang), k + r * Math.sin(ang)];
  const P = S(Pg[0], Pg[1]);
  const C = S(h, k);
  const Q = S(qx, qy);
  const qCol = c.estadoQ === "dentro" ? Q_DENTRO : c.estadoQ === "sobre" ? Q_SOBRE : Q_FUERA;

  return (
    <group>
      {/* la curva */}
      <Line points={curva} color={accent} lineWidth={4} />
      {/* centro */}
      <Marcador p={C} color={CENTRO_COL} radio={0.13} />
      <Etiqueta pos={[C[0], C[1] - 0.42, 0.05]} color={CENTRO_COL} size={12} bg="rgba(6,16,31,0.9)">
        <strong>C</strong>&nbsp;{fmtPar(h, k)}
      </Etiqueta>
      {/* radio: centro → P (siempre = r) */}
      <Line points={[C, P]} color={RADIO_COL} lineWidth={3.4} />
      <Etiqueta pos={[(C[0] + P[0]) / 2, (C[1] + P[1]) / 2 + 0.32, 0.05]} color={RADIO_COL} size={11.5}>
        r = {fmtNum2(r)}
      </Etiqueta>
      <Marcador p={P} color={RADIO_COL} radio={0.13} />
      {/* punto de prueba Q: dentro / sobre / fuera */}
      <Line points={[C, Q]} color={qCol} lineWidth={2.4} dashed dashSize={0.16} gapSize={0.12} />
      <Marcador p={Q} color={qCol} radio={0.15} />
      <Etiqueta pos={[Q[0], Q[1] + 0.44, 0.05]} color={qCol} size={12} bg="rgba(6,16,31,0.92)">
        <strong>Q</strong> {fmtPar(qx, qy)} · {c.estadoQ}
      </Etiqueta>
    </group>
  );
}

/* ── PARÁBOLA ─────────────────────────────────────────────────────────────── */
function EscenaParab({ p, fase, mostrarFocal, accent }: {
  p: number; fase: number; mostrarFocal: boolean; accent: string;
}) {
  const par = useMemo(() => calcParab(p), [p]);
  // medio-ancho efectivo: que la curva no se salga del plano por arriba
  const halfEff = Math.min(PARAB_HALF, Math.sqrt(4 * p * YMAX));
  const curva = useMemo(() => SL(curvaParab(p, halfEff)), [p, halfEff]);

  // punto P que recorre la parábola (oscila a ambos lados del vértice)
  const t = halfEff * Math.sin(fase * Math.PI * 2);
  const Pg = puntoParab(t, p);
  const P = S(Pg[0], Pg[1]);
  const F = S(0, par.focoY);
  const V = S(0, 0);
  const foot = S(Pg[0], par.directrizY); // pie de la perpendicular a la directriz
  const d = distanciasParab(t, p);

  // rayos de la propiedad focal: bajan paralelos al eje y se reflejan al foco
  const rayos = useMemo(() => {
    const xs = [-0.7, -0.4, 0.4, 0.7].map((f) => f * halfEff);
    return xs.map((x) => {
      const [hx, hy] = puntoParab(x, p);
      return { entra: [S(x, YMAX), S(hx, hy)] as Pt[], sale: [S(hx, hy), S(0, par.focoY)] as Pt[] };
    });
  }, [p, halfEff, par.focoY]);

  return (
    <group>
      {/* directriz y = −p */}
      <Line points={[S(-G, par.directrizY), S(G, par.directrizY)]} color={DIR_COL} lineWidth={2.6} dashed dashSize={0.22} gapSize={0.14} />
      <Etiqueta pos={[S(G, par.directrizY)[0] - 0.7, S(0, par.directrizY)[1] - 0.34, 0.05]} color={DIR_COL} size={11} bg="rgba(6,16,31,0.85)">
        directriz y = {fmtNum2(par.directrizY)}
      </Etiqueta>

      {/* propiedad focal */}
      {mostrarFocal && rayos.map((ry, i) => (
        <group key={i}>
          <Line points={ry.entra} color={RAY_COL} lineWidth={1.8} transparent opacity={0.8} />
          <Line points={ry.sale} color={RAY_COL} lineWidth={1.8} transparent opacity={0.8} />
        </group>
      ))}

      {/* la curva */}
      <Line points={curva} color={accent} lineWidth={4} />

      {/* vértice */}
      <Marcador p={V} color={VERT_COL} radio={0.12} />
      <Etiqueta pos={[V[0] - 0.55, V[1] - 0.4, 0.05]} color={VERT_COL} size={11.5} bg="rgba(6,16,31,0.9)">
        <strong>V</strong> (0, 0)
      </Etiqueta>

      {/* foco */}
      <Marcador p={F} color={FOCO_COL} radio={0.14} />
      <Etiqueta pos={[F[0] + 0.55, F[1] + 0.1, 0.05]} color={FOCO_COL} size={12} bg="rgba(6,16,31,0.92)">
        <strong>F</strong> {fmtPar(0, par.focoY)}
      </Etiqueta>

      {/* las dos distancias iguales: P→foco y P→directriz */}
      <Line points={[P, F]} color={DFOCO_COL} lineWidth={3.2} />
      <Etiqueta pos={[(P[0] + F[0]) / 2 + 0.3, (P[1] + F[1]) / 2, 0.06]} color={DFOCO_COL} size={11}>
        d₁ = {fmtNum2(d.aFoco)}
      </Etiqueta>
      <Line points={[P, foot]} color={DDIR_COL} lineWidth={3.2} />
      <Etiqueta pos={[(P[0] + foot[0]) / 2 - 0.45, (P[1] + foot[1]) / 2, 0.06]} color={DDIR_COL} size={11}>
        d₂ = {fmtNum2(d.aDirectriz)}
      </Etiqueta>
      <Marcador p={P} color={accent} radio={0.14} />
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, h, k, r, qx, qy, p, fase, mostrarFocal, accent, autoRotate, pausado, resetNonce }: ConicasSceneProps) {
  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.4} color={accent} />

      <group key={`${modo}-${resetNonce}`}>
        <Rejilla />
        <Ejes />
        {modo === "circunferencia"
          ? <EscenaCirc h={h} k={k} r={r} qx={qx} qy={qy} fase={fase} accent={accent} />
          : <EscenaParab p={p} fase={fase} mostrarFocal={mostrarFocal} accent={accent} />}
      </group>

      <ContactShadows position={[0, -G * U - 0.4, 0]} opacity={0.3} scale={22} blur={2.6} far={9} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 6, 8]} scale={10} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[6, 2, 5]} scale={6} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-6, 3, 4]} scale={6} color="#bfe6c4" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={26}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.55}
        target={[0, 0, 0]}
        autoRotate={autoRotate && !pausado}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function ConicasScene(props: ConicasSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.5, 3, 11.5], fov: 46 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
