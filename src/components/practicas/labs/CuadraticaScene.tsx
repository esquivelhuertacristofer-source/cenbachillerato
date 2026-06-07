"use client";

/**
 * Escena 3D del laboratorio de Ecuaciones cuadráticas — R3F.
 * Se carga de forma diferida (ssr:false) desde LabCuadratica.tsx.
 *
 * Metáfora: la parábola y = ax² + bx + c es un VALLE y el plano y = 0 es el
 * AGUA. Las raíces de ax²+bx+c=0 son justo donde el valle toca el agua. Según
 * el discriminante Δ = b²−4ac el valle corta la superficie en 2 puntos (Δ>0),
 * la roza en 1 (Δ=0) o se queda completo arriba/abajo sin tocarla (Δ<0). El
 * vértice (punto más bajo si a>0) y los cortes con el agua se marcan en vivo.
 *
 * La escena auto-escala para que cualquier a,b,c entre en el encuadre.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; los marcadores laten mutando
 * REFS (sin setState ni Math.random en el render). La geometría del valle se
 * construye de forma determinista en useMemo a partir de a,b,c.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { evalY, resolver, vertice, discriminante, fmt } from "./cuadratica-data";

export interface CuadraticaSceneProps {
  a: number;
  b: number;
  c: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const NX = 96;     // muestras a lo largo de x
const W = 11;      // ancho del encuadre (mundo)
const H = 6.6;     // alto del encuadre (mundo)
const D = 2.6;     // profundidad del valle (mundo, eje z)
const AGUA = "#3aa0ff";
const RAIZ = "#ffd24a";

/* ─── Geometría + mapeo, derivados de a,b,c ────────────────────────────── */
function useModelo(a: number, b: number, c: number) {
  return useMemo(() => {
    const aa = a === 0 ? 1e-6 : a;
    const vx = -b / (2 * aa);
    const r = resolver(a, b, c);

    // rango en x: centrado en el vértice, abarca raíces + margen
    let half = 3.2;
    for (const root of r.reales) half = Math.max(half, Math.abs(root - vx) * 1.45);
    half = Math.min(half, 40);
    const xc = vx;
    const xMin = xc - half;
    const xMax = xc + half;

    // muestreo + rango en y (siempre incluye y=0)
    const xs: number[] = [];
    const ys: number[] = [];
    let yMin = 0, yMax = 0;
    for (let i = 0; i < NX; i++) {
      const x = xMin + ((xMax - xMin) * i) / (NX - 1);
      const y = evalY(a, b, c, x);
      xs.push(x); ys.push(y);
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
    const yc = (yMin + yMax) / 2;
    const yHalf = Math.max((yMax - yMin) / 2, 1e-3);

    const X = (x: number) => ((x - xc) / half) * (W / 2);
    const Y = (y: number) => ((y - yc) / yHalf) * (H / 2);

    // curva (borde frontal del valle)
    const curva: [number, number, number][] = xs.map((x, i) => [X(x), Y(ys[i]!), D / 2]);

    // pared del valle (extrusión de la curva a lo largo de z)
    const geom = new THREE.BufferGeometry();
    const pos: number[] = [];
    for (let i = 0; i < NX; i++) {
      const xw = X(xs[i]!);
      const yw = Y(ys[i]!);
      pos.push(xw, yw, D / 2);   // frente
      pos.push(xw, yw, -D / 2);  // fondo
    }
    const idx: number[] = [];
    for (let i = 0; i < NX - 1; i++) {
      const a0 = i * 2, b0 = i * 2 + 1, a1 = (i + 1) * 2, b1 = (i + 1) * 2 + 1;
      idx.push(a0, b0, a1, b0, b1, a1);
    }
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geom.setIndex(idx);
    geom.computeVertexNormals();

    const y0w = Y(0);                 // nivel del agua en el mundo
    const v = vertice(a, b, c);
    const vtx: [number, number, number] = [X(v.x), Y(v.y), D / 2];

    const raicesW = r.reales
      .filter((root) => root >= xMin && root <= xMax)
      .map((root) => ({ xw: X(root), valor: root }));

    const yAxisX = (xMin <= 0 && 0 <= xMax) ? X(0) : null;

    return { curva, geom, y0w, vtx, vinfo: v, raicesW, yAxisX, disc: discriminante(a, b, c), tipo: r.tipo };
  }, [a, b, c]);
}

/* ─── Marcador palpitante (raíz / vértice) ─────────────────────────────── */
function Pulso({ pos, color, escala = 1, pausado }: {
  pos: [number, number, number]; color: string; escala?: number; pausado: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (!pausado) t.current += delta * 2.4;
    const s = (1 + 0.16 * Math.sin(t.current)) * escala;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.17, 20, 20]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
    </mesh>
  );
}

/* ─── Contenido de la escena ───────────────────────────────────────────── */
function Mundo({ a, b, c, accent, pausado }: {
  a: number; b: number; c: number; accent: string; pausado: boolean;
}) {
  const { curva, geom, y0w, vtx, vinfo, raicesW, yAxisX, tipo } = useModelo(a, b, c);

  // línea del eje x (sobre el agua, frente)
  const ejeX: [number, number, number][] = [[-W / 2, y0w, D / 2], [W / 2, y0w, D / 2]];

  return (
    <group>
      <ContactShadows position={[0, -H / 2 - 0.6, 0]} opacity={0.28} scale={20} blur={2.6} far={9} />

      {/* Agua (plano y = 0) */}
      <mesh position={[0, y0w, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W + 2, D + 4]} />
        <meshStandardMaterial color={AGUA} emissive={AGUA} emissiveIntensity={0.25} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* línea del eje x (la "orilla") */}
      <Line points={ejeX} color={AGUA} lineWidth={2} transparent opacity={0.8} />
      <Html position={[W / 2, y0w, D / 2]} center distanceFactor={13} pointerEvents="none">
        <div style={{ transform: "translate(22px,0)", color: AGUA, fontSize: 12, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>y = 0</div>
      </Html>

      {/* eje y (vertical, si x=0 está en cuadro) */}
      {yAxisX !== null && (
        <Line points={[[yAxisX, -H / 2, D / 2], [yAxisX, H / 2, D / 2]]} color="#ffffff" lineWidth={1} transparent opacity={0.25} dashed dashSize={0.18} gapSize={0.14} />
      )}

      {/* Pared del valle (parábola extruida) */}
      <mesh geometry={geom} castShadow>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.32} transparent opacity={0.5} side={THREE.DoubleSide} roughness={0.45} metalness={0.15} />
      </mesh>
      {/* borde frontal brillante de la curva */}
      <Line points={curva} color={accent} lineWidth={3.2} />

      {/* Raíces: donde el valle toca el agua */}
      {raicesW.map((rt, i) => (
        <group key={i}>
          <Pulso pos={[rt.xw, y0w, D / 2]} color={RAIZ} escala={1.15} pausado={pausado} />
          <Line points={[[rt.xw, y0w, D / 2], [rt.xw, y0w - 0.9, D / 2]]} color={RAIZ} lineWidth={2} transparent opacity={0.7} />
          <Html position={[rt.xw, y0w, D / 2]} center distanceFactor={13} pointerEvents="none">
            <div style={{ transform: "translateY(26px)", display: "flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, background: "rgba(2,12,28,0.82)", border: `1px solid ${RAIZ}88`, whiteSpace: "nowrap", backdropFilter: "blur(6px)" }}>
              <i className="fa-solid fa-location-dot" style={{ color: RAIZ, fontSize: 11 }} />
              <span style={{ color: "#fff", fontSize: 11.5, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>x = {fmt(rt.valor)}</span>
            </div>
          </Html>
        </group>
      ))}

      {/* Vértice */}
      <Pulso pos={vtx} color="#ff7ad9" escala={0.95} pausado={pausado} />
      <Html position={vtx} center distanceFactor={13} pointerEvents="none">
        <div style={{ transform: "translateY(-30px)", display: "flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, background: "rgba(2,12,28,0.82)", border: "1px solid #ff7ad988", whiteSpace: "nowrap", backdropFilter: "blur(6px)" }}>
          <i className="fa-solid fa-down-long" style={{ color: "#ff7ad9", fontSize: 11 }} />
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
            vértice ({fmt(vinfo.x)}, {fmt(vinfo.y)})
          </span>
        </div>
      </Html>

      {/* Mensaje cuando no hay raíces reales */}
      {tipo === "ninguna" && (
        <Html position={[0, y0w + (vtx[1] > y0w ? 1.4 : -1.4), D / 2]} center distanceFactor={15} pointerEvents="none">
          <div style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(2,12,28,0.82)", border: "1px solid rgba(255,255,255,0.25)", whiteSpace: "nowrap", color: "#cfe0ff", fontSize: 11.5, fontWeight: 800 }}>
            el valle no toca el agua · Δ &lt; 0
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Canvas + contenido ───────────────────────────────────────────────── */
export default function CuadraticaScene(props: CuadraticaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [8.5, 5, 11], fov: 45 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: CuadraticaSceneProps) {
  const { a, b, c, accent, pausado, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 64]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 9, 7]}
        intensity={1.4}
        color="#fff2cc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-6, 2, 6]} intensity={0.4} color={accent} />

      <group key={`${resetNonce}`}>
        <Mundo a={a} b={b} c={c} accent={accent} pausado={pausado} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.2} position={[0, 8, 4]} scale={[14, 4, 1]} color="#ffffff" />
        <Lightformer intensity={0.8} position={[-8, 2, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={0.8} position={[8, 1, 5]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={32}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.44} />
      </EffectComposer>
    </>
  );
}
