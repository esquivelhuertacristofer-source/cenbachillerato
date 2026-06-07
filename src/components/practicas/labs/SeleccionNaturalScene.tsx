"use client";

/**
 * Escena 3D del laboratorio "Selección natural" (CNEYT-VI-P07).
 *
 *  - conejos:    población de conejos (claro/oscuro) sobre el terreno del
 *                ambiente elegido, con depredadores circulando. La proporción
 *                de cada morfo refleja las frecuencias fenotípicas de la
 *                generación actual; al avanzar el tiempo, el morfo camuflado
 *                predomina.
 *  - tipos:      histograma 3D de un rasgo que la selección estabilizadora /
 *                direccional / disruptiva va reformando generación a generación.
 *  - evidencias: brazo humano, aleta de ballena y ala de murciélago, con los
 *                MISMOS huesos del mismo color (homología = ancestro común).
 *
 * Toda animación ocurre dentro de useFrame mutando refs (nunca en el render),
 * conforme a las reglas del React Compiler.
 */

import * as THREE from "three";
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { T } from "./_kit";
import {
  type Modo,
  type Pt,
  MORFO_CLARO,
  MORFO_OSCURO,
  RABBIT_SLOTS,
  ANIMALES,
  huesosDe,
} from "./seleccion-natural-data";

export interface SeleccionNaturalSceneProps {
  modo: Modo;
  // conejos
  terreno: string;
  cielo: string;
  fClaro: number;
  predadores: number;
  // tipos
  barras: number[];
  fitness: number[];
  tipoColor: string;
  // evidencias
  animalSel: string;
  // común
  playing: boolean;
  accent: string;
  resetNonce: number;
  gen: number;
}

/* ── Etiqueta flotante (Html) ─────────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 12, fuerte = false, col }: { pos: Pt; children: ReactNode; df?: number; fuerte?: boolean; col?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          padding: fuerte ? "6px 12px" : "2px 8px",
          borderRadius: 8,
          background: fuerte ? "rgba(5,14,30,0.85)" : "rgba(5,14,30,0.6)",
          border: `1px solid ${col ?? T.lineStrong}`,
          color: col ?? T.text,
          fontSize: fuerte ? 15 : 12,
          fontWeight: fuerte ? 800 : 700,
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
          textShadow: "0 1px 4px rgba(0,0,0,0.7)",
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MODO 1 — Conejos
   ════════════════════════════════════════════════════════════════════════════ */

function Conejo({ pos, rot, claro, fase, playing }: { pos: Pt; rot: number; claro: boolean; fase: number; playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.position.y = playing ? Math.abs(Math.sin(t * 2.2 + fase)) * 0.13 : 0.02;
  });
  const cuerpo = claro ? MORFO_CLARO : MORFO_OSCURO;
  const emis = claro ? "#cdd6e0" : "#241b14";
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <group ref={g}>
        {/* cuerpo */}
        <mesh position={[0, 0.22, 0]} scale={[1, 0.85, 1.3]} castShadow>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshStandardMaterial color={cuerpo} emissive={emis} emissiveIntensity={0.12} roughness={0.85} />
        </mesh>
        {/* cabeza */}
        <mesh position={[0, 0.34, 0.22]} castShadow>
          <sphereGeometry args={[0.13, 18, 18]} />
          <meshStandardMaterial color={cuerpo} emissive={emis} emissiveIntensity={0.12} roughness={0.85} />
        </mesh>
        {/* orejas */}
        {[-0.06, 0.06].map((dx, i) => (
          <mesh key={i} position={[dx, 0.5, 0.22]} rotation={[0.15, 0, dx * 1.6]}>
            <capsuleGeometry args={[0.028, 0.16, 4, 8]} />
            <meshStandardMaterial color={cuerpo} emissive={emis} emissiveIntensity={0.12} roughness={0.85} />
          </mesh>
        ))}
        {/* cola */}
        <mesh position={[0, 0.24, -0.22]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial color="#f4f6f9" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function Predador({ idx, total }: { idx: number; total: number }) {
  const g = useRef<THREE.Group>(null);
  const base = (idx / Math.max(1, total)) * Math.PI * 2;
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime * 0.5 + base;
    const r = 5.2;
    g.current.position.set(Math.cos(t) * r, 3.2 + Math.sin(t * 1.7) * 0.4, Math.sin(t) * r);
    g.current.rotation.y = -t + Math.PI / 2;
  });
  return (
    <group ref={g}>
      {/* cuerpo */}
      <mesh scale={[0.5, 0.16, 0.28]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#1b2430" emissive="#0b1119" emissiveIntensity={0.2} roughness={0.6} />
      </mesh>
      {/* alas */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.32, 0, 0]} rotation={[0, 0, s * 0.5]}>
          <boxGeometry args={[0.5, 0.02, 0.22]} />
          <meshStandardMaterial color="#222d3a" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function MundoConejos({ terreno, fClaro, predadores, playing, gen }: { terreno: string; fClaro: number; predadores: number; playing: boolean; gen: number }) {
  return (
    <group>
      {/* terreno */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[7.4, 7.4, 0.5, 64]} />
        <meshStandardMaterial color={terreno} roughness={0.95} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
        <ringGeometry args={[7.2, 7.42, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* conejos */}
      {RABBIT_SLOTS.map((s, i) => {
        const dither = (i * 0.61803398875) % 1;
        const claro = dither < fClaro;
        return <Conejo key={i} pos={s.pos} rot={s.rot} claro={claro} fase={i * 1.37} playing={playing} />;
      })}

      {/* depredadores */}
      {Array.from({ length: predadores }).map((_, i) => (
        <Predador key={i} idx={i} total={predadores} />
      ))}

      <Etiqueta pos={[0, 4.6, 0]} df={16} fuerte col="#ffffff">Generación {gen}</Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MODO 2 — Tipos de selección (histograma 3D)
   ════════════════════════════════════════════════════════════════════════════ */

function MundoTipos({ barras, fitness, tipoColor }: { barras: number[]; fitness: number[]; tipoColor: string }) {
  const esc = 0.06; // % → unidades
  const dimC = new THREE.Color("#334155");
  const hotC = new THREE.Color(tipoColor);
  return (
    <group position={[0, -1.4, 0]}>
      {/* base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <boxGeometry args={[9.4, 3.2, 0.1]} />
        <meshStandardMaterial color="#0c1726" roughness={0.9} />
      </mesh>
      {barras.map((v, i) => {
        const w = fitness[i] ?? 0;
        const h = Math.max(0.05, v * esc);
        const x = (i - (barras.length - 1) / 2) * 0.92;
        const c = dimC.clone().lerp(hotC, w);
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, h / 2, 0]}>
              <boxGeometry args={[0.66, h, 0.66]} />
              <meshStandardMaterial color={`#${c.getHexString()}`} emissive={tipoColor} emissiveIntensity={0.15 + w * 0.85} roughness={0.4} metalness={0.1} />
            </mesh>
            {/* marcador de aptitud */}
            <mesh position={[0, w * 3 + 0.2, 0.5]}>
              <sphereGeometry args={[0.07 + w * 0.06, 12, 12]} />
              <meshStandardMaterial color={tipoColor} emissive={tipoColor} emissiveIntensity={1} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
      {/* curva de aptitud (línea de marcadores) etiqueta */}
      <Etiqueta pos={[-4.7, 3.6, 0.5]} df={16} col={tipoColor}>aptitud</Etiqueta>
      <Etiqueta pos={[-4.4, -0.5, 0]} df={18} col={T.text2}>rasgo pequeño</Etiqueta>
      <Etiqueta pos={[4.4, -0.5, 0]} df={18} col={T.text2}>rasgo grande</Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MODO 3 — Evidencias (homología)
   ════════════════════════════════════════════════════════════════════════════ */

function Bone({ a, b, color, grosor, emis, opacity }: { a: Pt; b: Pt; color: string; grosor: number; emis: number; opacity: number }) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const ang = Math.atan2(-dx, dy);
  return (
    <mesh position={mid} rotation={[0, 0, ang]}>
      <capsuleGeometry args={[grosor, Math.max(0.02, len - grosor), 5, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emis} roughness={0.45} metalness={0.1} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

function Extremidad({ id, x, etq, icono, seleccionado }: { id: string; x: number; etq: string; icono: string; seleccionado: boolean }) {
  const huesos = huesosDe(id);
  const emis = seleccionado ? 0.85 : 0.18;
  const op = seleccionado ? 1 : 0.42;
  return (
    <group position={[x, 0, 0]}>
      {huesos.map((h, i) => (
        <Bone key={i} a={h.a} b={h.b} color={h.color} grosor={h.grosor} emis={emis} opacity={op} />
      ))}
      <Etiqueta pos={[0, 3.0, 0]} df={seleccionado ? 13 : 16} fuerte={seleccionado} col={seleccionado ? "#ffffff" : T.text2}>
        {etq}
      </Etiqueta>
      <Html position={[0, -2.7, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: 26, color: seleccionado ? "#fff" : "rgba(255,255,255,0.4)" }}>
          <i className={`fa-solid ${icono}`} />
        </div>
      </Html>
    </group>
  );
}

function MundoEvidencias({ animalSel, playing }: { animalSel: string; playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    if (playing) g.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.35;
  });
  const xs = [-4.4, 0, 4.4];
  return (
    <group ref={g} position={[0, -0.2, 0]}>
      {ANIMALES.map((a, i) => (
        <Extremidad key={a.id} id={a.id} x={xs[i] ?? 0} etq={a.etq} icono={a.icono} seleccionado={a.id === animalSel} />
      ))}
    </group>
  );
}

/* ── Contenido de la escena ───────────────────────────────────────────────── */
function Contenido(props: SeleccionNaturalSceneProps) {
  const { modo, terreno, cielo, fClaro, predadores, barras, fitness, tipoColor, animalSel, playing, accent, resetNonce, gen } = props;
  const bg = modo === "conejos" ? cielo : "#040912";
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 18, 46]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[6, 10, 8]} intensity={1.15} castShadow />
      <directionalLight position={[-8, 4, -6]} intensity={0.4} color={accent} />
      {modo !== "conejos" && <Stars radius={80} depth={40} count={1100} factor={3} saturation={0} fade speed={0.5} />}

      <group key={`${modo}-${resetNonce}`}>
        {modo === "conejos" && <MundoConejos terreno={terreno} fClaro={fClaro} predadores={predadores} playing={playing} gen={gen} />}
        {modo === "tipos" && <MundoTipos barras={barras} fitness={fitness} tipoColor={tipoColor} />}
        {modo === "evidencias" && <MundoEvidencias animalSel={animalSel} playing={playing} />}
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.2} position={[0, 5, 6]} scale={[12, 6, 1]} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[-6, 1, 4]} scale={[6, 6, 1]} color={accent} />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={(Math.PI * 5) / 9}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

/* ── Export por defecto: Canvas ───────────────────────────────────────────── */
export default function SeleccionNaturalScene(props: SeleccionNaturalSceneProps) {
  const cam: { position: Pt; fov: number } =
    props.modo === "conejos"
      ? { position: [0, 6.5, 13], fov: 44 }
      : props.modo === "tipos"
        ? { position: [0, 2.4, 12], fov: 44 }
        : { position: [0, 0.4, 13], fov: 46 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} shadows gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
