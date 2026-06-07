"use client";

/**
 * Escena 3D del laboratorio "Mutaciones: tipos, causas y consecuencias"
 * (CNEYT-VI-P06). Tres modos:
 *
 *  - puntuales:    sobre una secuencia real de la β-globina, se aplica una
 *                  sustitución / inserción / deleción y se comparan en 3D la
 *                  proteína original y la mutada (silenciosa, missense, nonsense,
 *                  frameshift). El nucleótido y el aminoácido cambiados pulsan.
 *  - cromosomicas: un cromosoma "modelo" de bandas A-B-C-D-E junto al resultado
 *                  de la deleción, duplicación, inversión, translocación o la
 *                  aneuploidía (trisomía 21 → tres copias).
 *  - mutagenos:    una doble hélice corta; la radiación UV forma un dímero de
 *                  timina (dos timinas adyacentes se unen y deforman la hélice);
 *                  los demás mutágenos muestran su daño característico.
 *
 * Toda animación ocurre en useFrame mutando refs (nunca en el render), conforme
 * al React Compiler. NO se usa <Text> de drei (cuelga el chunk con Turbopack):
 * el texto del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Base, BASE_COLOR } from "./adn-dogma-data";
import {
  type Modo,
  type Pt,
  type AnalisisPuntual,
  type ResultadoCromo,
  type MutCromoDef,
  type MutagenoDef,
  BANDAS_BASE,
} from "./mutaciones-data";

export interface MutacionesSceneProps {
  modo: Modo;
  // puntuales
  analisis: AnalisisPuntual;
  // cromosómicas
  resultadoCromo: ResultadoCromo;
  cromoDef: MutCromoDef;
  // mutágenos
  mutageno: MutagenoDef;
  dimero: boolean; // UV aplicado → daño formado
  reparar: boolean; // NER aplicado
  playing: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

/* ── helper geometría puro para segmentos (cilindros) ─────────────────── */
function seg(a: Pt, b: Pt): { pos: Pt; quat: [number, number, number, number]; len: number } {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = new THREE.Vector3().subVectors(vb, va);
  const len = dir.length() || 0.0001;
  const mid = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return { pos: [mid.x, mid.y, mid.z], quat: [q.x, q.y, q.z, q.w], len };
}

/* ── Etiqueta flotante (Html) ─────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 10, col }: { pos: Pt; children: ReactNode; df?: number; col?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(4,10,22,0.82)", border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`, color: "#fff", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 6px 18px -8px #000" }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Texto pequeño anclado a un punto (sin fondo) ─────────────────────── */
function Letra({ pos, children, df = 8, col = "#e2e8f0", size = 14 }: { pos: Pt; children: ReactNode; df?: number; col?: string; size?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: size, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>{children}</div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · MUTACIONES PUNTUALES
 * ════════════════════════════════════════════════════════════════════════ */

/** Tesela de un nucleótido del ARNm; pulsa si es el sitio mutado. */
function NucTile({ x, base, mutado, playing }: { x: number; base: string; mutado: boolean; playing: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const col = BASE_COLOR[base as Base] ?? "#94a3b8";
  useFrame((s) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    if (mutado) {
      const k = playing ? 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 5)) : 0.9;
      m.emissiveIntensity = k;
      const sc = 1 + (mutado ? 0.12 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 5)) : 0);
      ref.current.scale.setScalar(playing ? sc : 1.1);
    } else {
      m.emissiveIntensity = 0.3;
    }
  });
  return (
    <group position={[x, 2.2, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      <Letra pos={[0, 0, 0.3]} df={7} size={15} col="#04121f">{base}</Letra>
      {mutado && <Letra pos={[0, 0.55, 0]} df={9} col="#fca5a5" size={12}>▲</Letra>}
    </group>
  );
}

/** Una cuenta = un aminoácido de la cadena proteica. */
function AminoBead({ x, y, color, abr, paro, resaltar, faint, playing }: { x: number; y: number; color: string; abr: string; paro: boolean; resaltar: boolean; faint: boolean; playing: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    if (resaltar && playing) {
      const k = 1 + 0.16 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 5));
      ref.current.scale.setScalar(k);
    } else {
      ref.current.scale.setScalar(resaltar ? 1.12 : 1);
    }
  });
  if (paro) {
    return (
      <group position={[x, y, 0]}>
        <mesh>
          <boxGeometry args={[0.36, 0.36, 0.36]} />
          <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.6} />
        </mesh>
        <Letra pos={[0, -0.5, 0]} df={9} col="#fca5a5" size={11}>STOP</Letra>
      </group>
    );
  }
  return (
    <group position={[x, y, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={resaltar ? 0.7 : 0.35} roughness={0.4} transparent opacity={faint ? 0.25 : 1} />
      </mesh>
      <Letra pos={[0, -0.5, 0]} df={9} col={faint ? "#475569" : "#e2e8f0"} size={11}>{abr}</Letra>
      {resaltar && <Letra pos={[0, 0.6, 0]} df={9} col="#fde047" size={12}>★</Letra>}
    </group>
  );
}

function MundoPuntuales({ analisis, playing }: { analisis: AnalisisPuntual; playing: boolean }) {
  const { arnmOriginal, arnmMutado, protOriginal, protMutada, cambioIdx, def } = analisis;

  // primer nucleótido distinto entre ARNm original y mutado
  let nucDif = -1;
  const nlen = Math.max(arnmOriginal.length, arnmMutado.length);
  for (let i = 0; i < nlen; i++) {
    if (arnmOriginal[i] !== arnmMutado[i]) { nucDif = i; break; }
  }

  const step = 0.5;
  const startX = -((arnmMutado.length - 1) * step) / 2;
  const tiles = [...arnmMutado].map((b, i) => (
    <NucTile key={i} x={startX + i * step} base={b} mutado={i === nucDif && def.id !== "ninguna"} playing={playing} />
  ));

  // cadenas de aminoácidos
  const bstep = 0.86;
  const startOrig = -((protOriginal.length - 1) * bstep) / 2;
  const startMut = -((protMutada.length - 1) * bstep) / 2;

  const cadenaOrig = protOriginal.map((c, i) => (
    <AminoBead key={`o${i}`} x={startOrig + i * bstep} y={0.55} color={c.amino.color} abr={c.amino.abr} paro={c.paro} resaltar={false} faint={false} playing={playing} />
  ));
  const cadenaMut = protMutada.map((c, i) => (
    <AminoBead key={`m${i}`} x={startMut + i * bstep} y={-1.6} color={c.amino.color} abr={c.amino.abr} paro={c.paro} resaltar={def.id !== "ninguna" && i === cambioIdx} faint={false} playing={playing} />
  ));
  // "fantasmas" de los aminoácidos perdidos por truncamiento (nonsense/frameshift)
  const perdidos: ReactNode[] = [];
  if (protMutada.length < protOriginal.length) {
    for (let i = protMutada.length; i < protOriginal.length; i++) {
      const c = protOriginal[i]!;
      perdidos.push(
        <AminoBead key={`p${i}`} x={startOrig + i * bstep} y={-1.6} color={c.amino.color} abr={c.amino.abr} paro={c.paro} resaltar={false} faint playing={playing} />,
      );
    }
  }

  // enlaces peptídicos (líneas) de la cadena mutada
  const enlacesMut: ReactNode[] = [];
  for (let i = 0; i < protMutada.length - 1; i++) {
    enlacesMut.push(
      <Line key={`lm${i}`} points={[[startMut + i * bstep, -1.6, 0], [startMut + (i + 1) * bstep, -1.6, 0]]} color="#64748b" lineWidth={2} />,
    );
  }
  const enlacesOrig: ReactNode[] = [];
  for (let i = 0; i < protOriginal.length - 1; i++) {
    enlacesOrig.push(
      <Line key={`lo${i}`} points={[[startOrig + i * bstep, 0.55, 0], [startOrig + (i + 1) * bstep, 0.55, 0]]} color="#64748b" lineWidth={2} />,
    );
  }

  return (
    <group>
      <Etiqueta pos={[0, 3.1, 0]} col="#38bdf8aa">
        <i className="fa-solid fa-rna" style={{ color: "#7dd3fc" }} /> ARNm {def.id === "ninguna" ? "(sano)" : "mutado"}
      </Etiqueta>
      {tiles}

      {enlacesOrig}
      {cadenaOrig}
      <Etiqueta pos={[startOrig - 0.9, 0.55, 0]} col="#34d399aa" df={11}>Original</Etiqueta>

      {enlacesMut}
      {cadenaMut}
      {perdidos}
      <Etiqueta pos={[Math.min(startMut, startOrig) - 0.9, -1.6, 0]} col={def.id === "silenciosa" ? "#34d399aa" : "#f87171aa"} df={11}>
        {def.id === "ninguna" ? "Proteína" : "Mutada"}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · MUTACIONES CROMOSÓMICAS
 * ════════════════════════════════════════════════════════════════════════ */

interface Banda { gen: string; color: string }

/** Un cromosoma como pila vertical de bandas con un estrechamiento (centrómero). */
function Cromosoma({ x, bandas, marca, label, labelCol }: { x: number; bandas: Banda[]; marca: number[]; label: string; labelCol: string }) {
  const h = 0.52;
  const total = bandas.length * h;
  const y0 = -total / 2 + h / 2;
  const items = bandas.map((b, i) => {
    const resaltar = marca.includes(i);
    return <BandaBox key={i} x={x} y={y0 + i * h} h={h} color={b.color} gen={b.gen} resaltar={resaltar} />;
  });
  return (
    <group>
      {/* eje/centrómero */}
      <mesh position={[x, 0, -0.12]}>
        <cylinderGeometry args={[0.06, 0.06, total + 0.3, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[x, 0, -0.12]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.5} />
      </mesh>
      {items}
      <Etiqueta pos={[x, total / 2 + 0.55, 0]} col={labelCol} df={11}>{label}</Etiqueta>
    </group>
  );
}

function BandaBox({ x, y, h, color, gen, resaltar }: { x: number; y: number; h: number; color: string; gen: string; resaltar: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = resaltar ? 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 4)) : 0.25;
  });
  return (
    <group position={[x, y, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[0.9, h * 0.86, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.45} />
      </mesh>
      <Letra pos={[0, 0, 0.32]} df={8} size={13} col="#04121f">{gen}</Letra>
    </group>
  );
}

function MundoCromosomicas({ resultado, def }: { resultado: ResultadoCromo; def: MutCromoDef }) {
  const ref = BANDAS_BASE;

  if (def.id === "aneuploidia") {
    // tres copias del mismo cromosoma (trisomía 21)
    const xs = [-1.8, 0, 1.8];
    return (
      <group>
        {xs.map((x, i) => (
          <Cromosoma key={i} x={x} bandas={ref} marca={[]} label={`Copia ${i + 1}`} labelCol="#a855f7aa" />
        ))}
        <Etiqueta pos={[0, 2.7, 0]} col="#a855f7aa">
          <i className="fa-solid fa-1" style={{ color: "#c084fc" }} /> Trisomía 21 · 3 cromosomas (no disyunción)
        </Etiqueta>
      </group>
    );
  }

  if (def.id === "translocacion" && resultado.secundario) {
    return (
      <group>
        <Cromosoma x={-2.4} bandas={ref} marca={[]} label="Normal" labelCol="#38bdf8aa" />
        <Cromosoma x={0} bandas={resultado.principal} marca={resultado.marca} label="Cromosoma 1" labelCol="#60a5faaa" />
        <Cromosoma x={2.4} bandas={resultado.secundario} marca={[2, 3]} label="Cromosoma 2" labelCol="#60a5faaa" />
        <Etiqueta pos={[0, 2.9, 0]} col="#60a5faaa">
          <i className="fa-solid fa-right-left" style={{ color: "#93c5fd" }} /> Translocación: D-E pasan a otro cromosoma
        </Etiqueta>
      </group>
    );
  }

  // estructurales con comparación normal | resultado
  return (
    <group>
      <Cromosoma x={-1.6} bandas={ref} marca={[]} label="Normal" labelCol="#38bdf8aa" />
      <Cromosoma x={1.6} bandas={resultado.principal} marca={resultado.marca} label={def.etq} labelCol={`${def.color}aa`} />
      <Etiqueta pos={[0, 2.9, 0]} col={`${def.color}aa`}>
        <i className={`fa-solid ${def.icono}`} style={{ color: def.color }} /> {def.etq}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · MUTÁGENOS Y DAÑO AL ADN
 * ════════════════════════════════════════════════════════════════════════ */

/** Secuencia de la hebra izquierda; posiciones 3-4 son timinas adyacentes. */
const HELIX_STRAND: Base[] = ["A", "C", "G", "T", "T", "G", "C", "A"];
const HELIX_COMP: Record<Base, Base> = { A: "T", T: "A", G: "C", C: "G", U: "A" };
const HRAD = 1.1;
const HSTEP = 0.62;

function NucleoSphere({ pos, base, dim }: { pos: Pt; base: Base; dim: boolean }) {
  const col = BASE_COLOR[base] ?? "#94a3b8";
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={dim ? 0.2 : 0.4} roughness={0.4} transparent opacity={dim ? 0.4 : 1} />
    </mesh>
  );
}

/** Rayo UV intermitente que baja hacia el dímero. */
function RayoUV({ on }: { on: boolean }) {
  const g = useRef<THREE.Group>(null);
  const lt = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    const flick = on && Math.sin(s.clock.elapsedTime * 14) > -0.2;
    if (g.current) g.current.visible = flick;
    if (lt.current) lt.current.intensity = flick ? 3 : 0.3;
  });
  const yTT = -((HELIX_STRAND.length - 1) * HSTEP) / 2 + 3.5 * HSTEP;
  const pts: Pt[] = [
    [3.4, 3.4, 0], [2.6, 2.4, 0.1], [3.0, 1.4, -0.1], [HRAD + 0.4, yTT + 0.4, 0],
  ];
  return (
    <group>
      <group ref={g}>
        <Line points={pts} color="#c4b5fd" lineWidth={3.5} />
      </group>
      <pointLight ref={lt} position={[HRAD, yTT, 0.4]} color="#a78bfa" intensity={0.3} distance={7} />
    </group>
  );
}

function MundoMutagenos({ mutageno, dimero, reparar, playing }: { mutageno: MutagenoDef; dimero: boolean; reparar: boolean; playing: boolean }) {
  const n = HELIX_STRAND.length;
  const y0 = -((n - 1) * HSTEP) / 2;
  const izq: Pt[] = [];
  const der: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const ang = i * 0.62;
    const y = y0 + i * HSTEP;
    izq.push([Math.cos(ang) * HRAD, y, Math.sin(ang) * HRAD]);
    der.push([-Math.cos(ang) * HRAD, y, -Math.sin(ang) * HRAD]);
  }
  const esUV = mutageno.id === "uv";
  const dimeroActivo = esUV && dimero && !reparar;
  const ti = 3, tj = 4; // timinas adyacentes

  const bases: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const dañado = dimeroActivo && (i === ti || i === tj);
    // si hay dímero, las dos T se acercan en Y
    let pL = izq[i]!;
    if (dimeroActivo && i === ti) pL = [pL[0], pL[1] + 0.12, pL[2]];
    if (dimeroActivo && i === tj) pL = [pL[0], pL[1] - 0.12, pL[2]];
    bases.push(<NucleoSphere key={`l${i}`} pos={pL} base={HELIX_STRAND[i]!} dim={false} />);
    const cb = HELIX_COMP[HELIX_STRAND[i]!];
    // mutágeno biológico: inserta un segmento viral en el centro de la hebra derecha
    const insViral = mutageno.id === "biologico" && i === 4;
    bases.push(<NucleoSphere key={`r${i}`} pos={der[i]!} base={cb} dim={insViral} />);
    void dañado;
  }

  // backbone (fosfato-desoxirribosa) como líneas
  const bbL: ReactNode[] = [];
  const bbR: ReactNode[] = [];
  for (let i = 0; i < n - 1; i++) {
    // radiación ionizante: rotura de doble cadena en el centro
    const roto = mutageno.id === "ionizante" && i === 3;
    if (!roto) {
      bbL.push(<Line key={`bl${i}`} points={[izq[i]!, izq[i + 1]!]} color="#7dd3fc" lineWidth={2.5} />);
      bbR.push(<Line key={`br${i}`} points={[der[i]!, der[i + 1]!]} color="#7dd3fc" lineWidth={2.5} />);
    }
  }

  // rungs (pares de bases)
  const rungs: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    rungs.push(<Line key={`g${i}`} points={[izq[i]!, der[i]!]} color="#334155" lineWidth={1.6} />);
  }

  return (
    <group>
      {bbL}
      {bbR}
      {rungs}
      {bases}

      {/* dímero de timina: enlace covalente entre las dos T */}
      {dimeroActivo && <DimeroBond a={[izq[ti]![0], izq[ti]![1] + 0.12, izq[ti]![2]]} b={[izq[tj]![0], izq[tj]![1] - 0.12, izq[tj]![2]]} />}
      {dimeroActivo && (
        <Etiqueta pos={[HRAD + 1.5, izq[ti]![1], 0]} col="#fbbf24aa">
          <i className="fa-solid fa-link" style={{ color: "#fde047" }} /> Dímero de timina (T=T)
        </Etiqueta>
      )}

      {esUV && <RayoUV on={dimero && playing} />}

      {/* radiación ionizante: chispa de rotura */}
      {mutageno.id === "ionizante" && (
        <>
          <ChispaRotura y={y0 + 3 * HSTEP + HSTEP / 2} playing={playing} />
          <Etiqueta pos={[HRAD + 1.6, y0 + 3.5 * HSTEP, 0]} col="#f87171aa">
            <i className="fa-solid fa-bolt" style={{ color: "#fca5a5" }} /> Rotura de doble cadena
          </Etiqueta>
        </>
      )}

      {/* químico: aducto voluminoso pegado a una base */}
      {mutageno.id === "quimico" && (
        <>
          <Aducto pos={[izq[4]![0] + 0.35, izq[4]![1], izq[4]![2] + 0.2]} playing={playing} />
          <Etiqueta pos={[HRAD + 1.7, izq[4]![1], 0]} col="#fb923caa">
            <i className="fa-solid fa-circle-dot" style={{ color: "#fdba74" }} /> Aducto químico en la base
          </Etiqueta>
        </>
      )}

      {/* biológico: segmento viral insertado */}
      {mutageno.id === "biologico" && (
        <>
          <mesh position={[der[4]![0], der[4]![1], der[4]![2] - 0.3]}>
            <icosahedronGeometry args={[0.28, 0]} />
            <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={0.6} roughness={0.4} />
          </mesh>
          <Etiqueta pos={[-HRAD - 1.7, der[4]![1], 0]} col="#a855f7aa">
            <i className="fa-solid fa-virus" style={{ color: "#c084fc" }} /> ADN viral integrado
          </Etiqueta>
        </>
      )}

      {/* reparación NER (solo UV): tijeras que escinden el dímero */}
      {esUV && reparar && (
        <Etiqueta pos={[HRAD + 1.6, izq[ti]![1], 0]} col="#34d399aa">
          <i className="fa-solid fa-scissors" style={{ color: "#6ee7b7" }} /> NER repara el dímero
        </Etiqueta>
      )}

      <Etiqueta pos={[0, y0 - 0.8, 0]} col={`${mutageno.color}aa`}>
        <i className={`fa-solid ${mutageno.icono}`} style={{ color: mutageno.color }} /> {mutageno.categoria}: {mutageno.etq}
      </Etiqueta>
    </group>
  );
}

function DimeroBond({ a, b }: { a: Pt; b: Pt }) {
  const { pos, quat, len } = seg(a, b);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 4));
  });
  return (
    <mesh ref={ref} position={pos} quaternion={quat}>
      <cylinderGeometry args={[0.07, 0.07, len, 10]} />
      <meshStandardMaterial color="#fde047" emissive="#fbbf24" emissiveIntensity={0.6} />
    </mesh>
  );
}

function ChispaRotura({ y, playing }: { y: number; playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (g.current) g.current.visible = playing ? Math.sin(s.clock.elapsedTime * 18) > 0 : true;
  });
  const pts: Pt[] = [[HRAD - 0.3, y + 0.3, 0], [HRAD + 0.1, y, 0.2], [HRAD - 0.2, y - 0.3, -0.1]];
  return (
    <group ref={g}>
      <Line points={pts} color="#fecaca" lineWidth={3} />
      <pointLight position={[HRAD, y, 0]} color="#f87171" intensity={playing ? 2 : 0.6} distance={4} />
    </group>
  );
}

function Aducto({ pos, playing }: { pos: Pt; playing: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const k = playing ? 1 + 0.12 * Math.sin(s.clock.elapsedTime * 3) : 1;
    ref.current.scale.setScalar(k);
  });
  return (
    <mesh ref={ref} position={pos}>
      <dodecahedronGeometry args={[0.22, 0]} />
      <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.5} roughness={0.5} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Escena / cámara / post
 * ════════════════════════════════════════════════════════════════════════ */

function Contenido(props: MutacionesSceneProps) {
  const { modo, analisis, resultadoCromo, cromoDef, mutageno, dimero, reparar, modoColor, resetNonce, playing } = props;
  const giro = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (giro.current && playing && modo !== "puntuales") giro.current.rotation.y += dt * 0.1;
  });

  const mundo: ReactNode =
    modo === "puntuales" ? (
      <MundoPuntuales analisis={analisis} playing={playing} />
    ) : modo === "cromosomicas" ? (
      <MundoCromosomicas resultado={resultadoCromo} def={cromoDef} />
    ) : (
      <MundoMutagenos mutageno={mutageno} dimero={dimero} reparar={reparar} playing={playing} />
    );

  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 18, 46]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 9, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={70} depth={30} count={900} factor={3} fade speed={0.4} />

      <group ref={giro} key={`${modo}-${resetNonce}`}>{mundo}</group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.1} position={[0, 6, 4]} scale={8} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[5, 0, -4]} scale={6} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={28} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.22} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function MutacionesScene(props: MutacionesSceneProps) {
  const cam: Pt = props.modo === "puntuales" ? [0, 0.4, 12] : props.modo === "cromosomicas" ? [0, 0.2, 11] : [0, 0.4, 11];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 46 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
