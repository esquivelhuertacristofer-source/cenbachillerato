"use client";

/**
 * Escena 3D — "Continuidad: las 3 condiciones, los tipos de discontinuidad y el
 * Teorema del Valor Intermedio" (PM-V-P02).
 *
 * Un PLANO CARTESIANO flotante (z = 0) que se orbita, con escala propia por caso
 * para mostrar valores REALES. Dos modos:
 *
 *  · CONTINUIDAD: dibuja f(x) (partida en saltos/huecos/asíntotas), marca el
 *    punto de análisis x = a y, según el tipo de discontinuidad, un ANILLO ABIERTO
 *    (límite no alcanzado) y/o un PUNTO LLENO (valor f(a)); para la esencial,
 *    una asíntota vertical. Un punto móvil P = (x, f(x)) recorre la curva.
 *  · TVI: dibuja g(x)=x³−x−1 en [1,2], los puntos (1,g(1)) y (2,g(2)), una recta
 *    horizontal y = N y el punto garantizado (c, N) donde g(c) = N (cruce).
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y useFrame solo late en refs.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";
import {
  func, evalFunc, muestrear, muestrearG, bisectN, TVI, fmt1, fmt2,
  type FuncId, type Modo, type Vista,
} from "./continuidad-data";

export interface ContinuidadSceneProps {
  modo: Modo;
  funcId: FuncId;
  xPos: number;     // posición del punto móvil (modo continuidad)
  nObj: number;     // valor objetivo N (modo TVI)
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const X_COL = "#fbbf24";      // posición de x (entrada)
const OK_COL = "#34D399";     // valor alcanzado / continuo / raíz
const HOLE_COL = "#f87171";   // hueco / no existe / asíntota

const BX = 5.6;               // semiancho del plano (unidades de escena)
const BY = 3.8;               // semialto del plano (unidades de escena)

/* ── Mapeo datos → plano (cierre sobre la vista activa) ───────────────────── */
function hacerMapa(v: Vista) {
  const sx = (dx: number) => -BX + ((dx - v.xmin) / (v.xmax - v.xmin)) * 2 * BX;
  const sy = (dy: number) => -BY + ((dy - v.ymin) / (v.ymax - v.ymin)) * 2 * BY;
  const S = (dx: number, dy: number): Pt => [sx(dx), sy(dy), 0];
  return { sx, sy, S };
}

function anilloPts(P: Pt, rad = 0.16, n = 40): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n;
    pts.push([P[0] + rad * Math.cos(t), P[1] + rad * Math.sin(t), P[2]]);
  }
  return pts;
}

/* ── Etiqueta flotante: tamaño fijo en píxeles (≥ 14), desplazamiento fijo ────
 * Las anchas (`ancha`) se ocultan en pantallas angostas: su info va al panel. */
function Etiqueta({
  pos, color, children, ancha = false,
}: {
  pos: Pt; color: string; children: React.ReactNode; ancha?: boolean;
}) {
  const angosta = useThree((st) => st.size.width < 640);
  if (ancha && angosta) return null;
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{
        whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
        border: `1.5px solid ${color}`, color: "#fff", fontWeight: 800, fontSize: 14,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Rejilla + ejes + ticks ───────────────────────────────────────────────── */
function Plano({ v }: { v: Vista }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);

  const geo = useMemo(() => {
    const pts: number[] = [];
    for (const tx of v.xticks) { pts.push(sx(tx), -BY, 0, sx(tx), BY, 0); }
    for (const ty of v.yticks) { pts.push(-BX, sy(ty), 0, BX, sy(ty), 0); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, [v, sx, sy]);

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;
  const ejeX: Pt[] = [S(v.xmin, ax0), S(v.xmax, ax0)];
  const ejeY: Pt[] = [S(ay0, v.ymin), S(ay0, v.ymax)];

  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={GRID_COL} transparent opacity={0.5} />
      </lineSegments>

      <Line points={ejeX} color={AXIS_COL} lineWidth={2.4} />
      <Line points={ejeY} color={AXIS_COL} lineWidth={2.4} />
    </group>
  );
}

/* ── Curva de f (una o varias polilíneas si hay saltos/huecos/asíntotas) ──── */
function Curva({ funcId, v, color }: { funcId: FuncId; v: Vista; color: string }) {
  const { S } = useMemo(() => hacerMapa(v), [v]);
  const polis = useMemo(() => {
    return muestrear(funcId).map((poli) =>
      poli
        .filter(([x, y]) => x >= v.xmin && x <= v.xmax && y >= v.ymin && y <= v.ymax)
        .map(([x, y]) => S(x, y)),
    );
  }, [funcId, v, S]);
  return (
    <>
      {polis.map((pts, i) =>
        pts.length > 1 ? <CurvaTubo key={i} puntos={pts} color={color} grosor={0.081} /> : null,
      )}
    </>
  );
}

/* ── Marcadores de continuidad en x = a ───────────────────────────────────── */
function Marcadores({ funcId, v }: { funcId: FuncId; v: Vista }) {
  const { sx, S } = useMemo(() => hacerMapa(v), [v]);
  const f = func(funcId);

  const dentroX = f.a >= v.xmin && f.a <= v.xmax;
  const vertical: Pt[] = [[sx(f.a), -BY, 0], [sx(f.a), BY, 0]];
  const lineCol = f.tipo === "esencial" ? HOLE_COL : X_COL;

  // anillos / puntos según el tipo
  const ringLim = f.lim; // límite bilateral (evitable)
  const ringSaltoIzq = f.limIzq; // salto: límite izquierdo (no alcanzado)

  return (
    <group>
      {dentroX && (
        <Line
          points={vertical}
          color={lineCol}
          lineWidth={f.tipo === "esencial" ? 2.2 : 1.6}
          dashed
          dashSize={0.16}
          gapSize={0.12}
          transparent
          opacity={f.tipo === "esencial" ? 0.85 : 0.6}
        />
      )}
      {dentroX && (
        <Etiqueta pos={[sx(f.a), -BY - 0.42, 0]} color={lineCol}>
          x = {f.a.toLocaleString("es-MX", { maximumFractionDigits: 1 })}
        </Etiqueta>
      )}

      {/* EVITABLE: anillo abierto en (a, lim) — f(a) no existe pero el límite sí */}
      {f.tipo === "evitable" && ringLim !== null && (
        <>
          <CurvaTubo puntos={anilloPts(S(f.a, ringLim))} color={HOLE_COL} grosor={0.054} />
          <Etiqueta pos={[S(f.a, ringLim)[0] + 0.3, S(f.a, ringLim)[1] + 0.55, 0.05]} color={HOLE_COL} ancha>
            hueco: lím = {fmt2(ringLim)}
          </Etiqueta>
        </>
      )}

      {/* SALTO: anillo abierto en (a, limIzq) + punto lleno en (a, f(a)) */}
      {f.tipo === "salto" && ringSaltoIzq !== null && f.fa !== null && (
        <>
          <CurvaTubo puntos={anilloPts(S(f.a, ringSaltoIzq))} color={HOLE_COL} grosor={0.054} />
          <Etiqueta pos={[S(f.a, ringSaltoIzq)[0] - 1.0, S(f.a, ringSaltoIzq)[1] - 0.1, 0.05]} color={HOLE_COL}>
            lím izq = {fmt1(ringSaltoIzq)}
          </Etiqueta>
          <mesh position={S(f.a, f.fa)}>
            <sphereGeometry args={[0.15, 22, 22]} />
            <meshStandardMaterial color="#fff" emissive={f.color} emissiveIntensity={1.6} />
          </mesh>
          <Etiqueta pos={[S(f.a, f.fa)[0] + 0.95, S(f.a, f.fa)[1] + 0.15, 0.05]} color={f.color} ancha>
            f({fmt1(f.a)}) = {fmt1(f.fa)}
          </Etiqueta>
        </>
      )}

      {/* ESENCIAL: etiqueta de asíntota vertical */}
      {f.tipo === "esencial" && dentroX && (
        <Etiqueta pos={[sx(f.a) + 0.95, BY - 0.4, 0.05]} color={HOLE_COL} ancha>
          asíntota x = {fmt1(f.a)}
        </Etiqueta>
      )}

      {/* CONTINUA: punto lleno en (a, f(a)), todo en verde */}
      {f.tipo === "ninguna" && f.fa !== null && (
        <>
          <mesh position={S(f.a, f.fa)}>
            <sphereGeometry args={[0.15, 22, 22]} />
            <meshStandardMaterial color="#fff" emissive={OK_COL} emissiveIntensity={1.7} />
          </mesh>
          <Etiqueta pos={[S(f.a, f.fa)[0] + 0.95, S(f.a, f.fa)[1] + 0.45, 0.05]} color={OK_COL} ancha>
            f({fmt1(f.a)}) = {fmt1(f.fa)} ✓
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Punto móvil P = (x, f(x)) (modo continuidad) ─────────────────────────── */
function Movil({ funcId, v, xPos }: { funcId: FuncId; v: Vista; xPos: number }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (pulso.current) pulso.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.16);
  });

  const f = func(funcId);
  const y = evalFunc(funcId, xPos);
  const visible = Number.isFinite(y) && xPos >= v.xmin && xPos <= v.xmax && y >= v.ymin && y <= v.ymax;
  if (!visible) return null;

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;
  const P = S(xPos, y);
  const baseX: Pt = [sx(xPos), sy(ax0), 0];
  const baseY: Pt = [sx(ay0), sy(y), 0];

  return (
    <group>
      <Line points={[baseX, P]} color={X_COL} lineWidth={2.2} dashed dashSize={0.16} gapSize={0.11} />
      <Line points={[P, baseY]} color={OK_COL} lineWidth={2.2} dashed dashSize={0.16} gapSize={0.11} />

      <mesh position={baseX}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={X_COL} emissive={X_COL} emissiveIntensity={0.7} />
      </mesh>

      <group ref={pulso} position={P}>
        <mesh>
          <sphereGeometry args={[0.15, 22, 22]} />
          <meshStandardMaterial color="#fff" emissive={f.color} emissiveIntensity={1.8} />
        </mesh>
      </group>
      <Etiqueta pos={[P[0] + 0.15, P[1] + 0.5, 0.05]} color={f.color}>
        f({fmt2(xPos)}) = {fmt2(y)}
      </Etiqueta>
    </group>
  );
}

/* ── Sondas laterales: el mismo acercamiento por la izquierda y por la derecha ─
 * Dos esferas en x = a ∓ δ (δ = |x − a|). Si f es continua en a convergen al
 * mismo valor; si hay salto o asíntota, se separan. */
const SONDA_IZQ = "#60a5fa";
const SONDA_DER = "#f472b6";

function Sondas({ funcId, v, xPos }: { funcId: FuncId; v: Vista; xPos: number }) {
  const { S } = useMemo(() => hacerMapa(v), [v]);
  const f = func(funcId);
  const delta = Math.max(Math.abs(xPos - f.a), 0.02);
  const lados: [number, string][] = [[f.a - delta, SONDA_IZQ], [f.a + delta, SONDA_DER]];
  return (
    <group>
      {lados.map(([x, col]) => {
        const y = evalFunc(funcId, x);
        if (!Number.isFinite(y) || x < v.xmin || x > v.xmax || y < v.ymin || y > v.ymax) return null;
        return (
          <mesh key={col} position={S(x, y)}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Escena del Teorema del Valor Intermedio ──────────────────────────────── */
function EscenaTvi({ nObj }: { nObj: number }) {
  const v = TVI.vista;
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (pulso.current) pulso.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.16);
  });

  const curva = useMemo(() => {
    return muestrearG()
      .filter(([x, y]) => x >= v.xmin && x <= v.xmax && y >= v.ymin && y <= v.ymax)
      .map(([x, y]) => S(x, y));
  }, [v, S]);

  const c = bisectN(nObj);
  const esRaiz = Math.abs(nObj) < 1e-9;

  const horizontal: Pt[] = [[-BX, sy(nObj), 0], [BX, sy(nObj), 0]];
  const vertA: Pt[] = [[sx(TVI.a), -BY, 0], [sx(TVI.a), BY, 0]];
  const vertB: Pt[] = [[sx(TVI.b), -BY, 0], [sx(TVI.b), BY, 0]];
  const vertC: Pt[] = [[sx(c), sy(v.ymin), 0], [sx(c), sy(nObj), 0]];

  return (
    <group>
      {/* curva g */}
      {curva.length > 1 && <CurvaTubo puntos={curva} color="#a78bfa" grosor={0.081} />}

      {/* límites del intervalo [a,b] */}
      <Line points={vertA} color={X_COL} lineWidth={1.4} dashed dashSize={0.14} gapSize={0.12} transparent opacity={0.5} />
      <Line points={vertB} color={X_COL} lineWidth={1.4} dashed dashSize={0.14} gapSize={0.12} transparent opacity={0.5} />

      {/* extremos (a, g(a)) y (b, g(b)) */}
      <mesh position={S(TVI.a, TVI.ga)}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial color="#fff" emissive={HOLE_COL} emissiveIntensity={1.4} />
      </mesh>
      <Etiqueta pos={[S(TVI.a, TVI.ga)[0] - 0.7, S(TVI.a, TVI.ga)[1] - 0.1, 0.05]} color={HOLE_COL}>
        g(1) = −1
      </Etiqueta>
      <mesh position={S(TVI.b, TVI.gb)}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial color="#fff" emissive={OK_COL} emissiveIntensity={1.4} />
      </mesh>
      <Etiqueta pos={[S(TVI.b, TVI.gb)[0] - 0.7, S(TVI.b, TVI.gb)[1] + 0.1, 0.05]} color={OK_COL}>
        g(2) = 5
      </Etiqueta>

      {/* recta objetivo y = N */}
      <Line points={horizontal} color={esRaiz ? OK_COL : "#fbbf24"} lineWidth={1.8} dashed dashSize={0.18} gapSize={0.12} transparent opacity={0.7} />

      {/* punto garantizado (c, N) */}
      <Line points={vertC} color={esRaiz ? OK_COL : "#fbbf24"} lineWidth={1.6} dashed dashSize={0.14} gapSize={0.1} transparent opacity={0.6} />
      <group ref={pulso} position={S(c, nObj)}>
        <mesh>
          <sphereGeometry args={[0.16, 22, 22]} />
          <meshStandardMaterial color="#fff" emissive={esRaiz ? OK_COL : "#fbbf24"} emissiveIntensity={2} />
        </mesh>
      </group>
      <Etiqueta pos={[S(c, nObj)[0] + 0.2, S(c, nObj)[1] + 0.55, 0.05]} color={esRaiz ? OK_COL : "#fbbf24"}>
        c ≈ {fmt3Local(c)}
      </Etiqueta>
    </group>
  );
}

function fmt3Local(n: number): string {
  return n.toLocaleString("es-MX", { maximumFractionDigits: 4 }).replace("-", "−");
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, funcId, xPos, nObj, accent, resetNonce }: ContinuidadSceneProps) {
  const f = func(funcId);
  const v = modo === "tvi" ? TVI.vista : f.vista;

  // Encuadre: el plano llena ~60 % del alto, entre la barra y la misión; en
  // pantallas angostas se aleja hasta que quepa todo el ancho.
  const camera = useThree((st) => st.camera);
  const ancho = useThree((st) => st.size.width);
  const alto = useThree((st) => st.size.height);
  useEffect(() => {
    const aspecto = ancho / Math.max(alto, 1);
    const dist = Math.max(15.5, (BX * 2 + 1.2) / (2 * Math.tan((44 * Math.PI) / 360) * aspecto));
    camera.position.set(dist * 0.16, 1.5 + dist * 0.04, dist);
    camera.lookAt(0, -0.5, 0);
  }, [camera, ancho, alto, modo]);

  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-BY - 0.5} />


      <group key={`${modo}-${funcId}-${resetNonce}`}>
        <Plano v={v} />
        {modo === "continuidad" ? (
          <>
            <Curva funcId={funcId} v={v} color={f.color} />
            <Marcadores funcId={funcId} v={v} />
            <Sondas funcId={funcId} v={v} xPos={xPos} />
            <Movil funcId={funcId} v={v} xPos={xPos} />
          </>
        ) : (
          <EscenaTvi nObj={nObj} />
        )}
      </group>



      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.55}
        target={[0, -0.5, 0]}
        maxDistance={40}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function ContinuidadScene(props: ContinuidadSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.2, 2.4, 13], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
