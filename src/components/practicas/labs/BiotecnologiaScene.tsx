"use client";

/**
 * Escena 3D del laboratorio "Biotecnología y bioética: CRISPR, OGM, clonación"
 * (CNEYT-VI-P08). Tres modos manipulables:
 *
 *  - crispr:      una doble hélice horizontal con la secuencia diana y el PAM
 *                 (5'-NGG-3'). La ARN guía (sgRNA) SE DESLIZA sobre la hebra: las
 *                 bases que encajan se ven de su color y las que no, en rojo; Cas9
 *                 solo corta si todas encajan y hay PAM. Tras el corte se muestra
 *                 la reparación elegida: NHEJ (indel → knockout) o HDR (inserción
 *                 precisa).
 *  - transgenico: ADN recombinante por etapas (aislar, cortar, ligar, transformar):
 *                 el plásmido se abre, el gen entra, se cierra y pasa al hospedero.
 *  - clonacion:   transferencia nuclear por etapas (donante, enuclear, transferir,
 *                 desarrollo): según el fin da un clon o células madre.
 *
 * Toda animación ocurre en useFrame mutando refs (nunca en el render), conforme
 * al React Compiler. NO se usa <Text> de drei (cuelga el chunk con Turbopack):
 * el texto del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Base, BASE_COLOR, complementoADN } from "./adn-dogma-data";
import { Escenario } from "./_escenario";
import {
  type Modo,
  type Pt,
  type ResultadoCrispr,
  type Reparacion,
  type TransgenDef,
  type ClonDef,
  PROTOSPACER,
  HEBRA_TOP,
  SGRNA,
  CORTE_IDX,
  FLANCO_IZQ,
  FLANCO_DER,
  analizarGuia,
  ETAPAS_TRANSGEN,
  ETAPAS_CLONACION,
} from "./biotecnologia-data";

export interface BiotecnologiaSceneProps {
  modo: Modo;
  // crispr
  resultadoCrispr: ResultadoCrispr;
  reparacion: Reparacion;
  cortar: boolean;
  /** Bases que se ha deslizado la ARN guía respecto de la diana (0 = alineada). */
  desfase: number;
  // transgénico
  transgen: TransgenDef;
  // clonación
  clon: ClonDef;
  /** Etapa del proceso (1-4) en transgénico y clonación. */
  etapa: number;
  playing: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

/* ── Encuadre: la escena se ajusta al escenario, entre la barra y la misión ─ */
const CAM_Z = 13;
const CAM_FOV = 46;
const RESERVA_ARRIBA = 64;
const RESERVA_ABAJO = 150;
interface Caja { x0: number; x1: number; y0: number; y1: number }

function planEncuadre(caja: Caja, W: number, H: number) {
  const visH = 2 * CAM_Z * Math.tan(((CAM_FOV / 2) * Math.PI) / 180);
  const wpp = visH / Math.max(1, H);
  const uH = Math.max(H * 0.4, H - RESERVA_ARRIBA - RESERVA_ABAJO) * wpp;
  const uW = Math.max(W * 0.5, W - 24) * wpp;
  const subir = ((RESERVA_ABAJO - RESERVA_ARRIBA) / 2) * wpp;
  const s = Math.min(uW / (caja.x1 - caja.x0), uH / (caja.y1 - caja.y0), 1.5);
  return { s, x: -((caja.x0 + caja.x1) / 2) * s, y: -((caja.y0 + caja.y1) / 2) * s + subir };
}

/** ¿Pantalla angosta? Entonces los rótulos anchos se ocultan (la info está en el panel). */
function useAngosta() {
  return useThree((s) => s.size.width) < 640;
}

/* ── Barra sólida entre dos puntos (en lugar de líneas de 1 px) ───────── */
function seg(a: Pt, b: Pt): { pos: Pt; quat: [number, number, number, number]; len: number } {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = new THREE.Vector3().subVectors(vb, va);
  const len = dir.length() || 0.0001;
  const mid = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return { pos: [mid.x, mid.y, mid.z], quat: [q.x, q.y, q.z, q.w], len };
}
function Barra({ a, b, r = 0.045, color, emis = 0 }: { a: Pt; b: Pt; r?: number; color: string; emis?: number }) {
  const { pos, quat, len } = seg(a, b);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emis} roughness={0.5} metalness={0.1} />
    </mesh>
  );
}

/* ── Etiqueta flotante (Html, tamaño fijo en píxeles) ─────────────────── */
function Etiqueta({ pos, children, col, ancha = false }: { pos: Pt; children: ReactNode; col?: string; ancha?: boolean }) {
  const angosta = useAngosta();
  if (ancha && angosta) return null;
  return (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(4,10,22,0.82)", border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`, color: "#fff", fontSize: 14, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 6px 18px -8px #000" }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Texto pequeño anclado a un punto (sin fondo) ─────────────────────── */
function Letra({ pos, children, col = "#e2e8f0", size = 14 }: { pos: Pt; children: ReactNode; col?: string; size?: number }) {
  return (
    <Html position={pos} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: Math.max(14, size), fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>{children}</div>
    </Html>
  );
}

/* ── Tesela de un nucleótido (caja coloreada con letra) ──────────────── */
function NucBox({ pos, base, resaltar, pam, playing, faint, letra = true }: { pos: Pt; base: string; resaltar?: boolean; pam?: boolean; playing?: boolean; faint?: boolean; letra?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const col = pam ? "#f8fafc" : BASE_COLOR[base as Base] ?? "#94a3b8";
  useFrame((s) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    if (resaltar) {
      m.emissiveIntensity = playing ? 0.5 + 0.45 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 5)) : 0.85;
    } else {
      m.emissiveIntensity = pam ? 0.15 : 0.32;
    }
  });
  return (
    <group position={pos}>
      <mesh ref={ref}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.3} roughness={0.42} transparent opacity={faint ? 0.45 : 1} />
      </mesh>
      {letra && <Letra pos={[0, 0, 0.28]} col={pam ? "#0f172a" : "#04121f"}>{base}</Letra>}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · CRISPR-Cas9
 * ════════════════════════════════════════════════════════════════════════ */

const STEP = 0.52;

function Cas9({ x, playing, ok }: { x: number; playing: boolean; ok: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const k = playing ? 1 + 0.06 * Math.sin(s.clock.elapsedTime * 2.4) : 1;
    ref.current.scale.set(k, k * 1.15, k);
  });
  const c = ok ? "#1d4ed8" : "#991b1b";
  return (
    <mesh ref={ref} position={[x, 0.4, -0.4]}>
      <sphereGeometry args={[1.05, 28, 28]} />
      <meshStandardMaterial color={ok ? "#1e3a8a" : "#7f1d1d"} emissive={c} emissiveIntensity={0.25} roughness={0.35} metalness={0.2} transparent opacity={0.4} />
    </mesh>
  );
}

function MundoCrispr({ res, cortar, reparacion, playing, desfase }: { res: ResultadoCrispr; cortar: boolean; reparacion: Reparacion; playing: boolean; desfase: number }) {
  const angosta = useAngosta();
  const FL = FLANCO_IZQ.length;
  const top: Base[] = [...FLANCO_IZQ, ...HEBRA_TOP, ...FLANCO_DER];
  const bot: Base[] = top.map(complementoADN);
  const n = top.length;
  const startX = -((n - 1) * STEP) / 2;
  const xAt = (i: number) => startX + i * STEP;
  const yTop = 0.85;
  const yBot = -0.05;
  const iCorte = FL + CORTE_IDX;
  const xCut = startX + (iCorte - 0.5) * STEP;
  const xCas = xCut + desfase * STEP;
  const pamIni = FL + PROTOSPACER.length;
  const g = analizarGuia(desfase);
  const letras = !angosta;

  const nodes: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = xAt(i);
    const esPam = i >= pamIni && i < pamIni + 3;
    const flanco = i < FL || i >= pamIni + 3;
    const cortadoAqui = cortar && (i === iCorte - 1 || i === iCorte);
    nodes.push(<NucBox key={`t${i}`} pos={[x, yTop, 0]} base={top[i]!} pam={esPam} faint={flanco} resaltar={cortadoAqui} playing={playing} letra={letras} />);
    nodes.push(<NucBox key={`b${i}`} pos={[x, yBot, 0]} base={bot[i]!} pam={esPam} faint={flanco} resaltar={cortadoAqui} playing={playing} letra={letras} />);
    // escalón (puente de H) — se omite justo en el corte
    if (!(cortar && i === iCorte)) {
      nodes.push(<Barra key={`r${i}`} a={[x, yTop - 0.2, 0]} b={[x, yBot + 0.2, 0]} r={0.035} color="#475569" />);
    }
  }

  // ARN guía (sgRNA): se desliza; en rojo las bases que no encajan
  const ySg = 2.0;
  const sg: ReactNode[] = [];
  for (let i = 0; i < SGRNA.length; i++) {
    const x = xAt(FL + i + desfase);
    const encaja = g.flags[i]!;
    const col = encaja ? BASE_COLOR[SGRNA[i]!] ?? "#fb923c" : "#ef4444";
    sg.push(
      <mesh key={`sg${i}`} position={[x, ySg, 0.1]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} roughness={0.4} />
      </mesh>,
    );
    sg.push(<Barra key={`sgl${i}`} a={[x, ySg - 0.15, 0.1]} b={[x, yTop + 0.22, 0]} r={0.025} color={encaja ? "#a78bfa" : "#b91c1c"} emis={0.25} />);
  }

  const yR = -3.0;
  return (
    <group>
      {nodes}
      {sg}

      {/* rótulos: máx. 4 a la vez */}
      {!cortar && <Etiqueta pos={[startX - 0.9, yTop, 0]} col="#38bdf8aa">ADN diana</Etiqueta>}
      <Etiqueta pos={[xAt(FL + (SGRNA.length - 1) / 2 + desfase), ySg + 0.55, 0]} col="#a855f7aa">
        <i className="fa-solid fa-dna" style={{ color: "#c4b5fd" }} /> ARN guía
      </Etiqueta>
      <Etiqueta pos={[xAt(pamIni + 1), yBot - 0.75, 0]} col="#e2e8f0aa">PAM 5′-NGG-3′</Etiqueta>

      {/* Cas9 viaja con la guía */}
      <Cas9 x={xCas} playing={playing} ok={g.corta} />
      {cortar ? (
        <>
          <CorteFlash x={xCut} playing={playing} />
          <Etiqueta pos={[xCut, -1.7, 0]} col="#f87171aa">
            <i className="fa-solid fa-bolt" style={{ color: "#fca5a5" }} /> Corte de doble cadena
          </Etiqueta>
        </>
      ) : (
        <Etiqueta pos={[xCas, -1.7, 0]} col={g.corta ? "#60a5faaa" : "#f87171aa"}>
          {g.corta ? (
            <><i className="fa-solid fa-scissors" style={{ color: "#93c5fd" }} /> Cas9 lista para cortar</>
          ) : (
            <><i className="fa-solid fa-ban" style={{ color: "#fca5a5" }} /> No encaja: {g.encajan}/{g.total}</>
          )}
        </Etiqueta>
      )}

      {/* resultado de la reparación */}
      {cortar && <Resultado res={res} reparacion={reparacion} playing={playing} yR={yR} letras={letras} />}
    </group>
  );
}

function CorteFlash({ x, playing }: { x: number; playing: boolean }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    if (ref.current) ref.current.intensity = playing ? 1.5 + 1.5 * Math.abs(Math.sin(s.clock.elapsedTime * 8)) : 1.5;
  });
  return (
    <>
      <Barra a={[x, 1.3, 0.3]} b={[x, -0.5, 0.3]} r={0.03} color="#fecaca" emis={0.8} />
      <pointLight ref={ref} position={[x, 0.4, 0.5]} color="#f87171" intensity={2} distance={5} />
    </>
  );
}

function Resultado({ res, reparacion, playing, yR, letras }: { res: ResultadoCrispr; reparacion: Reparacion; playing: boolean; yR: number; letras: boolean }) {
  const seq = res.editada;
  const startX = -((seq.length - 1) * STEP) / 2;
  const col = reparacion === "hdr" ? "#34d399" : "#fb923c";
  const tiles = seq.map((b, i) => (
    <NucBox key={`res${i}`} pos={[startX + i * STEP, yR, 0]} base={b} resaltar={res.marca.includes(i)} playing={playing} letra={letras} />
  ));
  return (
    <group>
      <Barra a={[0, -2.2, 0]} b={[0, yR + 0.4, 0]} r={0.05} color={col} emis={0.3} />
      {tiles}
      <Etiqueta pos={[0, yR - 0.8, 0]} col={`${col}aa`} ancha>
        <i className={`fa-solid ${res.rep.icono}`} style={{ color: col }} /> {res.rep.etq} · {res.titulo}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · TRANSGÉNICO / ADN RECOMBINANTE (por etapas)
 * ════════════════════════════════════════════════════════════════════════ */

const X_PLASMIDO = -3.6;
const X_HOSPEDERO = 4.6;

function Plasmido({ etapa }: { etapa: number }) {
  const abierto = etapa === 2;
  const dentro = etapa >= 4;
  const angosta = useAngosta();
  return (
    <group position={[dentro ? X_HOSPEDERO : X_PLASMIDO, 0, 0]} scale={dentro ? 0.4 : 1}>
      <mesh rotation={[Math.PI / 2.6, 0, abierto ? 0.4 : 0]}>
        <torusGeometry args={[1.0, 0.13, 16, 48, abierto ? Math.PI * 2 - 0.8 : Math.PI * 2]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      {!dentro && !angosta && <Etiqueta pos={[0, 1.5, 0]} col="#38bdf8aa">Plásmido</Etiqueta>}
    </group>
  );
}

/** Gen foráneo: según la etapa espera aparte, se acerca y queda dentro del plásmido. */
function GenForaneo({ color, etapa, playing }: { color: string; etapa: number; playing: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (!ref.current) return;
    const dentroPlasmido = etapa === 3;
    const tx = dentroPlasmido ? X_PLASMIDO + 1.0 : 0.2;
    const ty = etapa === 1 && playing ? 0.15 * Math.sin(s.clock.elapsedTime * 2) : 0;
    const k = 1 - Math.exp(-dt * 6);
    ref.current.position.x += (tx - ref.current.position.x) * k;
    ref.current.position.y += (ty - ref.current.position.y) * k;
    const rz = dentroPlasmido ? Math.PI / 2 : 0;
    ref.current.rotation.z += (rz - ref.current.rotation.z) * k;
    const e = (ref.current.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial;
    if (e) e.emissiveIntensity = 0.4 + 0.3 * Math.sin(s.clock.elapsedTime * 4);
  });
  if (etapa >= 4) return null;
  return (
    <group ref={ref} position={[0.2, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.9, 0.34, 0.34]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Hospedero: bacteria E. coli (cápsula), maíz o arroz según el caso. */
function Hospedero({ transgen, etapa, playing }: { transgen: TransgenDef; etapa: number; playing: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const k = playing && etapa >= 4 ? 1 + 0.05 * Math.sin(s.clock.elapsedTime * 2) : 1;
    ref.current.scale.set(k, k, k);
  });
  return (
    <group position={[X_HOSPEDERO, 0, 0]}>
      <mesh ref={ref} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.7, 1.0, 8, 16]} />
        <meshStandardMaterial color={transgen.color} emissive={transgen.color} emissiveIntensity={0.2} roughness={0.5} transparent opacity={0.5} />
      </mesh>
      <Etiqueta pos={[0, 1.35, 0]} col={`${transgen.color}aa`} ancha>
        <i className={`fa-solid ${transgen.icono}`} style={{ color: transgen.color }} /> {transgen.hospedero}
      </Etiqueta>
      <Productos color={transgen.color} playing={playing} activo={etapa >= 4} />
    </group>
  );
}

/** Pequeñas esferas (proteína producida) que emergen del hospedero (solo en la etapa 4). */
function Productos({ color, playing, activo }: { color: string; playing: boolean; activo: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!g.current) return;
    g.current.visible = activo;
    g.current.children.forEach((c, i) => {
      const t = playing ? (s.clock.elapsedTime * 0.5 + i * 0.33) % 1 : 0.4 + i * 0.2;
      c.position.set(1.0 + t * 1.4, Math.sin(i * 2) * 0.5 * t, Math.cos(i * 2) * 0.4 * t);
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (m) m.opacity = 1 - t * 0.7;
    });
  });
  return (
    <group ref={g} visible={false}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

function MundoTransgenico({ transgen, etapa, playing }: { transgen: TransgenDef; etapa: number; playing: boolean }) {
  const e = ETAPAS_TRANSGEN[Math.min(ETAPAS_TRANSGEN.length, Math.max(1, etapa)) - 1]!;
  return (
    <group>
      <Plasmido etapa={etapa} />
      <GenForaneo color={transgen.color} etapa={etapa} playing={playing} />
      {/* flujo: plásmido recombinante → hospedero */}
      <Barra a={[-2.4, -1.1, 0]} b={[3.6, -1.1, 0]} r={0.025} color="#334155" />
      <Hospedero transgen={transgen} etapa={etapa} playing={playing} />
      <Etiqueta pos={[0, 2.6, 0]} col={`${transgen.color}aa`} ancha>
        <i className={`fa-solid ${transgen.icono}`} style={{ color: transgen.color }} /> {transgen.etq} · {transgen.anio}
      </Etiqueta>
      <Etiqueta pos={[0, -2.1, 0]} col="#94a3b8aa" ancha>
        {etapa >= 4 ? <>{e.etq}: produce {transgen.producto}</> : <>{e.etq}</>}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · CLONACIÓN (transferencia nuclear de células somáticas, por etapas)
 * ════════════════════════════════════════════════════════════════════════ */

function Celula({ pos, r, color, nucleo, nucleoColor, label, labelCol }: { pos: Pt; r: number; color: string; nucleo: boolean; nucleoColor?: string; label?: string; labelCol?: string }) {
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[r, 28, 28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} roughness={0.5} transparent opacity={0.42} />
      </mesh>
      {nucleo && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[r * 0.42, 20, 20]} />
          <meshStandardMaterial color={nucleoColor ?? "#a855f7"} emissive={nucleoColor ?? "#7c3aed"} emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      )}
      {label && <Etiqueta pos={[0, r + 0.5, 0]} col={labelCol ?? "#94a3b8aa"}>{label}</Etiqueta>}
    </group>
  );
}

/** Núcleo que viaja del donante al óvulo enucleado (animado; etapa 3). */
function NucleoViajero({ from, to, playing, color, visible }: { from: Pt; to: Pt; playing: boolean; color: string; visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.visible = visible;
    const t = playing ? (s.clock.elapsedTime * 0.3) % 1 : 0.5;
    ref.current.position.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * 0.6, from[2]);
  });
  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.28, 18, 18]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.4} />
    </mesh>
  );
}

function MundoClonacion({ clon, etapa, playing }: { clon: ClonDef; etapa: number; playing: boolean }) {
  const donanteColor = "#a855f7";
  const reproductiva = clon.id === "reproductiva";
  const e = ETAPAS_CLONACION[Math.min(ETAPAS_CLONACION.length, Math.max(1, etapa)) - 1]!;
  const final = etapa >= 4;
  return (
    <group>
      {/* donante (célula somática con núcleo) */}
      <Celula pos={[-4.2, 1.4, 0]} r={0.75} color="#38bdf8" nucleo nucleoColor={donanteColor} label="Donante" labelCol="#38bdf8aa" />
      {/* óvulo: con su núcleo (etapa 1) y luego enucleado */}
      <Celula pos={[-1.4, -1.2, 0]} r={1.0} color="#fbbf24" nucleo={etapa === 1} nucleoColor="#fde68a" label="Óvulo" labelCol="#fbbf24aa" />
      <NucleoViajero from={[-4.2, 1.4, 0]} to={[-1.4, -1.2, 0]} playing={playing} color={donanteColor} visible={etapa === 3} />

      {/* embrión reconstruido y desenlace (etapa 4) */}
      {final && (
        <>
          <Celula pos={[1.4, -0.2, 0]} r={0.85} color="#34d399" nucleo nucleoColor={donanteColor} label="Embrión" labelCol="#34d399aa" />
          <Barra a={[-0.4, -1.0, 0]} b={[0.5, -0.4, 0]} r={0.035} color="#64748b" />
          {reproductiva ? (
            <group>
              <Celula pos={[4.6, 0.4, 0]} r={0.65} color="#38bdf8" nucleo nucleoColor={donanteColor} />
              <mesh position={[4.6, -0.9, 0]}>
                <sphereGeometry args={[0.45, 20, 20]} />
                <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={0.4} roughness={0.5} />
              </mesh>
              <Etiqueta pos={[4.6, 1.5, 0]} col="#a855f7aa" ancha>
                <i className="fa-solid fa-clone" style={{ color: "#c084fc" }} /> Clon idéntico al donante
              </Etiqueta>
            </group>
          ) : (
            <group>
              {[[4.2, 0.5], [4.9, 0.1], [4.4, -0.4], [5.1, -0.7]].map((p, i) => (
                <mesh key={i} position={[p[0]!, p[1]!, 0]}>
                  <sphereGeometry args={[0.26, 16, 16]} />
                  <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.5} roughness={0.4} />
                </mesh>
              ))}
              <Etiqueta pos={[4.7, 1.4, 0]} col="#34d399aa" ancha>
                <i className="fa-solid fa-staff-snake" style={{ color: "#6ee7b7" }} /> Células madre
              </Etiqueta>
            </group>
          )}
        </>
      )}

      {!final && (
        <Etiqueta pos={[2.2, 0.6, 0]} col={`${clon.color}aa`} ancha>
          <i className={`fa-solid ${reproductiva ? "fa-clone" : "fa-staff-snake"}`} style={{ color: clon.color }} /> {e.etq}
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Escena / cámara / post
 * ════════════════════════════════════════════════════════════════════════ */

function cajaDe(modo: Modo, cortar: boolean): Caja {
  if (modo === "crispr") return { x0: -7.8, x1: 7.0, y0: cortar ? -4.2 : -2.5, y1: 3.2 };
  if (modo === "transgenico") return { x0: -5.2, x1: 7.4, y0: -2.6, y1: 3.2 };
  return { x0: -5.6, x1: 6.2, y0: -2.8, y1: 3.0 };
}

function Contenido(props: BiotecnologiaSceneProps) {
  const { modo, resultadoCrispr, reparacion, cortar, desfase, transgen, clon, etapa, modoColor, resetNonce, playing } = props;
  const size = useThree((st) => st.size);
  const plan = planEncuadre(cajaDe(modo, cortar), size.width, size.height);
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (giro.current && playing && modo === "clonacion") giro.current.rotation.y += dt * 0.03;
  });

  const mundo: ReactNode =
    modo === "crispr" ? (
      <MundoCrispr res={resultadoCrispr} cortar={cortar} reparacion={reparacion} playing={playing} desfase={desfase} />
    ) : modo === "transgenico" ? (
      <MundoTransgenico transgen={transgen} etapa={etapa} playing={playing} />
    ) : (
      <MundoClonacion clon={clon} etapa={etapa} playing={playing} />
    );

  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      <Escenario acento={props.accent} mesa={false} niebla={false} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />

      <group position={[plan.x, plan.y, 0]} scale={plan.s}>
        <group ref={giro} key={`${modo}-${resetNonce}`}>{mundo}</group>
      </group>

      <OrbitControls enablePan={false} minDistance={7} maxDistance={24} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.22} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function BiotecnologiaScene(props: BiotecnologiaSceneProps) {
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
