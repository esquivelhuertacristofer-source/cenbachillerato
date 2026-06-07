"use client";

/**
 * Escena 3D del laboratorio "Estructura de una reacción química" (CNEYT-III·O4).
 *
 * Tres modos; TODA la animación ocurre dentro de useFrame mutando refs (nunca en
 * el render — reglas del React Compiler):
 *  - anatomia:    arma la ecuación en 3D (reactivos · flecha · productos) con sus
 *    moléculas (esferas = átomos); según escena.foco resalta reactivos, la flecha,
 *    los productos, los coeficientes o los subíndices.
 *  - conservacion: la misma ecuación con un panel de conteo de átomos por elemento
 *    a cada lado de la flecha; resalta reactivos, productos o el balance final.
 *  - simbologia:  galería flotante de los símbolos (→, ⇌, +, coef., subíndice,
 *    estados…) con su significado.
 *
 * Esquemática (no a escala): las moléculas son grupos de esferas; las fórmulas y
 * los conteos de átomos son exactos. Etiquetas con <Html> (NUNCA <Text> de drei:
 * cuelga el chunk con Turbopack).
 */

import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type Escena,
  type Reaccion,
  type Especie,
  contarAtomos,
  SIMBOLOS,
} from "./estructura-reaccion-data";

type Pt = [number, number, number];

export interface EstructuraReaccionSceneProps {
  modo: Modo;
  escena: Escena;
  reaccion: Reaccion;
  playing: boolean;
  modoColor: string;
  resetNonce: number;
}

/* Colores por elemento químico (convención CPK aproximada) */
const ELEMENTO_COLOR: Record<string, string> = {
  H: "#e2e8f0",
  C: "#475569",
  O: "#ef4444",
  N: "#3b82f6",
  Cl: "#22c55e",
  Na: "#a855f7",
};

function colorElemento(el: string): string {
  return ELEMENTO_COLOR[el] ?? "#fbbf24";
}

function pillStyle(color: string, big = false): React.CSSProperties {
  return {
    padding: big ? "6px 14px" : "4px 11px",
    borderRadius: 999,
    background: "rgba(4,10,22,0.82)",
    border: `1px solid ${color}`,
    color: "#fff",
    fontSize: big ? 15 : 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
    boxShadow: "0 6px 18px -8px #000",
  };
}

function Etiqueta({ pos, color, children, df = 12, big = false }: { pos: Pt; color: string; children: React.ReactNode; df?: number; big?: boolean }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={pillStyle(color, big)}>{children}</div>
    </Html>
  );
}

/* ── Átomos de una molécula (índice 0 al centro, el resto en círculo) ───────── */
function atomosExpandidos(especie: Especie): string[] {
  const out: string[] = [];
  // colocar el átomo "central" preferente (C, luego N, luego el de mayor count)
  const entries = Object.entries(especie.atomos);
  entries.sort((a, b) => {
    const pri = (el: string) => (el === "C" ? 3 : el === "N" ? 2 : el === "Na" ? 1 : 0);
    return pri(b[0]) - pri(a[0]);
  });
  for (const [el, n] of entries) for (let i = 0; i < n; i++) out.push(el);
  return out;
}

function Molecula({ especie, glow }: { especie: Especie; glow: number }) {
  const grp = useRef<THREE.Group>(null);
  const t = useRef(0);
  const atomos = atomosExpandidos(especie);
  useFrame((_, dt) => {
    t.current += dt;
    if (grp.current) {
      grp.current.rotation.y += dt * 0.5;
      const s = 1 + glow * 0.08 * (0.5 + 0.5 * Math.sin(t.current * 3));
      grp.current.scale.setScalar(s);
    }
  });
  const n = atomos.length;
  return (
    <group ref={grp}>
      {atomos.map((el, i) => {
        let p: Pt = [0, 0, 0];
        if (i > 0) {
          const a = ((i - 1) / Math.max(1, n - 1)) * Math.PI * 2;
          const r = 0.5;
          p = [Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 2) * 0.2];
        }
        const c = colorElemento(el);
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[i === 0 ? 0.34 : 0.26, 18, 18]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3 + glow * 0.5} roughness={0.3} metalness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Flecha de reacción (simple → o doble ⇌) ──────────────────────────────── */
function Flecha({ reversible, glow }: { reversible: boolean; glow: number }) {
  const grp = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (grp.current) {
      const e = 0.6 + glow * (0.4 + 0.4 * Math.sin(t.current * 4));
      grp.current.scale.setScalar(e);
    }
  });
  const color = glow > 0.1 ? "#fde047" : "#94a3b8";
  return (
    <group ref={grp}>
      {/* cuerpo */}
      <mesh position={[-0.1, reversible ? 0.18 : 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 1.2, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.6, reversible ? 0.18 : 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.16, 0.34, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {reversible && (
        <>
          <mesh position={[0.1, -0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 1.2, 10]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.6, -0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.16, 0.34, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ── Signo + entre especies ───────────────────────────────────────────────── */
function Mas() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.5} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ── Layout de una ecuación en el eje X ───────────────────────────────────── */
interface Slot {
  tipo: "especie" | "mas" | "flecha";
  especie?: Especie;
  lado?: "react" | "prod";
  x: number;
}

function construirSlots(r: Reaccion): { slots: Slot[]; ancho: number } {
  const seq: Omit<Slot, "x">[] = [];
  r.reactivos.forEach((e, i) => {
    if (i > 0) seq.push({ tipo: "mas" });
    seq.push({ tipo: "especie", especie: e, lado: "react" });
  });
  seq.push({ tipo: "flecha" });
  r.productos.forEach((e, i) => {
    if (i > 0) seq.push({ tipo: "mas" });
    seq.push({ tipo: "especie", especie: e, lado: "prod" });
  });
  const paso = 2.5;
  const ancho = (seq.length - 1) * paso;
  const slots: Slot[] = seq.map((s, i) => ({ ...s, x: i * paso - ancho / 2 }));
  return { slots, ancho };
}

function Ecuacion({ reaccion, foco }: { reaccion: Reaccion; foco: Escena["foco"] }) {
  const { slots } = construirSlots(reaccion);
  const focoReact = foco === "reactivos";
  const focoProd = foco === "productos";
  const focoFlecha = foco === "flecha";
  const focoCoef = foco === "coeficientes";
  const focoSub = foco === "subindices";

  return (
    <group>
      {slots.map((s, i) => {
        if (s.tipo === "mas") return <group key={i} position={[s.x, 0, 0]}><Mas /></group>;
        if (s.tipo === "flecha")
          return (
            <group key={i} position={[s.x, 0, 0]}>
              <Flecha reversible={reaccion.reversible} glow={focoFlecha ? 1 : foco === "comparar" || foco === "ecuacion" ? 0.2 : 0} />
              {focoFlecha && <Etiqueta pos={[0.2, -1.2, 0]} color="#fde047cc">{reaccion.reversible ? "⇌ reversible: «en ambos sentidos»" : "→ «se transforma en»"}</Etiqueta>}
            </group>
          );
        const e = s.especie as Especie;
        const esReact = s.lado === "react";
        const dim = (focoReact && !esReact) || (focoProd && esReact);
        const glow = (focoReact && esReact) || (focoProd && !esReact) ? 1 : 0;
        const coefColor = focoCoef ? "#fbbf24" : esReact ? "#cbd5e1" : "#cbd5e1";
        return (
          <group key={i} position={[s.x, 0, 0]} scale={dim ? 0.78 : 1}>
            <Molecula especie={e} glow={glow} />
            {/* coeficiente (si > 1) */}
            {e.coef > 1 && (
              <Etiqueta pos={[-0.95, 0.05, 0]} color={`${coefColor}${focoCoef ? "ff" : "aa"}`} big={focoCoef}>
                {e.coef}
              </Etiqueta>
            )}
            {/* fórmula + estado */}
            <Etiqueta pos={[0, -1.15, 0]} color={focoSub ? "#fb923cff" : esReact ? "#38bdf8cc" : "#34d399cc"} big={focoSub}>
              {e.formula} ({e.estado})
            </Etiqueta>
            {/* etiqueta de lado al inicio de cada bloque */}
          </group>
        );
      })}
    </group>
  );
}

/* ── Panel de conteo de átomos (modo conservación) ────────────────────────── */
function PanelConteo({ reaccion, foco }: { reaccion: Reaccion; foco: Escena["foco"] }) {
  const c = contarAtomos(reaccion);
  const verR = foco === "reactivos" || foco === "comparar" || foco === "ecuacion";
  const verP = foco === "productos" || foco === "comparar" || foco === "ecuacion";
  const n = c.elementos.length;
  const paso = 1.7;
  const ancho = (n - 1) * paso;
  const maxAt = Math.max(1, ...c.elementos.map((el) => Math.max(c.reactivos[el] ?? 0, c.productos[el] ?? 0)));
  return (
    <group position={[0, -3.2, 0]}>
      {c.elementos.map((el, i) => {
        const x = i * paso - ancho / 2;
        const nr = c.reactivos[el] ?? 0;
        const np = c.productos[el] ?? 0;
        const igual = nr === np;
        const col = colorElemento(el);
        const hR = (nr / maxAt) * 1.6;
        const hP = (np / maxAt) * 1.6;
        return (
          <group key={el} position={[x, 0, 0]}>
            {/* barra reactivos */}
            {verR && (
              <mesh position={[-0.4, hR / 2, 0]}>
                <boxGeometry args={[0.55, Math.max(0.05, hR), 0.4]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.35} roughness={0.4} />
              </mesh>
            )}
            {/* barra productos */}
            {verP && (
              <mesh position={[0.4, hP / 2, 0]}>
                <boxGeometry args={[0.55, Math.max(0.05, hP), 0.4]} />
                <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.35} roughness={0.4} />
              </mesh>
            )}
            <Etiqueta pos={[0, -0.5, 0]} color={`${col}dd`}>
              {el}: {verR ? nr : "—"} / {verP ? np : "—"} {foco === "comparar" ? (igual ? "✓" : "✗") : ""}
            </Etiqueta>
          </group>
        );
      })}
      {foco === "comparar" && (
        <Etiqueta pos={[0, 2.5, 0]} color={c.balanceada ? "#34d399ff" : "#ef4444ff"} big>
          {c.balanceada ? "Materia conservada ✓ (ecuación balanceada)" : "No coincide ✗"}
        </Etiqueta>
      )}
      {(foco === "reactivos" || foco === "productos") && (
        <Etiqueta pos={[0, 2.5, 0]} color={foco === "reactivos" ? "#38bdf8cc" : "#34d399cc"}>
          {foco === "reactivos" ? "Átomos en los REACTIVOS (coef × subíndice)" : "Átomos en los PRODUCTOS (coef × subíndice)"}
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Galería de simbología ────────────────────────────────────────────────── */
function GaleriaSimbolos() {
  const cols = 4;
  const paso = 3.0;
  const filaPaso = 3.0;
  return (
    <group>
      {SIMBOLOS.map((s, i) => {
        const col = i % cols;
        const fila = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * paso;
        const y = 2.6 - fila * filaPaso;
        return (
          <group key={s.nombre} position={[x, y, 0]}>
            <mesh>
              <boxGeometry args={[2.5, 2.4, 0.18]} />
              <meshStandardMaterial color="#0a1626" emissive={s.color} emissiveIntensity={0.12} roughness={0.6} />
            </mesh>
            <Etiqueta pos={[0, 0.55, 0.2]} color={s.color} big>{s.simbolo}</Etiqueta>
            <Etiqueta pos={[0, -0.35, 0.2]} color={`${s.color}cc`}>{s.nombre}</Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

function Contenido({ modo, escena, reaccion, playing, modoColor, resetNonce }: EstructuraReaccionSceneProps) {
  void playing;
  return (
    <>
      <color attach="background" args={["#040b12"]} />
      <fog attach="fog" args={["#040b12", 26, 70]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 9, 6]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={80} depth={40} count={900} factor={3} fade speed={0.4} />

      <group key={`${modo}-${reaccion.id}-${resetNonce}`}>
        {modo === "simbologia" ? (
          <GaleriaSimbolos />
        ) : (
          <>
            <group position={[0, modo === "conservacion" ? 1.3 : 0, 0]}>
              <Ecuacion reaccion={reaccion} foco={escena.foco} />
            </group>
            {/* etiquetas de lado */}
            {modo === "anatomia" && (escena.foco === "reactivos" || escena.foco === "ecuacion") && (
              <Etiqueta pos={[-3.6, 1.6, 0]} color="#38bdf8cc">REACTIVOS</Etiqueta>
            )}
            {modo === "anatomia" && (escena.foco === "productos" || escena.foco === "ecuacion") && (
              <Etiqueta pos={[3.6, 1.6, 0]} color="#34d399cc">PRODUCTOS</Etiqueta>
            )}
            {modo === "anatomia" && escena.foco === "coeficientes" && (
              <Etiqueta pos={[0, 2.3, 0]} color="#fbbf24cc">COEFICIENTE = cuántas moléculas (número grande al frente)</Etiqueta>
            )}
            {modo === "anatomia" && escena.foco === "subindices" && (
              <Etiqueta pos={[0, 2.3, 0]} color="#fb923ccc">SUBÍNDICE = cuántos átomos por molécula (número pequeño dentro)</Etiqueta>
            )}
            {modo === "conservacion" && <PanelConteo reaccion={reaccion} foco={escena.foco} />}
          </>
        )}
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.0} position={[0, 6, 4]} scale={10} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[6, 0, -4]} scale={7} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={8} maxDistance={48} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function EstructuraReaccionScene(props: EstructuraReaccionSceneProps) {
  const cam: Pt = props.modo === "simbologia" ? [0, 0, 16] : props.modo === "conservacion" ? [0, -0.4, 16] : [0, 0.4, 14];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
