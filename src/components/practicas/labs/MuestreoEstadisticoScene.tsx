"use client";

/**
 * Escena 3D del laboratorio "Muestreo: cómo elegir una muestra
 * representativa" (PM-VI-P07). Dos vistas:
 *
 *  - patio (modos «técnicas» y «sesgo»): los 800 estudiantes de la escuela del
 *    ejercicio A2, por grado y por salón (InstancedMesh). Quienes quedan en la
 *    muestra se levantan: amarillos si usan redes más de 3 h al día, blancos si
 *    no; el resto se apaga con el color de su grado.
 *  - histograma (modo «error»): cada muestra repetida cae como una ficha en la
 *    columna de su estimación; la línea dorada es el valor real de la escuela.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo, no por
 * cuadro. NO se usa <Text> de drei (cuelga el chunk con Turbopack): el texto
 * del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type Metodo, GRADOS, SALONES, ESTUDIANTES, N_POBLACION, P_REAL, margenError } from "./muestreo-estadistico-data";
import { Escenario } from "./_escenario";

export interface MuestreoSceneProps {
  modo: Modo;
  metodo: Metodo;
  /** 1 si el estudiante está en la muestra actual. */
  seleccion: Uint8Array;
  salonesElegidos: number[];
  /** Cuántos de cada grado tiene la muestra actual. */
  porGrado: number[];
  estimaciones: number[];
  n: number;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const COL_SI = "#fde047";
const COL_NO = "#f1f5f9";
const COL_APAGADO = new THREE.Color("#0b1220");

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
 * PATIO
 * ════════════════════════════════════════════════════════════════════════ */

const SP = 0.155;
const GAP_SALON = 0.26;
const GAP_GRADO = 0.62;

interface Rect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

function acomodarPatio() {
  const pos = new Float32Array(N_POBLACION * 3);
  const rectSalon: Rect[] = [];
  const centroGrado: { x: number; zAtras: number; zFrente: number }[] = [];
  const anchoSalon = (tam: number) => Math.ceil(Math.sqrt(tam)) * SP;
  const anchosGrado = GRADOS.map((_, gi) => {
    const max = Math.max(...SALONES.filter((s) => s.grado === gi).map((s) => anchoSalon(s.tamano)));
    return { max, total: 2 * max + GAP_SALON };
  });
  const anchoTotal = anchosGrado.reduce((a, b) => a + b.total, 0) + GAP_GRADO * (GRADOS.length - 1);
  let x = -anchoTotal / 2;
  const zTopes: number[] = [];

  GRADOS.forEach((_, gi) => {
    const sal = SALONES.filter((s) => s.grado === gi);
    const { max, total } = anchosGrado[gi]!;
    const filas = Math.ceil(sal.length / 2);
    const cols = Math.ceil(Math.sqrt(sal[0]!.tamano));
    const filasAsiento = Math.ceil(sal[0]!.tamano / cols);
    const altoSalon = filasAsiento * SP;
    const altoGrado = filas * altoSalon + (filas - 1) * GAP_SALON;
    const z0 = -altoGrado / 2;
    zTopes.push(altoGrado);
    sal.forEach((s, k) => {
      const cx = x + (k % 2) * (max + GAP_SALON);
      const cz = z0 + Math.floor(k / 2) * (altoSalon + GAP_SALON);
      rectSalon[s.id] = { x0: cx - SP * 0.4, z0: cz - SP * 0.4, x1: cx + cols * SP - SP * 0.6, z1: cz + altoSalon - SP * 0.6 };
      for (let a = 0; a < s.tamano; a++) {
        const i = s.inicio + a;
        pos[i * 3] = cx + (a % cols) * SP;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = cz + Math.floor(a / cols) * SP;
      }
    });
    centroGrado.push({ x: x + total / 2 - SP / 2, zAtras: z0, zFrente: z0 + altoGrado });
    x += total + GAP_GRADO;
  });
  return { pos, rectSalon, centroGrado, anchoTotal, fondo: Math.max(...zTopes) };
}

const PATIO = acomodarPatio();

function Estudiantes({ seleccion }: { seleccion: Uint8Array }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const actual = useRef<{ y: Float32Array; e: Float32Array; col: Float32Array } | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);

  const destinos = useMemo(() => {
    const y = new Float32Array(N_POBLACION);
    const e = new Float32Array(N_POBLACION);
    const col = new Float32Array(N_POBLACION * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < N_POBLACION; i++) {
      const est = ESTUDIANTES[i]!;
      const sel = seleccion[i] === 1;
      y[i] = sel ? 0.16 : 0;
      e[i] = sel ? 1.25 : 0.85;
      if (sel) tmp.set(est.usaMucho ? COL_SI : COL_NO);
      else tmp.set(GRADOS[est.grado]!.color).lerp(COL_APAGADO, 0.5);
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return { y, e, col };
  }, [seleccion]);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!actual.current) actual.current = { y: destinos.y.slice(), e: new Float32Array(N_POBLACION), col: destinos.col.slice() };
    const a = actual.current;
    const k = suave(dt, 0.12);
    let mov = 0;
    for (let i = 0; i < N_POBLACION; i++) {
      const dy = destinos.y[i]! - a.y[i]!;
      const de = destinos.e[i]! - a.e[i]!;
      a.y[i] = a.y[i]! + dy * k;
      a.e[i] = a.e[i]! + de * k;
      mov += Math.abs(dy) + Math.abs(de);
      for (let d = 0; d < 3; d++) {
        const dc = destinos.col[i * 3 + d]! - a.col[i * 3 + d]!;
        a.col[i * 3 + d] = a.col[i * 3 + d]! + dc * k;
        mov += Math.abs(dc);
      }
    }
    if (mov < 1e-3 && mesh.userData.listo) return;
    for (let i = 0; i < N_POBLACION; i++) {
      dummy.position.set(PATIO.pos[i * 3]!, a.y[i]!, PATIO.pos[i * 3 + 2]!);
      dummy.scale.setScalar(SP * 0.62 * a.e[i]!);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      c.setRGB(a.col[i * 3]!, a.col[i * 3 + 1]!, a.col[i * 3 + 2]!);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.userData.listo = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_POBLACION]} castShadow frustumCulled={false}>
      <capsuleGeometry args={[0.36, 0.55, 3, 8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.05} />
    </instancedMesh>
  );
}

function EscenaPatio({ modo, metodo, seleccion, salonesElegidos, porGrado, accent, modoColor }: { modo: Modo; metodo: Metodo; seleccion: Uint8Array; salonesElegidos: number[]; porGrado: number[]; accent: string; modoColor: string }) {
  const hayMuestra = porGrado.some((x) => x > 0);
  const zFrente = PATIO.fondo / 2;
  const puerta: Pt = [PATIO.anchoTotal / 2 - 1.1, 0, zFrente + 0.45];
  return (
    <group position={[0, -0.9, 0.2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[PATIO.anchoTotal + 2.2, PATIO.fondo + 2]} />
        <meshStandardMaterial color="#0d1726" roughness={0.9} />
      </mesh>

      {/* Salones: un piso por salón */}
      {SALONES.map((s) => {
        const r = PATIO.rectSalon[s.id]!;
        const elegido = salonesElegidos.includes(s.id);
        return (
          <group key={s.id}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(r.x0 + r.x1) / 2, -0.1, (r.z0 + r.z1) / 2]}>
              <planeGeometry args={[r.x1 - r.x0, r.z1 - r.z0]} />
              <meshStandardMaterial color={elegido ? accent : "#16233a"} emissive={elegido ? accent : "#000"} emissiveIntensity={elegido ? 0.25 : 0} transparent opacity={elegido ? 0.5 : 1} />
            </mesh>
            {elegido && (
              <Line
                points={[
                  [r.x0, -0.08, r.z0],
                  [r.x1, -0.08, r.z0],
                  [r.x1, -0.08, r.z1],
                  [r.x0, -0.08, r.z1],
                  [r.x0, -0.08, r.z0],
                ]}
                color={accent}
                lineWidth={2}
              />
            )}
          </group>
        );
      })}

      <Estudiantes seleccion={seleccion} />

      {GRADOS.map((g, gi) => (
        <Etiqueta key={g.nombre} pos={[PATIO.centroGrado[gi]!.x, 0.55, PATIO.centroGrado[gi]!.zAtras - 0.35]} col={`${g.color}aa`} df={9}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: g.color }} />
          {g.corto}
          <span style={{ color: hayMuestra ? "#fff" : "#94a3b8", fontWeight: 900 }}>{hayMuestra ? `${porGrado[gi]} de ${g.tamano}` : g.tamano}</span>
        </Etiqueta>
      ))}

      {/* Entrada */}
      <group position={puerta}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.6, 0.7, 0.08]} />
          <meshStandardMaterial color={modo === "sesgo" && metodo === "conveniencia" ? modoColor : "#475569"} emissive={modo === "sesgo" && metodo === "conveniencia" ? modoColor : "#000"} emissiveIntensity={0.5} />
        </mesh>
        <Letra pos={[0, 0.9, 0]} col={modo === "sesgo" && metodo === "conveniencia" ? modoColor : "#94a3b8"} size={12} df={8}>
          <i className="fa-solid fa-door-open" style={{ marginRight: 5 }} />
          Entrada
        </Letra>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * HISTOGRAMA DE MUESTRAS REPETIDAS
 * ════════════════════════════════════════════════════════════════════════ */

const HW = 8.4;
const BIN = 0.02;
const MAX_ALTO = 3.1;
const MAX_FICHAS = 320;

function Fichas({ estimaciones, color }: { estimaciones: number[]; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const actual = useRef<Float32Array | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const ancho = HW * BIN;

  /** Por ficha: x de su columna, y de su lugar en la pila y alto de ficha. */
  const destino = useMemo(() => {
    const columna = (p: number) => Math.min(Math.round(1 / BIN) - 1, Math.floor(p / BIN + 1e-9));
    const total = new Map<number, number>();
    for (const p of estimaciones) total.set(columna(p), (total.get(columna(p)) ?? 0) + 1);
    const h = Math.min(ancho * 0.9, MAX_ALTO / Math.max(1, ...total.values()));
    const lleva = new Map<number, number>();
    const out = new Float32Array(estimaciones.length * 3);
    estimaciones.forEach((p, i) => {
      const b = columna(p);
      const k = lleva.get(b) ?? 0;
      lleva.set(b, k + 1);
      out[i * 3] = -HW / 2 + (b + 0.5) * ancho;
      out[i * 3 + 1] = (k + 0.5) * h;
      out[i * 3 + 2] = h;
    });
    return out;
  }, [estimaciones, ancho]);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!actual.current) actual.current = new Float32Array(MAX_FICHAS * 3).fill(0);
    const a = actual.current;
    const n = estimaciones.length;
    const k = suave(dt, 0.16);
    for (let i = 0; i < MAX_FICHAS; i++) {
      if (i >= n) {
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0.0001);
        a[i * 3 + 1] = MAX_ALTO + 1.5;
        a[i * 3 + 2] = 0;
      } else {
        a[i * 3] = destino[i * 3]!;
        a[i * 3 + 1] = a[i * 3 + 1]! + (destino[i * 3 + 1]! - a[i * 3 + 1]!) * k;
        a[i * 3 + 2] = a[i * 3 + 2]! + (destino[i * 3 + 2]! - a[i * 3 + 2]!) * k;
        dummy.position.set(a[i * 3]!, a[i * 3 + 1]!, 0);
        dummy.scale.set(ancho * 0.86, Math.max(0.004, a[i * 3 + 2]! * 0.86), 0.2);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX_FICHAS]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} />
    </instancedMesh>
  );
}

function EscenaHistograma({ estimaciones, n, accent, modoColor }: { estimaciones: number[]; n: number; accent: string; modoColor: string }) {
  const xDe = (p: number) => -HW / 2 + p * HW;
  const me = margenError(P_REAL, n);
  const media = estimaciones.length ? estimaciones.reduce((a, b) => a + b, 0) / estimaciones.length : null;
  return (
    <group position={[0, -1.6, 0]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[HW + 0.6, 0.1, 1.2]} />
        <meshStandardMaterial color="#111c2e" roughness={0.8} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => i / 10).map((t) => (
        <group key={t}>
          <Line
            points={[
              [xDe(t), 0.01, 0.62],
              [xDe(t), 0.01, 0.75],
            ]}
            color="#64748b"
            lineWidth={1.4}
          />
          <Letra pos={[xDe(t), -0.3, 0.7]} size={11} df={8}>
            {Math.round(t * 100)} %
          </Letra>
        </group>
      ))}

      {/* Margen de error teórico alrededor del valor real */}
      <mesh position={[xDe(P_REAL), MAX_ALTO / 2 + 0.1, -0.12]}>
        <planeGeometry args={[Math.max(0.01, 2 * me * HW), MAX_ALTO + 0.2]} />
        <meshBasicMaterial color={accent} transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <mesh position={[xDe(P_REAL), MAX_ALTO / 2 + 0.2, 0]}>
        <boxGeometry args={[0.025, MAX_ALTO + 0.4, 0.025]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <Etiqueta pos={[xDe(P_REAL), MAX_ALTO + 0.65, 0]} col="#fbbf24aa" df={9}>
        Valor real: {(P_REAL * 100).toFixed(2)} %
      </Etiqueta>

      <Fichas estimaciones={estimaciones} color={modoColor} />

      {media !== null && (
        <>
          <mesh position={[xDe(media), -0.02, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.1, 0.22, 16]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.4} />
          </mesh>
          {Math.abs(media - P_REAL) > 0.04 && (
            <Etiqueta pos={[xDe(media), MAX_ALTO * 0.55, 0.3]} col={`${modoColor}aa`} df={9}>
              Promedio: {(media * 100).toFixed(1)} %
            </Etiqueta>
          )}
        </>
      )}
      <Letra pos={[0, -0.72, 0.7]} col="#e2e8f0" size={13} df={9}>
        Proporción estimada en cada muestra (n = {n})
      </Letra>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */
export default function MuestreoEstadisticoScene(props: MuestreoSceneProps) {
  const { modo, metodo, seleccion, salonesElegidos, porGrado, estimaciones, n, accent, modoColor, resetNonce } = props;
  const patio = modo !== "error";
  const camara: Pt = patio ? [0, 7.2, 7.6] : [0, 1.2, 9.6];

  return (
    <Canvas key={`${patio ? "patio" : "hist"}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: camara, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento={accent} />
      <pointLight position={[-6, 2, 5]} intensity={0.4} color={modoColor} />

      {patio ? (
        <EscenaPatio modo={modo} metodo={metodo} seleccion={seleccion} salonesElegidos={salonesElegidos} porGrado={porGrado} accent={accent} modoColor={modoColor} />
      ) : (
        <EscenaHistograma estimaciones={estimaciones} n={n} accent={accent} modoColor={modoColor} />
      )}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={5} maxDistance={20} maxPolarAngle={Math.PI * 0.46} minPolarAngle={Math.PI * 0.08} target={[0, patio ? -0.8 : 0, 0]} />
      <EffectComposer>
        <Bloom intensity={0.32} luminanceThreshold={0.55} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
