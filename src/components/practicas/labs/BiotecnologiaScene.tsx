"use client";

/**
 * Escena 3D del laboratorio "Biotecnología y bioética: CRISPR, OGM, clonación"
 * (CNEYT-VI-P08). Tres modos manipulables:
 *
 *  - crispr:      una doble hélice horizontal con la secuencia diana y el PAM
 *                 (5'-NGG-3'); la ARN guía (sgRNA) se aparea y la proteína Cas9
 *                 corta. Según la reparación elegida se muestra el resultado:
 *                 NHEJ (indel → knockout) o HDR (inserción precisa).
 *  - transgenico: ADN recombinante — un gen foráneo se corta e inserta en un
 *                 plásmido y se transforma el hospedero, que produce la proteína
 *                 (insulina humana, maíz Bt, arroz dorado).
 *  - clonacion:   transferencia nuclear de células somáticas (Dolly): el núcleo
 *                 del donante pasa a un óvulo enucleado y, según el fin, da un
 *                 clon (reproductiva) o células madre (terapéutica).
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
  type ResultadoCrispr,
  type Reparacion,
  type TransgenDef,
  type ClonDef,
  PROTOSPACER,
  HEBRA_TOP,
  HEBRA_BOT,
  SGRNA,
  CORTE_IDX,
} from "./biotecnologia-data";

export interface BiotecnologiaSceneProps {
  modo: Modo;
  // crispr
  resultadoCrispr: ResultadoCrispr;
  reparacion: Reparacion;
  cortar: boolean;
  // transgénico
  transgen: TransgenDef;
  // clonación
  clon: ClonDef;
  playing: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
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

/* ── Tesela de un nucleótido (caja coloreada con letra) ──────────────── */
function NucBox({ pos, base, resaltar, pam, playing, faint }: { pos: Pt; base: string; resaltar?: boolean; pam?: boolean; playing?: boolean; faint?: boolean }) {
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
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.3} roughness={0.42} transparent opacity={faint ? 0.3 : 1} />
      </mesh>
      <Letra pos={[0, 0, 0.28]} df={7} size={14} col={pam ? "#0f172a" : "#04121f"}>{base}</Letra>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · CRISPR-Cas9
 * ════════════════════════════════════════════════════════════════════════ */

const STEP = 0.52;

function Cas9({ x, playing }: { x: number; playing: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const k = playing ? 1 + 0.06 * Math.sin(s.clock.elapsedTime * 2.4) : 1;
    ref.current.scale.set(k, k * 1.15, k);
  });
  return (
    <mesh ref={ref} position={[x, 0, -0.4]}>
      <sphereGeometry args={[1.05, 28, 28]} />
      <meshStandardMaterial color="#1e3a8a" emissive="#1d4ed8" emissiveIntensity={0.25} roughness={0.35} metalness={0.2} transparent opacity={0.45} />
    </mesh>
  );
}

function MundoCrispr({ res, cortar, reparacion, playing }: { res: ResultadoCrispr; cortar: boolean; reparacion: Reparacion; playing: boolean }) {
  const n = HEBRA_TOP.length;
  const startX = -((n - 1) * STEP) / 2;
  const yTop = 0.85;
  const yBot = -0.05;
  const xCut = startX + (CORTE_IDX - 0.5) * STEP;
  const pamStart = PROTOSPACER.length;

  const nodes: ReactNode[] = [];

  // hebras superior e inferior + escalones
  for (let i = 0; i < n; i++) {
    const x = startX + i * STEP;
    const esPam = i >= pamStart;
    const cortadoAqui = cortar && (i === CORTE_IDX - 1 || i === CORTE_IDX);
    nodes.push(<NucBox key={`t${i}`} pos={[x, yTop, 0]} base={HEBRA_TOP[i]!} pam={esPam} resaltar={cortadoAqui} playing={playing} />);
    nodes.push(<NucBox key={`b${i}`} pos={[x, yBot, 0]} base={HEBRA_BOT[i]!} pam={esPam} resaltar={cortadoAqui} playing={playing} />);
    // escalón (puente de H) — se omite justo en el corte
    const enCorte = cortar && i === CORTE_IDX;
    if (!enCorte) {
      nodes.push(<Line key={`r${i}`} points={[[x, yTop - 0.2, 0], [x, yBot + 0.2, 0]]} color="#334155" lineWidth={1.6} />);
    }
  }

  // ARN guía (sgRNA) sobre el protospacer
  const sg: ReactNode[] = [];
  const ySg = 2.0;
  for (let i = 0; i < SGRNA.length; i++) {
    const x = startX + i * STEP;
    const col = BASE_COLOR[SGRNA[i]!] ?? "#fb923c";
    sg.push(
      <mesh key={`sg${i}`} position={[x, ySg, 0.1]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} roughness={0.4} />
      </mesh>,
    );
    sg.push(<Line key={`sgl${i}`} points={[[x, ySg - 0.15, 0.1], [x, yTop + 0.22, 0]]} color="#a78bfa" lineWidth={1.2} />);
  }

  return (
    <group>
      {nodes}
      {sg}

      {/* etiquetas de hebras */}
      <Etiqueta pos={[startX - 0.9, yTop, 0]} col="#38bdf8aa" df={11}>ADN diana</Etiqueta>
      <Etiqueta pos={[startX + ((SGRNA.length - 1) / 2) * STEP, ySg + 0.55, 0]} col="#a855f7aa">
        <i className="fa-solid fa-dna" style={{ color: "#c4b5fd" }} /> ARN guía (sgRNA)
      </Etiqueta>

      {/* PAM */}
      <Etiqueta pos={[startX + (pamStart + 1) * STEP, yBot - 0.7, 0]} col="#e2e8f0aa" df={11}>PAM 5′-NGG-3′</Etiqueta>

      {/* Cas9 + corte */}
      <Cas9 x={xCut} playing={playing} />
      {!cortar && (
        <Etiqueta pos={[xCut, -1.7, 0]} col="#60a5faaa">
          <i className="fa-solid fa-scissors" style={{ color: "#93c5fd" }} /> Cas9 lista para cortar
        </Etiqueta>
      )}
      {cortar && (
        <>
          <CorteFlash x={xCut} playing={playing} />
          <Etiqueta pos={[xCut, -1.7, 0]} col="#f87171aa">
            <i className="fa-solid fa-bolt" style={{ color: "#fca5a5" }} /> Corte de doble cadena (3 pb antes del PAM)
          </Etiqueta>
        </>
      )}

      {/* resultado de la reparación */}
      {cortar && <Resultado res={res} reparacion={reparacion} playing={playing} startXdiana={startX} n={n} />}
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
      <Line points={[[x, 1.3, 0.3], [x, -0.5, 0.3]]} color="#fecaca" lineWidth={3} dashed dashSize={0.12} gapSize={0.1} />
      <pointLight ref={ref} position={[x, 0.4, 0.5]} color="#f87171" intensity={2} distance={5} />
    </>
  );
}

function Resultado({ res, reparacion, playing, startXdiana, n }: { res: ResultadoCrispr; reparacion: Reparacion; playing: boolean; startXdiana: number; n: number }) {
  const seq = res.editada;
  const yR = -3.0;
  const step = STEP;
  const startX = -((seq.length - 1) * step) / 2;
  const col = reparacion === "hdr" ? "#34d399" : "#fb923c";
  const tiles = seq.map((b, i) => (
    <NucBox key={`res${i}`} pos={[startX + i * step, yR, 0]} base={b} resaltar={res.marca.includes(i)} playing={playing} />
  ));
  void startXdiana; void n;
  return (
    <group>
      <Line points={[[0, -2.2, 0], [0, yR + 0.4, 0]]} color={col} lineWidth={2} />
      {tiles}
      <Etiqueta pos={[startX - 1.0, yR, 0]} col={`${col}aa`} df={11}>{res.rep.etq}</Etiqueta>
      <Etiqueta pos={[0, yR - 0.8, 0]} col={`${col}aa`}>
        <i className={`fa-solid ${res.rep.icono}`} style={{ color: col }} /> {res.titulo}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · TRANSGÉNICO / ADN RECOMBINANTE
 * ════════════════════════════════════════════════════════════════════════ */

function Plasmido({ pos, color }: { pos: Pt; color: string }) {
  return (
    <mesh position={pos} rotation={[Math.PI / 2.6, 0, 0]}>
      <torusGeometry args={[1.0, 0.13, 16, 48]} />
      <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.3} roughness={0.4} />
      <Etiqueta pos={[0, 1.5, 0]} col="#38bdf8aa">Plásmido</Etiqueta>
      {/* marcador del color del gen ya integrado, decorativo */}
      <mesh position={[0, 0, 0]} visible={false}><sphereGeometry args={[0.01]} /><meshStandardMaterial color={color} /></mesh>
    </mesh>
  );
}

/** Gen foráneo que orbita y se inserta en el plásmido (animado por ref). */
function GenForaneo({ color, playing }: { color: string; playing: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    // ciclo 0..1: el gen viaja desde la derecha hacia el plásmido (centro-izq)
    const t = playing ? (s.clock.elapsedTime * 0.25) % 1 : 0.5;
    const x = 3.4 - t * 3.4; // de x=3.4 (gen aislado) a x=0 (insertado)
    ref.current.position.set(x, 0, 0);
    const e = (ref.current.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial;
    if (e) e.emissiveIntensity = 0.4 + 0.3 * Math.sin(s.clock.elapsedTime * 4);
  });
  return (
    <group ref={ref} position={[3.4, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.9, 0.34, 0.34]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
      <Letra pos={[0, 0.55, 0]} df={10} col={color} size={12}>gen</Letra>
    </group>
  );
}

/** Hospedero: bacteria E. coli (cápsula), maíz o arroz según el caso. */
function Hospedero({ transgen, playing }: { transgen: TransgenDef; playing: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const k = playing ? 1 + 0.05 * Math.sin(s.clock.elapsedTime * 2) : 1;
    ref.current.scale.set(k, k, k);
  });
  return (
    <group position={[4.6, 0, 0]}>
      <mesh ref={ref} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.5, 0.9, 8, 16]} />
        <meshStandardMaterial color={transgen.color} emissive={transgen.color} emissiveIntensity={0.25} roughness={0.5} />
      </mesh>
      <Etiqueta pos={[0, 1.2, 0]} col={`${transgen.color}aa`}>
        <i className={`fa-solid ${transgen.icono}`} style={{ color: transgen.color }} /> {transgen.hospedero}
      </Etiqueta>
      <Productos color={transgen.color} playing={playing} />
      <Etiqueta pos={[0, -1.3, 0]} col={`${transgen.color}aa`}>Produce: {transgen.producto}</Etiqueta>
    </group>
  );
}

/** Pequeñas esferas (proteína producida) que emergen del hospedero. */
function Productos({ color, playing }: { color: string; playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!g.current) return;
    g.current.children.forEach((c, i) => {
      const t = playing ? (s.clock.elapsedTime * 0.5 + i * 0.33) % 1 : 0.4 + i * 0.2;
      c.position.set(0.8 + t * 1.4, Math.sin(i * 2) * 0.5 * t, Math.cos(i * 2) * 0.4 * t);
      (c as THREE.Mesh).visible = playing || t < 0.7;
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (m) m.opacity = 1 - t * 0.7;
    });
  });
  return (
    <group ref={g}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

function MundoTransgenico({ transgen, playing }: { transgen: TransgenDef; playing: boolean }) {
  return (
    <group>
      <Plasmido pos={[-3.6, 0, 0]} color={transgen.color} />
      <GenForaneo color={transgen.color} playing={playing} />
      {/* flujo: plásmido recombinante → hospedero */}
      <Line points={[[-2.4, 0, 0], [3.9, 0, 0]]} color="#475569" lineWidth={1.6} dashed dashSize={0.18} gapSize={0.12} />
      <Hospedero transgen={transgen} playing={playing} />
      <Etiqueta pos={[-3.6, -1.7, 0]} col="#94a3b8aa">
        <i className="fa-solid fa-scissors" style={{ color: "#cbd5e1" }} /> Enzima de restricción + ADN ligasa
      </Etiqueta>
      <Etiqueta pos={[0, 2.6, 0]} col={`${transgen.color}aa`}>
        <i className={`fa-solid ${transgen.icono}`} style={{ color: transgen.color }} /> {transgen.etq} · {transgen.anio}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · CLONACIÓN (transferencia nuclear de células somáticas)
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
      {label && <Etiqueta pos={[0, r + 0.5, 0]} col={labelCol ?? "#94a3b8aa"} df={11}>{label}</Etiqueta>}
    </group>
  );
}

/** Núcleo que viaja del donante al óvulo enucleado (animado). */
function NucleoViajero({ from, to, playing, color }: { from: Pt; to: Pt; playing: boolean; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = playing ? (s.clock.elapsedTime * 0.3) % 1 : 0.5;
    ref.current.position.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * 0.6, from[2]);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.28, 18, 18]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.4} />
    </mesh>
  );
}

function MundoClonacion({ clon, playing }: { clon: ClonDef; playing: boolean }) {
  const donanteColor = "#a855f7";
  const reproductiva = clon.id === "reproductiva";
  return (
    <group>
      {/* donante (célula somática con núcleo) */}
      <Celula pos={[-4.2, 1.4, 0]} r={0.75} color="#38bdf8" nucleo nucleoColor={donanteColor} label="Donante (somática)" labelCol="#38bdf8aa" />
      {/* óvulo enucleado */}
      <Celula pos={[-1.4, -1.2, 0]} r={1.0} color="#fbbf24" nucleo={false} label="Óvulo enucleado" labelCol="#fbbf24aa" />
      <NucleoViajero from={[-4.2, 1.4, 0]} to={[-1.4, -1.2, 0]} playing={playing} color={donanteColor} />
      <Etiqueta pos={[-2.8, 0.6, 0]} col="#a855f7aa">
        <i className="fa-solid fa-arrow-right" style={{ color: "#c084fc" }} /> Transferencia nuclear
      </Etiqueta>

      {/* embrión reconstruido */}
      <Celula pos={[1.2, -0.2, 0]} r={0.85} color="#34d399" nucleo nucleoColor={donanteColor} label="Embrión (clon)" labelCol="#34d399aa" />
      <Line points={[[-0.4, -1.0, 0], [0.5, -0.4, 0]]} color="#475569" lineWidth={1.6} />

      {/* desenlace según el fin */}
      {reproductiva ? (
        <group>
          <Celula pos={[4.4, 0.4, 0]} r={0.65} color="#38bdf8" nucleo nucleoColor={donanteColor} />
          <mesh position={[4.4, -0.9, 0]}>
            <sphereGeometry args={[0.45, 20, 20]} />
            <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={0.4} roughness={0.5} />
          </mesh>
          <Etiqueta pos={[4.4, 1.4, 0]} col="#a855f7aa">
            <i className="fa-solid fa-clone" style={{ color: "#c084fc" }} /> Clon idéntico al donante
          </Etiqueta>
          <Etiqueta pos={[4.4, -1.8, 0]} col="#a855f7aa" df={11}>Se implanta en madre sustituta</Etiqueta>
        </group>
      ) : (
        <group>
          {[[4.0, 0.5], [4.7, 0.1], [4.2, -0.4], [4.9, -0.7]].map((p, i) => (
            <mesh key={i} position={[p[0]!, p[1]!, 0]}>
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.5} roughness={0.4} />
            </mesh>
          ))}
          <Etiqueta pos={[4.5, 1.3, 0]} col="#34d399aa">
            <i className="fa-solid fa-staff-snake" style={{ color: "#6ee7b7" }} /> Células madre (medicina regenerativa)
          </Etiqueta>
          <Etiqueta pos={[4.5, -1.6, 0]} col="#34d399aa" df={11}>No se implanta — sin fin reproductivo</Etiqueta>
        </group>
      )}

      <Etiqueta pos={[0, 2.6, 0]} col={`${clon.color}aa`}>
        <i className={`fa-solid ${reproductiva ? "fa-clone" : "fa-staff-snake"}`} style={{ color: clon.color }} /> Clonación {clon.etq.toLowerCase()}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Escena / cámara / post
 * ════════════════════════════════════════════════════════════════════════ */

function Contenido(props: BiotecnologiaSceneProps) {
  const { modo, resultadoCrispr, reparacion, cortar, transgen, clon, modoColor, resetNonce, playing } = props;
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (giro.current && playing && modo === "clonacion") giro.current.rotation.y += dt * 0.05;
  });

  const mundo: ReactNode =
    modo === "crispr" ? (
      <MundoCrispr res={resultadoCrispr} cortar={cortar} reparacion={reparacion} playing={playing} />
    ) : modo === "transgenico" ? (
      <MundoTransgenico transgen={transgen} playing={playing} />
    ) : (
      <MundoClonacion clon={clon} playing={playing} />
    );

  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 18, 48]} />
      <ambientLight intensity={0.66} />
      <directionalLight position={[6, 9, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={70} depth={30} count={900} factor={3} fade speed={0.4} />

      <group ref={giro} key={`${modo}-${resetNonce}`}>{mundo}</group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.1} position={[0, 6, 4]} scale={8} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[5, 0, -4]} scale={6} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={7} maxDistance={30} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.22} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function BiotecnologiaScene(props: BiotecnologiaSceneProps) {
  const cam: Pt = props.modo === "crispr" ? [0, -0.4, 13] : props.modo === "transgenico" ? [0, 0.3, 13] : [0, 0.2, 13];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 46 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
