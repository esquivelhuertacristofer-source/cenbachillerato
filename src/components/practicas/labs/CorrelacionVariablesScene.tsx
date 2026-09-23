"use client";

/**
 * Escena 3D del laboratorio "¿Están relacionadas? Independencia y
 * correlación" (PM-VI-P12). Tres modos:
 *
 *  - contingencia: dos torres de 50 fichas (hombres y mujeres). La frontera
 *                  entre fútbol y básquetbol de cada torre se compara con un
 *                  plano translúcido: la altura esperada si las variables
 *                  fueran independientes.
 *  - dispersion:   un tablero donde cada toque agrega un punto y cada punto
 *                  tocado se quita. Recta de mínimos cuadrados y, a elección,
 *                  el rectángulo (x − x̄)(y − ȳ) de cada punto.
 *  - causalidad:   52 semanas de helado y ahogamientos. Primero aplanadas en
 *                  el plano; al revelar la temperatura se separan en el eje de
 *                  profundidad y la cámara gira para mostrarlo.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo, no por
 * cuadro. NO se usa <Text> de drei (cuelga el chunk con Turbopack): el texto
 * del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";
import {
  type Modo,
  type Punto,
  type Rango,
  type Semana,
  type VistaCausal,
  GRUPO,
  estadisticos,
  bandaDe,
  BANDAS,
  SEMANAS_T,
  HELADO_R,
  AHOGA_R,
  fmt,
} from "./correlacion-variables-data";

export interface CorrelacionSceneProps {
  modo: Modo;
  // ── contingencia
  hombresFutbol: number;
  mujeresFutbol: number;
  // ── dispersión
  puntos: Punto[];
  rangoX: Rango;
  rangoY: Rango;
  ejeX: string;
  ejeY: string;
  mostrarRecta: boolean;
  mostrarProductos: boolean;
  onAgregar: (p: Punto) => void;
  onQuitar: (i: number) => void;
  // ── causalidad
  semanas: Semana[];
  vistaCausal: VistaCausal;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Piezas comunes ───────────────────────────────────────────────────── */
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

/** Suavizado por tiempo: la misma trayectoria a cualquier cuadro por segundo. */
const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);

function Movil({ objetivo, children, vel = 0.12, escala = 1 }: { objetivo: Pt; children: ReactNode; vel?: number; escala?: number }) {
  const ref = useRef<THREE.Group>(null);
  const primera = useRef(true);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (primera.current) {
      g.position.set(objetivo[0], objetivo[1], objetivo[2]);
      g.scale.setScalar(0.001);
      primera.current = false;
    }
    const k = suave(dt, vel);
    g.position.x += (objetivo[0] - g.position.x) * k;
    g.position.y += (objetivo[1] - g.position.y) * k;
    g.position.z += (objetivo[2] - g.position.z) * k;
    g.scale.setScalar(g.scale.x + (escala - g.scale.x) * suave(dt, 0.16));
  });
  return <group ref={ref}>{children}</group>;
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · TABLA DE CONTINGENCIA EN TORRES
 * ════════════════════════════════════════════════════════════════════════ */

const COLS = 5;
const SP = 0.36;
const Y0 = -1.85;
const COL_FUTBOL = "#e2e8f0";
const COL_BASQUET = "#fb923c";

function Torre({ x, futbol, nombre, color, modoColor }: { x: number; futbol: number; nombre: string; color: string; modoColor: string }) {
  const filas = GRUPO / COLS;
  const alto = filas * SP;
  const frontera = Y0 + (futbol / COLS) * SP;
  const pct = Math.round((futbol / GRUPO) * 100);
  return (
    <group>
      {Array.from({ length: GRUPO }, (_, i) => {
        const esF = i < futbol;
        const pos: Pt = [x + ((i % COLS) - (COLS - 1) / 2) * SP, Y0 + SP / 2 + Math.floor(i / COLS) * SP, 0];
        return (
          <Movil key={`${nombre}-${i}-${esF ? "f" : "b"}`} objetivo={pos}>
            <mesh castShadow>
              <sphereGeometry args={[0.145, 18, 18]} />
              <meshStandardMaterial color={esF ? COL_FUTBOL : COL_BASQUET} emissive={esF ? "#94a3b8" : COL_BASQUET} emissiveIntensity={esF ? 0.12 : 0.28} roughness={0.4} />
            </mesh>
          </Movil>
        );
      })}
      {/* Vitrina */}
      <mesh position={[x, Y0 + alto / 2, 0]}>
        <boxGeometry args={[COLS * SP + 0.14, alto + 0.1, 0.52]} />
        <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.07} roughness={0.1} depthWrite={false} />
      </mesh>
      <mesh position={[x, Y0 - 0.06, 0]} receiveShadow>
        <boxGeometry args={[COLS * SP + 0.34, 0.12, 0.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {/* Frontera observada */}
      <mesh position={[x, frontera, 0.3]}>
        <boxGeometry args={[COLS * SP + 0.2, 0.035, 0.035]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Letra pos={[x, Y0 - 0.42, 0.3]} col="#e2e8f0" size={14} df={9}>
        {nombre}
      </Letra>
      <Etiqueta pos={[x, Y0 + alto + 0.45, 0]} col={`${modoColor}88`} df={10}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: COL_FUTBOL }} />
        fútbol {futbol}/{GRUPO} = {pct} %
      </Etiqueta>
    </group>
  );
}

function EscenaContingencia({ hF, mF, modoColor, accent }: { hF: number; mF: number; modoColor: string; accent: string }) {
  const esperado = (GRUPO * (hF + mF)) / (2 * GRUPO);
  const yEsp = Y0 + (esperado / COLS) * SP;
  const iguales = hF === mF;
  return (
    <group position={[0, 0.1, 0]}>
      <Torre x={-1.65} futbol={hF} nombre="Hombres" color={iguales ? modoColor : "#f472b6"} modoColor={modoColor} />
      <Torre x={1.65} futbol={mF} nombre="Mujeres" color={iguales ? modoColor : "#f472b6"} modoColor={modoColor} />

      {/* Plano de lo esperado */}
      <Movil objetivo={[0, yEsp, 0]} vel={0.1}>
        <mesh>
          <boxGeometry args={[5.6, 0.02, 1.05]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <Line
          points={[
            [-2.8, 0, 0.53],
            [2.8, 0, 0.53],
          ]}
          color={accent}
          lineWidth={2}
          dashed
          dashSize={0.12}
          gapSize={0.08}
        />
      </Movil>
      <Etiqueta pos={[3.05, yEsp, 0.5]} col={`${accent}aa`} df={9} izq>
        Esperado: {fmt(esperado, esperado % 1 === 0 ? 0 : 1)}/{GRUPO}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · TABLERO DE DISPERSIÓN
 * ════════════════════════════════════════════════════════════════════════ */

const TW = 7.0;
const TH = 4.0;
const COL_POS = "#34d399";
const COL_NEG = "#f87171";

/** Marcas enteras: una por unidad si el rango es corto, cada 5 si es largo. */
function ticks(r: Rango): number[] {
  const span = r.max - r.min;
  const n = span <= 10 ? span : Math.round(span / 5);
  return Array.from({ length: n + 1 }, (_, i) => r.min + (span * i) / n);
}

/** Recorta el segmento de la recta y = a + b·x al rectángulo del tablero. */
function recortarRecta(a: number, b: number, rx: Rango, ry: Rango): [Punto, Punto] | null {
  const cand: Punto[] = [];
  const dentroY = (y: number) => y >= ry.min - 1e-9 && y <= ry.max + 1e-9;
  const dentroX = (x: number) => x >= rx.min - 1e-9 && x <= rx.max + 1e-9;
  for (const x of [rx.min, rx.max]) {
    const y = a + b * x;
    if (dentroY(y)) cand.push({ x, y });
  }
  if (Math.abs(b) > 1e-12) {
    for (const y of [ry.min, ry.max]) {
      const x = (y - a) / b;
      if (dentroX(x)) cand.push({ x, y });
    }
  }
  if (cand.length < 2) return null;
  cand.sort((p, q) => p.x - q.x);
  return [cand[0]!, cand[cand.length - 1]!];
}

function EscenaDispersion({
  puntos,
  rangoX,
  rangoY,
  ejeX,
  ejeY,
  mostrarRecta,
  mostrarProductos,
  onAgregar,
  onQuitar,
  accent,
}: {
  puntos: Punto[];
  rangoX: Rango;
  rangoY: Rango;
  ejeX: string;
  ejeY: string;
  mostrarRecta: boolean;
  mostrarProductos: boolean;
  onAgregar: (p: Punto) => void;
  onQuitar: (i: number) => void;
  accent: string;
}) {
  const wx = (x: number) => -TW / 2 + ((x - rangoX.min) / (rangoX.max - rangoX.min)) * TW;
  const wy = (y: number) => -TH / 2 + ((y - rangoY.min) / (rangoY.max - rangoY.min)) * TH;
  const est = useMemo(() => estadisticos(puntos), [puntos]);
  const segmento = est.recta ? recortarRecta(est.recta.a, est.recta.b, rangoX, rangoY) : null;

  const tocarTablero = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const local = e.object.worldToLocal(e.point.clone());
    const x = rangoX.min + ((local.x + TW / 2) / TW) * (rangoX.max - rangoX.min);
    const y = rangoY.min + ((local.y + TH / 2) / TH) * (rangoY.max - rangoY.min);
    if (x < rangoX.min || x > rangoX.max || y < rangoY.min || y > rangoY.max) return;
    onAgregar({ x, y });
  };

  const rejilla: Pt[] = [];
  for (const t of ticks(rangoX)) rejilla.push([wx(t), -TH / 2, 0.005], [wx(t), TH / 2, 0.005]);
  for (const t of ticks(rangoY)) rejilla.push([-TW / 2, wy(t), 0.005], [TW / 2, wy(t), 0.005]);

  return (
    <group position={[0.25, 0.05, 0]}>
      <mesh
        onPointerDown={tocarTablero}
        onPointerOver={() => {
          document.body.style.cursor = "crosshair";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
        receiveShadow
      >
        <planeGeometry args={[TW, TH]} />
        <meshStandardMaterial color="#0b1628" roughness={0.85} />
      </mesh>
      <Line points={rejilla} segments color="#1f2f47" lineWidth={1} />
      <Line
        points={[
          [-TW / 2, -TH / 2, 0.01],
          [TW / 2, -TH / 2, 0.01],
          [TW / 2, TH / 2, 0.01],
          [-TW / 2, TH / 2, 0.01],
          [-TW / 2, -TH / 2, 0.01],
        ]}
        color="#3b5275"
        lineWidth={1.5}
      />
      {ticks(rangoX).map((t) => (
        <Letra key={`tx-${t}`} pos={[wx(t), -TH / 2 - 0.22, 0]} size={11} df={8}>
          {fmt(t, 0)}
        </Letra>
      ))}
      {ticks(rangoY).map((t) => (
        <Letra key={`ty-${t}`} pos={[-TW / 2 - 0.3, wy(t), 0]} size={11} df={8}>
          {fmt(t, 0)}
        </Letra>
      ))}
      <Letra pos={[0, -TH / 2 - 0.55, 0]} col="#e2e8f0" size={13} df={9}>
        {ejeX}
      </Letra>
      <Html position={[-TW / 2 - 0.72, 0, 0]} center distanceFactor={9} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", transform: "rotate(-90deg)", textShadow: "0 2px 6px #000" }}>{ejeY}</div>
      </Html>

      {/* Rectángulos de productos y centro de la nube */}
      {mostrarProductos && est.n >= 2 && (
        <>
          {puntos.map((p, i) => {
            const x0 = wx(est.mediaX);
            const y0 = wy(est.mediaY);
            const x1 = wx(p.x);
            const y1 = wy(p.y);
            const w = Math.abs(x1 - x0);
            const h = Math.abs(y1 - y0);
            if (w < 1e-3 || h < 1e-3) return null;
            const positivo = (p.x - est.mediaX) * (p.y - est.mediaY) >= 0;
            return (
              <mesh key={`rect-${i}`} position={[(x0 + x1) / 2, (y0 + y1) / 2, 0.012 + i * 0.0008]}>
                <planeGeometry args={[w, h]} />
                <meshBasicMaterial color={positivo ? COL_POS : COL_NEG} transparent opacity={0.16} depthWrite={false} />
              </mesh>
            );
          })}
          <Line
            points={[
              [wx(est.mediaX), -TH / 2, 0.03],
              [wx(est.mediaX), TH / 2, 0.03],
            ]}
            color="#cbd5e1"
            lineWidth={1.4}
            dashed
            dashSize={0.1}
            gapSize={0.08}
          />
          <Line
            points={[
              [-TW / 2, wy(est.mediaY), 0.03],
              [TW / 2, wy(est.mediaY), 0.03],
            ]}
            color="#cbd5e1"
            lineWidth={1.4}
            dashed
            dashSize={0.1}
            gapSize={0.08}
          />
          <Letra pos={[wx(est.mediaX), TH / 2 + 0.2, 0]} col="#cbd5e1" size={12} df={8}>
            x̄
          </Letra>
          <Letra pos={[TW / 2 + 0.22, wy(est.mediaY), 0]} col="#cbd5e1" size={12} df={8}>
            ȳ
          </Letra>
        </>
      )}

      {mostrarRecta && segmento && (
        <CurvaTubo puntos={[
            [wx(segmento[0].x), wy(segmento[0].y), 0.06],
            [wx(segmento[1].x), wy(segmento[1].y), 0.06],
          ]} color={accent} grosor={0.054} />
      )}

      {puntos.map((p, i) => (
        <Movil key={`p-${i}-${p.x}-${p.y}`} objetivo={[wx(p.x), wy(p.y), 0.14]}>
          <mesh
            castShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              onQuitar(i);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.55} roughness={0.3} />
          </mesh>
        </Movil>
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · CORRELACIÓN NO ES CAUSALIDAD
 * ════════════════════════════════════════════════════════════════════════ */

const CX = 5.4;
const CY = 3.6;
const CZ = 4.6;

/** Lleva la cámara a una posición durante un momento y después la suelta. */
function CamaraGuiada({ destino, clave }: { destino: Pt; clave: string }) {
  const desde = useRef<{ clave: string; t: number } | null>(null);
  useFrame((state, dt) => {
    const { camera, controls } = state;
    if (!desde.current || desde.current.clave !== clave) desde.current = { clave, t: 0 };
    const d = desde.current;
    if (d.t > 1.8) return;
    d.t += Math.min(dt, 0.25);
    const k = suave(dt, 0.07);
    camera.position.x += (destino[0] - camera.position.x) * k;
    camera.position.y += (destino[1] - camera.position.y) * k;
    camera.position.z += (destino[2] - camera.position.z) * k;
    camera.lookAt(0, 0, 0);
    (controls as unknown as { update?: () => void } | null)?.update?.();
  });
  return null;
}

const colTemp = new THREE.Color();
function colorTemperatura(t: number): string {
  const u = Math.max(0, Math.min(1, (t - SEMANAS_T.min) / (SEMANAS_T.max - SEMANAS_T.min)));
  colTemp.setHSL(0.62 - 0.62 * u, 0.85, 0.6);
  return `#${colTemp.getHexString()}`;
}

function EscenaCausal({ semanas, vista, accent }: { semanas: Semana[]; vista: VistaCausal; accent: string }) {
  const hx = (h: number) => -CX / 2 + ((h - HELADO_R.min) / (HELADO_R.max - HELADO_R.min)) * CX;
  const ay = (a: number) => -CY / 2 + ((a - AHOGA_R.min) / (AHOGA_R.max - AHOGA_R.min)) * CY;
  const tz = (t: number) => CZ / 2 - ((t - SEMANAS_T.min) / (SEMANAS_T.max - SEMANAS_T.min)) * CZ;
  const conProfundidad = vista !== "aparente";

  const global = useMemo(() => estadisticos(semanas.map((s) => ({ x: s.helado, y: s.ahogamientos }))), [semanas]);
  const rectasBanda = useMemo(
    () =>
      BANDAS.map((b) => {
        const de = semanas.filter((s) => bandaDe(s.temperatura).id === b.id);
        const est = estadisticos(de.map((s) => ({ x: s.helado, y: s.ahogamientos })));
        const tMedia = de.reduce((acc, s) => acc + s.temperatura, 0) / Math.max(1, de.length);
        const xs = de.map((s) => s.helado);
        return { banda: b, est, tMedia, xMin: Math.min(...xs), xMax: Math.max(...xs), n: de.length };
      }),
    [semanas],
  );

  const recta = (a: number, b: number, x0: number, x1: number, z: number): Pt[] => [
    [hx(x0), ay(a + b * x0), z],
    [hx(x1), ay(a + b * x1), z],
  ];

  return (
    <group position={[0.2, 0.4, 0]}>
      {/* Ejes */}
      <Line
        points={[
          [-CX / 2, -CY / 2, CZ / 2],
          [CX / 2, -CY / 2, CZ / 2],
        ]}
        color="#64748b"
        lineWidth={1.6}
      />
      <Line
        points={[
          [-CX / 2, -CY / 2, CZ / 2],
          [-CX / 2, CY / 2, CZ / 2],
        ]}
        color="#64748b"
        lineWidth={1.6}
      />
      {conProfundidad && (
        <Line
          points={[
            [-CX / 2, -CY / 2, CZ / 2],
            [-CX / 2, -CY / 2, -CZ / 2],
          ]}
          color={accent}
          lineWidth={2.2}
        />
      )}
      {/* Piso de referencia */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -CY / 2 - 0.01, 0]} receiveShadow>
        <planeGeometry args={[CX, CZ]} />
        <meshStandardMaterial color="#0b1628" roughness={0.9} transparent opacity={conProfundidad ? 0.9 : 0.35} />
      </mesh>

      <Letra pos={[0, -CY / 2 - 0.35, CZ / 2 + 0.2]} col="#e2e8f0" size={12} df={7.5}>
        Helado vendido (miles de litros por semana)
      </Letra>
      {conProfundidad ? (
        <Letra pos={[-CX / 2, CY / 2 + 0.3, CZ / 2]} col="#e2e8f0" size={12} df={7.5}>
          Ahogamientos por semana
        </Letra>
      ) : (
        <Html position={[-CX / 2 - 0.45, 0, CZ / 2]} center distanceFactor={7.5} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", transform: "rotate(-90deg)", textShadow: "0 2px 6px #000" }}>Ahogamientos por semana</div>
        </Html>
      )}
      {conProfundidad && (
        <>
          <Letra pos={[-CX / 2 - 0.35, -CY / 2, tz(SEMANAS_T.min)]} col={accent} size={11} df={7.5}>
            {SEMANAS_T.min} °C
          </Letra>
          <Letra pos={[-CX / 2 - 0.35, -CY / 2, tz(SEMANAS_T.max)]} col={accent} size={11} df={7.5}>
            {SEMANAS_T.max} °C
          </Letra>
        </>
      )}
      {conProfundidad && (
        <Etiqueta pos={[-CX / 2 - 0.2, -CY / 2 + 0.35, -CZ / 2 - 0.3]} col={`${accent}aa`} df={7.5}>
          <i className="fa-solid fa-temperature-high" style={{ color: accent }} />
          Temperatura (°C): la variable oculta
        </Etiqueta>
      )}

      {/* Rebanadas de temperatura */}
      {vista === "controlada" &&
        rectasBanda.map(({ banda, est, tMedia, xMin, xMax, n }) => {
          const z = tz(tMedia);
          return (
            <group key={banda.id}>
              <mesh position={[0, 0, z]}>
                <planeGeometry args={[CX, CY]} />
                <meshBasicMaterial color={banda.color} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
              {est.recta && n >= 3 && <Line points={recta(est.recta.a, est.recta.b, xMin, xMax, z)} color={banda.color} lineWidth={2.6} />}
              <Etiqueta pos={[hx(xMax) + 0.2, est.recta ? ay(est.recta.a + est.recta.b * xMax) : 0, z]} col={`${banda.color}aa`} df={7} izq>
                r = {est.r === null ? "—" : fmt(est.r)}
              </Etiqueta>
            </group>
          );
        })}

      {vista !== "controlada" && global.recta && (
        <Line points={recta(global.recta.a, global.recta.b, HELADO_R.min + 0.5, HELADO_R.max - 0.8, CZ / 2)} color={accent} lineWidth={2.6} transparent opacity={vista === "aparente" ? 1 : 0.35} />
      )}

      {semanas.map((s, i) => {
        const col = vista === "aparente" ? "#e0f2fe" : vista === "oculta" ? colorTemperatura(s.temperatura) : bandaDe(s.temperatura).color;
        return (
          <Movil key={i} objetivo={[hx(s.helado), ay(s.ahogamientos), conProfundidad ? tz(s.temperatura) : CZ / 2]} vel={0.08}>
            <mesh castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} roughness={0.35} />
            </mesh>
          </Movil>
        );
      })}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */
export default function CorrelacionVariablesScene(props: CorrelacionSceneProps) {
  const { modo, hombresFutbol, mujeresFutbol, puntos, rangoX, rangoY, ejeX, ejeY, mostrarRecta, mostrarProductos, onAgregar, onQuitar, semanas, vistaCausal, accent, modoColor, resetNonce } = props;
  const camara: Pt = modo === "contingencia" ? [0, 0.6, 9.2] : modo === "dispersion" ? [0, 0.2, 9.6] : [0, 0.3, 11.6];
  const destinoCausal: Pt = vistaCausal === "aparente" ? [0, 0.3, 11.6] : [-4.8, 3.6, 10.4];

  return (
    <Canvas key={`${modo}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: camara, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento={accent} />
      <pointLight position={[-6, -2, 5]} intensity={0.45} color={modoColor} />

      {modo === "contingencia" && <EscenaContingencia hF={hombresFutbol} mF={mujeresFutbol} modoColor={modoColor} accent={accent} />}
      {modo === "dispersion" && (
        <EscenaDispersion puntos={puntos} rangoX={rangoX} rangoY={rangoY} ejeX={ejeX} ejeY={ejeY} mostrarRecta={mostrarRecta} mostrarProductos={mostrarProductos} onAgregar={onAgregar} onQuitar={onQuitar} accent={accent} />
      )}
      {modo === "causalidad" && (
        <>
          <EscenaCausal semanas={semanas} vista={vistaCausal} accent={accent} />
          <CamaraGuiada destino={destinoCausal} clave={vistaCausal} />
        </>
      )}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={5} maxDistance={18} maxPolarAngle={Math.PI * 0.62} minPolarAngle={Math.PI * 0.15} enableRotate={modo !== "dispersion"} target={[0, 0, 0]} />
      <EffectComposer>
        <Bloom intensity={0.34} luminanceThreshold={0.5} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
