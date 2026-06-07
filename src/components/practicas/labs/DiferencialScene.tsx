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
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  linCaso, lineal, muestrear, clipRecta, tangenteBase,
  volEsfera, dVol, fmt1, fmt2, fmt3,
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

/* ── Etiqueta flotante ────────────────────────────────────────────────────── */
function Etiqueta({
  pos, color, children, size = 11.5, bg = "rgba(6,16,31,0.82)",
}: {
  pos: Pt; color: string; children: React.ReactNode; size?: number; bg?: string;
}) {
  return (
    <Html position={pos} center distanceFactor={16} pointerEvents="none">
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

  const ejeX: Pt[] = [S(v.xmin, Math.max(v.ymin, 0)), S(v.xmax, Math.max(v.ymin, 0))];
  const ejeY: Pt[] = [S(Math.max(v.xmin, 0), v.ymin), S(Math.max(v.xmin, 0), v.ymax)];
  const fmtTick = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 1 }).replace("-", "−");

  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={GRID_COL} transparent opacity={0.5} />
      </lineSegments>

      <Line points={ejeX} color={AXIS_COL} lineWidth={2.4} />
      <Line points={ejeY} color={AXIS_COL} lineWidth={2.4} />
      <Etiqueta pos={[BX + 0.5, sy(Math.max(v.ymin, 0)), 0]} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">{v.xlabel}</Etiqueta>
      <Etiqueta pos={[sx(Math.max(v.xmin, 0)) - 0.1, BY + 0.5, 0]} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">{v.ylabel}</Etiqueta>

      {v.xticks.map((t) => (
        <Etiqueta key={`tx${t}`} pos={[sx(t), -BY - 0.34, 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
      {v.yticks.filter((t) => t !== 0).map((t) => (
        <Etiqueta key={`ty${t}`} pos={[-BX - 0.6, sy(t), 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
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
        <meshStandardMaterial color="#fff" emissive={BASE_COL} emissiveIntensity={1.7} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[B[0], B[1] - 0.55, 0]} color={BASE_COL} size={10.5}>base a = {fmt1(a)}</Etiqueta>

      {/* triángulo del diferencial (dx, dy) */}
      <Line points={[B, C]} color={DX_COL} lineWidth={2.2} />
      <Line points={[C, Ttop]} color={DY_COL} lineWidth={2.2} />
      <Etiqueta pos={[(B[0] + C[0]) / 2, B[1] - 0.34, 0]} color={DX_COL} size={9.5} bg="rgba(6,16,31,0.7)">dx = {fmt2(dxv)}</Etiqueta>
      <Etiqueta pos={[C[0] + 0.7, (C[1] + Ttop[1]) / 2, 0]} color={DY_COL} size={9.5} bg="rgba(6,16,31,0.7)">dy = {fmt3(dyv)}</Etiqueta>

      {/* sonda vertical en x */}
      <Line points={[[sx(xPos), -BY, 0], [sx(xPos), BY, 0]]} color="#7dd3fc" lineWidth={1.3} dashed dashSize={0.16} gapSize={0.12} transparent opacity={0.4} />
      <Etiqueta pos={[sx(xPos), -BY - 0.4, 0]} color="#7dd3fc" size={10} bg="rgba(6,16,31,0.85)">x = {fmt2(xPos)}</Etiqueta>

      {/* brecha = error, entre el punto estimado y el real */}
      {dentro(fx) && dentro(Lx) && Math.abs(fx - Lx) > 1e-4 && (
        <Line points={[Pest, Preal]} color={ERR_COL} lineWidth={4} />
      )}

      {/* punto estimado L(x) sobre la tangente */}
      {dentro(Lx) && (
        <>
          <mesh position={Pest}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color="#fff" emissive={EST_COL} emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
          <Etiqueta pos={[Pest[0] + 1.0, Pest[1] - 0.2, 0]} color={EST_COL} size={11} bg="rgba(6,16,31,0.95)">
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
              <meshStandardMaterial color="#fff" emissive={REAL_COL} emissiveIntensity={1.9} toneMapped={false} />
            </mesh>
          </group>
          <Etiqueta pos={[Preal[0] + 1.0, Preal[1] + 0.42, 0.05]} color={REAL_COL} size={11} bg="rgba(6,16,31,0.95)">
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
            color={ERR_COL} transparent opacity={0.18} side={THREE.DoubleSide}
            emissive={ERR_COL} emissiveIntensity={0.4} depthWrite={false}
          />
        </mesh>
        {/* malla de la superficie exterior, para marcar el grosor */}
        <mesh>
          <sphereGeometry args={[shellW, 24, 16]} />
          <meshBasicMaterial color={ERR_COL} wireframe transparent opacity={0.35} />
        </mesh>
        {/* línea ecuatorial que marca r y r+dr */}
        <Line points={radio(rW)} color={AXIS_COL} lineWidth={2} />
      </group>

      <Etiqueta pos={[0, shellW + 0.7, 0]} color={ERR_COL} size={11.5}>
        cáscara = dV = 4π r²·dr
      </Etiqueta>
      <Etiqueta pos={[rW * 0.5, -0.25, rW * 0.5]} color={AXIS_COL} size={11}>r = {fmt1(r)} cm</Etiqueta>
      <Etiqueta pos={[0, -shellW - 0.7, 0]} color="#cdd8ec" size={10} bg="rgba(6,16,31,0.85)">
        dr = {fmt2(dr)} cm (grosor exagerado ×{SHELL_EXAG})
      </Etiqueta>
      <Etiqueta pos={[0, -shellW - 1.25, 0]} color={REAL_COL} size={10.5} bg="rgba(6,16,31,0.9)">
        V = {fmt1(volEsfera(r))} cm³ · dV = {fmt2(dVol(r, dr))} cm³
      </Etiqueta>
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
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.5} color={accent} />

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

      <ContactShadows position={[0, modo === "esfera" ? -3.6 : -BY - 0.5, 0]} opacity={0.28} scale={24} blur={2.6} far={9} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 6, 8]} scale={12} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[6, 2, 5]} scale={6} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-6, 3, 4]} scale={6} color="#e9d5ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={modo === "esfera" ? 7 : 9}
        maxDistance={32}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        target={[0, 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
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
