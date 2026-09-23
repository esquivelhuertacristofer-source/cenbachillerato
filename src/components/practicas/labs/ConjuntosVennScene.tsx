"use client";

/**
 * Escena 3D del laboratorio "Conjuntos y diagramas de Venn" (PM-VI-P10).
 * Tres modos:
 *
 *  - operaciones: un tablero de Venn (U, A y B) con fichas numeradas. La zona
 *                 de la operación elegida se ilumina y sus fichas se levantan.
 *                 Tocar una ficha la cambia de zona.
 *  - demorgan:    dos tableros gemelos. A la izquierda se construye un lado de
 *                 la ley y a la derecha el otro, paso a paso.
 *  - encuesta:    un grupo de estudiantes se acomoda en el diagrama por fases,
 *                 empezando por la intersección.
 *
 * Las zonas se pintan píxel a píxel en una textura: para cada punto del
 * tablero se decide si está en A y en B, y se evalúa la condición de la
 * operación. Así el sombreado es exacto también en la lente de la
 * intersección, que con geometría 3D habría que aproximar.
 *
 * Toda animación ocurre en useFrame mutando refs (nunca en el render), conforme
 * al React Compiler. NO se usa <Text> de drei (cuelga el chunk con Turbopack):
 * el texto del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type Zona, type Elemento, type RepartoEncuesta, zonaDe } from "./conjuntos-venn-data";
import { Escenario } from "./_escenario";

type Cond = (enA: boolean, enB: boolean) => boolean;

/** Una capa de color sobre el tablero: se pinta donde la condición es cierta. */
export interface CapaVenn {
  f: Cond;
  color: string;
  alpha: number;
}

export interface ConjuntosSceneProps {
  modo: Modo;
  // ── operaciones
  elementos: Elemento[];
  /** Condición de la operación elegida. */
  operacion: Cond;
  onTocarElemento: (i: number) => void;
  // ── demorgan
  capasIzq: CapaVenn[];
  capasDer: CapaVenn[];
  notacionIzq: string;
  notacionDer: string;
  /** null mientras la ley no ha terminado de construirse. */
  coinciden: boolean | null;
  // ── encuesta
  reparto: RepartoEncuesta;
  total: number;
  /** 0 = sin acomodar; 1..4 = zonas acomodadas según FASES_ENCUESTA. */
  fase: number;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Geometría del tablero (unidades locales) ─────────────────────────── */
const W = 8.4;
const H = 5.2;
const R = 1.9;
const CA: [number, number] = [-1.1, 0];
const CB: [number, number] = [1.1, 0];

const COL_A = "#60a5fa";
const COL_B = "#f472b6";
const COL_AMBOS = "#c084fc";
const COL_NINGUNO = "#94a3b8";

export const COLOR_ZONA: Record<Zona, string> = {
  soloA: COL_A,
  soloB: COL_B,
  ambos: COL_AMBOS,
  ninguno: COL_NINGUNO,
};

function enA(x: number, y: number): boolean {
  return (x - CA[0]) ** 2 + (y - CA[1]) ** 2 <= R * R;
}
function enB(x: number, y: number): boolean {
  return (x - CB[0]) ** 2 + (y - CB[1]) ** 2 <= R * R;
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/**
 * Pinta el tablero: fondo del universal, las capas pedidas mezcladas en orden,
 * y encima los contornos del rectángulo y de los dos círculos.
 */
function pintarTablero(capas: CapaVenn[]): HTMLCanvasElement {
  const PX = 640;
  const PY = Math.round((PX * H) / W);
  const cv = document.createElement("canvas");
  cv.width = PX;
  cv.height = PY;
  const ctx = cv.getContext("2d");
  if (!ctx) return cv;

  const img = ctx.createImageData(PX, PY);
  const cols = capas.map((c) => ({ ...c, rgb: rgb(c.color) }));
  const fondo: [number, number, number] = [14, 27, 46];

  for (let py = 0; py < PY; py++) {
    const y = H / 2 - ((py + 0.5) / PY) * H;
    for (let px = 0; px < PX; px++) {
      const x = -W / 2 + ((px + 0.5) / PX) * W;
      const a = enA(x, y);
      const b = enB(x, y);
      let r = fondo[0];
      let g = fondo[1];
      let bl = fondo[2];
      for (const c of cols) {
        if (!c.f(a, b)) continue;
        r = r + (c.rgb[0] - r) * c.alpha;
        g = g + (c.rgb[1] - g) * c.alpha;
        bl = bl + (c.rgb[2] - bl) * c.alpha;
      }
      const k = (py * PX + px) * 4;
      img.data[k] = r;
      img.data[k + 1] = g;
      img.data[k + 2] = bl;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Contornos
  const sx = PX / W;
  const aPx = (x: number) => (x + W / 2) * sx;
  const aPy = (y: number) => (H / 2 - y) * sx;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(226,232,240,0.55)";
  ctx.strokeRect(3, 3, PX - 6, PY - 6);
  ctx.lineWidth = 5;
  ctx.strokeStyle = COL_A;
  ctx.beginPath();
  ctx.arc(aPx(CA[0]), aPy(CA[1]), R * sx, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = COL_B;
  ctx.beginPath();
  ctx.arc(aPx(CB[0]), aPy(CB[1]), R * sx, 0, Math.PI * 2);
  ctx.stroke();
  return cv;
}

/** Tablero de Venn como plano texturizado. La textura se rehace solo si cambian las capas. */
function Tablero({ capas, claveCapas }: { capas: CapaVenn[]; claveCapas: string }) {
  // La clave resume las capas: las funciones no se pueden comparar, así que se
  // decide rehacer la textura por su descripción textual.
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(pintarTablero(capas));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveCapas]);
  useEffect(() => () => tex.dispose(), [tex]);

  return (
    <group>
      <mesh position={[0, 0, -0.09]} receiveShadow>
        <boxGeometry args={[W + 0.3, H + 0.3, 0.16]} />
        <meshStandardMaterial color="#0b1526" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* Aros en relieve: dan volumen a los dos conjuntos */}
      <mesh position={[CA[0], CA[1], 0.03]}>
        <torusGeometry args={[R, 0.04, 10, 96]} />
        <meshStandardMaterial color={COL_A} emissive={COL_A} emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[CB[0], CB[1], 0.03]}>
        <torusGeometry args={[R, 0.04, 10, 96]} />
        <meshStandardMaterial color={COL_B} emissive={COL_B} emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ── Etiquetas ────────────────────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 10, col }: { pos: Pt; children: ReactNode; df?: number; col?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
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
        }}
      >
        {children}
      </div>
    </Html>
  );
}

function Letra({ pos, children, df = 8, col = "#e2e8f0", size = 14 }: { pos: Pt; children: ReactNode; df?: number; col?: string; size?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: size, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>{children}</div>
    </Html>
  );
}

/* ── Acomodo de fichas dentro de cada zona ────────────────────────────── */

const ANCLA: Record<Zona, [number, number]> = {
  soloA: [-2.05, 0],
  ambos: [0, 0],
  soloB: [2.05, 0],
  ninguno: [0, 0], // no se usa: la zona de fuera se ordena por esquinas
};

/**
 * Puntos candidatos de cada zona, sobre una rejilla, lejos de los bordes para
 * que ninguna ficha quede montada sobre una línea (y parezca de otra zona).
 * Van ordenados del centro de la zona hacia afuera.
 */
function puntosPorZona(paso: number, margen: number): Record<Zona, [number, number][]> {
  const out: Record<Zona, [number, number][]> = { soloA: [], soloB: [], ambos: [], ninguno: [] };
  for (let y = -H / 2 + margen; y <= H / 2 - margen + 1e-6; y += paso) {
    for (let x = -W / 2 + margen; x <= W / 2 - margen + 1e-6; x += paso) {
      const dA = Math.hypot(x - CA[0], y - CA[1]);
      const dB = Math.hypot(x - CB[0], y - CB[1]);
      if (Math.abs(dA - R) < margen || Math.abs(dB - R) < margen) continue;
      out[zonaDe(dA <= R, dB <= R)].push([x, y]);
    }
  }
  const esquinas: [number, number][] = [
    [-W / 2 + 0.6, H / 2 - 0.5],
    [W / 2 - 0.6, H / 2 - 0.5],
    [-W / 2 + 0.6, -H / 2 + 0.5],
    [W / 2 - 0.6, -H / 2 + 0.5],
  ];
  for (const z of ["soloA", "ambos", "soloB"] as Zona[]) {
    const [ax, ay] = ANCLA[z];
    out[z].sort((p, q) => Math.hypot(p[0] - ax, p[1] - ay) - Math.hypot(q[0] - ax, q[1] - ay));
  }
  const dEsq = (p: [number, number]) => Math.min(...esquinas.map((e) => Math.hypot(p[0] - e[0], p[1] - e[1])));
  out.ninguno.sort((p, q) => dEsq(p) - dEsq(q));
  return out;
}

/**
 * Posición de la i-ésima ficha de una zona. Si la zona se llena, las fichas
 * extra se apilan encima en otra capa en lugar de desaparecer.
 */
function posEnZona(tabla: Record<Zona, [number, number][]>, z: Zona, i: number, alto: number): Pt {
  const pts = tabla[z];
  if (pts.length === 0) return [ANCLA[z][0], ANCLA[z][1], alto];
  const capa = Math.floor(i / pts.length);
  const p = pts[i % pts.length]!;
  return [p[0], p[1], alto + capa * alto * 1.6];
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · OPERACIONES
 * ════════════════════════════════════════════════════════════════════════ */

function Ficha({
  objetivo,
  etq,
  enResultado,
  zona,
  accent,
  onTocar,
}: {
  objetivo: Pt;
  etq: string;
  enResultado: boolean;
  zona: Zona;
  accent: string;
  onTocar: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const primera = useRef(true);
  useFrame((s) => {
    const g = ref.current;
    if (!g) return;
    const alto = objetivo[2] + (enResultado ? 0.38 + Math.sin(s.clock.elapsedTime * 2 + objetivo[0]) * 0.05 : 0);
    if (primera.current) {
      g.position.set(objetivo[0], objetivo[1], alto);
      primera.current = false;
      return;
    }
    g.position.x += (objetivo[0] - g.position.x) * 0.14;
    g.position.y += (objetivo[1] - g.position.y) * 0.14;
    g.position.z += (alto - g.position.z) * 0.14;
  });

  const col = enResultado ? accent : COLOR_ZONA[zona];
  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onTocar();
  };

  return (
    <group ref={ref}>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        onPointerDown={onDown}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <cylinderGeometry args={[0.27, 0.27, 0.16, 32]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={enResultado ? 0.75 : 0.18} roughness={0.35} metalness={0.25} />
      </mesh>
      <Letra pos={[0, 0, 0.14]} col={enResultado ? "#04121f" : "#ffffff"} size={15} df={7}>
        {etq}
      </Letra>
    </group>
  );
}

function EscenaOperaciones({
  elementos,
  operacion,
  onTocarElemento,
  accent,
}: {
  elementos: Elemento[];
  operacion: Cond;
  onTocarElemento: (i: number) => void;
  accent: string;
}) {
  const tabla = useMemo(() => puntosPorZona(0.82, 0.36), []);
  // Celeste: sobre el fondo azul marino queda limpio (el naranja del acento
  // daba café y el ámbar, verde oliva), y las fichas naranjas del resultado
  // resaltan encima por contraste complementario.
  const capas: CapaVenn[] = [{ f: operacion, color: "#7dd3fc", alpha: 0.55 }];
  // Clave estable: qué zonas marca la operación.
  const clave = `op:${[false, true].flatMap((a) => [false, true].map((b) => (operacion(a, b) ? 1 : 0))).join("")}:${accent}`;

  // Índice de cada ficha dentro de su zona.
  const contador: Record<Zona, number> = { soloA: 0, soloB: 0, ambos: 0, ninguno: 0 };
  const posiciones = elementos.map((el) => posEnZona(tabla, el.zona, contador[el.zona]++, 0.14));

  return (
    <group rotation={[-0.42, 0, 0]} position={[0, 0.15, 0]}>
      <Tablero capas={capas} claveCapas={clave} />
      {elementos.map((el, i) => (
        <Ficha
          key={el.etq}
          objetivo={posiciones[i]!}
          etq={el.etq}
          zona={el.zona}
          enResultado={operacion(el.zona === "soloA" || el.zona === "ambos", el.zona === "soloB" || el.zona === "ambos")}
          accent={accent}
          onTocar={() => onTocarElemento(i)}
        />
      ))}
      <Letra pos={[-W / 2 - 0.05, H / 2 + 0.32, 0.1]} col="rgba(226,232,240,0.85)" size={20} df={9}>
        U
      </Letra>
      <Letra pos={[CA[0] - 1.25, R + 0.02, 0.1]} col={COL_A} size={22} df={9}>
        A
      </Letra>
      <Letra pos={[CB[0] + 1.25, R + 0.02, 0.1]} col={COL_B} size={22} df={9}>
        B
      </Letra>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · LEYES DE DE MORGAN
 * ════════════════════════════════════════════════════════════════════════ */

function claveDeCapas(capas: CapaVenn[]): string {
  return capas
    .map((c) => `${[false, true].flatMap((a) => [false, true].map((b) => (c.f(a, b) ? 1 : 0))).join("")}${c.color}${c.alpha}`)
    .join("|");
}

function EscenaDeMorgan({
  capasIzq,
  capasDer,
  notacionIzq,
  notacionDer,
  coinciden,
  modoColor,
}: {
  capasIzq: CapaVenn[];
  capasDer: CapaVenn[];
  notacionIzq: string;
  notacionDer: string;
  coinciden: boolean | null;
  modoColor: string;
}) {
  const esc = 0.5;
  return (
    <group rotation={[-0.3, 0, 0]} position={[0, 0.2, 0]}>
      <group position={[-2.35, 0, 0]} scale={esc}>
        <Tablero capas={capasIzq} claveCapas={claveDeCapas(capasIzq)} />
        <Letra pos={[CA[0] - 1.25, R + 0.02, 0.1]} col={COL_A} size={18} df={11}>
          A
        </Letra>
        <Letra pos={[CB[0] + 1.25, R + 0.02, 0.1]} col={COL_B} size={18} df={11}>
          B
        </Letra>
        <Etiqueta pos={[0, H / 2 + 0.75, 0.1]} col={`${modoColor}88`} df={16}>
          {notacionIzq}
        </Etiqueta>
      </group>

      <Letra pos={[0, 0, 0.1]} col={coinciden ? "#34d399" : "rgba(255,255,255,0.6)"} size={30} df={9}>
        {coinciden === null ? "?" : coinciden ? "=" : "≠"}
      </Letra>

      <group position={[2.35, 0, 0]} scale={esc}>
        <Tablero capas={capasDer} claveCapas={claveDeCapas(capasDer)} />
        <Letra pos={[CA[0] - 1.25, R + 0.02, 0.1]} col={COL_A} size={18} df={11}>
          A
        </Letra>
        <Letra pos={[CB[0] + 1.25, R + 0.02, 0.1]} col={COL_B} size={18} df={11}>
          B
        </Letra>
        <Etiqueta pos={[0, H / 2 + 0.75, 0.1]} col={`${modoColor}88`} df={16}>
          {notacionDer}
        </Etiqueta>
      </group>

      {coinciden !== null && (
        <Etiqueta pos={[0, -H * esc / 2 - 0.7, 0.1]} col={coinciden ? "#34d39988" : "#f8717188"} df={11}>
          <i className={`fa-solid ${coinciden ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: coinciden ? "#34d399" : "#f87171" }} />
          {coinciden ? "Las dos construcciones marcan exactamente las mismas zonas" : "Las zonas no coinciden"}
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · ENCUESTA
 * ════════════════════════════════════════════════════════════════════════ */

/** Orden en que se acomodan las zonas (igual que FASES_ENCUESTA). */
const ORDEN_FASES: Zona[] = ["ambos", "soloA", "soloB", "ninguno"];

function Estudiante({ objetivo, color, visible }: { objetivo: Pt; color: string; visible: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const primera = useRef(true);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (primera.current) {
      g.position.set(objetivo[0], objetivo[1], objetivo[2]);
      primera.current = false;
    }
    g.position.x += (objetivo[0] - g.position.x) * 0.1;
    g.position.y += (objetivo[1] - g.position.y) * 0.1;
    g.position.z += (objetivo[2] - g.position.z) * 0.1;
    const s = g.scale.x + ((visible ? 1 : 0.001) - g.scale.x) * 0.15;
    g.scale.setScalar(s);
  });
  return (
    <group ref={ref}>
      {/* cuerpo y cabeza, de pie sobre el tablero (el eje z es la altura) */}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.1, 0.2, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.26]} castShadow>
        <sphereGeometry args={[0.075, 14, 14]} />
        <meshStandardMaterial color="#f5d0a9" roughness={0.6} />
      </mesh>
    </group>
  );
}

function EscenaEncuesta({ reparto, total, fase, modoColor }: { reparto: RepartoEncuesta; total: number; fase: number; modoColor: string }) {
  const tabla = useMemo(() => puntosPorZona(0.3, 0.16), []);

  // Cuántos van en cada zona.
  const cuantos: Record<Zona, number> = { ambos: reparto.ambos, soloA: reparto.soloF, soloB: reparto.soloB, ninguno: Math.max(reparto.ninguno, 0) };

  // Asignación estable: primero los de la intersección, luego solo F, solo B y
  // al final los de fuera. El estudiante i siempre es el mismo muñeco.
  const asignados: { zona: Zona; idx: number }[] = [];
  for (const z of ORDEN_FASES) for (let k = 0; k < cuantos[z]; k++) asignados.push({ zona: z, idx: k });

  const capas: CapaVenn[] = ORDEN_FASES.slice(0, fase).map((z) => ({
    f: (a: boolean, b: boolean) => zonaDe(a, b) === z,
    color: COLOR_ZONA[z],
    alpha: 0.26,
  }));
  const clave = `enc:${fase}`;

  const MAXIMO = 40;
  return (
    <group rotation={[-0.5, 0, 0]} position={[0, 0.85, 0]} scale={0.84}>
      <Tablero capas={capas} claveCapas={clave} />
      {Array.from({ length: MAXIMO }, (_, i) => {
        const a = asignados[i];
        const existe = i < total && a !== undefined;
        const acomodado = existe && ORDEN_FASES.indexOf(a.zona) < fase;
        // Los que aún no se acomodan esperan en fila, debajo del tablero.
        const fila: Pt = [-W / 2 + 0.3 + (i % 20) * 0.41, -H / 2 - 0.42 - Math.floor(i / 20) * 0.38, 0.02];
        const objetivo = acomodado && a ? posEnZona(tabla, a.zona, a.idx, 0.02) : fila;
        const color = acomodado && a ? COLOR_ZONA[a.zona] : "#64748b";
        return <Estudiante key={i} objetivo={objetivo} color={color} visible={existe} />;
      })}

      <Letra pos={[-W / 2 - 0.05, H / 2 + 0.32, 0.1]} col="rgba(226,232,240,0.85)" size={18} df={9}>
        U
      </Letra>
      <Etiqueta pos={[CA[0] - 0.9, R + 0.35, 0.1]} col={`${COL_A}88`} df={10}>
        <span style={{ color: COL_A }}>F</span> Fútbol
      </Etiqueta>
      <Etiqueta pos={[CB[0] + 0.9, R + 0.35, 0.1]} col={`${COL_B}88`} df={10}>
        <span style={{ color: COL_B }}>B</span> Básquetbol
      </Etiqueta>

      {fase >= 1 && (
        <Etiqueta pos={[0, -R - 0.05, 0.5]} col={`${COL_AMBOS}aa`} df={10}>
          ambos {reparto.ambos}
        </Etiqueta>
      )}
      {fase >= 2 && (
        <Etiqueta pos={[-2.2, -R + 0.25, 0.5]} col={`${COL_A}aa`} df={10}>
          solo F {reparto.soloF}
        </Etiqueta>
      )}
      {fase >= 3 && (
        <Etiqueta pos={[2.2, -R + 0.25, 0.5]} col={`${COL_B}aa`} df={10}>
          solo B {reparto.soloB}
        </Etiqueta>
      )}
      {fase >= 4 && (
        <Etiqueta pos={[W / 2 - 1.1, -H / 2 + 0.35, 0.5]} col={`${modoColor}aa`} df={10}>
          ninguno {reparto.ninguno}
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */
export default function ConjuntosVennScene(props: ConjuntosSceneProps) {
  const { modo, elementos, operacion, onTocarElemento, capasIzq, capasDer, notacionIzq, notacionDer, coinciden, reparto, total, fase, accent, modoColor, resetNonce } = props;

  const camara: Pt = modo === "demorgan" ? [0, 0.6, 9.2] : modo === "encuesta" ? [0, 0.4, 9.4] : [0, 0.4, 9];

  return (
    <Canvas
      key={`${modo}-${resetNonce}`}
      shadows
      dpr={[1, 1.75]}
      camera={{ position: camara, fov: 42 }}
      gl={{ antialias: true }}
      onPointerMissed={() => {
        document.body.style.cursor = "";
      }}
    >
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento={accent} />
      <pointLight position={[-6, -3, 5]} intensity={0.45} color={modoColor} />

      {modo === "operaciones" && <EscenaOperaciones elementos={elementos} operacion={operacion} onTocarElemento={onTocarElemento} accent={accent} />}
      {modo === "demorgan" && (
        <EscenaDeMorgan capasIzq={capasIzq} capasDer={capasDer} notacionIzq={notacionIzq} notacionDer={notacionDer} coinciden={coinciden} modoColor={modoColor} />
      )}
      {modo === "encuesta" && <EscenaEncuesta reparto={reparto} total={total} fase={fase} modoColor={modoColor} />}

      <OrbitControls enablePan={false} enableZoom minDistance={5} maxDistance={18} maxPolarAngle={Math.PI * 0.8} minPolarAngle={Math.PI * 0.2} />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.45} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
