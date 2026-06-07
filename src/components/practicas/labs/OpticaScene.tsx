"use client";

/**
 * Escena 3D — "Óptica geométrica: lentes, espejos y formación de imágenes"
 * (CNEYT-V-P06-A2).
 *
 * Tres MODOS, según la prop `modo`:
 *  · "lentes"     — banco óptico con una lente convergente o divergente. El objeto
 *    (flecha) se coloca a la distancia dₒ; se trazan dos rayos principales (el
 *    paralelo, que sale por el foco, y el que pasa por el centro, que no se desvía)
 *    y donde se cruzan se forma la imagen. Imagen real (al otro lado) o virtual
 *    (mismo lado, líneas punteadas). Verifica 1/f = 1/dₒ + 1/dᵢ y M = −dᵢ/dₒ.
 *  · "espejos"    — espejo plano, cóncavo o convexo. Mismo trazo de rayos, pero la
 *    luz se refleja: la imagen real queda del MISMO lado que el objeto.
 *  · "refraccion" — frontera entre dos medios (aire, agua, vidrio, diamante). Un
 *    rayo incide con ángulo θ₁ y se refracta con θ₂ según n₁·sen θ₁ = n₂·sen θ₂.
 *    Al superar el ángulo crítico θ_c hay reflexión total interna (fibra óptica).
 *
 * Patrón R3F: el default export solo monta <Canvas key={modo}> y delega en
 * <Contenido>. React Compiler: la animación (un fotón que recorre los rayos) vive
 * en useFrame que MUTA la posición de un ref (nunca setState). La construcción de
 * rayos es 2D (plano z = 0) sobre cálculo exacto; los números del panel son los
 * que devuelven resolverGauss / resolverSnell.
 */

import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo, type TipoLente, type TipoEspejo,
  resolverGauss, resolverSnell, medioPorId,
  H_OBJ, fmtAng, fmtDist, fmtAumento, fmt2,
} from "./optica-data";

export interface OpticaSceneProps {
  modo: Modo;
  // lentes
  tipoLente: TipoLente;
  fLente: number;   // |f|
  doLente: number;
  // espejos
  tipoEspejo: TipoEspejo;
  fEspejo: number;  // |f|
  doEspejo: number;
  // refracción
  medio1: string;
  medio2: string;
  thetaInc: number;
  // común
  playing: boolean;
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Escala visual ────────────────────────────────────────────────────────── */
const X = 7;          // semiancho del dominio (scene units)
const Y = 4.2;        // semialto útil
const SX = 0.8;       // scene units por "u" (eje X)
const SY = 0.9;       // scene units por "u" (eje Y)

const P = (ux: number, uy: number): Pt => [ux * SX, uy * SY, 0];

/** Punto de la recta A→B evaluado en scene-x = ex (devuelve null si es vertical). */
function pointAtX(a: Pt, b: Pt, ex: number): Pt | null {
  const dx = b[0] - a[0];
  if (Math.abs(dx) < 1e-6) return null;
  const t = (ex - a[0]) / dx;
  return [ex, a[1] + t * (b[1] - a[1]), 0];
}

const RAD = Math.PI / 180;

/* ── Fotón que recorre una trayectoria (loop) ─────────────────────────────── */
function Photon({ path, color, playing, speed = 3.2 }: { path: Pt[]; color: string; playing: boolean; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const dRef = useRef(0);

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m || path.length < 2) return;
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!, b = path[i]!;
      total += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    if (total < 1e-4) return;
    if (playing) dRef.current = (dRef.current + dt * speed) % total;
    let d = dRef.current;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!, b = path[i]!;
      const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (d <= seg) {
        const t = seg < 1e-6 ? 0 : d / seg;
        m.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0.02);
        return;
      }
      d -= seg;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} toneMapped={false} />
    </mesh>
  );
}

/* ── Título flotante ──────────────────────────────────────────────────────── */
function Titulo({ texto, sub, color }: { texto: string; sub?: string; color: string }) {
  return (
    <Html position={[0, Y + 1.0, 0]} center distanceFactor={20} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", textAlign: "center", padding: "4px 12px", borderRadius: 10,
        background: "rgba(4,12,26,0.9)", border: `1px solid ${color}aa`, color: "#fff",
        fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontWeight: 900, fontSize: 12 }}>{texto}</div>
        {sub && <div style={{ fontWeight: 800, fontSize: 10.5, color }}>{sub}</div>}
      </div>
    </Html>
  );
}

/* ── Eje óptico ───────────────────────────────────────────────────────────── */
function EjeOptico() {
  return (
    <Line points={[[-X, 0, 0], [X, 0, 0]] as Pt[]} color="#46587a" lineWidth={1} transparent opacity={0.55} dashed dashSize={0.22} gapSize={0.16} />
  );
}

/* ── Flecha vertical (objeto / imagen) ────────────────────────────────────── */
function Flecha({ x, h, color, label, sub, dashed = false }: { x: number; h: number; color: string; label: string; sub?: string; dashed?: boolean }) {
  const tip: Pt = [x, h, 0];
  const base: Pt = [x, 0, 0];
  const up = h >= 0;
  const hd = 0.26 * (up ? 1 : -1);
  return (
    <group>
      <Line points={[base, tip] as Pt[]} color={color} lineWidth={dashed ? 2 : 3} transparent opacity={dashed ? 0.7 : 1} dashed={dashed} dashSize={0.16} gapSize={0.12} />
      <Line points={[[x - 0.16, h - hd, 0], tip, [x + 0.16, h - hd, 0]] as Pt[]} color={color} lineWidth={dashed ? 2 : 3} transparent opacity={dashed ? 0.7 : 1} dashed={dashed} dashSize={0.1} gapSize={0.08} />
      <Html position={[x, h + (up ? 0.5 : -0.5), 0]} center distanceFactor={17} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "2px 8px", borderRadius: 8, background: "rgba(5,13,26,0.85)", border: `1px solid ${color}88`, color, fontWeight: 900, fontSize: 10, fontFamily: "system-ui, sans-serif" }}>
          {label}{sub && <div style={{ fontSize: 8.5, fontWeight: 800, color: "rgba(220,232,255,0.75)" }}>{sub}</div>}
        </div>
      </Html>
    </group>
  );
}

/* ── Marca de foco ────────────────────────────────────────────────────────── */
function Foco({ x, etq, color = "#fbbf24" }: { x: number; etq: string; color?: string }) {
  return (
    <group>
      <mesh position={[x, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <Html position={[x, -0.42, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{ fontSize: 9, fontWeight: 900, color, fontFamily: "ui-monospace, monospace" }}>{etq}</div>
      </Html>
    </group>
  );
}

/* ── Símbolo de la lente ──────────────────────────────────────────────────── */
function SimboloLente({ tipo, color }: { tipo: TipoLente; color: string }) {
  const top = Y - 0.6, bot = -(Y - 0.6);
  const conv = tipo === "convergente";
  // flechas en los extremos: hacia afuera (convergente) o hacia adentro (divergente)
  const a = 0.28;
  return (
    <group>
      <Line points={[[0, bot, 0], [0, top, 0]] as Pt[]} color={color} lineWidth={3} transparent opacity={0.92} />
      {/* punta superior */}
      <Line points={[[-a, top + (conv ? -a : a) * 0 - (conv ? a : -a), 0], [0, top, 0], [a, top - (conv ? a : -a), 0]] as Pt[]} color={color} lineWidth={3} transparent opacity={0.92} />
      {/* punta inferior */}
      <Line points={[[-a, bot + (conv ? a : -a), 0], [0, bot, 0], [a, bot + (conv ? a : -a), 0]] as Pt[]} color={color} lineWidth={3} transparent opacity={0.92} />
      {/* cuerpo translúcido */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[0.5, (top - bot)]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Símbolo del espejo (arco) ────────────────────────────────────────────── */
function SimboloEspejo({ tipo, color }: { tipo: TipoEspejo; color: string }) {
  const h = Y - 0.5;
  const N = 28;
  const curv = tipo === "plano" ? 0 : tipo === "concavo" ? 0.9 : -0.9; // cóncavo abre a la izquierda (hacia el objeto)
  const pts: Pt[] = [];
  for (let i = 0; i < N; i++) {
    const y = -h + (2 * h * i) / (N - 1);
    const x = curv * (1 - (y / h) * (y / h)); // parábola: vértice en x=0
    pts.push([x, y, 0]);
  }
  return (
    <group>
      <Line points={pts} color={color} lineWidth={3} transparent opacity={0.95} />
      {/* rayado del reverso */}
      {Array.from({ length: 9 }, (_, i) => {
        const y = -h + (2 * h * (i + 0.5)) / 9;
        const x = curv * (1 - (y / h) * (y / h));
        const dir = tipo === "convexo" ? -1 : 1;
        return <Line key={i} points={[[x, y, 0], [x + dir * 0.22, y - 0.18, 0]] as Pt[]} color={color} lineWidth={1.5} transparent opacity={0.45} />;
      })}
    </group>
  );
}

/* ── (a) + (b) Construcción de rayos genérica (lente o espejo) ────────────── */
function EscenaImagen({
  esLente, f, do_, color, playing,
}: { esLente: boolean; f: number; do_: number; color: string; playing: boolean }) {
  const ho = H_OBJ;
  const r = resolverGauss(f, do_, ho);
  const dir = esLente ? 1 : -1; // los rayos emergentes van a la derecha (lente) o regresan a la izquierda (espejo)

  // puntos en scene-coords
  const tipObj = P(-do_, ho);            // punta del objeto (siempre a la izquierda)
  const lensTop = P(0, ho);              // donde el rayo paralelo toca el componente
  const center: Pt = [0, 0, 0];          // centro / vértice

  const enInf = r.enInfinito;
  const xImgU = dir * r.di;              // u-x de la imagen (con signo del lado)
  const hiU = r.hi;
  const pImg: Pt = P(xImgU, isFinite(hiU) ? hiU : 0);
  const virtual = r.tipoImagen === "virtual";
  const endX = dir * X;                  // borde por donde salen los rayos emergentes

  // rayos emergentes (solo si la imagen no está en el infinito)
  const ray1End = enInf ? P(endX / SX, ho) : pointAtX(lensTop, pImg, endX); // paralelo → foco
  const ray2End = enInf ? pointAtX(tipObj, center, endX) : pointAtX(center, pImg, endX); // por el centro/vértice

  const focColor = "#fbbf24";

  return (
    <group>
      <EjeOptico />
      {esLente
        ? <SimboloLente tipo={f >= 0 ? "convergente" : "divergente"} color={color} />
        : null}

      {/* focos */}
      {isFinite(f) && Math.abs(f) > 1e-3 && (
        <>
          <Foco x={(esLente ? Math.abs(f) : -Math.abs(f)) * SX * Math.sign(f === 0 ? 1 : f)} etq={esLente ? "F′" : "F"} color={focColor} />
          <Foco x={-(esLente ? Math.abs(f) : -Math.abs(f)) * SX * Math.sign(f === 0 ? 1 : f)} etq={esLente ? "F" : "C·F"} color={focColor} />
        </>
      )}

      {/* rayo incidente 1 (paralelo al eje) */}
      <Line points={[tipObj, lensTop] as Pt[]} color={color} lineWidth={2} transparent opacity={0.9} />
      {ray1End && <Line points={[lensTop, ray1End] as Pt[]} color={color} lineWidth={2} transparent opacity={0.9} />}
      {/* rayo incidente 2 (por el centro / vértice) */}
      <Line points={[tipObj, center] as Pt[]} color="#67e8f9" lineWidth={2} transparent opacity={0.9} />
      {ray2End && <Line points={[center, ray2End] as Pt[]} color="#67e8f9" lineWidth={2} transparent opacity={0.9} />}

      {/* extensiones punteadas a la imagen virtual */}
      {virtual && !enInf && (
        <>
          <Line points={[lensTop, pImg] as Pt[]} color={color} lineWidth={1.5} transparent opacity={0.5} dashed dashSize={0.16} gapSize={0.12} />
          <Line points={[center, pImg] as Pt[]} color="#67e8f9" lineWidth={1.5} transparent opacity={0.5} dashed dashSize={0.16} gapSize={0.12} />
        </>
      )}

      {/* objeto */}
      <Flecha x={-do_ * SX} h={ho * SY} color="#86efac" label="objeto" sub={fmtDist(do_)} />

      {/* imagen */}
      {!enInf && Math.abs(xImgU) <= (X / SX) + 0.6 && isFinite(hiU) && (
        <Flecha x={xImgU * SX} h={hiU * SY} color={virtual ? "#fca5a5" : "#fde047"} label={virtual ? "imagen virtual" : "imagen real"} sub={`${r.orientacion} · ${r.tamano}`} dashed={virtual} />
      )}

      {/* imagen en el infinito */}
      {enInf && (
        <Html position={[dir * (X - 1.6), Y - 0.4, 0]} center distanceFactor={18} pointerEvents="none">
          <div style={{ whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 8, background: "rgba(5,13,26,0.85)", border: "1px solid rgba(255,255,255,0.2)", color: "#fde047", fontWeight: 900, fontSize: 10, fontFamily: "system-ui, sans-serif" }}>
            objeto en el foco → imagen en el infinito (rayos paralelos)
          </div>
        </Html>
      )}

      <Photon path={[tipObj, center, ray2End ?? center]} color="#67e8f9" playing={playing} />
    </group>
  );
}

/* ── (c) Refracción — ley de Snell ────────────────────────────────────────── */
function EscenaRefraccion({ medio1, medio2, thetaInc, playing }: { medio1: string; medio2: string; thetaInc: number; playing: boolean }) {
  const m1 = medioPorId(medio1);
  const m2 = medioPorId(medio2);
  const s = resolverSnell(m1.n, m2.n, thetaInc);
  const R = 6;

  const t1 = thetaInc * RAD;
  const A: Pt = [-Math.sin(t1) * R, Math.cos(t1) * R, 0];   // incidente desde arriba-izquierda
  const O: Pt = [0, 0, 0];
  const reflE: Pt = [Math.sin(t1) * R, Math.cos(t1) * R, 0]; // reflejado arriba-derecha

  let refrE: Pt | null = null;
  if (!s.reflexionTotal) {
    const t2 = s.thetaRefDeg * RAD;
    refrE = [Math.sin(t2) * R, -Math.cos(t2) * R, 0];        // refractado abajo-derecha
  }

  // arcos de ángulo
  const arc = (ang0: number, ang1: number, rad: number): Pt[] => {
    const N = 18, out: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const a = ang0 + (ang1 - ang0) * (i / (N - 1));
      out.push([Math.sin(a) * rad, Math.cos(a) * rad, 0]);
    }
    return out;
  };

  return (
    <group>
      {/* medios */}
      <mesh position={[0, Y / 2, -0.05]}>
        <planeGeometry args={[2 * X, Y]} />
        <meshBasicMaterial color={m1.color} transparent opacity={0.12} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, -Y / 2, -0.05]}>
        <planeGeometry args={[2 * X, Y]} />
        <meshBasicMaterial color={m2.color} transparent opacity={0.18} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* frontera + normal */}
      <Line points={[[-X, 0, 0], [X, 0, 0]] as Pt[]} color="#e2e8f0" lineWidth={2} transparent opacity={0.75} />
      <Line points={[[0, Y, 0], [0, -Y, 0]] as Pt[]} color="#94a3b8" lineWidth={1.5} transparent opacity={0.55} dashed dashSize={0.2} gapSize={0.16} />

      {/* etiquetas de medio */}
      <Html position={[-X + 1.4, Y - 0.5, 0]} center distanceFactor={18} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", padding: "2px 9px", borderRadius: 8, background: "rgba(5,13,26,0.8)", border: `1px solid ${m1.color}88`, color: m1.color, fontWeight: 900, fontSize: 10.5, fontFamily: "system-ui, sans-serif" }}>{m1.nombre} · n₁ = {fmt2(m1.n)}</div>
      </Html>
      <Html position={[-X + 1.4, -(Y - 0.5), 0]} center distanceFactor={18} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", padding: "2px 9px", borderRadius: 8, background: "rgba(5,13,26,0.8)", border: `1px solid ${m2.color}88`, color: m2.color, fontWeight: 900, fontSize: 10.5, fontFamily: "system-ui, sans-serif" }}>{m2.nombre} · n₂ = {fmt2(m2.n)}</div>
      </Html>

      {/* rayo incidente */}
      <Line points={[A, O] as Pt[]} color="#fde047" lineWidth={3} transparent opacity={0.95} />
      {/* rayo reflejado (tenue, salvo reflexión total) */}
      <Line points={[O, reflE] as Pt[]} color="#fbbf24" lineWidth={s.reflexionTotal ? 3 : 1.6} transparent opacity={s.reflexionTotal ? 0.95 : 0.4} dashed={!s.reflexionTotal} dashSize={0.16} gapSize={0.12} />
      {/* rayo refractado */}
      {refrE && <Line points={[O, refrE] as Pt[]} color={m2.color} lineWidth={3} transparent opacity={0.95} />}

      {/* arcos de ángulo */}
      <Line points={arc(0, -t1, 1.3)} color="#fde047" lineWidth={1.5} transparent opacity={0.8} />
      {refrE && <Line points={arc(Math.PI, Math.PI - (s.thetaRefDeg * RAD), 1.3)} color={m2.color} lineWidth={1.5} transparent opacity={0.8} />}

      <Html position={[-Math.sin(t1 / 2) * 1.9, Math.cos(t1 / 2) * 1.9, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{ fontSize: 10, fontWeight: 900, color: "#fde047", fontFamily: "ui-monospace, monospace" }}>θ₁ = {fmtAng(thetaInc)}</div>
      </Html>
      {refrE && (
        <Html position={[Math.sin((s.thetaRefDeg * RAD) / 2) * 1.9, -Math.cos((s.thetaRefDeg * RAD) / 2) * 1.9, 0]} center distanceFactor={16} pointerEvents="none">
          <div style={{ fontSize: 10, fontWeight: 900, color: m2.color, fontFamily: "ui-monospace, monospace" }}>θ₂ = {fmtAng(s.thetaRefDeg)}</div>
        </Html>
      )}

      {/* aviso de reflexión total interna */}
      {s.reflexionTotal && (
        <Html position={[0, -Y + 0.8, 0]} center distanceFactor={18} pointerEvents="none">
          <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "4px 12px", borderRadius: 9, background: "rgba(40,10,8,0.9)", border: "1px solid #fbbf24", color: "#fde047", fontWeight: 900, fontSize: 11, fontFamily: "system-ui, sans-serif" }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} />
            REFLEXIÓN TOTAL INTERNA · θ₁ &gt; θ_c = {s.thetaCriticoDeg != null ? fmtAng(s.thetaCriticoDeg) : "—"}
          </div>
        </Html>
      )}

      <Titulo
        texto={s.reflexionTotal ? "Reflexión total interna" : "Refracción (ley de Snell)"}
        sub={`${m1.nombre} → ${m2.nombre} · n₁·sen θ₁ = n₂·sen θ₂`}
        color={s.reflexionTotal ? "#fde047" : m2.color}
      />

      <Photon path={refrE ? [A, O, refrE] : [A, O, reflE]} color="#fde047" playing={playing} />
    </group>
  );
}

/* ── Wrappers de modo con su título ───────────────────────────────────────── */
function ModoLente({ tipoLente, fLente, doLente, playing, accent }: Pick<OpticaSceneProps, "tipoLente" | "fLente" | "doLente" | "playing" | "accent">) {
  const f = tipoLente === "convergente" ? Math.abs(fLente) : -Math.abs(fLente);
  const r = resolverGauss(f, doLente, H_OBJ);
  const col = tipoLente === "convergente" ? "#a78bfa" : "#f472b6";
  return (
    <group>
      <Titulo
        texto={`Lente ${tipoLente}`}
        sub={r.enInfinito ? "objeto en el foco → imagen en ∞" : `${r.tipoImagen} · ${r.orientacion} · ${r.tamano} · M = ${fmtAumento(r.M)}`}
        color={col}
      />
      <EscenaImagen esLente f={f} do_={doLente} color={col} playing={playing} />
      <pointLight position={[0, 0, 6]} intensity={0.4} color={accent} />
    </group>
  );
}

function ModoEspejo({ tipoEspejo, fEspejo, doEspejo, playing, accent }: Pick<OpticaSceneProps, "tipoEspejo" | "fEspejo" | "doEspejo" | "playing" | "accent">) {
  const f = tipoEspejo === "plano" ? Infinity : tipoEspejo === "concavo" ? Math.abs(fEspejo) : -Math.abs(fEspejo);
  const r = resolverGauss(f, doEspejo, H_OBJ);
  const col = "#5eead4";
  return (
    <group>
      <Titulo
        texto={`Espejo ${tipoEspejo}`}
        sub={`${r.tipoImagen} · ${r.orientacion} · ${r.tamano} · M = ${fmtAumento(r.M)}`}
        color={col}
      />
      <SimboloEspejo tipo={tipoEspejo} color={col} />
      <EscenaImagen esLente={false} f={f} do_={doEspejo} color="#a78bfa" playing={playing} />
      <pointLight position={[0, 0, 6]} intensity={0.4} color={accent} />
    </group>
  );
}

/* ── Contenido ────────────────────────────────────────────────────────────── */
function Contenido(props: OpticaSceneProps) {
  const { modo, accent, resetNonce, playing } = props;
  return (
    <>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 26, 75]} />

      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 8, 8]} intensity={1.1} />
      <pointLight position={[-8, 4, 7]} intensity={0.45} color={accent} />
      <Stars radius={70} depth={30} count={900} factor={3} saturation={0} fade speed={0.5} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "lentes" && <ModoLente tipoLente={props.tipoLente} fLente={props.fLente} doLente={props.doLente} playing={playing} accent={accent} />}
        {modo === "espejos" && <ModoEspejo tipoEspejo={props.tipoEspejo} fEspejo={props.fEspejo} doEspejo={props.doEspejo} playing={playing} accent={accent} />}
        {modo === "refraccion" && <EscenaRefraccion medio1={props.medio1} medio2={props.medio2} thetaInc={props.thetaInc} playing={playing} />}
      </group>

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.1} position={[0, 7, 8]} scale={14} color="#eaf1ff" />
          <Lightformer intensity={0.6} position={[8, 3, 5]} scale={7} color="#cfe0ff" />
          <Lightformer intensity={0.6} position={[-8, 3, 4]} scale={7} color="#dcd5ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={11}
        maxDistance={28}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 1.7}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.45} />
      </EffectComposer>
    </>
  );
}

export default function OpticaScene(props: OpticaSceneProps) {
  const cam = { position: [0, 0.4, 16] as Pt, fov: 48 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
