"use client";

/**
 * Escena 3D — "Diagrama de cuerpo libre: las leyes de Newton" (CNEYT-V-P01-A2).
 *
 * Tres escenarios que el alumno orbita, cada uno con su DIAGRAMA DE CUERPO LIBRE
 * dibujado como flechas vectoriales sobre el objeto aislado:
 *  · horizontal — caja sobre suelo plano con una fuerza aplicada F; flechas de
 *    peso (W), normal (N), fricción (f), fuerza aplicada (F) y fuerza neta (ΣF).
 *  · inclinado  — caja sobre una rampa a θ; el empuje a favor del plano (m·g·senθ)
 *    se compara con la fricción: al superar f_s,máx la caja DESLIZA por la rampa.
 *  · polea      — bloque m₁ sobre una mesa unido por una cuerda que pasa por una
 *    polea a una masa colgante m₂; se ve la MISMA tensión T tirando de ambos.
 *
 * Etiquetas: como máximo 3-4 a la vez, en la PUNTA de su flecha y desplazadas
 * según su lado (nunca se pisan); el resto de valores vive en el panel.
 * Las flechas se escalan linealmente con la magnitud de la fuerza (FSCALE).
 * React Compiler: nada de Math.random()/Date.now()/setState en render.
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario, calidadEscena } from "./_escenario";
import { resolver, fmt0, type Modo } from "./newton-data";

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
  /** Muestra las componentes del peso (mg·senθ, mg·cosθ) con su etiqueta. */
  componentes?: boolean;
}

type Pt = [number, number, number];
type Lado = "up" | "down" | "left" | "right";

/* ── Colores de cada fuerza ───────────────────────────────────────────────── */
const C_PESO = "#f87171";   // peso W = m·g
const C_NORM = "#34D399";   // normal N
const C_FRIC = "#fb923c";   // fricción f
const C_APLI = "#C084FC";   // fuerza aplicada F
const C_TENS = "#fbbf24";   // tensión T
const C_NETO = "#7dd3fc";   // fuerza neta ΣF
const C_COMP = "#fca5a5";   // componentes del peso (punteadas)
const RAMPA = "#1a4262";
const MESA = "#1a4262";

/* N → unidades de escena. Lineal (las flechas se comparan entre sí) y solo se
 * recorta si una fuerza se sale del encuadre (masas altas): la cifra de la
 * etiqueta sigue siendo la real. */
const FSCALE = 0.06;
const LEN_MAX = 3.4;
const BOXE = 1.2;           // arista base de la caja (escala 1)

/* ── Tamaño visual de un bloque según su masa (pista suave de inercia) ─────── */
function tam(m: number): number {
  return THREE.MathUtils.clamp(Math.cbrt(m / 2), 0.75, 1.45);
}

/* ── Etiqueta de una flecha: va en la PUNTA, desplazada hacia afuera ──────────
 * El desplazamiento es determinista según el lado, así que dos fuerzas con
 * direcciones distintas nunca caen una sobre otra. Tamaño fijo en píxeles. */
const DESPLAZA: Record<Lado, string> = {
  up: "translate(0,-70%)",
  down: "translate(0,70%)",
  left: "translate(-62%,0)",
  right: "translate(62%,0)",
};

function Etiqueta({ pos, color, children, lado = "up" }: {
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

/* ── Flecha de fuerza: cilindro (asta) + cono (punta) orientados según dir ──── */
function Flecha({
  base, dir, mag, color, label, lado = "up", dashed = false, grosor = 0.055,
}: {
  base: Pt; dir: Pt; mag: number; color: string; label?: React.ReactNode; lado?: Lado; dashed?: boolean; grosor?: number;
}) {
  const len = Math.min(mag * FSCALE, LEN_MAX);
  const quat = useMemo(() => {
    const v = new THREE.Vector3(dir[0], dir[1], dir[2]);
    if (v.lengthSq() < 1e-9) return new THREE.Quaternion();
    v.normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
  }, [dir]);

  if (len < 0.05) return null;

  const headLen = Math.min(0.32, len * 0.42);
  const shaftLen = Math.max(0.001, len - headLen);

  /* Las flechas se dibujan por encima de la caja y del piso (depthTest off):
   * el DCL parte del centro del cuerpo y debe verse completo. */
  return (
    <group position={base} quaternion={quat}>
      {dashed ? (
        <Line
          points={[[0, 0, 0], [0, shaftLen, 0]]}
          color={color}
          lineWidth={2.6}
          dashed
          dashSize={0.16}
          gapSize={0.1}
          transparent
          opacity={0.95}
          depthTest={false}
          renderOrder={10}
        />
      ) : (
        <mesh position={[0, shaftLen / 2, 0]} renderOrder={10}>
          <cylinderGeometry args={[grosor, grosor, shaftLen, 14]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} toneMapped={false} depthTest={false} transparent />
        </mesh>
      )}
      <mesh position={[0, shaftLen + headLen / 2, 0]} renderOrder={10}>
        <coneGeometry args={[grosor * 2.6, headLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} toneMapped={false} depthTest={false} transparent />
      </mesh>
      {label != null && <Etiqueta pos={[0, len, 0]} color={color} lado={lado}>{label}</Etiqueta>}
    </group>
  );
}

/* ── Bloque (caja) ────────────────────────────────────────────────────────── */
function Bloque({ center, escala, color }: { center: Pt; escala: number; color: string }) {
  const e = BOXE * escala;
  return (
    <group position={center}>
      <mesh castShadow>
        <boxGeometry args={[e, e, e]} />
        <meshStandardMaterial color={color} metalness={0.25} roughness={0.45} transparent opacity={0.82} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(e, e, e)]} />
        <lineBasicMaterial color="#eaf1ff" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}

/* ── Altura del piso por escenario ────────────────────────────────────────── */
function yTopeRampa(theta: number, half: number, x: number): number {
  const th = (theta * Math.PI) / 180;
  return -Math.cos(th) * half + Math.tan(th) * (x - Math.sin(th) * half);
}
const RAMPA_X = 4.2;
function pisoDe(modo: Modo, p: { m: number; theta: number }): number {
  if (modo === "horizontal") return -(BOXE * tam(p.m)) / 2 - 0.01;
  if (modo === "inclinado") return yTopeRampa(p.theta, (BOXE * tam(p.m)) / 2, -RAMPA_X) - 0.01;
  return -4.1;
}

/* ── Escenario 1: plano horizontal ────────────────────────────────────────── */
function EscenaHorizontal({ m, F, muS, muK }: { m: number; F: number; muS: number; muK: number }) {
  const d = resolver("horizontal", { m, F, theta: 0, m1: 0, m2: 0, muS, muK });
  const s = tam(m);
  const half = (BOXE * s) / 2;
  const C: Pt = [0, 0, 0];

  return (
    <group>
      <Bloque center={C} escala={s} color={d.mueve ? "#2fb0ff" : "#1e88c7"} />

      <Flecha base={C} dir={[0, -1, 0]} mag={d.W} color={C_PESO} label={`W = ${fmt0(d.W)} N`} lado="down" />
      <Flecha base={C} dir={[0, 1, 0]} mag={d.N} color={C_NORM} label={`N = ${fmt0(d.N)} N`} lado="up" />
      {F > 0.01 && <Flecha base={C} dir={[1, 0, 0]} mag={d.aplicada} color={C_APLI} label={`F = ${fmt0(F)} N`} lado="right" />}
      {d.fric > 0.01 && <Flecha base={[0, 0, 0.001]} dir={[-1, 0, 0]} mag={d.fric} color={C_FRIC} label={`f = ${fmt0(d.fric)} N`} lado="left" />}
      {d.mueve && d.neto > 0.01 && (
        <Flecha base={[0, half + 0.3, 0.35]} dir={[1, 0, 0]} mag={d.neto} color={C_NETO} grosor={0.065} />
      )}
    </group>
  );
}

/* ── Escenario 2: plano inclinado ─────────────────────────────────────────── */
const X0 = 1.3;     // posición inicial de la caja sobre la rampa (eje local)
const X_FIN = -3.4; // dónde "sale" y vuelve a empezar

/** La caja y todo su DCL viajan juntos por la rampa cuando ΣF > 0. */
function Deslizante({ mueve, a, children }: { mueve: boolean; a: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (!mueve) { t.current = 0; g.position.x = X0; return; }
    t.current += Math.min(dt, 0.05);
    const av = THREE.MathUtils.clamp(a, 0.5, 6) * 0.7;
    const x = X0 - 0.5 * av * t.current * t.current;
    if (x < X_FIN) { t.current = 0; g.position.x = X0; return; }
    g.position.x = x;
  });
  return <group ref={ref} position={[X0, 0, 0]}>{children}</group>;
}

function EscenaInclinada({ m, theta, muS, muK, componentes }: { m: number; theta: number; muS: number; muK: number; componentes: boolean }) {
  const d = resolver("inclinado", { m, F: 0, theta, m1: 0, m2: 0, muS, muK });
  const th = (theta * Math.PI) / 180;
  const s = tam(m);
  const half = (BOXE * s) / 2;
  const C: Pt = [0, 0, 0];

  const Wpar = d.Wpar ?? 0;
  const Wperp = d.Wperp ?? 0;

  /* cuña sólida en el marco del mundo: su cara superior es la rampa y su base
   * queda siempre sobre el piso */
  const piso = pisoDe("inclinado", { m, theta });
  const yl = yTopeRampa(theta, half, -RAMPA_X);
  const yr = yTopeRampa(theta, half, RAMPA_X);
  const forma = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-RAMPA_X, yl);
    sh.lineTo(RAMPA_X, yr);
    sh.lineTo(RAMPA_X, piso);
    sh.lineTo(-RAMPA_X, piso);
    sh.closePath();
    return sh;
  }, [yl, yr, piso]);

  return (
    <group>
      <mesh position={[0, 0, -1.5]} receiveShadow castShadow>
        <extrudeGeometry args={[forma, { depth: 3, bevelEnabled: false }]} />
        <meshStandardMaterial color={RAMPA} metalness={0.15} roughness={0.8} />
      </mesh>

      {/* marco inclinado: caja + fuerzas relativas a la superficie */}
      <group rotation={[0, 0, th]}>
        <Deslizante mueve={d.mueve} a={d.a}>
          <Bloque center={C} escala={s} color={d.mueve ? "#2fb0ff" : "#1e88c7"} />

          <Flecha base={C} dir={[0, 1, 0]} mag={d.N} color={C_NORM} label={`N = ${fmt0(d.N)} N`} lado="up" />
          {d.fric > 0.01 && <Flecha base={C} dir={[1, 0, 0]} mag={d.fric} color={C_FRIC} label={`f = ${fmt0(d.fric)} N`} lado="right" />}

          {/* componente del peso a favor del plano: el empuje que hay que vencer */}
          <Flecha base={[0, 0, 0.001]} dir={[-1, 0, 0]} mag={Wpar} color={C_COMP} dashed
            label={componentes ? `mg·senθ = ${fmt0(Wpar)} N` : undefined} lado="left" />
          {componentes && (
            <Flecha base={[0, 0, 0.001]} dir={[0, -1, 0]} mag={Wperp} color={C_COMP} dashed label={`mg·cosθ = ${fmt0(Wperp)} N`} lado="right" />
          )}

          {d.mueve && d.neto > 0.01 && (
            <Flecha base={[0, half + 0.25, 0.35]} dir={[-1, 0, 0]} mag={d.neto} color={C_NETO} grosor={0.065} />
          )}

          {/* peso real, SIEMPRE vertical: contragiro para quedar en el marco del mundo */}
          <group rotation={[0, 0, -th]}>
            <Flecha base={C} dir={[0, -1, 0]} mag={d.W} color={C_PESO} label={`W = ${fmt0(d.W)} N`} lado="left" />
          </group>
        </Deslizante>
      </group>

      {/* ángulo en el pie de la rampa */}
      <Etiqueta pos={[-RAMPA_X + 1.3, piso + 0.45, 1.6]} color="#facc15" lado="right">θ = {fmt0(theta)}°</Etiqueta>
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
  const piso = pisoDe("polea", { m: 0, theta: 0 });
  const alto = -0.31 - piso;

  const T = d.T ?? 0;

  return (
    <group>
      {/* mesa */}
      <mesh position={[(xb - 3 + px) / 2, -0.16, 0]} receiveShadow castShadow>
        <boxGeometry args={[px + 3, 0.3, 3]} />
        <meshStandardMaterial color={MESA} metalness={0.15} roughness={0.8} />
      </mesh>
      {/* patas hasta el piso */}
      <mesh position={[xb - 2.4, -0.31 - alto / 2, 1.1]}><boxGeometry args={[0.18, alto, 0.18]} /><meshStandardMaterial color="#10304a" /></mesh>
      <mesh position={[xb - 2.4, -0.31 - alto / 2, -1.1]}><boxGeometry args={[0.18, alto, 0.18]} /><meshStandardMaterial color="#10304a" /></mesh>

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

      <Bloque center={C1} escala={s1} color="#1e88c7" />
      <Bloque center={C2} escala={s2} color="#7c5cff" />

      {/* DCL de m₁ (sobre la mesa): W y N van sin etiqueta (sus valores, en el panel) */}
      <Flecha base={C1} dir={[0, -1, 0]} mag={d.W} color={C_PESO} />
      <Flecha base={C1} dir={[0, 1, 0]} mag={d.N} color={C_NORM} />
      <Flecha base={C1} dir={[1, 0, 0]} mag={T} color={C_TENS} label={`T = ${fmt0(T)} N`} lado="up" />
      {d.fric > 0.01 && <Flecha base={[xb, half1, 0.001]} dir={[-1, 0, 0]} mag={d.fric} color={C_FRIC} label={`f = ${fmt0(d.fric)} N`} lado="left" />}

      {/* DCL de m₂ (colgante) */}
      <Flecha base={C2} dir={[0, 1, 0]} mag={T} color={C_TENS} label="T" lado="right" />
      <Flecha base={[px + rp, y2, 0.001]} dir={[0, -1, 0]} mag={m2 * 9.81} color={C_PESO} label={`W₂ = ${fmt0(m2 * 9.81)} N`} lado="right" />

      {d.mueve && d.neto > 0.01 && (
        <Flecha base={[xb, half1 + half1 + 0.3, 0.35]} dir={[1, 0, 0]} mag={d.neto} color={C_NETO} grosor={0.065} />
      )}
    </group>
  );
}

/* ── Encuadre por escenario: objeto + flechas ≈ 60 % del alto, algo por encima
 *    del centro porque abajo tapa el banner de la misión y arriba la barra ──── */
const ENCUADRE: Record<Modo, { cam: Pt; objetivo: Pt }> = {
  horizontal: { cam: [2.4, 1.5, 6.4], objetivo: [0.5, -0.5, 0] },
  inclinado: { cam: [0.8, 1.0, 7.2], objetivo: [-0.2, -0.8, 0] },
  polea: { cam: [2.0, 1.2, 10.4], objetivo: [0.5, -1.6, 0] },
};

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, m, F, theta, m1, m2, muS, muK, accent, resetNonce, componentes = false }: NewtonSceneProps) {
  const [calidad] = useState(() => calidadEscena());
  const piso = pisoDe(modo, { m: modo === "polea" ? m1 : m, theta });
  const enc = ENCUADRE[modo];

  return (
    <>
      <Escenario acento={accent} suelo={piso} calidad={calidad} />

      <group key={resetNonce}>
        {modo === "horizontal" && <EscenaHorizontal m={m} F={F} muS={muS} muK={muK} />}
        {modo === "inclinado" && <EscenaInclinada m={m} theta={theta} muS={muS} muK={muK} componentes={componentes} />}
        {modo === "polea" && <EscenaPolea m1={m1} m2={m2} muS={muS} muK={muK} />}
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={modo === "polea" ? 15 : 12}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.9}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        target={enc.objetivo}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.45} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function NewtonScene(props: NewtonSceneProps) {
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: ENCUADRE[props.modo].cam, fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
