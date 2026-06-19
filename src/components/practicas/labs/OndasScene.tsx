"use client";

/**
 * Escena 3D — "Ondas: amplitud, frecuencia y longitud de onda" (CNEYT-V-P04-A2).
 *
 * Tres MODOS (uno por bloque de la simulación verbatim), según la prop `modo`:
 *  · "onda"          — una onda mecánica viaja en +x; los puntos del medio (las
 *    esferas) solo oscilan en su sitio (un trazador en x=0 lo evidencia). La
 *    longitud de onda en pantalla baja al subir la frecuencia y crece con la
 *    rapidez del medio: la relación v = λ·f, hecha visible.
 *  · "interferencia" — dos ondas iguales se superponen. Con desfase φ → resultante
 *    de amplitud |2A·cos(φ/2)| (constructiva ↔ destructiva). En modo estacionaria,
 *    dos ondas en sentidos opuestos forman nodos fijos y antinodos.
 *  · "doppler"       — una fuente en movimiento emite frentes circulares: por
 *    delante se comprimen (tono agudo) y por detrás se estiran (tono grave).
 *
 * Patrón R3F: el default export solo monta <Canvas> (cámara según el modo y
 * key={modo} para remontarse) y delega en <Contenido>.
 * React Compiler: la animación vive en un único useFrame por sub-escena que MUTA
 * refs/atributos de geometría (nunca setState); la pausa congela acumulando el
 * tiempo en un ref solo cuando `playing` es true. La onda en pantalla es
 * esquemática (escala visual acotada); los números de los paneles son exactos.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
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
const NPTS = 220;            // puntos por curva
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
const C_ONDA = "#7dd3fc";
const C_INTER = "#34D399";
const C_W1 = "#fbbf24";
const C_W2 = "#38bdf8";
const C_ACERCA = "#f87171";  // tono agudo
const C_ALEJA = "#60a5fa";   // tono grave
const C_NODO = "#94a3b8";

/* ── Utilidad: rellena el atributo de posición de una THREE.Line ──────────── */
function fillCurva(line: THREE.Line, fn: (x: number) => number) {
  const pos = line.geometry.getAttribute("position") as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < NPTS; i++) {
    const x = -X + (2 * X * i) / (NPTS - 1);
    arr[i * 3] = x;
    arr[i * 3 + 1] = fn(x);
    arr[i * 3 + 2] = 0;
  }
  pos.needsUpdate = true;
}

/** Crea un objeto THREE.Line vacío de NPTS puntos (geometría dinámica). */
function nuevaCurva(color: string, opacity: number, lineWidth = 1): THREE.Line {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NPTS * 3), 3));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, linewidth: lineWidth, toneMapped: false });
  return new THREE.Line(g, m);
}

/**
 * Libera la geometría y el material de las curvas creadas con `nuevaCurva` al
 * desmontar. R3F no dispone los objetos pasados por `<primitive object={...} />`,
 * y como el <Canvas> se remonta con key={modo}, sin esto cada cambio de modo
 * dejaría una BufferGeometry + material huérfanos en la GPU.
 */
function useDisposeCurvas(...curvas: THREE.Line[]) {
  useEffect(() => {
    return () => {
      for (const c of curvas) {
        c.geometry.dispose();
        (c.material as THREE.Material).dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ── Título flotante de la escena ─────────────────────────────────────────── */
function Titulo({ texto, sub, color }: { texto: string; sub?: string; color: string }) {
  return (
    <Html position={[0, 4.4, 0]} center distanceFactor={20} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", textAlign: "center", padding: "4px 12px", borderRadius: 10,
        background: "rgba(4,12,26,0.9)", border: `1px solid ${color}aa`, color: "#fff",
        fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontWeight: 900, fontSize: 12 }}>{texto}</div>
        {sub && <div style={{ fontWeight: 800, fontSize: 10.5, color }}>{sub}</div>}
      </div>
    </Html>
  );
}

/* ── Eje horizontal de referencia ─────────────────────────────────────────── */
function EjeX() {
  return <Line points={[[-X, 0, 0], [X, 0, 0]] as Pt[]} color="#3a4a64" lineWidth={1} transparent opacity={0.55} dashed dashSize={0.25} gapSize={0.18} />;
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
  const curva = useMemo(() => nuevaCurva(C_ONDA, 0.9), []);
  useDisposeCurvas(curva);
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const tracerRef = useRef<THREE.Mesh>(null);

  // color de la curva según el medio
  (curva.material as THREE.LineBasicMaterial).color.set(medio.color);

  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
    const t = tRef.current;
    const y = (x: number) => aVis * Math.sin(k * x - w * t);
    fillCurva(curva, y);

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

  // soporte para la regla de λ y A (se recalcula al cambiar controles, no por frame)
  const yTop = aVis + 0.7;
  return (
    <group>
      <Titulo texto={`onda en ${medio.nombre.toLowerCase()}`} sub={`v = ${fmt0(medio.v)} m/s · λ = ${fmtLambda(onda.lambda)} · f = ${fmt0(f)} Hz`} color={medio.color} />
      <EjeX />

      <primitive object={curva} />
      <instancedMesh ref={dotsRef} args={[undefined, undefined, NDOT]}>
        <sphereGeometry args={[0.075, 14, 14]} />
        <meshStandardMaterial color={medio.color} emissive={medio.color} emissiveIntensity={0.5} toneMapped={false} />
      </instancedMesh>

      {/* trazador: una partícula del medio que SOLO sube y baja (no avanza) */}
      <Line points={[[0, -aVis - 0.3, 0], [0, aVis + 0.3, 0]] as Pt[]} color="#ffffff" lineWidth={1} transparent opacity={0.25} dashed dashSize={0.12} gapSize={0.1} />
      <mesh ref={tracerRef}>
        <sphereGeometry args={[0.16, 22, 22]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.85} toneMapped={false} />
      </mesh>
      <Html position={[0.35, aVis + 0.55, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", padding: "2px 7px", borderRadius: 7, background: "rgba(6,16,31,0.85)", border: "1px solid #ffffff55", color: "#fff", fontWeight: 800, fontSize: 10, fontFamily: "system-ui, sans-serif" }}>
          una partícula del medio
        </div>
      </Html>

      {/* regla de longitud de onda */}
      <Line points={[[-lVis / 2, yTop, 0], [lVis / 2, yTop, 0]] as Pt[]} color="#fde68a" lineWidth={2} />
      <Line points={[[-lVis / 2, yTop - 0.18, 0], [-lVis / 2, yTop + 0.18, 0]] as Pt[]} color="#fde68a" lineWidth={2} />
      <Line points={[[lVis / 2, yTop - 0.18, 0], [lVis / 2, yTop + 0.18, 0]] as Pt[]} color="#fde68a" lineWidth={2} />
      <Html position={[0, yTop + 0.38, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", padding: "2px 8px", borderRadius: 7, background: "rgba(6,16,31,0.85)", border: "1px solid #fde68a88", color: "#fde68a", fontWeight: 900, fontSize: 11, fontFamily: "system-ui, sans-serif" }}>
          λ = {fmtLambda(onda.lambda)}
        </div>
      </Html>

      {/* regla de amplitud */}
      <Line points={[[-X + 0.5, 0, 0], [-X + 0.5, aVis, 0]] as Pt[]} color="#fca5a5" lineWidth={2} />
      <Html position={[-X + 0.5, aVis / 2, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", padding: "2px 7px", borderRadius: 7, background: "rgba(6,16,31,0.85)", border: "1px solid #fca5a588", color: "#fca5a5", fontWeight: 800, fontSize: 10, fontFamily: "system-ui, sans-serif" }}>
          A = {fmt2(A)}
        </div>
      </Html>
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
  const w1 = useMemo(() => nuevaCurva(C_W1, 0.45), []);
  const w2 = useMemo(() => nuevaCurva(C_W2, 0.45), []);
  const res = useMemo(() => nuevaCurva(C_INTER, 1), []);
  useDisposeCurvas(w1, w2, res);

  // color de la resultante: estacionaria usa otro tono
  (res.material as THREE.LineBasicMaterial).color.set(estacionaria ? "#a78bfa" : C_INTER);

  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
    const t = tRef.current;
    if (estacionaria) {
      const y1 = (x: number) => aVis * Math.sin(k * x - w * t);
      const y2 = (x: number) => aVis * Math.sin(k * x + w * t);
      fillCurva(w1, y1);
      fillCurva(w2, y2);
      fillCurva(res, (x) => y1(x) + y2(x));
    } else {
      const y1 = (x: number) => aVis * Math.sin(k * x - w * t);
      const y2 = (x: number) => aVis * Math.sin(k * x - w * t + phi);
      fillCurva(w1, y1);
      fillCurva(w2, y2);
      fillCurva(res, (x) => y1(x) + y2(x));
    }
  });

  // nodos/antinodos de la onda estacionaria: y = 2A·sin(kx)·cos(wt) → nodos en sin(kx)=0
  const nodos: Pt[] = [];
  const antinodos: Pt[] = [];
  if (estacionaria) {
    for (let n = -6; n <= 6; n++) {
      const xN = (n * Math.PI) / k;             // sin(kx)=0
      if (Math.abs(xN) <= X) nodos.push([xN, 0, 0]);
      const xA = ((n + 0.5) * Math.PI) / k;      // |sin(kx)|=1
      if (Math.abs(xA) <= X) antinodos.push([xA, 0, 0]);
    }
  }

  const etqCol = estacionaria ? "#a78bfa" : inter.tipo === "constructiva" ? "#34D399" : inter.tipo === "destructiva" ? "#f87171" : "#fbbf24";

  return (
    <group>
      <Titulo
        texto={estacionaria ? "onda estacionaria (sentidos opuestos)" : `interferencia ${inter.tipo}`}
        sub={estacionaria ? "nodos fijos · antinodos cada λ/2" : `φ = ${fmt2(phi)} rad · A_res = ${fmt2(inter.Ares)} (${fmt0(inter.pct * 100)}%)`}
        color={etqCol}
      />
      <EjeX />

      <primitive object={w1} />
      <primitive object={w2} />
      <primitive object={res} />

      {/* envolvente de la estacionaria (±2A·sin(kx)) */}
      {estacionaria && (
        <>
          <Line points={Array.from({ length: NPTS }, (_, i) => { const x = -X + (2 * X * i) / (NPTS - 1); return [x, 2 * aVis * Math.sin(k * x), 0] as Pt; })} color="#a78bfa" lineWidth={1} transparent opacity={0.3} dashed dashSize={0.2} gapSize={0.15} />
          <Line points={Array.from({ length: NPTS }, (_, i) => { const x = -X + (2 * X * i) / (NPTS - 1); return [x, -2 * aVis * Math.sin(k * x), 0] as Pt; })} color="#a78bfa" lineWidth={1} transparent opacity={0.3} dashed dashSize={0.2} gapSize={0.15} />
          {nodos.map((p, i) => (
            <mesh key={`n${i}`} position={p}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={C_NODO} emissive={C_NODO} emissiveIntensity={0.6} toneMapped={false} />
            </mesh>
          ))}
          {antinodos.map((p, i) => (
            <mesh key={`a${i}`} position={p}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.8} toneMapped={false} />
            </mesh>
          ))}
        </>
      )}

      {/* leyenda de las dos fuentes */}
      <Html position={[-X + 0.2, -3.1, 0]} distanceFactor={18} pointerEvents="none">
        <div style={{ display: "flex", gap: 12, fontFamily: "system-ui, sans-serif", fontWeight: 800, fontSize: 10.5 }}>
          <span style={{ color: C_W1 }}>● onda 1</span>
          <span style={{ color: C_W2 }}>● onda 2</span>
          <span style={{ color: etqCol }}>● resultante</span>
        </div>
      </Html>
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
      <Titulo
        texto={vs > 0 ? "fuente en movimiento — efecto Doppler" : "fuente en reposo (sin Doppler)"}
        sub={`f = ${fmt0(fd)} Hz · vs = ${fmt0(vs)} m/s → adelante ${fmt0(d.fAcerca)} Hz · atrás ${fmt0(d.fAleja)} Hz`}
        color={accent}
      />

      {/* frentes de onda (pool de anillos) */}
      {Array.from({ length: K_RINGS }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el; }}
          visible={false}
        >
          <ringGeometry args={[0.97, 1.0, 72]} />
          <meshBasicMaterial color={accent} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}

      {/* fuente */}
      <group ref={fuenteRef}>
        <mesh>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
        {vs > 0 && (
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.16, 0.4, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        )}
        <Html position={[0, 0.7, 0]} center distanceFactor={15} pointerEvents="none">
          <div style={{ whiteSpace: "nowrap", padding: "2px 8px", borderRadius: 7, background: "rgba(6,16,31,0.85)", border: `1px solid ${accent}88`, color: "#fff", fontWeight: 800, fontSize: 10, fontFamily: "system-ui, sans-serif" }}>
            fuente · {fmt0(fd)} Hz
          </div>
        </Html>
      </group>

      {/* observadores */}
      <group position={[X - 0.3, -2.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshStandardMaterial color={C_ACERCA} emissive={C_ACERCA} emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        <Html position={[0, 0.55, 0]} center distanceFactor={16} pointerEvents="none">
          <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "2px 8px", borderRadius: 7, background: "rgba(6,16,31,0.88)", border: `1px solid ${C_ACERCA}88`, color: C_ACERCA, fontWeight: 800, fontSize: 10, fontFamily: "system-ui, sans-serif" }}>
            se acerca → {fmt0(d.fAcerca)} Hz (agudo)
          </div>
        </Html>
      </group>
      <group position={[-X + 0.3, -2.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshStandardMaterial color={C_ALEJA} emissive={C_ALEJA} emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        <Html position={[0, 0.55, 0]} center distanceFactor={16} pointerEvents="none">
          <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "2px 8px", borderRadius: 7, background: "rgba(6,16,31,0.88)", border: `1px solid ${C_ALEJA}88`, color: C_ALEJA, fontWeight: 800, fontSize: 10, fontFamily: "system-ui, sans-serif" }}>
            se aleja → {fmt0(d.fAleja)} Hz (grave)
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ──────────────────────────────────── */
function Contenido({ modo, A, f, medioId, phi, estacionaria, fd, vs, playing, accent, resetNonce }: OndasSceneProps) {
  return (
    <>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 24, 70]} />

      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 8]} intensity={1.2} />
      <pointLight position={[-8, 4, 7]} intensity={0.55} color={accent} />
      <Stars radius={70} depth={30} count={1200} factor={3} saturation={0} fade speed={0.5} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "onda" && <EscenaOnda A={A} f={f} medioId={medioId} playing={playing} />}
        {modo === "interferencia" && <EscenaInterferencia A={A} phi={phi} estacionaria={estacionaria} playing={playing} />}
        {modo === "doppler" && <EscenaDoppler fd={fd} vs={vs} playing={playing} accent={accent} />}
      </group>

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.1} position={[0, 7, 8]} scale={14} color="#eaf1ff" />
          <Lightformer intensity={0.6} position={[8, 3, 5]} scale={7} color="#cfe0ff" />
          <Lightformer intensity={0.6} position={[-8, 3, 4]} scale={7} color="#dcd5ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={9}
        maxDistance={26}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.7}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.45} />
      </EffectComposer>
    </>
  );
}

export default function OndasScene(props: OndasSceneProps) {
  const cam = { position: [0, 1.5, 15] as Pt, fov: 46 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
