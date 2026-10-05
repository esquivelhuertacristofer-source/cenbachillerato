"use client";

/**
 * Escena 3D — "La derivada: la secante que se vuelve tangente (cociente de
 * Newton)" (PM-V-P03-A2).
 *
 * Un PLANO CARTESIANO flotante (z = 0) que se orbita, con escala propia por caso.
 * Dibuja:
 *  · la curva f(x),
 *  · el punto de tangencia P = (a, f(a)),
 *  · un segundo punto Q = (a+h, f(a+h)) sobre la curva,
 *  · la recta SECANTE por P y Q (su pendiente es el cociente de Newton),
 *  · la recta TANGENTE en P (pendiente f'(a)).
 * Cuando h → 0, Q se acerca a P y la secante se confunde con la tangente.
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
  func, evalFunc, deriv, muestrear, tangente, pendienteSecante, clipRecta, cruzaCorte,
  fmt2, type FuncId, type Vista,
} from "./derivada-data";

export interface DerivadaSceneProps {
  funcId: FuncId;
  aPos: number;     // punto de tangencia a
  hSep: number;     // separación h del segundo punto (cociente de Newton)
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const SEC_COL = "#fbbf24";    // recta secante (cociente de Newton)
const TAN_COL = "#34D399";    // recta tangente (derivada)
const Q_COL = "#f472b6";      // segundo punto (a+h)

const BX = 5.6;               // semiancho del plano (unidades de escena)
const BY = 3.8;               // semialto del plano (unidades de escena)

/* ── Mapeo datos → plano (cierre sobre la vista activa) ───────────────────── */
function hacerMapa(v: Vista) {
  const sx = (dx: number) => -BX + ((dx - v.xmin) / (v.xmax - v.xmin)) * 2 * BX;
  const sy = (dy: number) => -BY + ((dy - v.ymin) / (v.ymax - v.ymin)) * 2 * BY;
  const S = (dx: number, dy: number): Pt => [sx(dx), sy(dy), 0];
  return { sx, sy, S };
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

/* ── Curva de f (una o varias polilíneas si hay asíntota) ─────────────────── */
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

/* ── Secante + tangente + puntos P y Q ────────────────────────────────────── */
function Rectas({ funcId, v, aPos, hSep }: { funcId: FuncId; v: Vista; aPos: number; hSep: number }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (pulso.current) pulso.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.16);
  });

  const f = func(funcId);
  const fa = evalFunc(funcId, aPos);
  const m = deriv(funcId, aPos);
  const { m: mt, b: bt } = tangente(funcId, aPos);

  // segundo punto Q = (a+h, f(a+h)); válido si no cruza una asíntota
  const xq = aPos + hSep;
  const fq = evalFunc(funcId, xq);
  const secValida = !cruzaCorte(funcId, aPos, hSep) && Number.isFinite(fq);
  const mSec = pendienteSecante(funcId, aPos, hSep);
  const bSec = fa - mSec * aPos;

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;

  // segmentos recortados a la vista (el React Compiler los memoiza)
  const tanSeg: Pt[] = clipRecta(mt, bt, v).map(([x, y]) => S(x, y));
  const secSeg: Pt[] = secValida ? clipRecta(mSec, bSec, v).map(([x, y]) => S(x, y)) : [];

  const pVisible = Number.isFinite(fa) && fa >= v.ymin && fa <= v.ymax;
  const qVisible = secValida && fq >= v.ymin && fq <= v.ymax && xq >= v.xmin && xq <= v.xmax;

  const P = S(aPos, fa);
  const Q = S(xq, fq);

  return (
    <group>
      {/* recta SECANTE (cociente de Newton) */}
      {secSeg.length === 2 && (
        <Line points={[secSeg[0]!, secSeg[1]!]} color={SEC_COL} lineWidth={2.6} dashed dashSize={0.22} gapSize={0.12} transparent opacity={0.92} />
      )}
      {/* recta TANGENTE (derivada) */}
      {tanSeg.length === 2 && (
        <CurvaTubo puntos={[tanSeg[0]!, tanSeg[1]!]} color={TAN_COL} grosor={0.061} />
      )}

      {/* segmento h (base) entre las verticales de a y a+h */}
      {pVisible && qVisible && (
        <>
          <Line
            points={[[sx(aPos), sy(ax0), 0], [sx(xq), sy(ax0), 0]]}
            color={SEC_COL} lineWidth={2} transparent opacity={0.7}
          />
          <Etiqueta pos={[(sx(aPos) + sx(xq)) / 2, sy(ax0) - 0.36, 0]} color={SEC_COL}>
            h = {fmt2(hSep)}
          </Etiqueta>
          <Line points={[[sx(xq), sy(ax0), 0], Q]} color={Q_COL} lineWidth={1.4} dashed dashSize={0.13} gapSize={0.1} transparent opacity={0.5} />
        </>
      )}

      {/* punto Q = (a+h, f(a+h)) */}
      {qVisible && (
        <>
          <mesh position={Q}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color="#fff" emissive={Q_COL} emissiveIntensity={1.4} />
          </mesh>
          <Etiqueta pos={[Q[0] + 1.3, Q[1] + 0.55, 0.05]} color={Q_COL} ancha>
            Q = ({fmt2(xq)}, {fmt2(fq)})
          </Etiqueta>
        </>
      )}

      {/* punto de tangencia P = (a, f(a)) */}
      {pVisible && (
        <>
          <Line points={[[sx(aPos), sy(ax0), 0], P]} color={TAN_COL} lineWidth={1.4} dashed dashSize={0.13} gapSize={0.1} transparent opacity={0.5} />
          <Line points={[[sx(ay0), sy(fa), 0], P]} color={TAN_COL} lineWidth={1.4} dashed dashSize={0.13} gapSize={0.1} transparent opacity={0.4} />
          <group ref={pulso} position={P}>
            <mesh>
              <sphereGeometry args={[0.16, 22, 22]} />
              <meshStandardMaterial color="#fff" emissive={f.color} emissiveIntensity={1.9} />
            </mesh>
          </group>
          <Etiqueta pos={[P[0] - 1.3, P[1] + 0.55, 0.05]} color={f.color} ancha>
            P = ({fmt2(aPos)}, {fmt2(fa)})
          </Etiqueta>
          <Etiqueta pos={[P[0] + 0.9, P[1] - 0.8, 0.05]} color={TAN_COL}>
            f&apos;({fmt2(aPos)}) = {fmt2(m)}
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ funcId, aPos, hSep, accent, resetNonce }: DerivadaSceneProps) {
  const f = func(funcId);
  const v = f.vista;

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
  }, [camera, ancho, alto]);

  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-BY - 0.5} />


      <group key={`${funcId}-${resetNonce}`}>
        <Plano v={v} />
        <Curva funcId={funcId} v={v} color={f.color} />
        <Rectas funcId={funcId} v={v} aPos={aPos} hSep={hSep} />
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

export default function DerivadaScene(props: DerivadaSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.2, 2.4, 13], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
