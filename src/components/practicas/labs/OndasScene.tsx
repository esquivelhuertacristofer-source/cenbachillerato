"use client";

/**
 * Escena 3D — "Ondas: amplitud, frecuencia y longitud de onda" (CNEYT-V-P04-A2).
 *
 * Tres MODOS (uno por bloque de la simulación verbatim), según la prop `modo`:
 *  · "onda"          — una onda mecánica viaja en +x; los puntos del medio (las
 *    esferas) solo oscilan en su sitio (un trazador en x=0 lo evidencia). La
 *    longitud de onda en pantalla baja al subir la frecuencia y crece con la
 *    rapidez del medio: la relación v = λ·f, hecha visible con una regla de λ.
 *  · "interferencia" — dos ondas iguales se superponen. Con desfase φ → resultante
 *    de amplitud |2A·cos(φ/2)| (constructiva ↔ destructiva). En modo estacionaria,
 *    dos ondas en sentidos opuestos forman nodos fijos y antinodos.
 *  · "doppler"       — una fuente en movimiento emite frentes circulares: por
 *    delante se comprimen (tono agudo) y por detrás se estiran (tono grave).
 *
 * Patrón R3F: el default export solo monta <Canvas> (key={modo} para remontarse)
 * y delega en <Contenido>. La animación vive en un único useFrame por sub-escena
 * que MUTA refs/atributos de geometría (nunca setState). Las curvas son líneas
 * gruesas (Line2) cuyo buffer se reescribe en sitio. La onda en pantalla es
 * esquemática (escala visual acotada); los números de los paneles son exactos.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Modo, resolverOnda, resolverInterferencia, resolverDoppler, medioPorId,
  fmt0, fmt2, fmtLambda,
} from "./ondas-data";

export interface OndasSceneProps {
  modo: Modo;
  A: number;          // (a) amplitud
  f: number;          // (a) frecuencia (Hz)
  medioId: string;    // (a) medio de propagación
  phi: number;        // (b) desfase entre las dos ondas (rad)
  estacionaria: boolean; // (b) onda estacionaria (sentidos opuestos)
  fd: number;         // (c) frecuencia de la fuente (Hz)
  vs: number;         // (c) rapidez de la fuente (m/s)
  playing: boolean;
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Escala visual (la onda en pantalla es esquemática) ───────────────────── */
const X = 7;                 // semiancho del dominio visible (unidades de escena)
const NPTS = 200;            // puntos por curva
const NDOT = 64;             // partículas del medio (modo onda)
const LAMBDA_REF = 85;       // m — λ del aire a 4 Hz (referencia de escala)
const LV_BASE = 3.0;         // unidades visuales por λ en la referencia

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** λ visual: comprimida con raíz para que el enorme rango de λ siga siendo dibujable. */
function lambdaVisual(lambda: number): number {
  return clamp(LV_BASE * Math.sqrt(lambda / LAMBDA_REF), 0.8, 9.5);
}
/** amplitud visual a partir de A ∈ [0.3, 2]. */
const ampVisual = (A: number) => A * 0.85;
/** rapidez angular visual ∝ f (acotada para que no parpadee). */
const omegaVisual = (f: number) => f * 0.5;

/* ── Colores ──────────────────────────────────────────────────────────────── */
const C_INTER = "#34D399";
const C_W1 = "#fbbf24";
const C_W2 = "#38bdf8";
const C_ACERCA = "#f87171";  // tono agudo
const C_ALEJA = "#60a5fa";   // tono grave
const C_NODO = "#94a3b8";
const C_ESTAC = "#a78bfa";

/* ── Etiqueta: fija en píxeles (≥ 14 px), nunca crece con la distancia ─────── */
function Etiqueta({ pos, color, children, ancha = false }: {
  pos: Pt; color: string; children: React.ReactNode; ancha?: boolean;
}) {
  const ancho = useThree((s) => s.size.width);
  if (ancha && ancho < 640) return null; // el dato ya está en el panel
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{
        whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
        border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 14,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Encuadre: el dominio X siempre cabe a lo ancho y queda sobre la misión ─── */
function Encuadre() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { width, height } = useThree((s) => s.size);
  useEffect(() => {
    const aspecto = width / Math.max(1, height);
    const mitad = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = clamp((X + 1.2) / (mitad * aspecto), 15, 30);
    camera.position.set(0, 0.7 * (d / 15), d);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);
  return null;
}

/* ── Curva gruesa (Line2): buffer reescrito en sitio, sin crear geometría ─── */
function CurvaGruesa({ fn, color, ancho = 4, opacity = 1, dashed = false }: {
  fn: (x: number) => number; color: string; ancho?: number; opacity?: number; dashed?: boolean;
}) {
  const ref = useRef<React.ComponentRef<typeof Line>>(null);
  const puntos = useMemo(
    () => Array.from({ length: NPTS }, (_, i) => [-X + (2 * X * i) / (NPTS - 1), 0, 0] as Pt),
    [],
  );
  useFrame(() => {
    const l = ref.current;
    if (!l) return;
    const attr = l.geometry.getAttribute("instanceStart") as THREE.InterleavedBufferAttribute | undefined;
    if (!attr) return;
    const arr = attr.data.array as Float32Array;
    for (let i = 0; i < NPTS - 1; i++) {
      const x0 = -X + (2 * X * i) / (NPTS - 1);
      const x1 = -X + (2 * X * (i + 1)) / (NPTS - 1);
      const o = i * 6;
      arr[o] = x0; arr[o + 1] = fn(x0); arr[o + 2] = 0;
      arr[o + 3] = x1; arr[o + 4] = fn(x1); arr[o + 5] = 0;
    }
    attr.data.needsUpdate = true;
    if (dashed) l.computeLineDistances();
  });
  return (
    <Line ref={ref} points={puntos} color={color} lineWidth={ancho} transparent={opacity < 1} opacity={opacity}
      dashed={dashed} dashSize={0.25} gapSize={0.18} frustumCulled={false} />
  );
}

/* ── Eje horizontal de referencia ─────────────────────────────────────────── */
function EjeX() {
  return <Line points={[[-X, 0, 0], [X, 0, 0]] as Pt[]} color="#475a78" lineWidth={1.5} transparent opacity={0.6} dashed dashSize={0.25} gapSize={0.18} />;
}

/* ── (a) Escena de onda viajera ───────────────────────────────────────────── */
function EscenaOnda({ A, f, medioId, playing }: Pick<OndasSceneProps, "A" | "f" | "medioId" | "playing">) {
  const medio = medioPorId(medioId);
  const onda = resolverOnda(A, f, medio.v);
  const aVis = ampVisual(A);
  const lVis = lambdaVisual(onda.lambda);
  const k = (2 * Math.PI) / lVis;
  const w = omegaVisual(f);

  const tRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const tracerRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
    const t = tRef.current;
    const y = (x: number) => aVis * Math.sin(k * x - w * t);

    const dots = dotsRef.current;
    if (dots) {
      for (let i = 0; i < NDOT; i++) {
        const x = -X + (2 * X * i) / (NDOT - 1);
        dummy.position.set(x, y(x), 0);
        dummy.updateMatrix();
        dots.setMatrixAt(i, dummy.matrix);
      }
      dots.instanceMatrix.needsUpdate = true;
    }
    if (tracerRef.current) tracerRef.current.position.y = y(0);
  });

  // regla de λ: se desplaza con la amplitud para no taparse con la cresta
  const yTop = aVis + 0.75;
  return (
    <group>
      <EjeX />

      <CurvaGruesa color={medio.color} ancho={4} opacity={0.9} fn={(x) => aVis * Math.sin(k * x - w * tRef.current)} />
      <instancedMesh ref={dotsRef} args={[undefined, undefined, NDOT]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={medio.color} emissive={medio.color} emissiveIntensity={0.35} roughness={0.4} />
      </instancedMesh>

      {/* trazador: una partícula del medio que SOLO sube y baja (no avanza) */}
      <Line points={[[0, -aVis - 0.3, 0], [0, aVis + 0.3, 0]] as Pt[]} color="#ffffff" lineWidth={1.5} transparent opacity={0.3} dashed dashSize={0.12} gapSize={0.1} />
      <mesh ref={tracerRef}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      <Etiqueta pos={[0.2, -aVis - 0.85, 0]} color="#ffffff" ancha>solo sube y baja</Etiqueta>

      {/* regla de longitud de onda */}
      <Line points={[[-lVis / 2, yTop, 0], [lVis / 2, yTop, 0]] as Pt[]} color="#fde68a" lineWidth={3} />
      <Line points={[[-lVis / 2, yTop - 0.2, 0], [-lVis / 2, yTop + 0.2, 0]] as Pt[]} color="#fde68a" lineWidth={3} />
      <Line points={[[lVis / 2, yTop - 0.2, 0], [lVis / 2, yTop + 0.2, 0]] as Pt[]} color="#fde68a" lineWidth={3} />
      <Etiqueta pos={[0, yTop + 0.6, 0]} color="#fde68a">λ = {fmtLambda(onda.lambda)}</Etiqueta>

      {/* regla de amplitud */}
      <Line points={[[-X + 0.5, 0, 0], [-X + 0.5, aVis, 0]] as Pt[]} color="#fca5a5" lineWidth={3} />
      <Etiqueta pos={[-X + 1.5, aVis / 2 + 0.2, 0]} color="#fca5a5">A = {fmt2(A)}</Etiqueta>
    </group>
  );
}

/* ── (b) Escena de interferencia / onda estacionaria ──────────────────────── */
function EscenaInterferencia({ A, phi, estacionaria, playing }: Pick<OndasSceneProps, "A" | "phi" | "estacionaria" | "playing">) {
  const inter = resolverInterferencia(A, phi);
  const aVis = ampVisual(A);
  const lVis = 2.6;                 // longitud de onda visual fija en este modo
  const k = (2 * Math.PI) / lVis;
  const w = omegaVisual(6);

  const tRef = useRef(0);
  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
  });

  const y1 = (x: number) => aVis * Math.sin(k * x - w * tRef.current);
  const y2 = estacionaria
    ? (x: number) => aVis * Math.sin(k * x + w * tRef.current)
    : (x: number) => aVis * Math.sin(k * x - w * tRef.current + phi);

  // nodos/antinodos de la onda estacionaria: y = 2A·sin(kx)·cos(wt) → nodos en sin(kx)=0
  const nodos: Pt[] = [];
  const antinodos: Pt[] = [];
  if (estacionaria) {
    for (let n = -6; n <= 6; n++) {
      const xN = (n * Math.PI) / k;
      if (Math.abs(xN) <= X) nodos.push([xN, 0, 0]);
      const xA = ((n + 0.5) * Math.PI) / k;
      if (Math.abs(xA) <= X) antinodos.push([xA, 0, 0]);
    }
  }
  const nodoEtq = nodos.find((p) => p[0] > 1.2 && p[0] < 3.2) ?? nodos[0];
  const antiEtq = antinodos.find((p) => p[0] > -0.2) ?? antinodos[0];

  const etqCol = estacionaria ? C_ESTAC : inter.tipo === "constructiva" ? C_INTER : inter.tipo === "destructiva" ? "#f87171" : "#fbbf24";
  const yRes = 2 * aVis + 0.55;

  return (
    <group>
      <EjeX />

      <CurvaGruesa color={C_W1} ancho={3} opacity={0.5} fn={y1} />
      <CurvaGruesa color={C_W2} ancho={3} opacity={0.5} fn={y2} />
      <CurvaGruesa color={etqCol} ancho={6} fn={(x) => y1(x) + y2(x)} />

      {estacionaria ? (
        <>
          {/* envolvente de la estacionaria (±2A·sin(kx)) */}
          <Line points={Array.from({ length: NPTS }, (_, i) => { const x = -X + (2 * X * i) / (NPTS - 1); return [x, 2 * aVis * Math.sin(k * x), 0] as Pt; })} color={C_ESTAC} lineWidth={1.5} transparent opacity={0.35} dashed dashSize={0.2} gapSize={0.15} />
          <Line points={Array.from({ length: NPTS }, (_, i) => { const x = -X + (2 * X * i) / (NPTS - 1); return [x, -2 * aVis * Math.sin(k * x), 0] as Pt; })} color={C_ESTAC} lineWidth={1.5} transparent opacity={0.35} dashed dashSize={0.2} gapSize={0.15} />
          {nodos.map((p, i) => (
            <mesh key={`n${i}`} position={p}>
              <sphereGeometry args={[0.15, 18, 18]} />
              <meshStandardMaterial color={C_NODO} emissive={C_NODO} emissiveIntensity={0.4} roughness={0.4} />
            </mesh>
          ))}
          {antinodos.map((p, i) => (
            <mesh key={`a${i}`} position={p}>
              <sphereGeometry args={[0.12, 18, 18]} />
              <meshStandardMaterial color={C_ESTAC} emissive={C_ESTAC} emissiveIntensity={0.5} roughness={0.4} />
            </mesh>
          ))}
          {nodoEtq && <Etiqueta pos={[nodoEtq[0], -0.7, 0]} color={C_NODO}>nodo (quieto)</Etiqueta>}
          {antiEtq && <Etiqueta pos={[antiEtq[0], 2 * aVis + 0.6, 0]} color={C_ESTAC} ancha>antinodo</Etiqueta>}
        </>
      ) : (
        <Etiqueta pos={[0, yRes + 0.3, 0]} color={etqCol}>
          {inter.tipo} · {fmt0(inter.pct * 100)}%
        </Etiqueta>
      )}
    </group>
  );
}

/* ── (c) Escena del efecto Doppler ────────────────────────────────────────── */
const K_RINGS = 16;
const TE = 0.5;       // intervalo de emisión visual (s)
const C_WAVE = 2.3;   // rapidez visual del frente de onda
const R_MAX = 9.5;    // radio máximo antes de reciclar

function EscenaDoppler({ fd, vs, playing, accent }: Pick<OndasSceneProps, "fd" | "vs" | "playing" | "accent">) {
  const d = resolverDoppler(fd, vs);
  const vsVis = vs / 42;        // rapidez visual de la fuente

  const tRef = useRef(0);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const fuenteRef = useRef<THREE.Group>(null);
  const stateRef = useRef<{ lastEmit: number; idx: number; rings: { x0: number; t0: number }[] }>({
    lastEmit: -100, idx: 0, rings: Array.from({ length: K_RINGS }, () => ({ x0: 0, t0: -100 })),
  });

  // posición de la fuente: va y viene por el dominio (rebote suave) a rapidez vsVis
  const sourceX = (t: number) => {
    const span = 2 * (X - 1);
    if (vsVis <= 0.0001) return -X + 1;
    const p = (vsVis * t) % (2 * span);
    const tri = p < span ? p : 2 * span - p;   // 0..span..0
    return -(X - 1) + tri;
  };

  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
    const t = tRef.current;
    const st = stateRef.current;

    const sx = sourceX(t);
    if (fuenteRef.current) fuenteRef.current.position.x = sx;

    // emitir un frente nuevo cada TE
    while (t - st.lastEmit >= TE) {
      st.lastEmit += TE;
      const rec = st.rings[st.idx]!;
      rec.x0 = sourceX(st.lastEmit);
      rec.t0 = st.lastEmit;
      st.idx = (st.idx + 1) % K_RINGS;
    }

    // actualizar cada anillo
    for (let i = 0; i < K_RINGS; i++) {
      const mesh = ringsRef.current[i];
      const rec = st.rings[i]!;
      if (!mesh) continue;
      const r = (t - rec.t0) * C_WAVE;
      if (r <= 0.05 || r > R_MAX) {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;
      mesh.position.x = rec.x0;
      mesh.scale.set(r, r, 1);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = clamp(0.85 * (1 - r / R_MAX), 0.04, 0.85);
    }
  });

  return (
    <group>
      {/* frentes de onda (pool de anillos) */}
      {Array.from({ length: K_RINGS }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el; }}
          visible={false}
        >
          <ringGeometry args={[0.96, 1.0, 72]} />
          <meshBasicMaterial color={accent} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}

      {/* fuente */}
      <group ref={fuenteRef}>
        <mesh>
          <sphereGeometry args={[0.34, 28, 28]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} roughness={0.35} />
        </mesh>
        {vs > 0 && (
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.18, 0.45, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} roughness={0.4} />
          </mesh>
        )}
        <Etiqueta pos={[0, 0.95, 0]} color={accent}>{fmt0(fd)} Hz</Etiqueta>
      </group>

      {/* observadores */}
      <group position={[X - 0.3, -2.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial color={C_ACERCA} emissive={C_ACERCA} emissiveIntensity={0.4} roughness={0.4} />
        </mesh>
        <Etiqueta pos={[-0.6, 0.7, 0]} color={C_ACERCA}>{fmt0(d.fAcerca)} Hz</Etiqueta>
      </group>
      <group position={[-X + 0.3, -2.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial color={C_ALEJA} emissive={C_ALEJA} emissiveIntensity={0.4} roughness={0.4} />
        </mesh>
        <Etiqueta pos={[0.6, 0.7, 0]} color={C_ALEJA}>{fmt0(d.fAleja)} Hz</Etiqueta>
      </group>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ──────────────────────────────────── */
function Contenido({ modo, A, f, medioId, phi, estacionaria, fd, vs, playing, accent, resetNonce }: OndasSceneProps) {
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. Sin altura: el
          escenario la MIDE de la propia escena al montarse. */}
      <Escenario acento={accent} mesa={false} niebla={false} />
      <Encuadre />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "onda" && <EscenaOnda A={A} f={f} medioId={medioId} playing={playing} />}
        {modo === "interferencia" && <EscenaInterferencia A={A} phi={phi} estacionaria={estacionaria} playing={playing} />}
        {modo === "doppler" && <EscenaDoppler fd={fd} vs={vs} playing={playing} accent={accent} />}
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={9}
        maxDistance={32}
        target={[0, -0.5, 0]}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.7}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function OndasScene(props: OndasSceneProps) {
  const cam = { position: [0, 0.7, 15] as Pt, fov: 46 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
