"use client";

/**
 * Escena 3D — "El límite: a qué se acerca f(x) cuando x→a" (PM-V-P01).
 *
 * Un PLANO CARTESIANO flotante (z = 0) que se orbita, con escala propia por caso
 * para mostrar valores REALES (h/km/h, radianes…). El alumno acerca x al punto
 * `a` (por la izquierda o por la derecha) y ve cómo el punto P = (x, f(x)) se
 * desliza sobre la curva hacia el blanco (a, L):
 *
 *  · una CRUZ de puntos marca el objetivo: la recta vertical x = a y la
 *    horizontal y = L (el valor del límite).
 *  · en (a, L) hay un HUECO ABIERTO (anillo) cuando f(a) no existe (0/0), o un
 *    punto lleno cuando la función es continua ahí.
 *  · guías punteadas bajan del punto a los ejes mostrando x y f(x).
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y useFrame solo late en refs.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  caso, evalCaso, muestrear, conUnidad, cercania,
  type CasoId, type Vista,
} from "./limites-data";

export interface LimitesSceneProps {
  casoId: CasoId;
  xPos: number;
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const X_COL = "#fbbf24";      // posición de x (entrada)
const LIM_COL = "#34D399";    // valor del límite L
const HOLE_COL = "#f87171";   // hueco (f(a) no existe)

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

      {v.xticks.filter((t) => t !== ay0).map((t) => (
        <Etiqueta key={`tx${t}`} pos={[sx(t), sy(ax0) - 0.34, 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
      {v.yticks.filter((t) => t !== ax0).map((t) => (
        <Etiqueta key={`ty${t}`} pos={[sx(ay0) - 0.42, sy(t), 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
    </group>
  );
}

/* ── Curva del caso (una o dos polilíneas si pasa por el hueco) ───────────── */
function Curva({ casoId, v, color }: { casoId: CasoId; v: Vista; color: string }) {
  const { S } = useMemo(() => hacerMapa(v), [v]);
  const polis = useMemo(() => {
    return muestrear(casoId).map((poli) =>
      poli
        .filter(([x, y]) => x >= v.xmin && x <= v.xmax && y >= v.ymin && y <= v.ymax)
        .map(([x, y]) => S(x, y)),
    );
  }, [casoId, v, S]);
  return (
    <>
      {polis.map((pts, i) =>
        pts.length > 1 ? <Line key={i} points={pts} color={color} lineWidth={4.5} /> : null,
      )}
    </>
  );
}

/* ── Objetivo: cruz x=a / y=L + marcador en (a, L) ────────────────────────── */
function Objetivo({ casoId, v }: { casoId: CasoId; v: Vista }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const c = caso(casoId);

  // anillo del hueco (círculo abierto) en coordenadas de escena
  const anillo = useMemo(() => {
    const P = S(c.a, c.L);
    const pts: Pt[] = [];
    const n = 40;
    const rad = 0.16;
    for (let i = 0; i <= n; i++) {
      const t = (2 * Math.PI * i) / n;
      pts.push([P[0] + rad * Math.cos(t), P[1] + rad * Math.sin(t), P[2]]);
    }
    return pts;
  }, [c.a, c.L, S]);

  const dentroX = c.a >= v.xmin && c.a <= v.xmax;
  const dentroY = c.L >= v.ymin && c.L <= v.ymax;
  const vertical: Pt[] = [[sx(c.a), -BY, 0], [sx(c.a), BY, 0]];
  const horizontal: Pt[] = [[-BX, sy(c.L), 0], [BX, sy(c.L), 0]];

  return (
    <group>
      {dentroX && <Line points={vertical} color={X_COL} lineWidth={1.6} dashed dashSize={0.16} gapSize={0.12} transparent opacity={0.6} />}
      {dentroY && <Line points={horizontal} color={LIM_COL} lineWidth={1.6} dashed dashSize={0.16} gapSize={0.12} transparent opacity={0.6} />}

      {dentroX && (
        <Etiqueta pos={[sx(c.a), -BY - 0.42, 0]} color={X_COL} size={11} bg="rgba(6,16,31,0.85)">
          x → {c.a.toLocaleString("es-MX", { maximumFractionDigits: 1 })}
        </Etiqueta>
      )}
      {dentroY && (
        <Etiqueta pos={[-BX - 0.7, sy(c.L), 0]} color={LIM_COL} size={11.5} bg="rgba(6,16,31,0.92)">
          L = {c.L.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
        </Etiqueta>
      )}

      {/* marcador en (a, L): hueco abierto si f(a) no existe, punto lleno si sí */}
      {dentroX && dentroY && (
        c.hueco ? (
          <>
            <Line points={anillo} color={HOLE_COL} lineWidth={3} />
            <Etiqueta pos={[S(c.a, c.L)[0] + 0.25, S(c.a, c.L)[1] + 0.5, 0.05]} color={HOLE_COL} size={11} bg="rgba(6,16,31,0.92)">
              f({c.a.toLocaleString("es-MX", { maximumFractionDigits: 1 })}) no existe (0/0)
            </Etiqueta>
          </>
        ) : (
          <mesh position={S(c.a, c.L)}>
            <sphereGeometry args={[0.15, 22, 22]} />
            <meshStandardMaterial color="#fff" emissive={LIM_COL} emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        )
      )}
    </group>
  );
}

/* ── Punto móvil P = (x, f(x)) que se acerca al objetivo ──────────────────── */
function Movil({ casoId, v, xPos }: { casoId: CasoId; v: Vista; xPos: number }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (pulso.current) pulso.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.16);
  });

  const c = caso(casoId);
  const y = evalCaso(casoId, xPos);
  const visible = Number.isFinite(y) && xPos >= v.xmin && xPos <= v.xmax && y >= v.ymin && y <= v.ymax;
  if (!visible) return null;

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;
  const P = S(xPos, y);
  const baseX: Pt = [sx(xPos), sy(ax0), 0];
  const baseY: Pt = [sx(ay0), sy(y), 0];

  return (
    <group>
      {/* guías al eje X y al eje Y */}
      <Line points={[baseX, P]} color={X_COL} lineWidth={2.2} dashed dashSize={0.16} gapSize={0.11} />
      <Line points={[P, baseY]} color={LIM_COL} lineWidth={2.2} dashed dashSize={0.16} gapSize={0.11} />

      <mesh position={baseX}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={X_COL} emissive={X_COL} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>

      {/* punto P pulsante sobre la curva */}
      <group ref={pulso} position={P}>
        <mesh>
          <sphereGeometry args={[0.15, 22, 22]} />
          <meshStandardMaterial color="#fff" emissive={c.color} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>
      <Etiqueta pos={[P[0] + 0.15, P[1] + 0.5, 0.05]} color={c.color} size={12} bg="rgba(6,16,31,0.92)">
        f(x) = {conUnidad(y, c.unidadY, 2)}
      </Etiqueta>
      <Etiqueta pos={[baseX[0], baseX[1] - 0.4, 0]} color={X_COL} size={10.5}>
        x = {conUnidad(xPos, c.unidadX, 3)} · |x−a| = {cercania(casoId, xPos)}
      </Etiqueta>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ casoId, xPos, accent, resetNonce }: LimitesSceneProps) {
  const c = caso(casoId);
  const v = c.vista;

  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.5} color={accent} />

      <group key={`${casoId}-${resetNonce}`}>
        <Plano v={v} />
        <Curva casoId={casoId} v={v} color={c.color} />
        <Objetivo casoId={casoId} v={v} />
        <Movil casoId={casoId} v={v} xPos={xPos} />
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

export default function LimitesScene(props: LimitesSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.2, 2.4, 13], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
