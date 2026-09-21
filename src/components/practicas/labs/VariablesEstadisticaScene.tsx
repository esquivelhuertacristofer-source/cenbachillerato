"use client";

/**
 * Escena 3D del laboratorio "Estadística: variables, población y muestra"
 * (PM-VI-P01). Tres vistas:
 *
 *  - variables: una máquina clasificadora. La tarjeta de la variable baja por
 *    tubos que se bifurcan (¿categorías o cantidades? → ¿con orden? / ¿se
 *    cuenta o se mide?) hasta el contenedor elegido; si el tipo no es el
 *    correcto, se pone roja y regresa.
 *  - poblacion: los 1 500 estudiantes del ejemplo del quiz A4 (InstancedMesh).
 *    El censo los recorre a todos; la encuesta levanta solo a la muestra.
 *  - inferencia: la tabla de frecuencias de la muestra hecha barras, con el
 *    intervalo que estima a toda la escuela y, al revelarla, la población.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo, no por
 * cuadro. NO se usa <Text> de drei (cuelga el chunk con Turbopack): el texto
 * del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type TipoVar,
  type VariableDef,
  type Resumen,
  TIPOS,
  TIPOS_DEF,
  N_POBLACION,
  HERMANOS,
  categoriaDe,
  CATEGORIAS,
  COLORES_CAT,
  PARAMETRO,
  margen95,
  num,
} from "./variables-estadistica-data";

export interface Envio {
  destino: TipoVar;
  ok: boolean;
  nonce: number;
}

export interface VariablesSceneProps {
  modo: Modo;
  tarjeta: VariableDef | null;
  envio: Envio | null;
  conteos: number[];
  censoNonce: number;
  censado: boolean;
  seleccion: Uint8Array;
  resumen: Resumen | null;
  revelar: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);

function Etiqueta({ pos, children, df = 10, col, izq }: { pos: Pt; children: ReactNode; df?: number; col?: string; izq?: boolean }) {
  return (
    <Html position={pos} center={!izq} distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.84)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: 12,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
          transform: izq ? "translateY(-50%)" : undefined,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

function Letra({ pos, children, df = 8, col = "#94a3b8", size = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; size?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: size, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>{children}</div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. MÁQUINA CLASIFICADORA
 * ════════════════════════════════════════════════════════════════════════ */

const INICIO: Pt = [0, 3.05, 0];
const J0: Pt = [0, 2.0, 0];
const JL: Pt = [-2.2, 0.85, 0];
const JR: Pt = [2.2, 0.85, 0];
const X_CONT: Record<TipoVar, number> = { nominal: -3.3, ordinal: -1.1, discreta: 1.1, continua: 3.3 };
const Y_BOCA = -0.3;
const Y_FONDO = -1.35;
const T_IDA = 1.3;
const T_SACUDE = 0.5;
const T_VUELTA = 0.8;

function ruta(t: TipoVar): THREE.Vector3[] {
  const lado = t === "nominal" || t === "ordinal" ? JL : JR;
  return [INICIO, J0, lado, [X_CONT[t], Y_BOCA + 0.2, 0], [X_CONT[t], Y_FONDO + 0.45, 0]].map((p) => new THREE.Vector3(...(p as Pt)));
}

/** Punto a una fracción u (0–1) del recorrido de una polilínea, por longitud. */
function sobreRuta(pts: THREE.Vector3[], u: number, out: THREE.Vector3) {
  const largos = pts.slice(1).map((p, i) => p.distanceTo(pts[i]!));
  const total = largos.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, u)) * total;
  for (let i = 0; i < largos.length; i++) {
    if (d <= largos[i]! || i === largos.length - 1) {
      return out.copy(pts[i]!).lerp(pts[i + 1]!, largos[i]! ? Math.min(1, d / largos[i]!) : 1);
    }
    d -= largos[i]!;
  }
  return out.copy(pts[pts.length - 1]!);
}

function Tubo({ desde, hasta, color }: { desde: Pt; hasta: Pt; color: string }) {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(...desde), new THREE.Vector3(...hasta)), 1, 0.075, 12, false), [desde, hasta]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.55} roughness={0.2} />
    </mesh>
  );
}

function Contenedor({ tipo, cuenta, activo }: { tipo: TipoVar; cuenta: number; activo: boolean }) {
  const d = TIPOS_DEF[tipo];
  const W = 1.5;
  const H = Y_BOCA - Y_FONDO;
  const D = 1.0;
  const paredes: { p: Pt; s: Pt }[] = [
    { p: [0, -H / 2, 0], s: [W, 0.05, D] },
    { p: [-W / 2, 0, 0], s: [0.05, H, D] },
    { p: [W / 2, 0, 0], s: [0.05, H, D] },
    { p: [0, 0, -D / 2], s: [W, H, 0.05] },
    { p: [0, 0, D / 2], s: [W, H, 0.05] },
  ];
  return (
    <group position={[X_CONT[tipo], (Y_BOCA + Y_FONDO) / 2, 0]}>
      {paredes.map((w, i) => (
        <mesh key={i} position={w.p} castShadow receiveShadow>
          <boxGeometry args={w.s} />
          <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={activo ? 0.55 : 0.12} transparent opacity={i === 4 ? 0.28 : 0.85} roughness={0.4} />
        </mesh>
      ))}
      {Array.from({ length: Math.min(cuenta, 12) }, (_, k) => (
        <mesh key={k} position={[-0.42 + (k % 4) * 0.28, -H / 2 + 0.16 + Math.floor(k / 8) * 0.29, -0.2 + (Math.floor(k / 4) % 2) * 0.36]} castShadow>
          <boxGeometry args={[0.24, 0.24, 0.24]} />
          <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0.3} roughness={0.35} />
        </mesh>
      ))}
      <Etiqueta pos={[0, -H / 2 - 0.42, 0.55]} col={`${d.color}aa`} df={10}>
        <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} />
        {d.etq}
        <span style={{ color: "#94a3b8" }}>· {cuenta}</span>
      </Etiqueta>
    </group>
  );
}

function Tarjeta({ tarjeta, envio }: { tarjeta: VariableDef | null; envio: Envio | null }) {
  const grupo = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const t0 = useRef<number | null>(null);
  const visto = useRef<number | null>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const rutas = useMemo(() => Object.fromEntries(TIPOS.map((t) => [t, ruta(t)])) as Record<TipoVar, THREE.Vector3[]>, []);
  const cBase = useMemo(() => new THREE.Color("#e2e8f0"), []);
  const cOk = useMemo(() => new THREE.Color("#34d399"), []);
  const cMal = useMemo(() => new THREE.Color("#f87171"), []);

  useFrame(({ clock }, dt) => {
    const g = grupo.current;
    const m = mat.current;
    if (!g || !m) return;
    const ahora = clock.elapsedTime;
    if (!envio) {
      t0.current = null;
      visto.current = null;
      g.position.set(...INICIO);
      g.position.y += Math.sin(ahora * 2) * 0.05;
      g.rotation.y += dt * 0.6;
      m.color.lerp(cBase, suave(dt, 0.2));
      m.emissive.set("#000");
      return;
    }
    if (visto.current !== envio.nonce) {
      visto.current = envio.nonce;
      t0.current = ahora;
    }
    const t = ahora - (t0.current ?? ahora);
    const pts = rutas[envio.destino];
    g.rotation.y += dt * 1.5;
    if (t <= T_IDA) {
      sobreRuta(pts, t / T_IDA, tmp);
      g.position.copy(tmp);
      m.color.lerp(cBase, suave(dt, 0.2));
    } else if (envio.ok) {
      sobreRuta(pts, 1, tmp);
      g.position.copy(tmp);
      m.color.lerp(cOk, suave(dt, 0.25));
      m.emissive.copy(cOk).multiplyScalar(0.4);
    } else if (t <= T_IDA + T_SACUDE) {
      sobreRuta(pts, 1, tmp);
      g.position.copy(tmp);
      g.position.x += Math.sin(t * 60) * 0.06;
      m.color.lerp(cMal, suave(dt, 0.35));
      m.emissive.copy(cMal).multiplyScalar(0.45);
    } else {
      const u = 1 - Math.min(1, (t - T_IDA - T_SACUDE) / T_VUELTA);
      sobreRuta(pts, u, tmp);
      g.position.copy(tmp);
    }
  });

  return (
    <group ref={grupo} position={INICIO}>
      <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.08} smoothness={3} castShadow>
        <meshStandardMaterial ref={mat} color="#e2e8f0" roughness={0.35} metalness={0.05} />
      </RoundedBox>
      {tarjeta && !envio && (
        <Html position={[0.45, 0.1, 0]} distanceFactor={9} zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ transform: "translateY(-50%)", padding: "8px 13px", borderRadius: 12, background: "rgba(4,10,22,0.9)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", whiteSpace: "nowrap", boxShadow: "0 8px 22px -8px #000" }}>
            <div style={{ fontSize: 15, fontWeight: 900 }}>{tarjeta.nombre}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94a3b8", marginTop: 2 }}>{tarjeta.ejemplos}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

const TUBOS: [Pt, Pt][] = [
  [INICIO, J0],
  [J0, JL],
  [J0, JR],
  ...TIPOS.map((t) => [t === "nominal" || t === "ordinal" ? JL : JR, [X_CONT[t], Y_BOCA + 0.05, 0]] as [Pt, Pt]),
];

function EscenaMaquina({ tarjeta, envio, conteos, modoColor }: { tarjeta: VariableDef | null; envio: Envio | null; conteos: number[]; modoColor: string }) {
  return (
    <group position={[0, -0.6, 0]}>
      <mesh position={[0, Y_FONDO - 0.1, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.12, 2.2]} />
        <meshStandardMaterial color="#111c2e" roughness={0.85} />
      </mesh>
      {TUBOS.map(([a, b], i) => (
        <Tubo key={i} desde={a} hasta={b} color={modoColor} />
      ))}
      {[J0, JL, JR].map((j, i) => (
        <mesh key={i} position={j}>
          <sphereGeometry args={[0.16, 24, 16]} />
          <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.6} />
        </mesh>
      ))}
      <Etiqueta pos={[J0[0] + 0.3, J0[1], 0]} col={`${modoColor}aa`} df={10} izq>
        ¿Categorías o cantidades?
      </Etiqueta>
      <Etiqueta pos={[JL[0], JL[1] + 0.42, 0]} df={10}>
        Cualitativa · ¿tiene orden?
      </Etiqueta>
      <Etiqueta pos={[JR[0], JR[1] + 0.42, 0]} df={10}>
        Cuantitativa · ¿se cuenta o se mide?
      </Etiqueta>
      {TIPOS.map((t, i) => (
        <Contenedor key={t} tipo={t} cuenta={conteos[i] ?? 0} activo={envio?.destino === t} />
      ))}
      <Tarjeta tarjeta={tarjeta} envio={envio} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. POBLACIÓN Y MUESTRA
 * ════════════════════════════════════════════════════════════════════════ */

const COLS = 50;
const ROWS = N_POBLACION / COLS;
const SP = 0.17;
const T_CENSO = 3.8;
const COL_SIN = new THREE.Color("#334155");
const COL_APAGADO = new THREE.Color("#141d2e");
const CATS_C = COLORES_CAT.map((c) => new THREE.Color(c));

function Estudiantes({ censoNonce, censado, seleccion }: { censoNonce: number; censado: boolean; seleccion: Uint8Array }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const escaner = useRef<THREE.Mesh>(null);
  const t0 = useRef<number | null>(null);
  const visto = useRef(censoNonce);
  const altura = useRef<Float32Array | null>(null);
  const quieto = useRef(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);
  const hayMuestra = useMemo(() => seleccion.some((v) => v === 1), [seleccion]);

  useEffect(() => {
    quieto.current = false;
  }, [seleccion, censado]);

  useFrame(({ clock }, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const ahora = clock.elapsedTime;
    if (visto.current !== censoNonce) {
      visto.current = censoNonce;
      t0.current = ahora;
      quieto.current = false;
    }
    const barriendo = t0.current !== null && ahora - t0.current < T_CENSO;
    const avance = censado ? 1 : t0.current !== null ? Math.min(1, (ahora - t0.current) / T_CENSO) : 0;
    if (escaner.current) {
      escaner.current.visible = barriendo;
      escaner.current.position.z = -((ROWS - 1) * SP) / 2 + avance * ROWS * SP;
    }
    if (quieto.current && !barriendo) return;

    if (!altura.current) altura.current = new Float32Array(N_POBLACION).fill(1);
    const h = altura.current;
    const k = suave(dt, 0.15);
    let movio = barriendo;
    for (let i = 0; i < N_POBLACION; i++) {
      const fila = Math.floor(i / COLS);
      const medido = (fila + 1) / ROWS <= avance + 1e-9;
      const sel = seleccion[i] === 1;
      const objetivo = hayMuestra && sel ? 2.1 : 1;
      h[i] = h[i]! + (objetivo - h[i]!) * k;
      if (Math.abs(objetivo - h[i]!) > 0.01) movio = true;
      dummy.position.set((i % COLS) * SP - ((COLS - 1) * SP) / 2, 0.08 * h[i]!, fila * SP - ((ROWS - 1) * SP) / 2);
      dummy.scale.set(1, h[i]!, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const cat = CATS_C[categoriaDe(HERMANOS[i]!)]!;
      if (hayMuestra) {
        if (sel) c.copy(cat);
        else c.copy(medido ? cat : COL_SIN).lerp(COL_APAGADO, 0.75);
      } else c.copy(medido ? cat : COL_SIN);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (!movio) quieto.current = true;
  });

  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, N_POBLACION]} castShadow>
        <cylinderGeometry args={[0.05, 0.062, 0.16, 8]} />
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      <mesh ref={escaner} position={[0, 0.25, 0]} visible={false}>
        <boxGeometry args={[COLS * SP + 0.4, 0.5, 0.04]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </>
  );
}

function EscenaPoblacion({ censoNonce, censado, seleccion, modoColor }: { censoNonce: number; censado: boolean; seleccion: Uint8Array; modoColor: string }) {
  const n = useMemo(() => seleccion.reduce((s, v) => s + v, 0), [seleccion]);
  return (
    <group position={[0, -0.9, 0]}>
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[COLS * SP + 0.6, 0.08, ROWS * SP + 0.6]} />
        <meshStandardMaterial color="#0f1a2c" roughness={0.9} />
      </mesh>
      <Estudiantes censoNonce={censoNonce} censado={censado} seleccion={seleccion} />
      <Etiqueta pos={[0, 0.5, -((ROWS * SP) / 2) - 0.45]} col={`${modoColor}aa`} df={10}>
        <i className="fa-solid fa-people-group" style={{ color: modoColor }} />
        Población: {num(N_POBLACION)} estudiantes
        {n > 0 && <span style={{ color: "#fde68a" }}>· muestra de {num(n)}</span>}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. BARRAS DE FRECUENCIA E INTERVALOS
 * ════════════════════════════════════════════════════════════════════════ */

const HB = 3.6;
const P_MAX = 0.5;
const XB = (k: number) => (k - 2) * 1.55;
const yDe = (p: number) => (Math.min(P_MAX, Math.max(0, p)) / P_MAX) * HB;

function BarraFrecuencia({ k, p, me, color, n, conteo }: { k: number; p: number; me: number; color: string; n: number; conteo: number }) {
  const barra = useRef<THREE.Mesh>(null);
  const bigote = useRef<THREE.Group>(null);
  const tope = useRef<THREE.Group>(null);
  const v = useRef(0);
  const m = useRef(0);
  useFrame((_, dt) => {
    v.current += (p - v.current) * suave(dt, 0.12);
    m.current += (me - m.current) * suave(dt, 0.12);
    const h = Math.max(0.004, yDe(v.current));
    if (barra.current) {
      barra.current.scale.y = h;
      barra.current.position.y = h / 2;
    }
    if (bigote.current) {
      const lo = yDe(v.current - m.current);
      const hi = yDe(v.current + m.current);
      const [linea, a, b] = bigote.current.children;
      if (linea) {
        linea.scale.y = Math.max(0.004, hi - lo);
        linea.position.y = (lo + hi) / 2;
      }
      if (a) a.position.y = lo;
      if (b) b.position.y = hi;
    }
    if (tope.current) tope.current.position.y = yDe(v.current + m.current) + 0.42;
  });
  return (
    <group position={[XB(k), 0, 0]}>
      <mesh ref={barra} castShadow>
        <boxGeometry args={[0.9, 1, 0.9]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.4} />
      </mesh>
      <group ref={bigote} position={[0, 0, 0.5]}>
        <mesh>
          <boxGeometry args={[0.05, 1, 0.05]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.34, 0.04, 0.05]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.34, 0.04, 0.05]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      </group>
      <group ref={tope}>
        {n > 0 && (
          <Etiqueta pos={[0, 0, 0.5]} col={`${color}aa`} df={10}>
            {conteo} · {num(p * 100, 1)} %
          </Etiqueta>
        )}
      </group>
    </group>
  );
}

function EscenaBarras({ resumen, revelar, modoColor }: { resumen: Resumen | null; revelar: boolean; modoColor: string }) {
  const n = resumen?.n ?? 0;
  return (
    <group position={[0, -1.7, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[8.6, 0.12, 2.0]} />
        <meshStandardMaterial color="#111c2e" roughness={0.85} />
      </mesh>
      {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((p) => (
        <group key={p}>
          <mesh position={[0, yDe(p), -0.62]}>
            <boxGeometry args={[9.0, 0.008, 0.008]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
          <Letra pos={[-4.85, yDe(p), -0.62]} size={11}>
            {Math.round(p * 100)} %
          </Letra>
        </group>
      ))}
      {CATEGORIAS.map((cat, k) => {
        const p = resumen?.relativas[k] ?? 0;
        return (
          <group key={cat}>
            <BarraFrecuencia k={k} p={p} me={n ? margen95(p, n) : 0} color={COLORES_CAT[k]!} n={n} conteo={resumen?.conteos[k] ?? 0} />
            <Letra pos={[XB(k), -0.34, 0.9]} size={12} col="#e2e8f0">
              {cat} {cat === "1" ? "hermano" : "hermanos"}
            </Letra>
            {revelar && (
              <group position={[XB(k), yDe(PARAMETRO.relativas[k]!), 0]}>
                <mesh>
                  <boxGeometry args={[1.12, 0.05, 1.12]} />
                  <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.9} transparent opacity={0.9} />
                </mesh>
                <Letra pos={[0.78, 0, 0.6]} size={11} col="#fde68a">
                  {num(PARAMETRO.relativas[k]! * 100, 0)} %
                </Letra>
              </group>
            )}
          </group>
        );
      })}
      {n === 0 && (
        <Etiqueta pos={[0, 1.6, 0]} col={`${modoColor}aa`} df={10}>
          Toma una muestra para construir la tabla
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

const CAMARAS: Record<Modo, { pos: Pt; target: Pt }> = {
  variables: { pos: [0, 1.2, 10.2], target: [0, 0.2, 0] },
  poblacion: { pos: [0, 5.6, 6.6], target: [0, -0.9, 0] },
  inferencia: { pos: [0.6, 1.6, 10], target: [-0.2, 0, 0] },
};

export default function VariablesEstadisticaScene(p: VariablesSceneProps) {
  const { modo, modoColor, resetNonce } = p;
  const cam = CAMARAS[modo];
  return (
    <Canvas key={`${modo}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 18, 40]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 9, 6]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 2, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {modo === "variables" && <EscenaMaquina tarjeta={p.tarjeta} envio={p.envio} conteos={p.conteos} modoColor={modoColor} />}
      {modo === "poblacion" && <EscenaPoblacion censoNonce={p.censoNonce} censado={p.censado} seleccion={p.seleccion} modoColor={modoColor} />}
      {modo === "inferencia" && <EscenaBarras resumen={p.resumen} revelar={p.revelar} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={20} maxPolarAngle={Math.PI * 0.49} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.6} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
