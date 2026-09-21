"use client";

/**
 * Escena 3D del laboratorio "Bayes: actualizar creencias con nueva
 * información" (PM-VI-P06). Tres modos:
 *
 *  - reducido:    100 personas de pie, agrupadas por la condición B. Al
 *                 condicionar, quienes no la cumplen se hunden y se apagan: la
 *                 probabilidad se cuenta solo entre los que quedan de pie.
 *  - arbol:       un árbol de dos etapas con ramas cuyo grosor crece con la
 *                 probabilidad de llegar a ellas, y partículas que eligen su
 *                 camino al azar con esas mismas probabilidades.
 *  - diagnostico: una población de 1 000 o 10 000 personas (InstancedMesh).
 *                 El color es la realidad (enferma o sana); el brillo y la
 *                 altura, el resultado de la prueba. Con «solo positivos», los
 *                 verdaderos y los falsos positivos se apilan en dos muros.
 *
 * Toda animación ocurre en useFrame mutando refs (nunca en el render), conforme
 * al React Compiler. NO se usa <Text> de drei (cuelga el chunk con Turbopack):
 * el texto del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type PoblacionDef,
  type Condicion,
  type ExperimentoArbol,
  type ConteosDx,
  calcularArbol,
  valor,
  txtP,
  CAT_VP,
  CAT_FN,
  CAT_FP,
  COL_DX,
} from "./bayes-condicional-data";

export type VistaDx = "poblacion" | "prueba" | "positivos";

export interface BayesSceneProps {
  modo: Modo;
  // ── reducido
  poblacion: PoblacionDef;
  nABc: number;
  condicion: Condicion;
  // ── árbol
  experimento: ExperimentoArbol;
  invertido: boolean;
  /** Conteos simulados por hoja (B∩A, B∩Aᶜ, Bᶜ∩A, Bᶜ∩Aᶜ), o null. */
  simHojas: number[] | null;
  // ── diagnóstico
  categorias: Uint8Array;
  vistaDx: VistaDx;
  conteos: ConteosDx;
  ronda: 1 | 2;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Etiquetas ────────────────────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 10, col, apagada, izq }: { pos: Pt; children: ReactNode; df?: number; col?: string; apagada?: boolean; izq?: boolean }) {
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
          opacity: apagada ? 0.4 : 1,
          transition: "opacity .3s",
          transform: izq ? "translateY(-50%)" : undefined,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Un grupo que se acerca suavemente a su posición y escala objetivo. */
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
    // Suavizado por tiempo: el mismo recorrido a 144 o a 10 cuadros por segundo.
    const k = 1 - Math.pow(1 - vel, Math.min(dt, 0.25) * 60);
    const ks = 1 - Math.pow(0.86, Math.min(dt, 0.25) * 60);
    g.position.x += (objetivo[0] - g.position.x) * k;
    g.position.y += (objetivo[1] - g.position.y) * k;
    g.position.z += (objetivo[2] - g.position.z) * k;
    g.scale.setScalar(g.scale.x + (escala - g.scale.x) * ks);
  });
  return <group ref={ref}>{children}</group>;
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · EL ESPACIO MUESTRAL SE REDUCE
 * ════════════════════════════════════════════════════════════════════════ */

const COL_B = "#38bdf8";
const COL_BC = "#a78bfa";
const COL_A = "#fb923c";
const COL_CABEZA = "#e7d3bd";
const COL_APAGADO = "#1e293b";

interface PersonaPos {
  enB: boolean;
  enA: boolean;
  pos: Pt;
}

function acomodarPoblacion(p: PoblacionDef, nABc: number) {
  const nBc = p.total - p.nB;
  const FILAS = 10;
  const colsB = Math.max(1, Math.ceil(p.nB / FILAS));
  const colsBc = Math.max(1, Math.ceil(nBc / FILAS));
  const SX = 0.56;
  const SZ = 0.5;
  const GAP = 1.05;
  const ancho = (colsB - 1) * SX + GAP + (colsBc - 1) * SX;
  const x0B = -ancho / 2;
  const x0Bc = x0B + (colsB - 1) * SX + GAP;
  // Fila 0 al frente; quienes cumplen A ocupan las primeras filas de su bloque.
  const zDe = (fila: number) => ((FILAS - 1) / 2 - fila) * SZ;

  const personas: PersonaPos[] = [];
  for (let j = 0; j < p.nB; j++) {
    personas.push({ enB: true, enA: j < p.nAB, pos: [x0B + (j % colsB) * SX, 0, zDe(Math.floor(j / colsB))] });
  }
  for (let j = 0; j < nBc; j++) {
    personas.push({ enB: false, enA: j < nABc, pos: [x0Bc + (j % colsBc) * SX, 0, zDe(Math.floor(j / colsBc))] });
  }
  const filasB = Math.ceil(p.nB / colsB);
  const filasBc = Math.ceil(nBc / colsBc);
  const marco = (x0: number, cols: number, filas: number): Pt[] => {
    const xa = x0 - SX * 0.6;
    const xb = x0 + (cols - 1) * SX + SX * 0.6;
    const za = zDe(0) + SZ * 0.7;
    const zb = zDe(filas - 1) - SZ * 0.7;
    const y = -0.29;
    return [
      [xa, y, za],
      [xb, y, za],
      [xb, y, zb],
      [xa, y, zb],
      [xa, y, za],
    ];
  };
  return {
    personas,
    centroB: x0B + ((colsB - 1) * SX) / 2,
    centroBc: x0Bc + ((colsBc - 1) * SX) / 2,
    zAtras: zDe(FILAS - 1),
    zFrente: zDe(0),
    marcoB: marco(x0B, colsB, filasB),
    marcoBc: marco(x0Bc, colsBc, filasBc),
  };
}

function EscenaPoblacion({ poblacion, nABc, condicion, modoColor }: { poblacion: PoblacionDef; nABc: number; condicion: Condicion; modoColor: string }) {
  const lay = useMemo(() => acomodarPoblacion(poblacion, nABc), [poblacion, nABc]);
  const activa = (q: PersonaPos) => (condicion === "ninguna" ? true : condicion === "B" ? q.enB : condicion === "Bc" ? !q.enB : q.enA);
  const nBc = poblacion.total - poblacion.nB;

  return (
    <group position={[0, -0.2, 0.2]}>
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.31, 0]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#0b1424" roughness={0.9} />
      </mesh>

      {condicion === "B" && <Line points={lay.marcoB} color={modoColor} lineWidth={2.4} />}
      {condicion === "Bc" && <Line points={lay.marcoBc} color={modoColor} lineWidth={2.4} />}

      {lay.personas.map((q, i) => {
        const on = activa(q);
        const cuerpo = on ? (q.enB ? COL_B : COL_BC) : COL_APAGADO;
        const cabeza = on ? (q.enA ? COL_A : COL_CABEZA) : "#334155";
        return (
          <Movil key={`${poblacion.id}-${i}`} objetivo={[q.pos[0], on ? 0 : -0.3, q.pos[2]]} escala={on ? 1 : 0.72} vel={0.1}>
            <mesh position={[0, 0.02, 0]} castShadow>
              <capsuleGeometry args={[0.12, 0.22, 4, 10]} />
              <meshStandardMaterial color={cuerpo} roughness={0.45} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.34, 0]} castShadow>
              <sphereGeometry args={[0.1, 14, 14]} />
              <meshStandardMaterial color={cabeza} emissive={on && q.enA ? COL_A : "#000000"} emissiveIntensity={on && q.enA ? 0.75 : 0} roughness={0.4} />
            </mesh>
            {condicion === "A" && q.enA && (
              <mesh position={[0, -0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.17, 0.23, 24]} />
                <meshBasicMaterial color={modoColor} />
              </mesh>
            )}
          </Movil>
        );
      })}

      <Etiqueta pos={[lay.centroB, 1.05, lay.zAtras - 0.35]} col={`${COL_B}99`} apagada={condicion === "Bc"}>
        <span style={{ width: 9, height: 9, borderRadius: 3, background: COL_B }} />
        {poblacion.nombreB} · {poblacion.nB}
        <span style={{ color: COL_A }}>
          ({poblacion.cortoA}: {poblacion.nAB})
        </span>
      </Etiqueta>
      <Etiqueta pos={[lay.centroBc, 1.05, lay.zAtras - 0.35]} col={`${COL_BC}99`} apagada={condicion === "B"}>
        <span style={{ width: 9, height: 9, borderRadius: 3, background: COL_BC }} />
        {poblacion.nombreBc} · {nBc}
        <span style={{ color: COL_A }}>
          ({poblacion.cortoA}: {nABc})
        </span>
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · ÁRBOL DE DOS ETAPAS
 * ════════════════════════════════════════════════════════════════════════ */

const COL_RAMA_B = "#f472b6";
const COL_RAMA_BC = "#60a5fa";
const COL_RAMA_A = "#fbbf24";
const COL_RAMA_AC = "#64748b";

const RAIZ: Pt = [-4.4, 0, 0];
const NODO_B: Pt = [-1.5, 1.5, 0];
const NODO_BC: Pt = [-1.5, -1.5, 0];
const HOJAS: Pt[] = [
  [1.25, 2.25, 0],
  [1.25, 0.75, 0],
  [1.25, -0.75, 0],
  [1.25, -2.25, 0],
];
const BARRA_X = 1.8;
const BARRA_LARGO = 3.2;

/** Un tubo recto entre dos puntos. */
function Tubo({ a, b, radio, color, opacidad = 1 }: { a: Pt; b: Pt; radio: number; color: string; opacidad?: number }) {
  const { pos, quat, largo } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const l = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    const m = va.clone().add(vb).multiplyScalar(0.5);
    return { pos: [m.x, m.y, m.z] as Pt, quat: q, largo: l };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[radio, radio, largo, 14]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35 * opacidad} roughness={0.35} transparent opacity={opacidad} depthWrite={opacidad > 0.9} />
    </mesh>
  );
}

const N_PARTICULAS = 34;

interface Particula {
  t: number;
  vel: number;
  b: boolean;
  a: boolean;
}

function Particulas({ experimento, invertido }: { experimento: ExperimentoArbol; invertido: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const estado = useRef<Particula[] | null>(null);
  const pB = valor(experimento.pB);
  const pAB = valor(experimento.pAdadoB);
  const pABc = valor(experimento.pAdadoBc);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const nuevo = (t: number): Particula => {
      const b = Math.random() < pB;
      return { t, vel: 0.22 + Math.random() * 0.12, b, a: Math.random() < (b ? pAB : pABc) };
    };
    if (!estado.current) estado.current = Array.from({ length: N_PARTICULAS }, (_, i) => nuevo(-i / N_PARTICULAS));
    const paso = Math.min(dt, 0.05);
    estado.current.forEach((p, i) => {
      p.t += paso * p.vel;
      if (p.t >= 1.15) estado.current![i] = nuevo(0);
      const q = estado.current![i]!;
      const mesh = refs.current[i];
      if (!mesh) return;
      const nodo = q.b ? NODO_B : NODO_BC;
      const hoja = HOJAS[q.b ? (q.a ? 0 : 1) : q.a ? 2 : 3]!;
      const t = Math.max(0, Math.min(1, q.t));
      if (t < 0.5) {
        const u = t / 0.5;
        tmp.set(RAIZ[0] + (nodo[0] - RAIZ[0]) * u, RAIZ[1] + (nodo[1] - RAIZ[1]) * u, 0.02);
      } else {
        const u = (t - 0.5) / 0.5;
        tmp.set(nodo[0] + (hoja[0] - nodo[0]) * u, nodo[1] + (hoja[1] - nodo[1]) * u, 0.02);
      }
      mesh.position.copy(tmp);
      const visible = q.t >= 0 && q.t <= 1.05;
      const apagada = invertido && t >= 0.5 && !q.a;
      mesh.scale.setScalar(visible ? (q.t > 1 ? 1.6 : 1) : 0.001);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const col = t < 0.5 ? (q.b ? COL_RAMA_B : COL_RAMA_BC) : q.a ? COL_RAMA_A : COL_RAMA_AC;
      mat.color.set(col);
      mat.emissive.set(col);
      mat.opacity = apagada ? 0.15 : 1;
    });
  });

  return (
    <>
      {Array.from({ length: N_PARTICULAS }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.9} transparent />
        </mesh>
      ))}
    </>
  );
}

function EscenaArbol({ experimento, invertido, simHojas, accent, modoColor }: { experimento: ExperimentoArbol; invertido: boolean; simHojas: number[] | null; accent: string; modoColor: string }) {
  const e = experimento;
  const arbol = useMemo(() => calcularArbol(e), [e]);
  const radio = (p: number) => 0.022 + 0.1 * Math.sqrt(p);
  const totalSim = simHojas ? simHojas.reduce((a, b) => a + b, 0) : 0;
  const pB = valor(e.pB);
  const ramas2: { de: Pt; k: number; p: number; condicional: string; enA: boolean }[] = [
    { de: NODO_B, k: 0, p: pB * valor(e.pAdadoB), condicional: txtP(e, e.pAdadoB), enA: true },
    { de: NODO_B, k: 1, p: pB * valor(arbol.pAcDadoB), condicional: txtP(e, arbol.pAcDadoB), enA: false },
    { de: NODO_BC, k: 2, p: (1 - pB) * valor(e.pAdadoBc), condicional: txtP(e, e.pAdadoBc), enA: true },
    { de: NODO_BC, k: 3, p: (1 - pB) * valor(arbol.pAcDadoBc), condicional: txtP(e, arbol.pAcDadoBc), enA: false },
  ];

  return (
    <group position={[-0.2, -0.3, 0]}>
      {/* Etapa 1 */}
      <Tubo a={RAIZ} b={NODO_B} radio={radio(pB)} color={COL_RAMA_B} />
      <Tubo a={RAIZ} b={NODO_BC} radio={radio(1 - pB)} color={COL_RAMA_BC} />
      <Etiqueta pos={[(RAIZ[0] + NODO_B[0]) / 2 - 0.35, (RAIZ[1] + NODO_B[1]) / 2 + 0.38, 0]} col={`${COL_RAMA_B}88`} df={9}>
        {txtP(e, e.pB)}
      </Etiqueta>
      <Etiqueta pos={[(RAIZ[0] + NODO_BC[0]) / 2 - 0.35, (RAIZ[1] + NODO_BC[1]) / 2 - 0.38, 0]} col={`${COL_RAMA_BC}88`} df={9}>
        {txtP(e, arbol.pBc)}
      </Etiqueta>

      {/* Etapa 2 */}
      {ramas2.map((r) => (
        <group key={r.k}>
          <Tubo a={r.de} b={HOJAS[r.k]!} radio={radio(r.p)} color={r.enA ? COL_RAMA_A : COL_RAMA_AC} opacidad={invertido && !r.enA ? 0.18 : 1} />
          <Etiqueta
            pos={[(r.de[0] + HOJAS[r.k]![0]) / 2, (r.de[1] + HOJAS[r.k]![1]) / 2 + (r.k % 2 === 0 ? 0.3 : -0.3), 0]}
            col={`${r.enA ? COL_RAMA_A : COL_RAMA_AC}88`}
            df={9}
            apagada={invertido && !r.enA}
          >
            {r.condicional}
          </Etiqueta>
        </group>
      ))}

      {/* Nodos */}
      <mesh position={RAIZ}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#e2e8f0" emissiveIntensity={0.3} />
      </mesh>
      {[
        { p: NODO_B, col: COL_RAMA_B, txt: e.b },
        { p: NODO_BC, col: COL_RAMA_BC, txt: e.bc },
      ].map((n) => (
        <group key={n.txt}>
          <mesh position={n.p}>
            <sphereGeometry args={[0.17, 20, 20]} />
            <meshStandardMaterial color={n.col} emissive={n.col} emissiveIntensity={0.45} />
          </mesh>
          <Etiqueta pos={[n.p[0] - 0.1, n.p[1] + (n.p[1] > 0 ? 0.48 : -0.48), 0]} col={`${n.col}aa`} df={9}>
            {n.txt}
          </Etiqueta>
        </group>
      ))}

      {/* Hojas y barras de probabilidad conjunta */}
      {arbol.hojas.map((h) => {
        const pos = HOJAS[h.k]!;
        const apagada = invertido && !h.enA;
        const col = h.enA ? COL_RAMA_A : COL_RAMA_AC;
        const largo = Math.max(0.04, valor(h.p) * BARRA_LARGO);
        const frec = simHojas && totalSim > 0 ? simHojas[h.k]! / totalSim : null;
        return (
          <group key={`hoja-${h.k}`}>
            <mesh position={pos}>
              <sphereGeometry args={[0.13, 18, 18]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={apagada ? 0.05 : 0.6} transparent opacity={apagada ? 0.3 : 1} />
            </mesh>
            <mesh position={[BARRA_X + largo / 2, pos[1] + 0.09, 0]}>
              <boxGeometry args={[largo, 0.2, 0.2]} />
              <meshStandardMaterial color={invertido && h.enA ? accent : col} emissive={invertido && h.enA ? accent : col} emissiveIntensity={apagada ? 0.02 : 0.4} transparent opacity={apagada ? 0.2 : 1} />
            </mesh>
            {frec !== null && (
              <mesh position={[BARRA_X + Math.max(0.02, frec * BARRA_LARGO) / 2, pos[1] - 0.16, 0]}>
                <boxGeometry args={[Math.max(0.02, frec * BARRA_LARGO), 0.1, 0.1]} />
                <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.5} transparent opacity={apagada ? 0.25 : 0.95} />
              </mesh>
            )}
            <Etiqueta pos={[BARRA_X + Math.max(largo, frec !== null ? frec * BARRA_LARGO : 0) + 0.18, pos[1] + 0.02, 0]} col={`${col}88`} df={9} apagada={apagada} izq>
              <span style={{ color: "#cbd5e1", fontWeight: 700 }}>{h.etq}</span>
              {txtP(e, h.p)}
            </Etiqueta>
          </group>
        );
      })}

      <Etiqueta pos={[-1.5, 2.9, 0]} col="rgba(255,255,255,0.25)" df={10}>
        {e.etapa1}
      </Etiqueta>
      <Etiqueta pos={[1.25, 2.9, 0]} col="rgba(255,255,255,0.25)" df={10}>
        {e.etapa2}
      </Etiqueta>
      {invertido && (
        <Etiqueta pos={[BARRA_X + 0.2, -3.0, 0]} col={`${accent}aa`} df={9} izq>
          <i className="fa-solid fa-eye" style={{ color: accent }} />
          Sabemos: {e.etapa2.toLowerCase()} = {e.a}
        </Etiqueta>
      )}

      <Particulas experimento={e} invertido={invertido} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · PRUEBA DIAGNÓSTICA (InstancedMesh)
 * ════════════════════════════════════════════════════════════════════════ */

interface Destinos {
  pos: Float32Array;
  escala: Float32Array;
  color: Float32Array;
  rejilla: { ancho: number; fondo: number };
  /** Centro de cada muro y altura del más alto. */
  muros: { xVP: number; xFP: number; alto: number } | null;
}

function calcularDestinos(cat: Uint8Array, vista: VistaDx, conteos: ConteosDx): Destinos {
  const N = cat.length;
  const pos = new Float32Array(N * 3);
  const escala = new Float32Array(N);
  const color = new Float32Array(N * 3);
  const c = new THREE.Color();

  const cols = Math.max(1, Math.ceil(Math.sqrt(N * 2.6)));
  const filas = Math.ceil(N / cols);
  const sp = Math.min(0.36, 7.6 / cols);

  let muros: Destinos["muros"] = null;
  let cm = 1;
  let s = 0.3;
  if (vista === "positivos") {
    cm = Math.max(1, Math.ceil(Math.sqrt(Math.max(conteos.vp, conteos.fp, 1))));
    s = Math.min(0.27, 2.55 / cm);
    const medio = (cm * s) / 2 + 0.5;
    muros = { xVP: -medio, xFP: medio, alto: Math.ceil(Math.max(conteos.vp, conteos.fp, 1) / cm) * s };
  }

  let kVP = 0;
  let kFP = 0;
  for (let i = 0; i < N; i++) {
    const k = cat[i]!;
    const positivo = k === CAT_VP || k === CAT_FP;
    const enfermo = k === CAT_VP || k === CAT_FN;
    const gx = ((i % cols) - (cols - 1) / 2) * sp;
    const gz = (Math.floor(i / cols) - (filas - 1) / 2) * sp;

    if (vista === "positivos" && muros && positivo) {
      const j = k === CAT_VP ? kVP++ : kFP++;
      const xc = k === CAT_VP ? muros.xVP : muros.xFP;
      pos[i * 3] = xc + ((j % cm) - (cm - 1) / 2) * s;
      pos[i * 3 + 1] = s * 0.5 + Math.floor(j / cm) * s;
      pos[i * 3 + 2] = 1.4;
      escala[i] = s * 0.82;
    } else if (vista === "positivos") {
      pos[i * 3] = gx;
      pos[i * 3 + 1] = -0.2;
      pos[i * 3 + 2] = gz - 1.3;
      escala[i] = sp * 0.45;
    } else {
      pos[i * 3] = gx;
      pos[i * 3 + 1] = vista === "prueba" && positivo ? sp * 1.1 : 0;
      pos[i * 3 + 2] = gz;
      escala[i] = sp * 0.82;
    }

    if (vista === "poblacion") c.set(enfermo ? COL_DX.enfermo : COL_DX.sano);
    else if (k === CAT_VP) c.set(COL_DX.vp);
    else if (k === CAT_FN) c.set(COL_DX.fn);
    else if (k === CAT_FP) c.set(COL_DX.fp);
    else c.set(COL_DX.vn);
    if (vista === "positivos" && !positivo) c.lerp(new THREE.Color("#0f172a"), 0.55);
    color[i * 3] = c.r;
    color[i * 3 + 1] = c.g;
    color[i * 3 + 2] = c.b;
  }
  return { pos, escala, color, rejilla: { ancho: cols * sp, fondo: filas * sp }, muros };
}

function Personas({ categorias, destinos }: { categorias: Uint8Array; destinos: Destinos }) {
  const N = categorias.length;
  const ref = useRef<THREE.InstancedMesh>(null);
  const actual = useRef<{ pos: Float32Array; escala: Float32Array; color: Float32Array } | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const grande = N > 2500;

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!actual.current || actual.current.escala.length !== N) {
      actual.current = { pos: destinos.pos.slice(), escala: new Float32Array(N), color: destinos.color.slice() };
    }
    const a = actual.current;
    const k = 1 - Math.pow(0.91, Math.min(dt, 0.25) * 60);
    let mov = 0;
    for (let i = 0; i < N; i++) {
      for (let d = 0; d < 3; d++) {
        const idx = i * 3 + d;
        const dp = destinos.pos[idx]! - a.pos[idx]!;
        a.pos[idx] = a.pos[idx]! + dp * k;
        const dc = destinos.color[idx]! - a.color[idx]!;
        a.color[idx] = a.color[idx]! + dc * k;
        mov += Math.abs(dp) + Math.abs(dc);
      }
      const de = destinos.escala[i]! - a.escala[i]!;
      a.escala[i] = a.escala[i]! + de * k;
      mov += Math.abs(de);
    }
    // Sin movimiento pendiente no se reescriben las matrices.
    if (mov < 1e-4 * N && mesh.userData.listo) return;
    for (let i = 0; i < N; i++) {
      dummy.position.set(a.pos[i * 3]!, a.pos[i * 3 + 1]!, a.pos[i * 3 + 2]!);
      dummy.scale.setScalar(a.escala[i]!);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      col.setRGB(a.color[i * 3]!, a.color[i * 3 + 1]!, a.color[i * 3 + 2]!);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.userData.listo = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} castShadow={!grande} frustumCulled={false}>
      {grande ? <boxGeometry args={[0.8, 1, 0.8]} /> : <capsuleGeometry args={[0.36, 0.5, 3, 8]} />}
      <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.05} />
    </instancedMesh>
  );
}

function EscenaDiagnostico({ categorias, vistaDx, conteos, ronda, accent }: { categorias: Uint8Array; vistaDx: VistaDx; conteos: ConteosDx; ronda: 1 | 2; accent: string }) {
  const destinos = useMemo(() => calcularDestinos(categorias, vistaDx, conteos), [categorias, vistaDx, conteos]);
  const positivos = conteos.vp + conteos.fp;
  const vpp = positivos === 0 ? 0 : conteos.vp / positivos;
  const miles = (n: number) => n.toLocaleString("es-MX").replace(/,/g, " ");
  const zAtras = -destinos.rejilla.fondo / 2;
  const prefijo = ronda === 2 ? "2.ª prueba · " : "";

  return (
    <group position={[0, -0.85, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, -0.2]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#0b1424" roughness={0.9} />
      </mesh>

      <Personas key={`${categorias.length}-${ronda}`} categorias={categorias} destinos={destinos} />

      {vistaDx === "poblacion" && (
        <Etiqueta pos={[0, 0.95, zAtras - 0.3]} col="rgba(255,255,255,0.25)" df={7.5}>
          {prefijo}
          <span style={{ width: 9, height: 9, borderRadius: 3, background: COL_DX.enfermo }} />
          Enfermos: {miles(conteos.enfermos)}
          <span style={{ width: 9, height: 9, borderRadius: 3, background: COL_DX.sano, marginLeft: 6 }} />
          Sanos: {miles(conteos.sanos)}
        </Etiqueta>
      )}
      {vistaDx === "prueba" && (
        <Etiqueta pos={[0, 0.95, zAtras - 0.3]} col={`${accent}88`} df={7.5}>
          {prefijo}
          <i className="fa-solid fa-arrow-up" style={{ color: accent }} />
          Salieron positivos: {miles(positivos)} de {miles(conteos.total)}
        </Etiqueta>
      )}
      {vistaDx === "positivos" && destinos.muros && (
        <>
          <Etiqueta pos={[destinos.muros.xVP, -0.05, 2.15]} col={`${COL_DX.vp}aa`} df={6.5}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: COL_DX.vp }} />
            Verdaderos positivos · {miles(conteos.vp)}
          </Etiqueta>
          <Etiqueta pos={[destinos.muros.xFP, -0.05, 2.15]} col={`${COL_DX.fp}aa`} df={6.5}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: COL_DX.fp }} />
            Falsos positivos · {miles(conteos.fp)}
          </Etiqueta>
          <Etiqueta pos={[0, destinos.muros.alto + 0.5, 1.4]} col={`${accent}cc`} df={7}>
            {prefijo}VPP = {miles(conteos.vp)} / {miles(positivos)} = {(vpp * 100).toFixed(1)} %
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */
export default function BayesCondicionalScene(props: BayesSceneProps) {
  const { modo, poblacion, nABc, condicion, experimento, invertido, simHojas, categorias, vistaDx, conteos, ronda, accent, modoColor, resetNonce } = props;
  const camara: Pt = modo === "reducido" ? [0, 5.3, 7.4] : modo === "arbol" ? [0.3, 0, 11.2] : [0, 4.1, 8.4];
  const objetivo: Pt = modo === "reducido" ? [0, -0.4, 0.2] : modo === "arbol" ? [0, 0, 0] : [0, 0.4, 0];

  return (
    <Canvas key={`${modo}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: camara, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 16, 36]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, -2, 5]} intensity={0.45} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {modo === "reducido" && <EscenaPoblacion poblacion={poblacion} nABc={nABc} condicion={condicion} modoColor={modoColor} />}
      {modo === "arbol" && <EscenaArbol experimento={experimento} invertido={invertido} simHojas={simHojas} accent={accent} modoColor={modoColor} />}
      {modo === "diagnostico" && <EscenaDiagnostico categorias={categorias} vistaDx={vistaDx} conteos={conteos} ronda={ronda} accent={accent} />}

      <OrbitControls enablePan={false} enableZoom minDistance={5} maxDistance={18} maxPolarAngle={Math.PI * 0.62} minPolarAngle={Math.PI * 0.12} target={objetivo} />
      <EffectComposer>
        <Bloom intensity={0.36} luminanceThreshold={0.45} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
