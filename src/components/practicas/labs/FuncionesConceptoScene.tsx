"use client";

/**
 * Escena 3D — "Concepto de función y sus representaciones" (PM-IV-P01).
 *
 * Un PLANO CARTESIANO flotante (z = 0) que se orbita, con escala propia por
 * relación para mostrar valores REALES (min/°C, s/m, $…). Dos modos:
 *
 *  · MÁQUINA (evaluar): el alumno elige una entrada x; una recta de guía sube
 *    desde el eje X y otra cruza hacia el eje Y marcando la salida f(x). El punto
 *    (x, f(x)) se resalta y la curva ya recorrida se traza en vivo — se ve que a
 *    cada entrada le corresponde EXACTAMENTE UNA salida.
 *
 *  · TEST (¿es función?): un plano vertical barre la gráfica (prueba de la línea
 *    vertical). Si corta la curva en un solo punto → función (verde); si la corta
 *    en dos → NO es función (rojo). La circunferencia falla; la parábola pasa.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y useFrame solo late en un ref.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  rel, evalRel, ramas, muestrear, enDominio, conUnidad,
  type RelId, type Modo, type Vista,
} from "./funciones-concepto-data";

export interface FuncionesConceptoSceneProps {
  relId: RelId;
  modo: Modo;
  xPos: number;
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const IN_COL = "#fbbf24";     // entrada (x)
const OUT_COL = "#34D399";    // salida (f(x))
const OK_COL = "#34D399";     // pasa la prueba
const BAD_COL = "#f87171";    // no pasa la prueba

const BX = 5.6;               // semiancho del plano (unidades de escena)
const BY = 3.8;               // semialto del plano (unidades de escena)

/* ── Mapeo datos → plano (cierre sobre la vista activa) ───────────────────── */
function hacerMapa(v: Vista) {
  const sx = (dx: number) => -BX + ((dx - v.xmin) / (v.xmax - v.xmin)) * 2 * BX;
  const sy = (dy: number) => -BY + ((dy - v.ymin) / (v.ymax - v.ymin)) * 2 * BY;
  const S = (dx: number, dy: number): Pt => [sx(dx), sy(dy), 0];
  return { sx, sy, S };
}

/* ── Etiqueta flotante ────────────────────────────────────────────────────── */
function Etiqueta({
  pos, color, children, size = 11.5, bg = "rgba(6,16,31,0.82)",
}: {
  pos: Pt; color: string; children: React.ReactNode; size?: number; bg?: string;
}) {
  return (
    <Html position={pos} center distanceFactor={15} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", padding: "4px 9px", borderRadius: 9, background: bg,
        border: `1px solid ${color}66`, color: "#fff", fontWeight: 700, fontSize: size,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
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

  // eje en x = 0 si 0 está en rango, si no en el borde inferior/izquierdo
  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;
  const ejeX: Pt[] = [S(v.xmin, ax0), S(v.xmax, ax0)];
  const ejeY: Pt[] = [S(ay0, v.ymin), S(ay0, v.ymax)];

  const fmtTick = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 1 }).replace("-", "−");

  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={GRID_COL} transparent opacity={0.5} />
      </lineSegments>

      <Line points={ejeX} color={AXIS_COL} lineWidth={2.4} />
      <Line points={ejeY} color={AXIS_COL} lineWidth={2.4} />
      <Etiqueta pos={[BX + 0.5, sy(ax0), 0]} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">{v.xlabel}</Etiqueta>
      <Etiqueta pos={[sx(ay0), BY + 0.5, 0]} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">{v.ylabel}</Etiqueta>

      {/* ticks del eje X */}
      {v.xticks.filter((t) => t !== ay0).map((t) => (
        <Etiqueta key={`tx${t}`} pos={[sx(t), sy(ax0) - 0.34, 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
      {/* ticks del eje Y */}
      {v.yticks.filter((t) => t !== ax0).map((t) => (
        <Etiqueta key={`ty${t}`} pos={[sx(ay0) - 0.42, sy(t), 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
    </group>
  );
}

/* ── Curva(s) de la relación ──────────────────────────────────────────────── */
function Curvas({ relId, v, color, tenue }: { relId: RelId; v: Vista; color: string; tenue: boolean }) {
  const { S } = useMemo(() => hacerMapa(v), [v]);
  const polis = useMemo(() => {
    return muestrear(relId).map((poli) =>
      poli
        .filter(([x, y]) => x >= v.xmin && x <= v.xmax && y >= v.ymin && y <= v.ymax)
        .map(([x, y]) => S(x, y)),
    );
  }, [relId, v, S]);
  return (
    <>
      {polis.map((pts, i) =>
        pts.length > 1 ? (
          <Line key={i} points={pts} color={color} lineWidth={tenue ? 3 : 5} transparent opacity={tenue ? 0.5 : 1} />
        ) : null,
      )}
    </>
  );
}

/* ── Modo MÁQUINA: entrada → salida ───────────────────────────────────────── */
function Maquina({ relId, v, xPos, color }: { relId: RelId; v: Vista; xPos: number; color: string }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const out = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (out.current) out.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 3) * 0.18);
  });

  const dentro = enDominio(relId, xPos);
  const y = evalRel(relId, xPos);
  const visible = dentro && Number.isFinite(y) && y >= v.ymin && y <= v.ymax;

  // traza recorrida (de domMin a xPos)
  const r = rel(relId);
  const traza = useMemo(() => {
    const pts: Pt[] = [];
    const N = 90;
    for (let i = 0; i <= N; i++) {
      const x = r.domMin + ((xPos - r.domMin) * i) / N;
      const yy = evalRel(relId, x);
      if (Number.isFinite(yy) && yy >= v.ymin && yy <= v.ymax) pts.push(S(x, yy));
    }
    return pts;
  }, [relId, r.domMin, xPos, v, S]);

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;

  if (!visible) return null;
  const P = S(xPos, y);
  const baseX: Pt = [sx(xPos), sy(ax0), 0]; // pie en el eje X
  const baseY: Pt = [sx(ay0), sy(y), 0];    // pie en el eje Y

  return (
    <group>
      {/* curva ya recorrida, resaltada */}
      {traza.length > 1 && <Line points={traza} color={color} lineWidth={6} />}

      {/* guía entrada: del eje X hasta el punto */}
      <Line points={[baseX, P]} color={IN_COL} lineWidth={2.4} dashed dashSize={0.18} gapSize={0.12} />
      {/* guía salida: del punto al eje Y */}
      <Line points={[P, baseY]} color={OUT_COL} lineWidth={2.4} dashed dashSize={0.18} gapSize={0.12} />

      {/* marcador de entrada en el eje X */}
      <mesh position={baseX}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={IN_COL} emissive={IN_COL} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[baseX[0], baseX[1] - 0.4, 0]} color={IN_COL} size={11}>
        entra x = {entradaTxt(relId, xPos)}
      </Etiqueta>

      {/* punto (x, f(x)) pulsante */}
      <group ref={out} position={P}>
        <mesh>
          <sphereGeometry args={[0.15, 22, 22]} />
          <meshStandardMaterial color="#fff" emissive={OUT_COL} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>
      <Etiqueta pos={[P[0] + 0.15, P[1] + 0.5, 0.05]} color={OUT_COL} size={12.5} bg="rgba(6,16,31,0.92)">
        <strong>sale</strong>&nbsp;{salidaTxt(relId, xPos)}
      </Etiqueta>
    </group>
  );
}

/* ── Modo TEST: prueba de la línea vertical ───────────────────────────────── */
function Test({ relId, v, xPos }: { relId: RelId; v: Vista; xPos: number }) {
  const { sx, S } = useMemo(() => hacerMapa(v), [v]);
  const ys = ramas(relId, xPos).filter((y) => y >= v.ymin && y <= v.ymax);
  const corta = ys.length;
  const esFunc = corta <= 1;
  const col = esFunc ? OK_COL : BAD_COL;

  const lineaTop: Pt = [sx(xPos), BY, 0];
  const lineaBot: Pt = [sx(xPos), -BY, 0];

  return (
    <group>
      {/* plano vertical de barrido (efecto 3D) */}
      <mesh position={[sx(xPos), 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 2 * BY]} />
        <meshBasicMaterial color={col} transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <Line points={[lineaTop, lineaBot]} color={col} lineWidth={3} />

      {/* puntos de corte */}
      {ys.map((y, i) => (
        <mesh key={i} position={S(xPos, y)}>
          <sphereGeometry args={[0.16, 22, 22]} />
          <meshStandardMaterial color="#fff" emissive={col} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      ))}

      <Etiqueta pos={[sx(xPos), BY + 0.45, 0]} color={col} size={12} bg="rgba(6,16,31,0.92)">
        {corta === 0 ? "no corta aquí" : corta === 1 ? "corta en 1 punto ✓" : `corta en ${corta} puntos ✗`}
      </Etiqueta>
    </group>
  );
}

/* ── helpers de etiqueta (texto con unidades reales) ──────────────────────── */
function entradaTxt(relId: RelId, x: number): string {
  const r = rel(relId);
  return conUnidad(x, r.unidadX, 1);
}
function salidaTxt(relId: RelId, x: number): string {
  const r = rel(relId);
  const y = evalRel(relId, x);
  return conUnidad(y, r.unidadY, 1);
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ relId, modo, xPos, accent, resetNonce }: FuncionesConceptoSceneProps) {
  const r = rel(relId);
  const v = r.vista;

  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.5} color={accent} />

      <group key={`${relId}-${modo}-${resetNonce}`}>
        <Plano v={v} />
        {/* en máquina, la curva base va tenue (la traza la resalta); en test, plena */}
        <Curvas relId={relId} v={v} color={r.color} tenue={modo === "maquina"} />
        {modo === "maquina" && r.esFuncion && <Maquina relId={relId} v={v} xPos={xPos} color={r.color} />}
        {modo === "test" && <Test relId={relId} v={v} xPos={xPos} />}
      </group>

      <ContactShadows position={[0, -BY - 0.5, 0]} opacity={0.3} scale={24} blur={2.6} far={9} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 6, 8]} scale={10} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[6, 2, 5]} scale={6} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-6, 3, 4]} scale={6} color="#ffd9b3" />
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
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function FuncionesConceptoScene(props: FuncionesConceptoSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.2, 2.4, 13], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
