"use client";

/**
 * Escena 3D del laboratorio "Lógica matemática y compuertas" (PM-I, P03).
 * Tres vistas:
 *
 *  - circuito: dos interruptores (p y q), la compuerta del conectivo y un foco.
 *    Los cables que llevan una proposición verdadera se iluminan; la señal
 *    viaja por el cable y el foco solo se enciende si la compuesta es V.
 *  - tabla: el árbol de compuertas de una expresión armado sobre un tablero de
 *    circuito. Cada fila de la tabla de verdad energiza las entradas y la señal
 *    avanza compuerta por compuerta hasta el foco.
 *  - razonar: los cuatro mundos posibles (VV, VF, FV, FF). En «formas» cada
 *    mundo tiene el foco del condicional original y el de otra forma; en
 *    «argumentos» los mundos que hacen falsa una premisa se hunden y los que
 *    quedan se iluminan en verde (confirman) o rojo (contraejemplo).
 *
 * Todos los valores salen de `evaluar()` en logica-compuertas-data. La
 * animación ocurre en useFrame mutando refs y avanza por tiempo. NO se usa
 * <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type Conectivo,
  type Expr,
  type Var,
  type Forma,
  type Argumento,
  type EstadoMundo,
  CONECTIVO_DEF,
  EXPRESIONES,
  SITUACIONES,
  FORMA_DEF,
  ARGUMENTO_DEF,
  FILAS,
  SIMBOLO,
  evaluar,
  texto,
  bin,
  P,
  Q,
  vf,
  claveFila,
  probarArgumento,
} from "./logica-compuertas-data";

export interface LogicaSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Circuito
  conectivo: Conectivo;
  p: boolean;
  q: boolean;
  revelado: boolean;
  pulso: number;
  onToggle: (v: Var) => void;
  // Tabla
  expresionId: string;
  fila: number;
  probada: boolean;
  /** Lo que el alumno escribió en la fila actual, por texto de subexpresión. */
  marcas: Record<string, boolean | null>;
  pulsoTabla: number;
  // Razonar
  situacionId: string;
  sub: "formas" | "argumentos";
  forma: Forma;
  formaRevelada: boolean;
  argumento: Argumento;
  argProbado: boolean;
  pulsoRazonar: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const AMBAR = "#fbbf24";
const OK = "#34d399";
const NO = "#f87171";
const C_ON = new THREE.Color(AMBAR);
const C_OFF = new THREE.Color("#233447");
const C_UNK = new THREE.Color("#3b4656");
const C_NEGRO = new THREE.Color("#000000");
/** Segundos que tarda la señal en recorrer un cable. */
const VIAJE = 0.55;
/** Segundos entre un nivel de compuertas y el siguiente. */
const PASO = 0.75;
const Y_CABLE = 0.12;

/** Reloj que vuelve a cero cada vez que cambia `pulso`. */
function useReloj(pulso: number) {
  const t = useRef(0);
  const ultimo = useRef(pulso);
  useFrame((_, dt) => {
    if (ultimo.current !== pulso) {
      ultimo.current = pulso;
      t.current = 0;
    } else t.current += Math.min(dt, 0.1);
  });
  return t;
}

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Chip V / F / ? que aparece cuando la señal llega. */
function ChipValor({ valor, retardo, pulso, fs = 13, error }: { valor: boolean | null; retardo: number; pulso: number; fs?: number; error?: boolean | null }) {
  const col = valor === null ? "#64748b" : valor ? AMBAR : "#94a3b8";
  return (
    <div key={`${pulso}-${String(valor)}`} style={{ display: "flex", alignItems: "center", gap: 5, animation: valor === null ? undefined : `lcAparece .35s ease-out ${retardo}s both` }}>
      <span
        style={{
          minWidth: fs * 1.9,
          textAlign: "center",
          padding: "3px 8px",
          borderRadius: 8,
          background: valor ? "rgba(251,191,36,0.2)" : "rgba(4,10,22,0.88)",
          border: `1.5px solid ${error ? NO : col}`,
          color: valor === null ? "#94a3b8" : valor ? "#fde68a" : "#e2e8f0",
          fontSize: fs,
          fontWeight: 900,
          fontFamily: "ui-monospace, monospace",
          boxShadow: valor ? `0 0 14px -2px ${AMBAR}` : "none",
        }}
      >
        {valor === null ? "?" : vf(valor)}
      </span>
      {error !== undefined && error !== null && (
        <span style={{ padding: "2px 7px", borderRadius: 7, background: "rgba(127,29,29,0.9)", border: `1px solid ${NO}`, color: "#fff", fontSize: fs * 0.72, fontWeight: 900, whiteSpace: "nowrap" }}>
          tú: {vf(error)}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Piezas de circuito
 * ════════════════════════════════════════════════════════════════════════ */

function ruta(pts: Pt[]): THREE.CurvePath<THREE.Vector3> {
  const v = pts.map((p) => new THREE.Vector3(...p));
  const path = new THREE.CurvePath<THREE.Vector3>();
  let prev = v[0]!;
  for (let i = 1; i < v.length - 1; i++) {
    const a = v[i - 1]!;
    const c = v[i]!;
    const n = v[i + 1]!;
    const r = Math.min(0.2, a.distanceTo(c) / 2, c.distanceTo(n) / 2);
    const p1 = c.clone().add(a.clone().sub(c).normalize().multiplyScalar(r));
    const p2 = c.clone().add(n.clone().sub(c).normalize().multiplyScalar(r));
    if (prev.distanceTo(p1) > 1e-4) path.add(new THREE.LineCurve3(prev, p1));
    if (r > 1e-4) path.add(new THREE.QuadraticBezierCurve3(p1, c, p2));
    prev = p2;
  }
  const fin = v[v.length - 1]!;
  if (prev.distanceTo(fin) > 1e-4 || path.curves.length === 0) path.add(new THREE.LineCurve3(prev, fin));
  return path;
}

function Cable({ puntos, valor, retardo, pulso, grosor = 0.045 }: { puntos: Pt[]; valor: boolean | null; retardo: number; pulso: number; grosor?: number }) {
  const curva = useMemo(() => ruta(puntos), [puntos]);
  const geo = useMemo(() => new THREE.TubeGeometry(curva, Math.max(40, puntos.length * 24), grosor, 10, false), [curva, puntos.length, grosor]);
  const tubo = useRef<THREE.Mesh>(null);
  const bola = useRef<THREE.Mesh>(null);
  const reloj = useRef(0);
  const ultimoPulso = useRef(pulso);
  const luz = useRef(0);
  const ultimoValor = useRef(valor);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }, dt) => {
    if (ultimoPulso.current !== pulso) {
      ultimoPulso.current = pulso;
      reloj.current = 0;
    } else reloj.current += Math.min(dt, 0.1);
    // Si el valor cambia sin un pulso nuevo (un interruptor), la señal sale ya.
    if (ultimoValor.current !== valor) {
      ultimoValor.current = valor;
      reloj.current = Math.min(reloj.current, retardo);
      luz.current = 0;
    }
    const t = reloj.current;
    const llego = valor === true && t >= retardo + VIAJE;
    luz.current += ((llego ? 1 : 0) - luz.current) * suave(dt, 0.12);
    const m = tubo.current?.material as THREE.MeshStandardMaterial | undefined;
    if (m) {
      m.color.lerpColors(valor === null ? C_UNK : C_OFF, C_ON, luz.current);
      m.emissive.lerpColors(C_NEGRO, C_ON, luz.current);
      m.emissiveIntensity = 0.75 + 0.25 * Math.sin(clock.elapsedTime * 5);
    }
    if (bola.current) {
      const f = (t - retardo) / VIAJE;
      const viaja = valor === true && f >= 0 && f <= 1;
      bola.current.visible = viaja;
      if (viaja) {
        curva.getPointAt(Math.min(1, Math.max(0, f)), tmp);
        bola.current.position.copy(tmp);
      }
    }
  });
  return (
    <>
      <mesh ref={tubo} geometry={geo} castShadow>
        <meshStandardMaterial color="#233447" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh ref={bola} visible={false}>
        <sphereGeometry args={[grosor * 2.6, 16, 12]} />
        <meshBasicMaterial color="#fff7cc" toneMapped={false} />
      </mesh>
    </>
  );
}

/* ── Geometrías de las compuertas (constantes de módulo) ─────────────── */

const EXTRUSION = { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 28 };

function extruir(s: THREE.Shape): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(s, EXTRUSION);
  // Acostada sobre el tablero: el eje y de la silueta queda hacia −z.
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0.03, 0);
  return g;
}

function siluetaAnd() {
  const s = new THREE.Shape();
  s.moveTo(-0.6, -0.5);
  s.lineTo(0.1, -0.5);
  s.absarc(0.1, 0, 0.5, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(-0.6, 0.5);
  s.lineTo(-0.6, -0.5);
  return s;
}
function siluetaOr() {
  const s = new THREE.Shape();
  s.moveTo(-0.62, -0.5);
  s.quadraticCurveTo(0.3, -0.5, 0.7, 0);
  s.quadraticCurveTo(0.3, 0.5, -0.62, 0.5);
  s.quadraticCurveTo(-0.32, 0, -0.62, -0.5);
  return s;
}
function siluetaNot() {
  const s = new THREE.Shape();
  s.moveTo(-0.5, -0.45);
  s.lineTo(0.42, 0);
  s.lineTo(-0.5, 0.45);
  s.lineTo(-0.5, -0.45);
  return s;
}
function arcoXnor() {
  const s = new THREE.Shape();
  s.moveTo(-0.84, -0.5);
  s.quadraticCurveTo(-0.54, 0, -0.84, 0.5);
  s.lineTo(-0.75, 0.5);
  s.quadraticCurveTo(-0.45, 0, -0.75, -0.5);
  s.lineTo(-0.84, -0.5);
  return s;
}

const GEO_AND = extruir(siluetaAnd());
const GEO_OR = extruir(siluetaOr());
const GEO_NOT = extruir(siluetaNot());
const GEO_ARCO = extruir(arcoXnor());
const GEO_BURBUJA = new THREE.CylinderGeometry(0.09, 0.09, 0.26, 24).translate(0, 0.14, 0);

/** Dónde entran (x local) y dónde sale (x local) la señal de cada compuerta. */
const X_ENTRADA: Record<Conectivo, number> = { neg: -0.5, and: -0.58, or: -0.5, imp: -0.72, bic: -0.5 };
const X_SALIDA: Record<Conectivo, number> = { neg: 0.62, and: 0.6, or: 0.7, imp: 0.7, bic: 0.9 };

const COLOR_COMPUERTA: Record<Conectivo, string> = { neg: "#0e7490", and: "#1d4ed8", or: "#6d28d9", imp: "#be185d", bic: "#047857" };

function Compuerta({ tipo, pos, esc, valor, retardo, pulso, error, nombre }: { tipo: Conectivo; pos: Pt; esc: number; valor: boolean | null; retardo: number; pulso: number; error?: boolean | null; nombre?: string }) {
  const cuerpo = useRef<THREE.Group>(null);
  const reloj = useReloj(pulso);
  const brillo = useRef(0);
  const col = COLOR_COMPUERTA[tipo];
  const cBrillo = useMemo(() => new THREE.Color(col).lerp(new THREE.Color("#ffffff"), 0.25), [col]);
  useFrame((_, dt) => {
    const on = valor === true && reloj.current >= retardo;
    brillo.current += ((on ? 1 : 0) - brillo.current) * suave(dt, 0.1);
    cuerpo.current?.children.forEach((c) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.emissive.lerpColors(C_NEGRO, cBrillo, brillo.current * 0.7);
    });
  });
  const geo = tipo === "and" ? GEO_AND : tipo === "neg" ? GEO_NOT : GEO_OR;
  return (
    <group position={pos}>
      <group ref={cuerpo} scale={esc}>
        <mesh geometry={geo} castShadow receiveShadow>
          <meshStandardMaterial color={col} metalness={0.35} roughness={0.32} />
        </mesh>
        {tipo === "bic" && (
          <mesh geometry={GEO_ARCO} castShadow>
            <meshStandardMaterial color={col} metalness={0.35} roughness={0.32} />
          </mesh>
        )}
        {(tipo === "neg" || tipo === "bic") && (
          <mesh geometry={GEO_BURBUJA} position={[tipo === "neg" ? 0.52 : 0.8, 0, 0]} castShadow>
            <meshStandardMaterial color={col} metalness={0.35} roughness={0.32} />
          </mesh>
        )}
        {tipo === "imp" && (
          <mesh geometry={GEO_BURBUJA} position={[-0.63, 0, -0.25]} castShadow>
            <meshStandardMaterial color={col} metalness={0.35} roughness={0.32} />
          </mesh>
        )}
      </group>
      <Html position={[tipo === "and" ? -0.1 * esc : -0.05 * esc, 0.34 * esc, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: 20 * esc, fontWeight: 900, color: "#fff", textShadow: `0 0 10px ${col}, 0 2px 4px #000`, lineHeight: 1 }}>{SIMBOLO[tipo]}</div>
      </Html>
      {nombre && (
        <Etiqueta pos={[0, 0.05, 0.95 * esc]} df={10} fs={11} col={`${col}cc`}>
          {nombre}
        </Etiqueta>
      )}
      <Html position={[X_SALIDA[tipo] * esc + 0.28, 0.55, -0.32 * esc]} center distanceFactor={10} zIndexRange={[21, 0]} style={{ pointerEvents: "none" }}>
        <ChipValor valor={valor} retardo={retardo} pulso={pulso} fs={esc > 1.2 ? 14 : 12} error={error} />
      </Html>
    </group>
  );
}

function Foco({ pos, esc, valor, retardo, pulso, children }: { pos: Pt; esc: number; valor: boolean | null; retardo: number; pulso: number; children?: ReactNode }) {
  const reloj = useReloj(pulso);
  const brillo = useRef(0);
  const vidrio = useRef<THREE.Mesh>(null);
  const filamento = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const luz = useRef<THREE.PointLight>(null);
  useFrame(({ clock }, dt) => {
    const on = valor === true && reloj.current >= retardo;
    brillo.current += ((on ? 1 : 0) - brillo.current) * suave(dt, 0.09);
    const b = brillo.current;
    const titila = 1 + 0.04 * Math.sin(clock.elapsedTime * 9);
    const mv = vidrio.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mv) {
      mv.emissive.lerpColors(C_NEGRO, C_ON, b);
      mv.emissiveIntensity = 0.9 * titila;
      mv.opacity = 0.32 + 0.5 * b;
    }
    const mf = filamento.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mf) mf.emissiveIntensity = 0.1 + 3.5 * b * titila;
    if (halo.current) {
      halo.current.visible = b > 0.02;
      halo.current.scale.setScalar(0.85 + 0.35 * b);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.12 * b;
    }
    if (luz.current) luz.current.intensity = 6 * b;
  });
  return (
    <group position={pos} scale={esc}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.4, 0.36, 28]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
      </mesh>
      {[0.42, 0.5, 0.58].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.24, 0.035, 8, 28]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      <mesh ref={vidrio} position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.52, 32, 24]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.32} roughness={0.08} metalness={0.1} emissive="#000000" depthWrite={false} />
      </mesh>
      <mesh ref={filamento} position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.025, 8, 24]} />
        <meshStandardMaterial color="#fde68a" emissive={AMBAR} emissiveIntensity={0.1} toneMapped={false} />
      </mesh>
      <mesh ref={halo} position={[0, 1.05, 0]} visible={false}>
        <sphereGeometry args={[0.75, 24, 18]} />
        <meshBasicMaterial color={AMBAR} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight ref={luz} position={[0, 1.1, 0]} color={AMBAR} intensity={0} distance={7} decay={1.6} />
      {children && (
        <Html position={[0, 2.0, 0]} center distanceFactor={10 / esc} zIndexRange={[22, 0]} style={{ pointerEvents: "none" }}>
          {children}
        </Html>
      )}
    </group>
  );
}

function Palanca({ pos, variable, valor, frase, onToggle }: { pos: Pt; variable: Var; valor: boolean; frase: string; onToggle: (v: Var) => void }) {
  const brazo = useRef<THREE.Group>(null);
  const led = useRef<THREE.Mesh>(null);
  const ang = useRef(valor ? -0.55 : 0.55);
  useFrame((_, dt) => {
    ang.current += ((valor ? -0.55 : 0.55) - ang.current) * suave(dt, 0.2);
    if (brazo.current) brazo.current.rotation.z = ang.current;
    const m = led.current?.material as THREE.MeshStandardMaterial | undefined;
    if (m) m.emissiveIntensity = valor ? 2.4 : 0.05;
  });
  const clic = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onToggle(variable);
  };
  return (
    <group position={pos}>
      <group onClick={clic} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
        <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.25, 0.34, 0.85]} />
          <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.22]} />
          <meshStandardMaterial color="#0b1220" roughness={0.6} />
        </mesh>
        <group ref={brazo} position={[0, 0.36, 0]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.84, 14]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.88, 0]} castShadow>
            <sphereGeometry args={[0.15, 20, 16]} />
            <meshStandardMaterial color={valor ? AMBAR : "#ef4444"} metalness={0.2} roughness={0.35} />
          </mesh>
        </group>
        <mesh ref={led} position={[-0.42, 0.36, 0.3]}>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshStandardMaterial color={valor ? AMBAR : "#334155"} emissive={AMBAR} emissiveIntensity={0.05} toneMapped={false} />
        </mesh>
      </group>
      <Html position={[0, 0.05, 0.85]} center distanceFactor={10} zIndexRange={[22, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 8px", borderRadius: 12, background: "rgba(4,10,22,0.88)", border: `1px solid ${valor ? AMBAR : "rgba(255,255,255,0.22)"}`, whiteSpace: "nowrap", boxShadow: "0 6px 18px -8px #000" }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: valor ? AMBAR : "#334155", color: valor ? "#1c1300" : "#e2e8f0", fontSize: 15, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>{variable}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{frase}</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: valor ? "#fde68a" : "#94a3b8", fontFamily: "ui-monospace, monospace" }}>{vf(valor)}</span>
        </div>
      </Html>
    </group>
  );
}

function Entrada({ pos, variable, valor }: { pos: Pt; variable: Var; valor: boolean }) {
  const led = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = led.current?.material as THREE.MeshStandardMaterial | undefined;
    if (m) m.emissiveIntensity = valor ? 2.2 : 0.04;
  });
  return (
    <group position={pos}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.24, 24]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh ref={led} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.15, 18, 14]} />
        <meshStandardMaterial color={valor ? AMBAR : "#334155"} emissive={AMBAR} emissiveIntensity={0.04} toneMapped={false} />
      </mesh>
      <Html position={[-0.7, 0.2, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1px solid ${valor ? AMBAR : "rgba(255,255,255,0.22)"}`, fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 12, whiteSpace: "nowrap" }}>
          <span style={{ color: "#fff" }}>{variable}</span>
          <span style={{ color: valor ? "#fde68a" : "#94a3b8" }}>{vf(valor)}</span>
        </div>
      </Html>
    </group>
  );
}

/* ── Tablero ──────────────────────────────────────────────────────────── */

const GEO_REJILLA = (() => {
  const pts: number[] = [];
  for (let x = -6.75; x <= 6.76; x += 0.5) pts.push(x, 0.005, -3.9, x, 0.005, 3.9);
  for (let z = -3.9; z <= 3.91; z += 0.5) pts.push(-6.75, 0.005, z, 6.75, 0.005, z);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
})();

function Tablero({ modoColor }: { modoColor: string }) {
  return (
    <group>
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[14, 0.3, 8.2]} />
        <meshStandardMaterial color="#0a1b27" roughness={0.75} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[13.6, 7.9]} />
        <meshStandardMaterial color="#0d2433" roughness={0.6} metalness={0.2} />
      </mesh>
      <lineSegments geometry={GEO_REJILLA}>
        <lineBasicMaterial color={modoColor} transparent opacity={0.1} />
      </lineSegments>
      {[-6.55, 6.55].map((x) =>
        [-3.7, 3.7].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.02, z]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.3} />
          </mesh>
        )),
      )}
    </group>
  );
}

/* ── Árbol de compuertas de una expresión ────────────────────────────── */

interface Nodo {
  e: Expr;
  tipo: Conectivo | "var";
  h: number;
  x: number;
  z: number;
  salida: Pt;
  entradas: Pt[];
  hijos: number[];
}

interface Layout {
  nodos: Nodo[];
  raiz: number;
  cables: { puntos: Pt[]; hijo: number }[];
  focoX: number;
  centro: number;
}

function hojas(e: Expr): number {
  if (e.k === "var") return 1;
  if (e.k === "not") return hojas(e.a);
  return hojas(e.a) + hojas(e.b);
}

function armar(e: Expr, o: { x0: number; dx: number; dz: number; esc: number; salidaVar: number; focoDx: number }): Layout {
  const nodos: Nodo[] = [];
  const n = hojas(e);
  let slot = 0;
  const rec = (x: Expr): number => {
    if (x.k === "var") {
      const z = (slot++ - (n - 1) / 2) * o.dz;
      nodos.push({ e: x, tipo: "var", h: 0, x: o.x0, z, salida: [o.x0 + o.salidaVar, Y_CABLE, z], entradas: [], hijos: [] });
      return nodos.length - 1;
    }
    const hijos = x.k === "not" ? [rec(x.a)] : [rec(x.a), rec(x.b)];
    const h = 1 + Math.max(...hijos.map((i) => nodos[i]!.h));
    const z = hijos.reduce((s, i) => s + nodos[i]!.z, 0) / hijos.length;
    const gx = o.x0 + h * o.dx;
    const tipo: Conectivo = x.k === "not" ? "neg" : x.op;
    const xe = gx + X_ENTRADA[tipo] * o.esc;
    const entradas: Pt[] =
      x.k === "not"
        ? [[xe, Y_CABLE, z]]
        : [
            [xe, Y_CABLE, z - 0.25 * o.esc],
            [gx + (tipo === "imp" ? -0.5 : X_ENTRADA[tipo]) * o.esc, Y_CABLE, z + 0.25 * o.esc],
          ];
    nodos.push({ e: x, tipo, h, x: gx, z, salida: [gx + X_SALIDA[tipo] * o.esc, Y_CABLE, z], entradas, hijos });
    return nodos.length - 1;
  };
  const raiz = rec(e);
  const cables: Layout["cables"] = [];
  nodos.forEach((nd) =>
    nd.hijos.forEach((hi, k) => {
      const a = nodos[hi]!.salida;
      const b = nd.entradas[k]!;
      if (Math.abs(a[2] - b[2]) < 0.01) cables.push({ puntos: [a, b], hijo: hi });
      else {
        const mx = Math.max(a[0] + 0.25, b[0] - 0.45 * o.esc);
        cables.push({ puntos: [a, [mx, Y_CABLE, a[2]], [mx, Y_CABLE, b[2]], b], hijo: hi });
      }
    }),
  );
  const r = nodos[raiz]!;
  const focoX = r.salida[0] + o.focoDx;
  const centro = (o.x0 - 0.6 + focoX + 0.6) / 2;
  return { nodos, raiz, cables, focoX, centro };
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. CIRCUITO DE CONECTIVOS
 * ════════════════════════════════════════════════════════════════════════ */

const LAYOUT_CIRCUITO = Object.fromEntries(
  (["neg", "and", "or", "imp", "bic"] as Conectivo[]).map((c) => [c, armar(CONECTIVO_DEF[c].expr, { x0: -3.5, dx: 3.4, dz: 3.0, esc: 1.55, salidaVar: 0.62, focoDx: 1.9 })]),
) as Record<Conectivo, Layout>;

function EscenaCircuito({ conectivo, p, q, revelado, pulso, onToggle, modoColor }: { conectivo: Conectivo; p: boolean; q: boolean; revelado: boolean; pulso: number; onToggle: (v: Var) => void; modoColor: string }) {
  const def = CONECTIVO_DEF[conectivo];
  const L = LAYOUT_CIRCUITO[conectivo];
  const raiz = L.nodos[L.raiz]!;
  const salida = evaluar(def.expr, p, q);
  const tSalida = revelado ? PASO : 0;
  return (
    <group>
      <Tablero modoColor={modoColor} />
      <group position={[-L.centro, 0, 0]}>
        {L.nodos.map((nd, i) =>
          nd.tipo === "var" ? (
            <Palanca key={i} pos={[nd.x - 0.15, 0, nd.z]} variable={(nd.e as { v: Var }).v} valor={(nd.e as { v: Var }).v === "p" ? p : q} frase={(nd.e as { v: Var }).v === "p" ? def.p.si : def.q!.si} onToggle={onToggle} />
          ) : (
            <Compuerta key={`${conectivo}-${i}`} tipo={nd.tipo} pos={[nd.x, 0, nd.z]} esc={1.55} valor={revelado ? salida : null} retardo={tSalida} pulso={pulso} nombre={def.compuerta} />
          ),
        )}
        {L.cables.map((c, i) => {
          const hijo = L.nodos[c.hijo]!;
          return <Cable key={`${conectivo}-${i}`} puntos={c.puntos} valor={evaluar(hijo.e, p, q)} retardo={0} pulso={pulso} grosor={0.06} />;
        })}
        <Cable key={`${conectivo}-sal`} puntos={[raiz.salida, [L.focoX - 0.35, Y_CABLE, raiz.z]]} valor={revelado ? salida : null} retardo={tSalida} pulso={pulso} grosor={0.06} />
        <Foco pos={[L.focoX, 0, raiz.z]} esc={1.35} valor={revelado ? salida : null} retardo={tSalida + VIAJE} pulso={pulso}>
          <div style={{ display: "grid", justifyItems: "center", gap: 4 }}>
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(4,10,22,0.88)",
                border: `1px solid ${revelado && salida ? AMBAR : "rgba(255,255,255,0.22)"}`,
                color: "#fff",
                fontSize: 14,
                fontWeight: 900,
                fontFamily: "ui-monospace, monospace",
                whiteSpace: "nowrap",
              }}
            >
              {texto(def.expr)} = <span key={`${pulso}-${String(revelado)}`} style={{ color: revelado ? (salida ? "#fde68a" : "#cbd5e1") : "#94a3b8", animation: revelado ? `lcAparece .35s ease-out ${tSalida + VIAJE}s both` : undefined }}>{revelado ? vf(salida) : "?"}</span>
            </div>
          </div>
        </Foco>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. TABLA DE VERDAD
 * ════════════════════════════════════════════════════════════════════════ */

const LAYOUT_TABLA = Object.fromEntries(EXPRESIONES.map((x) => [x.id, armar(x.expr, { x0: -4.3, dx: 2.45, dz: 1.2, esc: 1, salidaVar: 0.36, focoDx: 1.35 })])) as Record<string, Layout>;

function EscenaTabla({ expresionId, fila, probada, marcas, pulso, modoColor }: { expresionId: string; fila: number; probada: boolean; marcas: Record<string, boolean | null>; pulso: number; modoColor: string }) {
  const ex = EXPRESIONES.find((x) => x.id === expresionId) ?? EXPRESIONES[0]!;
  const L = LAYOUT_TABLA[ex.id]!;
  const [p, q] = FILAS[fila] ?? FILAS[0]!;
  const raiz = L.nodos[L.raiz]!;
  const salida = evaluar(ex.expr, p, q);
  const tRaiz = raiz.h * PASO;
  return (
    <group>
      <Tablero modoColor={modoColor} />
      <group position={[-L.centro, 0, 0]}>
        {L.nodos.map((nd, i) => {
          if (nd.tipo === "var") {
            const v = (nd.e as { v: Var }).v;
            return <Entrada key={`${ex.id}-${i}`} pos={[nd.x, 0, nd.z]} variable={v} valor={v === "p" ? p : q} />;
          }
          const val = evaluar(nd.e, p, q);
          const tu = marcas[texto(nd.e)];
          return (
            <Compuerta
              key={`${ex.id}-${i}`}
              tipo={nd.tipo}
              pos={[nd.x, 0, nd.z]}
              esc={1}
              valor={probada ? val : null}
              retardo={nd.h * PASO}
              pulso={pulso}
              error={probada && tu !== null && tu !== undefined && tu !== val ? tu : null}
            />
          );
        })}
        {L.cables.map((c, i) => {
          const hijo = L.nodos[c.hijo]!;
          const visible = hijo.tipo === "var" || probada;
          return <Cable key={`${ex.id}-${i}`} puntos={c.puntos} valor={visible ? evaluar(hijo.e, p, q) : null} retardo={hijo.h * PASO} pulso={pulso} />;
        })}
        <Cable key={`${ex.id}-sal`} puntos={[raiz.salida, [L.focoX - 0.25, Y_CABLE, raiz.z]]} valor={probada ? salida : null} retardo={tRaiz} pulso={pulso} />
        <Foco pos={[L.focoX, 0, raiz.z]} esc={0.95} valor={probada ? salida : null} retardo={tRaiz + VIAJE} pulso={pulso} />
      </group>
      <Etiqueta pos={[0, 0.1, 3.55]} df={10} fs={13} col={`${modoColor}aa`}>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{texto(ex.expr)}</span>
        <span style={{ color: "rgba(255,255,255,0.45)" }}>·</span>
        fila {claveFila(p, q)}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. CUATRO MUNDOS POSIBLES
 * ════════════════════════════════════════════════════════════════════════ */

const X_MUNDOS = [-4.65, -1.55, 1.55, 4.65];
const T_P1 = 0.4;
const T_P2 = 1.5;
const T_C = 2.6;

function Cristal({ pos, valor, letra }: { pos: Pt; valor: boolean; letra: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.8 + pos[0];
      ref.current.position.y = 0.95 + Math.sin(clock.elapsedTime * 1.6 + pos[0] * 2) * 0.05;
    }
  });
  return (
    <group position={[pos[0], 0, pos[2]]}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 0.5, 10]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh ref={ref} position={[0, 0.95, 0]} castShadow>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color={valor ? AMBAR : "#334155"} emissive={valor ? AMBAR : "#000000"} emissiveIntensity={valor ? 1.1 : 0} metalness={0.2} roughness={0.25} flatShading />
      </mesh>
      <Html position={[0, 1.42, 0]} center distanceFactor={10} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 900, color: valor ? "#fde68a" : "#94a3b8", textShadow: "0 1px 3px #000" }}>
          {letra}={vf(valor)}
        </div>
      </Html>
    </group>
  );
}

function FocoMundo({ pos, valor, retardo, pulso, col, etq }: { pos: Pt; valor: boolean | null; retardo: number; pulso: number; col: string; etq: string }) {
  const reloj = useReloj(pulso);
  const bulbo = useRef<THREE.Mesh>(null);
  const b = useRef(0);
  const cOn = useMemo(() => new THREE.Color(col), [col]);
  useFrame((_, dt) => {
    const on = valor === true && reloj.current >= retardo;
    b.current += ((on ? 1 : 0) - b.current) * suave(dt, 0.1);
    const m = bulbo.current?.material as THREE.MeshStandardMaterial | undefined;
    if (m) {
      m.emissive.lerpColors(C_NEGRO, cOn, b.current);
      m.emissiveIntensity = 1.6;
      m.color.lerpColors(valor === null ? C_UNK : C_OFF, cOn, b.current);
    }
  });
  return (
    <group position={pos}>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.18, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh ref={bulbo}>
        <sphereGeometry args={[0.24, 24, 18]} />
        <meshStandardMaterial color="#233447" roughness={0.2} toneMapped={false} />
      </mesh>
      <Html position={[0, -0.62, 0]} center distanceFactor={10} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, fontWeight: 900, color: "#e2e8f0", whiteSpace: "nowrap", textShadow: "0 1px 3px #000" }}>{etq}</div>
      </Html>
    </group>
  );
}

function Mundo({
  i,
  modoColor,
  situacionId,
  sub,
  forma,
  formaRevelada,
  argumento,
  estado,
  pulso,
}: {
  i: number;
  modoColor: string;
  situacionId: string;
  sub: "formas" | "argumentos";
  forma: Forma;
  formaRevelada: boolean;
  argumento: Argumento;
  estado: EstadoMundo | null;
  pulso: number;
}) {
  const sit = SITUACIONES.find((s) => s.id === situacionId) ?? SITUACIONES[0]!;
  const [p, q] = FILAS[i]!;
  const clave = claveFila(p, q);
  const x = X_MUNDOS[i]!;
  const plataforma = useRef<THREE.Group>(null);
  const haz = useRef<THREE.Mesh>(null);
  const reloj = useReloj(pulso);
  const y = useRef(0);
  const cHaz = estado === "contraejemplo" ? NO : OK;
  useFrame(({ clock }, dt) => {
    const t = reloj.current;
    const hunde = (estado === "descartadoP1" && t >= T_P1) || (estado === "descartadoP2" && t >= T_P2);
    y.current += ((hunde ? -0.75 : 0) - y.current) * suave(dt, 0.06);
    if (plataforma.current) plataforma.current.position.y = y.current;
    if (haz.current) {
      const on = (estado === "confirma" || estado === "contraejemplo") && t >= T_C;
      const s = Math.min(1, Math.max(0, (t - T_C) / 0.5));
      haz.current.visible = on;
      haz.current.scale.set(1, Math.max(0.001, s), 1);
      haz.current.position.y = 0.2 + (3.2 * s) / 2;
      (haz.current.material as THREE.MeshBasicMaterial).opacity = (estado === "contraejemplo" ? 0.22 + 0.1 * Math.sin(clock.elapsedTime * 7) : 0.16) * s;
    }
  });

  const orig = evaluar(FORMA_DEF.original.expr, p, q);
  const otra = evaluar(FORMA_DEF[forma].expr, p, q);
  const arg = ARGUMENTO_DEF[argumento];
  const p1 = evaluar(bin("imp", P, Q), p, q);
  const p2 = evaluar(arg.premisa2, p, q);
  const c = evaluar(arg.conclusion, p, q);
  const ejemplo = sit.ejemplos[clave];
  const probado = estado !== null;

  const loseta = (etq: string, val: boolean, t: number, activa: boolean) => (
    <span
      key={`${etq}-${pulso}`}
      style={{
        padding: "2px 6px",
        borderRadius: 6,
        fontFamily: "ui-monospace, monospace",
        fontSize: 10.5,
        fontWeight: 900,
        border: `1px solid ${!probado || !activa ? "rgba(255,255,255,0.18)" : val ? OK : NO}`,
        background: !probado || !activa ? "rgba(4,10,22,0.7)" : val ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.22)",
        color: !probado || !activa ? "#64748b" : "#fff",
        transition: `all .3s ease ${probado ? t : 0}s`,
      }}
    >
      {etq} {probado && activa ? vf(val) : "·"}
    </span>
  );

  let insignia: ReactNode = null;
  if (sub === "argumentos" && estado) {
    const def =
      estado === "descartadoP1"
        ? { txt: "Descartado: P1 es F", col: "#94a3b8", t: T_P1 }
        : estado === "descartadoP2"
          ? { txt: "Descartado: P2 es F", col: "#94a3b8", t: T_P2 }
          : estado === "confirma"
            ? { txt: "Premisas V · conclusión V", col: OK, t: T_C }
            : { txt: "¡Contraejemplo!", col: NO, t: T_C };
    insignia = (
      <div key={`${pulso}-${estado}`} style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(4,10,22,0.9)", border: `1.5px solid ${def.col}`, color: "#fff", fontSize: 11.5, fontWeight: 900, whiteSpace: "nowrap", animation: `lcAparece .35s ease-out ${def.t}s both` }}>
        {def.txt}
      </div>
    );
  }

  return (
    <group position={[x, 0, 0]}>
      <group ref={plataforma}>
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.3, 1.4, 0.24, 6]} />
          <meshStandardMaterial color="#13263a" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[1.22, 1.22, 0.03, 6]} />
          <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.25} transparent opacity={0.35} />
        </mesh>
        <Cristal pos={[-0.5, 0, -0.35]} valor={p} letra="p" />
        <Cristal pos={[0.5, 0, -0.35]} valor={q} letra="q" />
        {sub === "formas" && (
          <>
            <FocoMundo pos={[-0.42, 2.75, -0.2]} valor={orig} retardo={0} pulso={0} col="#38bdf8" etq="p → q" />
            <FocoMundo pos={[0.42, 2.75, -0.2]} valor={formaRevelada ? otra : null} retardo={i * 0.35} pulso={pulso} col={modoColor} etq={FORMA_DEF[forma].simbolo} />
            {formaRevelada && (
              <Html position={[0, 3.45, -0.2]} center distanceFactor={10} zIndexRange={[19, 0]} style={{ pointerEvents: "none" }}>
                <div key={`${pulso}-${forma}`} style={{ width: 30, height: 30, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,10,22,0.9)", border: `2px solid ${orig === otra ? OK : NO}`, color: orig === otra ? OK : NO, fontSize: 18, fontWeight: 900, animation: `lcAparece .35s ease-out ${i * 0.35 + 0.2}s both` }}>
                  {orig === otra ? "=" : "≠"}
                </div>
              </Html>
            )}
          </>
        )}
      </group>
        {sub === "argumentos" && (
          <Html position={[0, 2.55, -0.2]} center distanceFactor={10} zIndexRange={[19, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
              {insignia}
              <div style={{ display: "flex", gap: 4 }}>
                {loseta("P1", p1, T_P1, true)}
                {loseta("P2", p2, T_P2, p1)}
                {loseta("C", c, T_C, p1 && p2)}
              </div>
            </div>
          </Html>
        )}
        <Html position={[0, 0.3, 1.45]} center distanceFactor={10} zIndexRange={[17, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 168, padding: "7px 9px", borderRadius: 11, opacity: estado === "descartadoP1" || estado === "descartadoP2" ? 0.5 : 1, transition: `opacity .5s ease ${estado === "descartadoP1" ? T_P1 : T_P2}s`, background: "rgba(4,10,22,0.9)", border: `1px solid ${estado === "contraejemplo" ? NO : "rgba(255,255,255,0.18)"}`, color: "#fff", boxShadow: "0 8px 20px -10px #000" }}>
            <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.12em", color: modoColor, marginBottom: 4 }}>MUNDO {clave}</div>
            {(
              [
                ["p", p, p ? sit.p.si : sit.p.no],
                ["q", q, q ? sit.q.si : sit.q.no],
              ] as const
            ).map(([l, v, frase]) => (
              <div key={l} style={{ display: "flex", gap: 6, alignItems: "baseline", fontSize: 11, lineHeight: 1.35 }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900, color: v ? "#fde68a" : "#94a3b8", flexShrink: 0 }}>
                  {l}={vf(v)}
                </span>
                <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{frase}</span>
              </div>
            ))}
            <div style={{ fontSize: 10.5, color: ejemplo ? "#cbd5e1" : "#fca5a5", marginTop: 4, fontWeight: 700 }}>{ejemplo ? `Ej.: ${ejemplo}` : "No existe ningún caso"}</div>
          </div>
        </Html>
      <mesh ref={haz} visible={false}>
        <cylinderGeometry args={[0.95, 0.95, 3.2, 32, 1, true]} />
        <meshBasicMaterial color={cHaz} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function EscenaMundos(p: { modoColor: string; situacionId: string; sub: "formas" | "argumentos"; forma: Forma; formaRevelada: boolean; argumento: Argumento; argProbado: boolean; pulso: number }) {
  const estados = p.sub === "argumentos" && p.argProbado ? probarArgumento(p.argumento) : null;
  const arg = ARGUMENTO_DEF[p.argumento];
  return (
    <group position={[0, -0.9, 0]}>
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <cylinderGeometry args={[8.2, 8.2, 0.12, 64]} />
        <meshStandardMaterial color="#0c1a2b" roughness={0.9} />
      </mesh>
      {X_MUNDOS.map((_, i) => (
        <Mundo
          key={i}
          i={i}
          modoColor={p.modoColor}
          situacionId={p.situacionId}
          sub={p.sub}
          forma={p.forma}
          formaRevelada={p.formaRevelada}
          argumento={p.argumento}
          estado={estados ? estados[i]! : null}
          pulso={p.pulso}
        />
      ))}
      <Etiqueta pos={[0, 4.35, -0.6]} df={10} fs={15} col={`${p.modoColor}aa`}>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{p.sub === "formas" ? `p → q   vs   ${FORMA_DEF[p.forma].simbolo}` : `P1: p → q   ·   P2: ${texto(arg.premisa2)}   ∴ C: ${texto(arg.conclusion)}`}</span>
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function LogicaCompuertasScene(p: LogicaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "circuito") return { pos: [0, 6.6, 7.4], target: [0, 0.2, 0.4] };
    if (vista === "tabla") return { pos: [0, 8.4, 7.6], target: [0, -0.2, 0.5] };
    return { pos: [0, 4.6, 10.8], target: [0, 0.8, 0] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 18, 40]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 9, 6]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "circuito" && <EscenaCircuito conectivo={p.conectivo} p={p.p} q={p.q} revelado={p.revelado} pulso={p.pulso} onToggle={p.onToggle} modoColor={modoColor} />}
      {vista === "tabla" && <EscenaTabla expresionId={p.expresionId} fila={p.fila} probada={p.probada} marcas={p.marcas} pulso={p.pulsoTabla} modoColor={modoColor} />}
      {vista === "razonar" && (
        <EscenaMundos modoColor={modoColor} situacionId={p.situacionId} sub={p.sub} forma={p.forma} formaRevelada={p.formaRevelada} argumento={p.argumento} argProbado={p.argProbado} pulso={p.pulsoRazonar} />
      )}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={20} maxPolarAngle={Math.PI * 0.46} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.45} luminanceThreshold={0.6} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
