"use client";

/**
 * Escena 3D — "Diagrama de cuerpo libre: las leyes de Newton" (CNEYT-V-P01-A2).
 *
 * Tres escenarios que el alumno orbita, cada uno con su DIAGRAMA DE CUERPO LIBRE
 * dibujado como flechas vectoriales sobre el objeto aislado:
 *  · horizontal — caja sobre suelo plano con una fuerza aplicada F; flechas de
 *    peso (W), normal (N), fricción (f), fuerza aplicada (F) y fuerza neta (ΣF).
 *  · inclinado  — caja sobre una rampa a θ; además de W, N y f se descompone el
 *    peso en su parte paralela (m·g·senθ) y perpendicular (m·g·cosθ) al plano.
 *  · polea      — bloque m₁ sobre una mesa unido por una cuerda que pasa por una
 *    polea a una masa colgante m₂; se ve la MISMA tensión T tirando de ambos.
 *
 * Las flechas se escalan linealmente con la magnitud de la fuerza (FSCALE), así
 * que sus longitudes son comparables y honestas; el número en newtons va en la
 * etiqueta. Patrón R3F: el default export solo monta <Canvas> y delega en
 * <Contenido>. React Compiler: nada de Math.random()/Date.now()/setState en
 * render; la geometría se memoiza o se deja como const (el compilador memoiza).
 */

import * as THREE from "three";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { resolver, fmt0, fmt1, type Modo } from "./newton-data";

export interface NewtonSceneProps {
  modo: Modo;
  m: number;
  F: number;
  theta: number;   // grados
  m1: number;
  m2: number;
  muS: number;
  muK: number;
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Colores de cada fuerza ───────────────────────────────────────────────── */
const C_PESO = "#f87171";   // peso W = m·g
const C_NORM = "#34D399";   // normal N
const C_FRIC = "#fb923c";   // fricción f
const C_APLI = "#C084FC";   // fuerza aplicada F
const C_TENS = "#fbbf24";   // tensión T
const C_NETO = "#7dd3fc";   // fuerza neta ΣF
const C_COMP = "#fca5a5";   // componentes del peso (punteadas)
const PISO = "#0c2233";
const RAMPA = "#13324a";

const FSCALE = 0.03;        // N → unidades de escena
const BOXE = 1.0;           // arista base de la caja (escala 1)

/* ── Tamaño visual de un bloque según su masa (pista suave de inercia) ─────── */
function tam(m: number): number {
  return THREE.MathUtils.clamp(Math.cbrt(m / 2), 0.72, 1.5);
}

/* ── Etiqueta flotante (siempre de cara a la cámara) ──────────────────────── */
function Etiqueta({
  pos, color, children, size = 11.5, bg = "rgba(6,16,31,0.85)",
}: {
  pos: Pt; color: string; children: React.ReactNode; size?: number; bg?: string;
}) {
  return (
    <Html position={pos} center distanceFactor={11} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", padding: "3px 8px", borderRadius: 8, background: bg,
        border: `1px solid ${color}77`, color: "#fff", fontWeight: 800, fontSize: size,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.45)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Flecha de fuerza: cilindro (asta) + cono (punta) orientados según dir ──── */
function Flecha({
  base, dir, mag, color, label, dashed = false, grosor = 0.05,
}: {
  base: Pt; dir: Pt; mag: number; color: string; label?: React.ReactNode; dashed?: boolean; grosor?: number;
}) {
  const len = mag * FSCALE;
  const quat = useMemo(() => {
    const v = new THREE.Vector3(dir[0], dir[1], dir[2]);
    if (v.lengthSq() < 1e-9) return new THREE.Quaternion();
    v.normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
  }, [dir]);

  if (len < 0.05) return null;

  const headLen = Math.min(0.3, len * 0.42);
  const shaftLen = Math.max(0.001, len - headLen);

  return (
    <group position={base} quaternion={quat}>
      {dashed ? (
        <Line
          points={[[0, 0, 0], [0, shaftLen, 0]]}
          color={color}
          lineWidth={2.4}
          dashed
          dashSize={0.16}
          gapSize={0.1}
          transparent
          opacity={0.9}
        />
      ) : (
        <mesh position={[0, shaftLen / 2, 0]}>
          <cylinderGeometry args={[grosor, grosor, shaftLen, 14]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} toneMapped={false} />
        </mesh>
      )}
      <mesh position={[0, shaftLen + headLen / 2, 0]}>
        <coneGeometry args={[grosor * 2.5, headLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {label != null && (
        <Etiqueta pos={[0, len + 0.26, 0]} color={color} size={11}>{label}</Etiqueta>
      )}
    </group>
  );
}

/* ── Bloque (caja) ────────────────────────────────────────────────────────── */
function Bloque({ center, escala, color, etiqueta, etiquetaCol = "#cdd8ec" }: {
  center: Pt; escala: number; color: string; etiqueta?: React.ReactNode; etiquetaCol?: string;
}) {
  const e = BOXE * escala;
  return (
    <group position={center}>
      <mesh castShadow>
        <boxGeometry args={[e, e, e]} />
        <meshStandardMaterial color={color} metalness={0.25} roughness={0.45} transparent opacity={0.82} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(e, e, e)]} />
        <lineBasicMaterial color="#eaf1ff" transparent opacity={0.55} />
      </lineSegments>
      {etiqueta != null && (
        <Etiqueta pos={[0, 0, e / 2 + 0.05]} color={etiquetaCol} size={10.5} bg="rgba(6,16,31,0.7)">{etiqueta}</Etiqueta>
      )}
    </group>
  );
}

/* ── Escenario 1: plano horizontal ────────────────────────────────────────── */
function EscenaHorizontal({ m, F, muS, muK }: { m: number; F: number; muS: number; muK: number }) {
  const d = resolver("horizontal", { m, F, theta: 0, m1: 0, m2: 0, muS, muK });
  const s = tam(m);
  const half = (BOXE * s) / 2;
  const C: Pt = [0, 0, 0];

  return (
    <group>
      {/* suelo */}
      <mesh position={[0, -half - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={PISO} metalness={0.1} roughness={0.9} />
      </mesh>
      <gridHelper args={[14, 14, "#1f3a4d", "#16293a"]} position={[0, -half, 0]} />

      <Bloque center={C} escala={s} color="#1e88c7" etiqueta={`m = ${fmt1(m)} kg`} />

      {/* flechas del DCL */}
      <Flecha base={C} dir={[0, -1, 0]} mag={d.W} color={C_PESO} label={`W = ${fmt0(d.W)} N`} />
      <Flecha base={C} dir={[0, 1, 0]} mag={d.N} color={C_NORM} label={`N = ${fmt0(d.N)} N`} />
      {F > 0.01 && <Flecha base={C} dir={[1, 0, 0]} mag={d.aplicada} color={C_APLI} label={`F = ${fmt0(F)} N`} />}
      {d.fric > 0.01 && <Flecha base={[0, 0, 0.001]} dir={[-1, 0, 0]} mag={d.fric} color={C_FRIC} label={`f = ${fmt0(d.fric)} N`} />}
      {d.mueve && d.neto > 0.01 && (
        <Flecha base={[0, half + 0.25, 0.35]} dir={[1, 0, 0]} mag={d.neto} color={C_NETO} grosor={0.06} label={`ΣF = ${fmt0(d.neto)} N`} />
      )}

      <EstadoBadge mueve={d.mueve} a={d.a} pos={[0, half + 1.0, 0]} />
    </group>
  );
}

/* ── Escenario 2: plano inclinado ─────────────────────────────────────────── */
function EscenaInclinada({ m, theta, muS, muK }: { m: number; theta: number; muS: number; muK: number }) {
  const d = resolver("inclinado", { m, F: 0, theta, m1: 0, m2: 0, muS, muK });
  const th = (theta * Math.PI) / 180;
  const s = tam(m);
  const half = (BOXE * s) / 2;
  const C: Pt = [0, 0, 0];

  const Wpar = d.Wpar ?? 0;
  const Wperp = d.Wperp ?? 0;

  return (
    <group>
      {/* marco inclinado: rampa + caja + fuerzas relativas a la superficie */}
      <group rotation={[0, 0, th]}>
        {/* rampa */}
        <mesh position={[0, -half - 0.16, 0]} receiveShadow>
          <boxGeometry args={[9, 0.3, 3.6]} />
          <meshStandardMaterial color={RAMPA} metalness={0.15} roughness={0.85} />
        </mesh>
        <Bloque center={C} escala={s} color="#1e88c7" etiqueta={`m = ${fmt1(m)} kg`} />

        {/* normal y fricción (relativas al plano) */}
        <Flecha base={C} dir={[0, 1, 0]} mag={d.N} color={C_NORM} label={`N = ${fmt0(d.N)} N`} />
        {d.fric > 0.01 && <Flecha base={C} dir={[1, 0, 0]} mag={d.fric} color={C_FRIC} label={`f = ${fmt0(d.fric)} N`} />}

        {/* componentes del peso (punteadas, sobre los ejes del plano) */}
        <Flecha base={[0, 0, 0.001]} dir={[-1, 0, 0]} mag={Wpar} color={C_COMP} dashed label={`mg·senθ = ${fmt0(Wpar)} N`} />
        <Flecha base={[0, 0, 0.001]} dir={[0, -1, 0]} mag={Wperp} color={C_COMP} dashed label={`mg·cosθ = ${fmt0(Wperp)} N`} />

        {/* fuerza neta a lo largo del plano (bajada) */}
        {d.mueve && d.neto > 0.01 && (
          <Flecha base={[0, half + 0.2, 0.35]} dir={[-1, 0, 0]} mag={d.neto} color={C_NETO} grosor={0.06} label={`ΣF = ${fmt0(d.neto)} N`} />
        )}
      </group>

      {/* peso real, SIEMPRE vertical (en el marco del mundo) */}
      <Flecha base={C} dir={[0, -1, 0]} mag={d.W} color={C_PESO} label={`W = ${fmt0(d.W)} N`} />

      {/* piso horizontal de referencia y ángulo */}
      <Etiqueta pos={[2.4, -half - 0.1, 0]} color="#9fb4cc" size={11} bg="rgba(6,16,31,0.7)">θ = {fmt0(theta)}°</Etiqueta>

      <EstadoBadge mueve={d.mueve} a={d.a} pos={[0, half + 1.2, 0]} />
    </group>
  );
}

/* ── Escenario 3: sistema con polea ───────────────────────────────────────── */
function EscenaPolea({ m1, m2, muS, muK }: { m1: number; m2: number; muS: number; muK: number }) {
  const d = resolver("polea", { m: 0, F: 0, theta: 0, m1, m2, muS, muK });
  const s1 = tam(m1);
  const s2 = tam(m2);
  const half1 = (BOXE * s1) / 2;
  const half2 = (BOXE * s2) / 2;

  const xb = -1.0;                 // centro del bloque sobre la mesa
  const C1: Pt = [xb, half1, 0];   // centro de m₁
  const px = 2.2;                  // x de la polea
  const rp = 0.26;                 // radio de la polea
  const yRope = half1;             // altura de la cuerda horizontal
  const y2 = -1.9 - half2;         // centro de m₂ colgante
  const C2: Pt = [px + rp, y2, 0];

  const T = d.T ?? 0;

  return (
    <group>
      {/* mesa */}
      <mesh position={[(xb - 3 + px) / 2, -0.16, 0]} receiveShadow>
        <boxGeometry args={[px + 3, 0.3, 3]} />
        <meshStandardMaterial color={RAMPA} metalness={0.15} roughness={0.85} />
      </mesh>
      {/* patas */}
      <mesh position={[xb - 2.4, -1.3, 1.1]}><boxGeometry args={[0.18, 2.3, 0.18]} /><meshStandardMaterial color={PISO} /></mesh>
      <mesh position={[xb - 2.4, -1.3, -1.1]}><boxGeometry args={[0.18, 2.3, 0.18]} /><meshStandardMaterial color={PISO} /></mesh>

      {/* polea */}
      <mesh position={[px, yRope, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[rp, 0.06, 12, 32]} />
        <meshStandardMaterial color="#9fb4cc" metalness={0.6} roughness={0.3} emissive="#475569" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[px, yRope, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[rp * 0.4, rp * 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* cuerda: horizontal del bloque a la polea + vertical a la masa */}
      <Line points={[[xb + half1, yRope, 0], [px, yRope, 0]]} color="#e2e8f0" lineWidth={2.4} />
      <Line points={[[px + rp, yRope, 0], [px + rp, y2 + half2, 0]]} color="#e2e8f0" lineWidth={2.4} />

      {/* bloques */}
      <Bloque center={C1} escala={s1} color="#1e88c7" etiqueta={`m₁ = ${fmt1(m1)} kg`} />
      <Bloque center={C2} escala={s2} color="#7c5cff" etiqueta={`m₂ = ${fmt1(m2)} kg`} />

      {/* DCL de m₁ (sobre la mesa) */}
      <Flecha base={C1} dir={[0, -1, 0]} mag={d.W} color={C_PESO} label={`W₁ = ${fmt0(d.W)} N`} />
      <Flecha base={C1} dir={[0, 1, 0]} mag={d.N} color={C_NORM} label={`N = ${fmt0(d.N)} N`} />
      <Flecha base={C1} dir={[1, 0, 0]} mag={T} color={C_TENS} label={`T = ${fmt0(T)} N`} />
      {d.fric > 0.01 && <Flecha base={[xb, half1, 0.001]} dir={[-1, 0, 0]} mag={d.fric} color={C_FRIC} label={`f = ${fmt0(d.fric)} N`} />}

      {/* DCL de m₂ (colgante) */}
      <Flecha base={C2} dir={[0, 1, 0]} mag={T} color={C_TENS} label={`T = ${fmt0(T)} N`} />
      <Flecha base={[px + rp, y2, 0.001]} dir={[0, -1, 0]} mag={m2 * 9.81} color={C_PESO} label={`W₂ = ${fmt0(m2 * 9.81)} N`} />

      {/* neto del sistema (sobre m₁, hacia la polea) */}
      {d.mueve && d.neto > 0.01 && (
        <Flecha base={[xb, half1 + half1 + 0.25, 0.35]} dir={[1, 0, 0]} mag={d.neto} color={C_NETO} grosor={0.06} label={`ΣF = ${fmt0(d.neto)} N`} />
      )}

      <EstadoBadge mueve={d.mueve} a={d.a} pos={[xb, half1 + 1.5, 0]} />
    </group>
  );
}

/* ── Insignia de estado (equilibrio / aceleración) ────────────────────────── */
function EstadoBadge({ mueve, a, pos }: { mueve: boolean; a: number; pos: Pt }) {
  return (
    <Etiqueta pos={pos} color={mueve ? C_NETO : C_NORM} size={12} bg="rgba(4,10,22,0.92)">
      {mueve ? `a = ${fmt1(a)} m/s²` : "ΣF = 0 · equilibrio"}
    </Etiqueta>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, m, F, theta, m1, m2, muS, muK, accent, resetNonce }: NewtonSceneProps) {
  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 16, 46]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 8]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={30} />
      <pointLight position={[-6, 4, 6]} intensity={0.5} color={accent} />

      <group key={resetNonce}>
        {modo === "horizontal" && <EscenaHorizontal m={m} F={F} muS={muS} muK={muK} />}
        {modo === "inclinado" && <EscenaInclinada m={m} theta={theta} muS={muS} muK={muK} />}
        {modo === "polea" && <EscenaPolea m1={m1} m2={m2} muS={muS} muK={muK} />}
      </group>

      <ContactShadows position={[0, -2.0, 0]} opacity={0.28} scale={20} blur={2.6} far={8} />

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
        minDistance={5}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.7}
        target={modo === "polea" ? [0.4, -0.3, 0] : [0, 0.3, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function NewtonScene(props: NewtonSceneProps) {
  const cam: Pt = props.modo === "polea" ? [2.2, 1.4, 10] : [2.0, 1.4, 8.5];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: cam, fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
