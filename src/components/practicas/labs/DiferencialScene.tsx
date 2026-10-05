"use client";

/**
 * Escena 3D — "El diferencial: la recta tangente como aproximación"
 * (PM-V-P08-A2).
 *
 * Dos modos en un mismo Canvas (se remonta al cambiar de modo):
 *
 *  · MODO "valor" — plano cartesiano flotante. La curva f (√x o eˣ) y su
 *    LINEALIZACIÓN L(x) = f(a) + f'(a)(x − a) (la recta tangente en el punto
 *    base a). Una sonda en x muestra dos puntos: el real f(x) sobre la curva y
 *    el estimado L(x) sobre la tangente; la brecha entre ambos es el ERROR.
 *    En el punto base se dibuja el triángulo del diferencial: cateto dx
 *    (horizontal) y cateto dy = f'(a)·dx (vertical sobre la tangente).
 *
 *  · MODO "esfera" — una esfera de radio r con una cáscara translúcida de
 *    grosor dr. El diferencial dV = 4π r²·dr es exactamente el volumen de esa
 *    cáscara delgada (superficie × grosor). El grosor se dibuja EXAGERADO para
 *    que sea visible; el valor real de dr aparece en la etiqueta.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y useFrame solo late/gira en refs.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";
import {
  linCaso, lineal, muestrear, clipRecta, tangenteBase,
  dVol, fmt1, fmt2, fmt3,
  type LinId, type Vista,
} from "./diferencial-data";

export interface DiferencialSceneProps {
  modo: "valor" | "esfera";
  casoId: LinId;     // modo "valor"
  xPos: number;      // sonda x (modo "valor")
  r: number;         // modo "esfera"
  dr: number;        // modo "esfera"
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const TAN_COL = "#7dd3fc";    // linealización (recta tangente)
const BASE_COL = "#34D399";   // punto base a
const REAL_COL = "#34D399";   // valor real f(x)
const EST_COL = "#f472b6";    // valor estimado L(x)
const ERR_COL = "#f87171";    // error |f(x) − L(x)|
const DX_COL = "#7dd3fc";     // cateto dx
const DY_COL = "#fbbf24";     // cateto dy (diferencial)

const BX = 4.6;               // semiancho del plano
const BY = 3.1;               // semialto del plano
const W_S = 0.42;             // escala cm → unidades de escena (esfera)
const SHELL_EXAG = 14;        // factor de exageración visual del grosor dr

/* ── Mapeo datos → plano ──────────────────────────────────────────────────── */
function hacerMapa(v: Vista) {
  const sx = (dx: number) => -BX + ((dx - v.xmin) / (v.xmax - v.xmin)) * 2 * BX;
  const sy = (dy: number) => -BY + ((dy - v.ymin) / (v.ymax - v.ymin)) * 2 * BY;
  const S = (dx: number, dy: number): Pt => [sx(dx), sy(dy), 0];
  return { sx, sy, S };
}

/* ── Etiqueta: tamaño fijo en píxeles (≥14), desplazada según el lado para que
 *    nunca se encimen entre sí ni tapen el punto que nombran ──────────────────── */
type Lado = "up" | "down" | "left" | "right";
const DESPLAZA: Record<Lado, string> = {
  up: "translate(0,-70%)",
  down: "translate(0,70%)",
  left: "translate(-62%,0)",
  right: "translate(62%,0)",
};

function Etiqueta({
  pos, color, children, lado = "up",
}: {
  pos: Pt; color: string; children: React.ReactNode; lado?: Lado;
}) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ transform: DESPLAZA[lado] }}>
        <div style={{
          whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
          border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15,
          fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}>
          {children}
        </div>
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

  const ejeX: Pt[] = [S(v.xmin, Math.max(v.ymin, 0)), S(v.xmax, Math.max(v.ymin, 0))];
  const ejeY: Pt[] = [S(Math.max(v.xmin, 0), v.ymin), S(Math.max(v.xmin, 0), v.ymax)];

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

/* ── Curva f del caso ─────────────────────────────────────────────────────── */
function CurvaTrazo({ casoId, color, width }: { casoId: LinId; color: string; width: number }) {
  const c = linCaso(casoId);
  const { S } = useMemo(() => hacerMapa(c.vista), [c.vista]);
  const polis = useMemo(() => {
    return muestrear(c).map((poli) =>
      poli
        .filter(([x, y]) => x >= c.vista.xmin && x <= c.vista.xmax && y >= c.vista.ymin && y <= c.vista.ymax)
        .map(([x, y]) => S(x, y)),
    );
  }, [c, S]);
  return (
    <>
      {polis.map((pts, i) =>
        pts.length > 1
          ? <Line key={i} points={pts} color={color} lineWidth={width} />
          : null,
      )}
    </>
  );
}

/* ── Linealización: la recta tangente en el punto base a ──────────────────── */
function Linealizacion({ casoId }: { casoId: LinId }) {
  const c = linCaso(casoId);
  const { S } = useMemo(() => hacerMapa(c.vista), [c.vista]);
  const { m, b } = tangenteBase(c);
  const seg: Pt[] = clipRecta(m, b, c.vista).map(([x, y]) => S(x, y));
  return seg.length === 2 ? (
    <Line points={[seg[0]!, seg[1]!]} color={TAN_COL} lineWidth={3} dashed dashSize={0.3} gapSize={0.16} />
  ) : null;
}

/* ── Sonda en x: puntos real vs estimado, error y triángulo del diferencial ─ */
function SondaValor({ casoId, xPos }: { casoId: LinId; xPos: number }) {
  const c = linCaso(casoId);
  const v = c.vista;
  const { sx, S } = hacerMapa(v); // el React Compiler memoiza este const
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    const k = 1 + Math.sin(s.clock.elapsedTime * 4) * 0.16;
    if (pulso.current) pulso.current.scale.setScalar(k);
  });

  const a = c.a;
  const fa = c.f(a);
  const fx = c.f(xPos);
  const Lx = lineal(c, xPos);
  const dxv = xPos - a;
  const dyv = c.d1(a) * dxv;

  const dentro = (y: number) => Number.isFinite(y) && y >= v.ymin && y <= v.ymax && xPos >= v.xmin && xPos <= v.xmax;

  const Preal = S(xPos, fx);
  const Pest = S(xPos, Lx);

  // triángulo del diferencial en el punto base: dx horizontal, dy vertical
  const B = S(a, fa);
  const C = S(xPos, fa);          // esquina (avanza dx sobre la horizontal)
  const Ttop = S(xPos, fa + dyv); // sube dy sobre la tangente

  return (
    <group>
      {/* punto base a */}
      <mesh position={B}>
        <sphereGeometry args={[0.15, 22, 22]} />
        <meshStandardMaterial color="#fff" emissive={BASE_COL} emissiveIntensity={1.7} />
      </mesh>
      <Etiqueta pos={B} color={BASE_COL} lado="left">a = {fmt1(a)}</Etiqueta>

      {/* triángulo del diferencial (dx, dy) */}
      <Line points={[B, C]} color={DX_COL} lineWidth={2.2} />
      <Line points={[C, Ttop]} color={DY_COL} lineWidth={2.2} />

      {/* sonda vertical en x */}
      <Line points={[[sx(xPos), -BY, 0], [sx(xPos), BY, 0]]} color="#7dd3fc" lineWidth={2} dashed dashSize={0.16} gapSize={0.12} transparent opacity={0.4} />

      {/* brecha = error, entre el punto estimado y el real */}
      {dentro(fx) && dentro(Lx) && Math.abs(fx - Lx) > 1e-4 && (
        <CurvaTubo puntos={[Pest, Preal]} color={ERR_COL} grosor={0.072} />
      )}

      {/* punto estimado L(x) sobre la tangente */}
      {dentro(Lx) && (
        <>
          <mesh position={Pest}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color="#fff" emissive={EST_COL} emissiveIntensity={1.8} />
          </mesh>
          <Etiqueta pos={Pest} color={EST_COL} lado={Lx >= fx ? "up" : "down"}>
            L(x) ≈ {fmt3(Lx)}
          </Etiqueta>
        </>
      )}

      {/* punto real f(x) sobre la curva (pulsa) */}
      {dentro(fx) && (
        <>
          <group ref={pulso} position={Preal}>
            <mesh>
              <sphereGeometry args={[0.14, 22, 22]} />
              <meshStandardMaterial color="#fff" emissive={REAL_COL} emissiveIntensity={1.9} />
            </mesh>
          </group>
          <Etiqueta pos={Preal} color={REAL_COL} lado={Lx >= fx ? "down" : "up"}>
            f(x) = {fmt3(fx)}
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Esfera con cáscara de grosor dr (modo error) ─────────────────────────── */
function EsferaError({ r, dr, accent }: { r: number; dr: number; accent: string }) {
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (giro.current) giro.current.rotation.y += dt * 0.3;
  });

  const ancho = useThree((st) => st.size.width) >= 640;
  const rW = r * W_S;
  const shellW = rW + dr * W_S * SHELL_EXAG; // grosor exagerado para que se vea

  return (
    <group position={[0, 0.2, 0]}>
      <group ref={giro}>
        {/* esfera interior (radio r) */}
        <mesh>
          <sphereGeometry args={[rW, 48, 48]} />
          <meshStandardMaterial
            color={accent} transparent opacity={0.55}
            emissive={accent} emissiveIntensity={0.25} metalness={0.3} roughness={0.35}
          />
        </mesh>
        {/* cáscara exterior (radio r + dr): el diferencial dV */}
        <mesh>
          <sphereGeometry args={[shellW, 48, 48]} />
          <meshStandardMaterial
            color={ERR_COL} transparent opacity={0.3} side={THREE.DoubleSide}
            emissive={ERR_COL} emissiveIntensity={0.4} depthWrite={false}
          />
        </mesh>
        {/* línea ecuatorial que marca r y r+dr */}
        <Line points={radio(rW)} color={AXIS_COL} lineWidth={2.6} />
      </group>

      {ancho && (
        <Etiqueta pos={[0, shellW, 0]} color={ERR_COL} lado="up">
          cáscara dV = {fmt2(dVol(r, dr))} cm³
        </Etiqueta>
      )}
      <Etiqueta pos={[rW, 0, 0]} color={AXIS_COL} lado="right">r = {fmt1(r)} cm</Etiqueta>
    </group>
  );
}

/** Anillo ecuatorial (en el plano XZ) de radio rad. */
function radio(rad: number): Pt[] {
  const pts: Pt[] = [];
  const n = 64;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push([Math.cos(t) * rad, 0, Math.sin(t) * rad]);
  }
  return pts;
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, casoId, xPos, r, dr, accent, resetNonce }: DiferencialSceneProps) {
  const c = linCaso(casoId);
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={modo === "esfera" ? -3.6 : -BY - 0.5} />


      <group key={resetNonce}>
        {modo === "valor" ? (
          <group position={[0, 0, 0]}>
            <Plano v={c.vista} />
            <CurvaTrazo casoId={casoId} color={c.color} width={4.2} />
            <Linealizacion casoId={casoId} />
            <SondaValor casoId={casoId} xPos={xPos} />
          </group>
        ) : (
          <EsferaError r={r} dr={dr} accent={accent} />
        )}
      </group>



      <Encuadre modo={modo} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={modo === "esfera" ? 7 : 9}
        maxDistance={32}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        target={modo === "esfera" ? [0, -0.1, 0] : [0, -0.6, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

/** Encuadre: el contenido ocupa ~60 % del alto, entre la barra y la misión; en
 *  pantallas angostas la cámara se aleja para que quepa el plano completo. */
function Encuadre({ modo }: { modo: "valor" | "esfera" }) {
  const camera = useThree((st) => st.camera);
  const size = useThree((st) => st.size);
  const aspect = size.width / Math.max(1, size.height);
  const base = modo === "esfera" ? 13.5 : 14.5;
  const z = Math.min(30, Math.max(base, (modo === "esfera" ? 5.2 : BX + 0.9) / (Math.tan((44 / 2) * (Math.PI / 180)) * Math.min(1.4, aspect))));
  useEffect(() => {
    camera.position.set(modo === "esfera" ? 2.4 : 0.4, modo === "esfera" ? 2.4 : 0.8, z);
    camera.updateProjectionMatrix();
  }, [camera, modo, z]);
  return null;
}

export default function DiferencialScene(props: DiferencialSceneProps) {
  const cam: Pt = props.modo === "esfera" ? [3, 2.5, 13] : [0.5, 1, 15];
  return (
    <Canvas
      key={props.modo}
      shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}
      camera={{ position: cam, fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}
