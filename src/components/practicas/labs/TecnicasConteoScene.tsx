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
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type UrnaDef, ETAPAS, PERSONAS, hojasDelArbol } from "./tecnicas-conteo-data";
import { Escenario } from "./_escenario";

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

const CAM_FOV = 42;

/* ── Etiquetas ────────────────────────────────────────────────────────── */
function Etiqueta({ pos, children, col }: { pos: Pt; children: ReactNode; col?: string }) {
  const { size } = useThree();
  // En pantallas angostas la información ya está en el panel: no se tapa la escena.
  if (size.width < 640) return null;
  return (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
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
          fontSize: 14,
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

function Letra({ pos, children, col = "#e2e8f0", size = 14 }: { pos: Pt; children: ReactNode; col?: string; size?: number }) {
  return (
    <Html position={pos} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: size, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>{children}</div>
    </Html>
  );
}

/**
 * Encuadre: el contenido llena ~60 % del alto, entre la barra de arriba (~64 px)
 * y la misión de abajo (~150 px), y cabe a lo ancho aunque la pantalla sea angosta.
 */
function Ajuste({ dist, ancho, alto, children }: { dist: number; ancho: number; alto: number; children: ReactNode }) {
  const { size } = useThree();
  const visH = 2 * dist * Math.tan((CAM_FOV * Math.PI) / 360);
  const visW = (visH * size.width) / Math.max(1, size.height);
  const libre = Math.max(0.3, (size.height - 214) / Math.max(1, size.height));
  const k = Math.min(1, visW / ancho, (visH * libre) / alto);
  const dy = (visH * 43) / Math.max(1, size.height);
  return (
    <group position={[0, dy, 0]} scale={k}>
      {children}
    </group>
  );
}

/** Muchas esferas iguales en UN solo dibujo (instancing). */
function EsferasInst({ pts, radio, color, emissive = "#000000", emi = 0, metal = 0.15 }: { pts: Pt[]; radio: number; color: string; emissive?: string; emi?: number; metal?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    pts.forEach((p, i) => {
      o.position.set(p[0], p[1], p[2]);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [pts]);
  if (pts.length === 0) return null;
  return (
    <instancedMesh key={pts.length} ref={ref} args={[undefined, undefined, pts.length]} castShadow>
      <sphereGeometry args={[radio, 16, 16]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emi} roughness={0.3} metalness={metal} />
    </instancedMesh>
  );
}

/** Ramas del árbol: cilindros delgados, todos en un solo dibujo. `aristas` viene por pares (padre, hijo). */
function RamasInst({ aristas, grosor, color }: { aristas: Pt[]; grosor: number; color: string }) {
  const n = Math.floor(aristas.length / 2);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const arriba = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < n; i++) {
      const a = new THREE.Vector3(...aristas[i * 2]!);
      const b = new THREE.Vector3(...aristas[i * 2 + 1]!);
      const dir = b.clone().sub(a);
      const largo = Math.max(dir.length(), 1e-4);
      o.position.copy(a).add(b).multiplyScalar(0.5);
      o.quaternion.setFromUnitVectors(arriba, dir.normalize());
      o.scale.set(grosor, largo, grosor);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [aristas, n, grosor]);
  if (n === 0) return null;
  return (
    <instancedMesh key={n} ref={ref} args={[undefined, undefined, n]}>
      <cylinderGeometry args={[1, 1, 1, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.5} />
    </instancedMesh>
  );
}

/** Un grupo que se acerca suavemente a su posición objetivo. */
function Movil({ objetivo, children, vel = 0.12, escala = 1, origen }: { objetivo: Pt; children: ReactNode; vel?: number; escala?: number; origen?: Pt }) {
  const ref = useRef<THREE.Group>(null);
  const primera = useRef(true);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (primera.current) {
      const o0 = origen ?? objetivo;
      g.position.set(o0[0], o0[1], o0[2]);
      g.scale.setScalar(origen ? 1 : 0.001);
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
  const hojasPts = useMemo(() => nodos.filter((n) => n.prof === opciones.length).map((n) => n.pos), [nodos, opciones.length]);

  return (
    <group position={[-0.1, -0.05, 0]}>
      {/* Ramas y hojas: un solo dibujo cada una (hasta 64 hojas). */}
      <RamasInst aristas={aristas} grosor={0.028} color="#64748b" />
      <EsferasInst pts={hojasPts} radio={radioHoja} color={accent} emissive={accent} emi={0.7} metal={0.2} />

      {nodos.map((n) => {
        const esHoja = n.prof === opciones.length;
        if (esHoja) return null;
        const color = n.prof === 0 ? "#e2e8f0" : ETAPAS[n.prof - 1]!.color;
        const radio = n.prof === 0 ? 0.24 : Math.max(0.09, radioHoja * 1.25);
        const conEtq = n.prof > 0 && cuentaProf(n.prof) <= 6;
        return (
          <Movil key={n.clave || "raiz"} objetivo={n.pos}>
            <mesh castShadow>
              <sphereGeometry args={[radio, 18, 18]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} metalness={0.2} />
            </mesh>
            {conEtq && (
              <Letra pos={huecoProf(n.prof) >= 0.8 ? [0, radio + 0.2, 0] : [-radio - 0.3, 0.02, 0]} col={color} size={14}>
                {ETAPAS[n.prof - 1]!.prefijo}
                {n.opcion + 1}
              </Letra>
            )}
          </Movil>
        );
      })}

      {/* Encabezados de etapa */}
      {opciones.map((n, k) => (
        <Etiqueta key={`etapa-${k}`} pos={[-ANCHO / 2 + ((k + 1) * ANCHO) / opciones.length, 2.75, 0]} col={`${ETAPAS[k]!.color}88`}>
          <i className={`fa-solid ${ETAPAS[k]!.icono}`} style={{ color: ETAPAS[k]!.color }} />
          {ETAPAS[k]!.nombre}: {n}
        </Etiqueta>
      ))}

      <Etiqueta pos={[-ANCHO / 2, -0.75, 0]} col={`${accent}aa`}>
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
      <Letra pos={[0, 1.48, 0]} col={destacado ? "#fff" : "rgba(255,255,255,0.45)"} size={14}>
        {nombre}
      </Letra>
    </group>
  );
}

function EscenaOrden({ r, importaOrden, arreglo }: { r: number; importaOrden: boolean; arreglo: number[] }) {
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
            <Letra pos={[X_PODIO[i]!, -1.25 + ALTURAS_PODIO[i]! / 2, 0.82]} col="#04121f" size={15}>
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
          <Letra pos={[0, -0.86, radioMesa * 0.55]} col="#fde68a" size={14}>
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

  const instanciar = urna.total > 30;
  const fueraDeUrna = (i: number) => i === segunda || (i === primera && !primeraVolvio);
  const ptsNormales = useMemo(
    () => posiciones.filter((_, i) => !esEspecial(i) && !fueraDeUrna(i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posiciones, primera, segunda, primeraVolvio, urna.id],
  );
  const ptsEspeciales = useMemo(
    () => posiciones.filter((_, i) => esEspecial(i) && !fueraDeUrna(i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posiciones, primera, segunda, primeraVolvio, urna.id],
  );

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
          <Etiqueta pos={[s[0], s[1] - 0.85, s[2]]} col={`${modoColor}77`}>
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

      {/* Bolas. Con muchas (la baraja), las que siguen en la urna van en un solo dibujo. */}
      {instanciar && (
        <>
          <EsferasInst pts={ptsNormales} radio={rb} color={COL_NORMAL} />
          <EsferasInst pts={ptsEspeciales} radio={rb} color={COL_ESP} emissive={COL_ESP} emi={0.4} metal={0.55} />
        </>
      )}
      {Array.from({ length: urna.total }, (_, i) => {
        const esp = esEspecial(i);
        const fuera = i === segunda || (i === primera && !primeraVolvio);
        if (instanciar && !fuera) return null;
        return (
          <Movil key={`${urna.id}-${i}`} objetivo={objetivoBola(i)} origen={instanciar ? posiciones[i] : undefined} vel={0.11} escala={fuera ? escalaFuera : 1}>
            <mesh castShadow>
              <sphereGeometry args={[rb, 20, 20]} />
              <meshStandardMaterial color={esp ? COL_ESP : COL_NORMAL} emissive={esp ? COL_ESP : "#000000"} emissiveIntensity={esp ? (fuera ? 0.9 : 0.4) : 0} roughness={0.3} metalness={esp ? 0.55 : 0.15} />
            </mesh>
            {urna.etiquetas && (
              <Letra pos={[0, 0, rb + 0.02]} col="#04121f" size={14}>
                {urna.etiquetas[i]}
              </Letra>
            )}
          </Movil>
        );
      })}

      <Etiqueta pos={[URNA_X, URNA_Y0 + URNA_ALTO + 0.55, 0]} col={`${modoColor}88`}>
        <i className="fa-solid fa-circle" style={{ color: COL_ESP, fontSize: 9 }} />
        {urna.rotulo}
      </Etiqueta>
      <Etiqueta pos={[(SLOT[0]![0] + SLOT[1]![0]) / 2, 1.55, 0]} col={conReemplazo ? "#34d39988" : "#f8717188"}>
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
  const dist = camara[2];

  return (
    <Canvas key={`${modo}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: camara, fov: CAM_FOV }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento={accent} />
      <pointLight position={[-6, -2, 5]} intensity={0.45} color={modoColor} />

      <Ajuste dist={dist} ancho={modo === "orden" ? 9.6 : modo === "reemplazo" ? 9 : 10} alto={modo === "multiplicativo" ? 6.6 : modo === "orden" ? 4.6 : 5.2}>
        {modo === "multiplicativo" && <EscenaArbol opciones={opciones} accent={accent} />}
        {modo === "orden" && <EscenaOrden r={r} importaOrden={importaOrden} arreglo={arreglo} />}
        {modo === "reemplazo" && <EscenaUrna urna={urna} conReemplazo={conReemplazo} primera={primera} segunda={segunda} modoColor={modoColor} />}
      </Ajuste>

      <OrbitControls enablePan={false} enableZoom minDistance={5} maxDistance={18} maxPolarAngle={Math.PI * 0.62} minPolarAngle={Math.PI * 0.18} target={[0, modo === "orden" ? -0.2 : 0, 0]} />
      <EffectComposer>
        <Bloom intensity={0.38} luminanceThreshold={0.42} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
