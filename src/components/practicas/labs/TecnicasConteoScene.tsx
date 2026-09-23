"use client";

/**
 * Escena 3D del laboratorio "Técnicas de conteo: contar para decidir"
 * (PM-VI-P11). Tres modos:
 *
 *  - multiplicativo: un árbol de decisiones de izquierda a derecha. Cada etapa
 *                    multiplica las ramas; cada hoja es un resultado distinto.
 *  - orden:          los cinco estudiantes del ejercicio A2. Con orden, suben a
 *                    un podio donde cada escalón es distinto; sin orden, se
 *                    sientan a una mesa redonda donde los asientos son
 *                    equivalentes (y por eso se acomodan siempre igual).
 *  - reemplazo:      una urna transparente y dos pedestales de extracción. Con
 *                    reemplazo, la primera bola vuelve a la urna y en su
 *                    pedestal queda solo el registro de lo que salió.
 *
 * Toda animación ocurre en useFrame mutando refs (nunca en el render), conforme
 * al React Compiler. NO se usa <Text> de drei (cuelga el chunk con Turbopack):
 * el texto del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type UrnaDef, ETAPAS, PERSONAS, hojasDelArbol } from "./tecnicas-conteo-data";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";

export interface ConteoSceneProps {
  modo: Modo;
  // ── multiplicativo
  opciones: number[];
  // ── orden
  r: number;
  importaOrden: boolean;
  /** Índices de PERSONAS en el arreglo actual (el orden importa en el podio). */
  arreglo: number[];
  // ── reemplazo
  urna: UrnaDef;
  conReemplazo: boolean;
  primera: number | null;
  segunda: number | null;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

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

/** Un grupo que se acerca suavemente a su posición objetivo. */
function Movil({ objetivo, children, vel = 0.12, escala = 1 }: { objetivo: Pt; children: ReactNode; vel?: number; escala?: number }) {
  const ref = useRef<THREE.Group>(null);
  const primera = useRef(true);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (primera.current) {
      g.position.set(objetivo[0], objetivo[1], objetivo[2]);
      g.scale.setScalar(0.001);
      primera.current = false;
    }
    g.position.x += (objetivo[0] - g.position.x) * vel;
    g.position.y += (objetivo[1] - g.position.y) * vel;
    g.position.z += (objetivo[2] - g.position.z) * vel;
    const s = g.scale.x + (escala - g.scale.x) * 0.14;
    g.scale.setScalar(s);
  });
  return <group ref={ref}>{children}</group>;
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · ÁRBOL DEL PRINCIPIO MULTIPLICATIVO
 * ════════════════════════════════════════════════════════════════════════ */

interface NodoArbol {
  clave: string;
  prof: number;
  /** Índice de la opción elegida en su etapa (−1 en la raíz). */
  opcion: number;
  pos: Pt;
}

function construirArbol(opciones: number[]): { nodos: NodoArbol[]; aristas: Pt[]; hojas: number } {
  const hojas = hojasDelArbol(opciones);
  const L = hojas.length;
  const ANCHO = 8.6;
  const ALTO = 4.5;
  const paso = L > 1 ? Math.min(0.95, ALTO / (L - 1)) : 0;
  const xDe = (prof: number) => -ANCHO / 2 + (prof * ANCHO) / opciones.length;
  const yHoja = (j: number) => ((L - 1) / 2 - j) * paso;

  // Un nodo por cada prefijo de ruta; su altura es el promedio de sus hojas.
  const acumulado = new Map<string, { suma: number; n: number; prof: number; opcion: number }>();
  hojas.forEach((ruta, j) => {
    for (let d = 0; d <= ruta.length; d++) {
      const clave = ruta.slice(0, d).join("-");
      const a = acumulado.get(clave) ?? { suma: 0, n: 0, prof: d, opcion: d === 0 ? -1 : ruta[d - 1]! };
      a.suma += yHoja(j);
      a.n += 1;
      acumulado.set(clave, a);
    }
  });

  const nodos: NodoArbol[] = [];
  const posDe = new Map<string, Pt>();
  for (const [clave, a] of acumulado) {
    const pos: Pt = [xDe(a.prof), a.suma / a.n, 0];
    posDe.set(clave, pos);
    nodos.push({ clave, prof: a.prof, opcion: a.opcion, pos });
  }
  const aristas: Pt[] = [];
  for (const n of nodos) {
    if (n.prof === 0) continue;
    const padre = n.clave.includes("-") ? n.clave.slice(0, n.clave.lastIndexOf("-")) : "";
    const pp = posDe.get(padre);
    if (pp) aristas.push(pp, n.pos);
  }
  return { nodos, aristas, hojas: L };
}

function EscenaArbol({ opciones, accent }: { opciones: number[]; accent: string }) {
  const { nodos, aristas, hojas } = useMemo(() => construirArbol(opciones), [opciones]);
  const cuentaProf = (d: number) => nodos.filter((n) => n.prof === d).length;
  // Separación vertical entre nodos hermanos de una profundidad: si no cabe la
  // etiqueta encima, va a la izquierda del nodo.
  const huecoProf = (d: number) => {
    const ys = nodos.filter((n) => n.prof === d).map((n) => n.pos[1]);
    return ys.length > 1 ? Math.abs(ys[0]! - ys[1]!) : Infinity;
  };
  const radioHoja = Math.max(0.05, Math.min(0.16, 2.2 / Math.max(hojas, 1)));
  const ANCHO = 8.6;

  return (
    <group position={[-0.1, -0.05, 0]}>
      {/* LAS RAMAS TIENEN CUERPO.
          Con `<Line>` eran trazos de 1,6 PÍXELES: no reciben luz, no proyectan
          sombra y miden lo mismo de cerca que de lejos, así que el árbol se
          leía como un dibujo pegado encima de la escena. `aristas` viene por
          pares (padre, hijo), de ahí el salto de dos en dos. */}
      {Array.from({ length: Math.floor(aristas.length / 2) }, (_, i) => {
        const desde = aristas[i * 2];
        const hasta = aristas[i * 2 + 1];
        if (!desde || !hasta) return null;
        return <CurvaTubo key={`rama-${i}`} puntos={[desde, hasta]} color="#64748b" grosor={0.028} brillo={0.4} />;
      })}

      {nodos.map((n) => {
        const esHoja = n.prof === opciones.length;
        const color = n.prof === 0 ? "#e2e8f0" : ETAPAS[n.prof - 1]!.color;
        const radio = n.prof === 0 ? 0.24 : esHoja ? radioHoja : Math.max(0.09, radioHoja * 1.25);
        const conEtq = n.prof > 0 && !esHoja && cuentaProf(n.prof) <= 12;
        return (
          <Movil key={n.clave || "raiz"} objetivo={n.pos}>
            <mesh castShadow>
              <sphereGeometry args={[radio, 18, 18]} />
              <meshStandardMaterial color={esHoja ? accent : color} emissive={esHoja ? accent : color} emissiveIntensity={esHoja ? 0.7 : 0.35} roughness={0.35} metalness={0.2} />
            </mesh>
            {conEtq && (
              <Letra pos={huecoProf(n.prof) >= 0.8 ? [0, radio + 0.2, 0] : [-radio - 0.3, 0.02, 0]} col={color} size={13} df={8}>
                {ETAPAS[n.prof - 1]!.prefijo}
                {n.opcion + 1}
              </Letra>
            )}
          </Movil>
        );
      })}

      {/* Encabezados de etapa */}
      {opciones.map((n, k) => (
        <Etiqueta key={`etapa-${k}`} pos={[-ANCHO / 2 + ((k + 1) * ANCHO) / opciones.length, 2.75, 0]} col={`${ETAPAS[k]!.color}88`} df={10}>
          <i className={`fa-solid ${ETAPAS[k]!.icono}`} style={{ color: ETAPAS[k]!.color }} />
          {ETAPAS[k]!.nombre}: {n}
        </Etiqueta>
      ))}

      <Etiqueta pos={[-ANCHO / 2, -0.75, 0]} col={`${accent}aa`} df={9}>
        <i className="fa-solid fa-leaf" style={{ color: accent }} />
        {opciones.join(" × ")} = {hojas} resultados
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · PODIO Y COMITÉ
 * ════════════════════════════════════════════════════════════════════════ */

const ALTURAS_PODIO = [1.05, 0.75, 0.55, 0.38, 0.24];
const X_PODIO = [0, -1.35, 1.35, -2.7, 2.7];
const ORDINAL = ["1.º", "2.º", "3.º", "4.º", "5.º"];

function Muneco({ color, nombre, destacado }: { color: string; nombre: string; destacado: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.42, 6, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={destacado ? 0.45 : 0.08} roughness={0.45} transparent opacity={destacado ? 1 : 0.5} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <sphereGeometry args={[0.2, 18, 18]} />
        <meshStandardMaterial color="#f5d0a9" roughness={0.6} transparent opacity={destacado ? 1 : 0.5} />
      </mesh>
      <Letra pos={[0, 1.48, 0]} col={destacado ? "#fff" : "rgba(255,255,255,0.45)"} size={13} df={8}>
        {nombre}
      </Letra>
    </group>
  );
}

function EscenaOrden({ r, importaOrden, arreglo, modoColor }: { r: number; importaOrden: boolean; arreglo: number[]; modoColor: string }) {
  // En la mesa el orden no importa: los asientos se asignan por orden
  // alfabético, así el mismo comité se ve idéntico aunque cambie el arreglo.
  const sentados = importaOrden ? arreglo : [...arreglo].sort((a, b) => a - b);
  const radioMesa = 0.75 + r * 0.22;

  const objetivoDe = (persona: number): { pos: Pt; dentro: boolean } => {
    const lugar = sentados.indexOf(persona);
    if (lugar >= 0) {
      if (importaOrden) return { pos: [X_PODIO[lugar]!, -1.2 + ALTURAS_PODIO[lugar]!, 0.3], dentro: true };
      // Asientos repartidos por el arco del fondo, de cara a la cámara: así la
      // mesa no tapa a nadie.
      const ang = r === 1 ? -Math.PI / 2 : Math.PI * (1.08 + (0.84 * lugar) / (r - 1));
      return { pos: [Math.cos(ang) * (radioMesa + 0.35), -1.2 + 0.05, Math.sin(ang) * (radioMesa + 0.35) * 0.8], dentro: true };
    }
    // Quienes no están esperan a los lados, alternando izquierda y derecha.
    const fuera = PERSONAS.map((_, i) => i).filter((i) => !sentados.includes(i));
    const k = fuera.indexOf(persona);
    const lado = k % 2 === 0 ? -1 : 1;
    return { pos: [lado * (3.75 + Math.floor(k / 2) * 0.85), -1.2, 0.9], dentro: false };
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Piso */}
      <mesh position={[0, -1.25, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 64]} />
        <meshStandardMaterial color="#0b1526" roughness={0.9} />
      </mesh>

      {importaOrden ? (
        Array.from({ length: r }, (_, i) => (
          <group key={`esc-${i}`}>
            <mesh position={[X_PODIO[i]!, -1.25 + ALTURAS_PODIO[i]! / 2, 0.3]} castShadow receiveShadow>
              <boxGeometry args={[1.15, ALTURAS_PODIO[i]!, 1]} />
              <meshStandardMaterial color={i === 0 ? "#fbbf24" : i === 1 ? "#cbd5e1" : i === 2 ? "#d97706" : "#475569"} roughness={0.35} metalness={0.45} />
            </mesh>
            <Letra pos={[X_PODIO[i]!, -1.25 + ALTURAS_PODIO[i]! / 2, 0.82]} col="#04121f" size={15} df={8}>
              {ORDINAL[i]}
            </Letra>
          </group>
        ))
      ) : (
        <group>
          <mesh position={[0, -0.95, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[radioMesa, radioMesa, 0.12, 48]} />
            <meshStandardMaterial color="#7c5a3a" roughness={0.55} metalness={0.1} />
          </mesh>
          <mesh position={[0, -1.1, 0]}>
            <cylinderGeometry args={[0.12, 0.2, 0.3, 16]} />
            <meshStandardMaterial color="#5b4129" roughness={0.7} />
          </mesh>
          <Letra pos={[0, -0.86, radioMesa * 0.55]} col="#fde68a" size={12} df={8}>
            comité
          </Letra>
        </group>
      )}

      {PERSONAS.map((p, i) => {
        const { pos, dentro } = objetivoDe(i);
        return (
          <Movil key={p.nombre} objetivo={pos} vel={0.1}>
            <Muneco color={p.color} nombre={p.nombre} destacado={dentro} />
          </Movil>
        );
      })}

      <Etiqueta pos={[0, 2.45, 0]} col={`${modoColor}88`} df={10}>
        <i className={`fa-solid ${importaOrden ? "fa-ranking-star" : "fa-people-group"}`} style={{ color: modoColor }} />
        {importaOrden ? `Podio de ${r}: cada escalón es distinto` : `Comité de ${r}: los asientos son equivalentes`}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · URNA CON Y SIN REEMPLAZO
 * ════════════════════════════════════════════════════════════════════════ */

const URNA_X = -2.1;
const URNA_R = 1.25;
const URNA_ALTO = 2.7;
const URNA_Y0 = -1.5;
const SLOT: Pt[] = [
  [0.95, -0.35, 0],
  [3.15, -0.35, 0],
];

function radioBola(total: number): number {
  return total > 20 ? 0.145 : total > 8 ? 0.27 : 0.34;
}

/** Posiciones deterministas de las bolas dentro de la urna, por capas desde el fondo. */
function empacar(total: number): Pt[] {
  const rb = radioBola(total);
  const d = rb * 2.05;
  const out: Pt[] = [];
  for (let capa = 0; out.length < total && capa < 60; capa++) {
    const y = URNA_Y0 + rb + 0.06 + capa * d * 0.9;
    const desfase = capa % 2 === 0 ? 0 : d / 2;
    for (let gx = -URNA_R; gx <= URNA_R && out.length < total; gx += d) {
      for (let gz = -URNA_R; gz <= URNA_R && out.length < total; gz += d) {
        const x = gx + desfase;
        const z = gz + desfase;
        if (Math.hypot(x, z) <= URNA_R - rb - 0.05) out.push([URNA_X + x, y, z]);
      }
    }
  }
  return out;
}

function EscenaUrna({
  urna,
  conReemplazo,
  primera,
  segunda,
  modoColor,
}: {
  urna: UrnaDef;
  conReemplazo: boolean;
  primera: number | null;
  segunda: number | null;
  modoColor: string;
}) {
  const posiciones = useMemo(() => empacar(urna.total), [urna.total]);
  const rb = radioBola(urna.total);
  // Fuera de la urna la bola se agranda hasta un tamaño legible, sea cual sea la urna.
  const escalaFuera = Math.max(1, 0.36 / rb);
  const rbFuera = rb * escalaFuera;
  const esEspecial = (i: number) => i >= urna.total - urna.marcadas;
  const COL_ESP = "#fbbf24";
  const COL_NORMAL = urna.id === "dado" ? "#e2e8f0" : urna.id === "reyes" ? "#94a3b8" : "#60a5fa";

  // Con reemplazo, al sacar la segunda la primera ya volvió: en su pedestal
  // queda solo un registro translúcido de lo que salió.
  const primeraVolvio = conReemplazo && segunda !== null;

  const objetivoBola = (i: number): Pt => {
    if (i === segunda) return [SLOT[1]![0], SLOT[1]![1] + rbFuera + 0.1, SLOT[1]![2]];
    if (i === primera && !primeraVolvio) return [SLOT[0]![0], SLOT[0]![1] + rbFuera + 0.1, SLOT[0]![2]];
    return posiciones[i] ?? [URNA_X, URNA_Y0 + 0.3, 0];
  };

  const etiquetaDe = (i: number | null) => (i === null ? "—" : urna.etiquetas ? urna.etiquetas[i] : esEspecial(i) ? urna.especial : `no ${urna.especial}`);

  return (
    <group position={[-0.2, 0.1, 0]}>
      {/* Urna de vidrio */}
      <mesh position={[URNA_X, URNA_Y0 + URNA_ALTO / 2, 0]}>
        <cylinderGeometry args={[URNA_R, URNA_R * 0.92, URNA_ALTO, 48, 1, true]} />
        <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.16} roughness={0.05} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[URNA_X, URNA_Y0, 0]} receiveShadow>
        <cylinderGeometry args={[URNA_R * 0.92, URNA_R * 0.92, 0.08, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[URNA_X, URNA_Y0 + URNA_ALTO, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[URNA_R, 0.035, 10, 64]} />
        <meshStandardMaterial color="#bae6fd" emissive="#7dd3fc" emissiveIntensity={0.35} />
      </mesh>

      {/* Pedestales */}
      {SLOT.map((s, k) => (
        <group key={`slot-${k}`}>
          <mesh position={[s[0], s[1] - 0.18, s[2]]} castShadow receiveShadow>
            <cylinderGeometry args={[0.55, 0.62, 0.36, 36]} />
            <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.4} />
          </mesh>
          <mesh position={[s[0], s[1] + 0.005, s[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.42, 0.5, 40]} />
            <meshBasicMaterial color={modoColor} />
          </mesh>
          <Etiqueta pos={[s[0], s[1] - 0.85, s[2]]} col={`${modoColor}77`} df={9}>
            {k + 1}.ª: {etiquetaDe(k === 0 ? primera : segunda)}
          </Etiqueta>
        </group>
      ))}

      {/* Registro de la primera, si ya volvió a la urna */}
      {primeraVolvio && primera !== null && (
        <mesh position={[SLOT[0]![0], SLOT[0]![1] + rbFuera + 0.1, SLOT[0]![2]]}>
          <sphereGeometry args={[rbFuera, 20, 20]} />
          <meshStandardMaterial color={esEspecial(primera) ? COL_ESP : COL_NORMAL} transparent opacity={0.28} wireframe />
        </mesh>
      )}

      {/* Bolas */}
      {Array.from({ length: urna.total }, (_, i) => {
        const esp = esEspecial(i);
        const fuera = i === segunda || (i === primera && !primeraVolvio);
        return (
          <Movil key={`${urna.id}-${i}`} objetivo={objetivoBola(i)} vel={0.11} escala={fuera ? escalaFuera : 1}>
            <mesh castShadow>
              <sphereGeometry args={[rb, 20, 20]} />
              <meshStandardMaterial color={esp ? COL_ESP : COL_NORMAL} emissive={esp ? COL_ESP : "#000000"} emissiveIntensity={esp ? (fuera ? 0.9 : 0.4) : 0} roughness={0.3} metalness={esp ? 0.55 : 0.15} />
            </mesh>
            {urna.etiquetas && (
              <Letra pos={[0, 0, rb + 0.02]} col="#04121f" size={14} df={7}>
                {urna.etiquetas[i]}
              </Letra>
            )}
          </Movil>
        );
      })}

      <Etiqueta pos={[URNA_X, URNA_Y0 + URNA_ALTO + 0.55, 0]} col={`${modoColor}88`} df={10}>
        <i className="fa-solid fa-circle" style={{ color: COL_ESP, fontSize: 9 }} />
        {urna.rotulo}
      </Etiqueta>
      <Etiqueta pos={[(SLOT[0]![0] + SLOT[1]![0]) / 2, 1.55, 0]} col={conReemplazo ? "#34d39988" : "#f8717188"} df={10}>
        <i className={`fa-solid ${conReemplazo ? "fa-rotate-left" : "fa-ban"}`} style={{ color: conReemplazo ? "#34d399" : "#f87171" }} />
        {conReemplazo ? "Con reemplazo: la primera vuelve a la urna" : "Sin reemplazo: la primera se queda fuera"}
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */
export default function TecnicasConteoScene(props: ConteoSceneProps) {
  const { modo, opciones, r, importaOrden, arreglo, urna, conReemplazo, primera, segunda, accent, modoColor, resetNonce } = props;
  const camara: Pt = modo === "multiplicativo" ? [0, 0.2, 10.5] : modo === "orden" ? [0, 2.4, 8.6] : [0.4, 1.4, 8.8];

  return (
    <Canvas key={`${modo}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: camara, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento={accent} />
      <pointLight position={[-6, -2, 5]} intensity={0.45} color={modoColor} />

      {modo === "multiplicativo" && <EscenaArbol opciones={opciones} accent={accent} />}
      {modo === "orden" && <EscenaOrden r={r} importaOrden={importaOrden} arreglo={arreglo} modoColor={modoColor} />}
      {modo === "reemplazo" && <EscenaUrna urna={urna} conReemplazo={conReemplazo} primera={primera} segunda={segunda} modoColor={modoColor} />}

      <OrbitControls enablePan={false} enableZoom minDistance={5} maxDistance={18} maxPolarAngle={Math.PI * 0.62} minPolarAngle={Math.PI * 0.18} target={[0, modo === "orden" ? -0.2 : 0, 0]} />
      <EffectComposer>
        <Bloom intensity={0.38} luminanceThreshold={0.42} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
