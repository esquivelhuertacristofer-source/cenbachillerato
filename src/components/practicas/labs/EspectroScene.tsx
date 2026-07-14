"use client";

/**
 * Escena 3D — "El espectro electromagnético" (CNEYT-V-P05-A1).
 *
 * Tres MODOS, según la prop `modo`:
 *  · "espectro"     — barra del espectro completo (escala log de frecuencia, de
 *    10⁴ a 10²² Hz) con sus 7 bandas; un marcador recorre la frecuencia y muestra
 *    λ = c/f y E = h·f; una onda viajera arriba acorta su longitud de onda al subir
 *    la frecuencia (todas viajan a la misma rapidez, la de la luz). El umbral de
 *    radiación ionizante (inicio de los rayos X) queda marcado.
 *  · "visible"      — barra de arcoíris de 380 a 700 nm; un marcador recorre la
 *    longitud de onda y se ve el color, su frecuencia y su energía. Recuerda que la
 *    luz visible es una franja diminuta del espectro.
 *  · "aplicaciones" — la misma barra del espectro con alfileres en aplicaciones
 *    reales de México (WiFi, 5G, GTM del INAOE, rayos X del IMSS, gamma del ININ…);
 *    la seleccionada se resalta con su frecuencia, banda y onda.
 *
 * Patrón R3F: el default export solo monta <Canvas> (key={modo}) y delega en
 * <Contenido>. React Compiler: la animación vive en useFrame que MUTA refs/atributos
 * (nunca setState); la pausa congela acumulando tiempo solo cuando `playing`. La
 * onda en pantalla es esquemática (nº de ciclos acotado); los números son exactos.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo, BANDAS, resolverEM, resolverVisible, aplicacionPorId, APLICACIONES,
  colorVisible, bandaPorFrecuencia, CAT_COLOR,
  LOGF_MIN, LOGF_MAX, NM_MIN, NM_MAX, F_IONIZANTE, C_LUZ,
  fmtFrec, fmtLambda, fmtEnergia, fmt0,
} from "./espectro-data";

export interface EspectroSceneProps {
  modo: Modo;
  logF: number;       // (a) frecuencia actual (log10)
  nm: number;         // (b) longitud de onda visible (nm)
  aplId: string;      // (c) aplicación seleccionada
  playing: boolean;
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Escala visual ────────────────────────────────────────────────────────── */
const X = 7;            // semiancho del dominio visible
const BAR_Y = -1.7;     // y de la barra del espectro
const BAR_H = 0.6;      // alto de la barra
const WAVE_Y = 1.5;     // y central de la onda viajera
const NPTS = 260;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const xOfLogF = (lf: number) => -X + (2 * X * (lf - LOGF_MIN)) / (LOGF_MAX - LOGF_MIN);
const xOfF = (f: number) => xOfLogF(Math.log10(f));
const xOfNm = (nm: number) => -X + (2 * X * (nm - NM_MIN)) / (NM_MAX - NM_MIN);

const DECADAS: { d: number; etq: string }[] = [
  { d: 6, etq: "10⁶ Hz" }, { d: 9, etq: "10⁹ Hz" }, { d: 12, etq: "10¹² Hz" },
  { d: 15, etq: "10¹⁵ Hz" }, { d: 18, etq: "10¹⁸ Hz" }, { d: 21, etq: "10²¹ Hz" },
];

/* ── Utilidades de curva ──────────────────────────────────────────────────── */
function fillCurva(line: THREE.Line, fn: (x: number) => number) {
  const pos = line.geometry.getAttribute("position") as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < NPTS; i++) {
    const x = -X + (2 * X * i) / (NPTS - 1);
    arr[i * 3] = x;
    arr[i * 3 + 1] = fn(x);
    arr[i * 3 + 2] = 0;
  }
  pos.needsUpdate = true;
}

function nuevaCurva(color: string, opacity: number, lineWidth = 2): THREE.Line {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NPTS * 3), 3));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, linewidth: lineWidth, toneMapped: false });
  return new THREE.Line(g, m);
}

/**
 * Libera geometría y material de las curvas `nuevaCurva` al desmontar. R3F no
 * dispone los objetos pasados por `<primitive object={...} />`, y el <Canvas> se
 * remonta con key={modo}, así que sin esto cada cambio de modo dejaría recursos
 * huérfanos en la GPU.
 */
function useDisposeCurvas(...curvas: THREE.Line[]) {
  useEffect(() => {
    return () => {
      for (const c of curvas) {
        c.geometry.dispose();
        (c.material as THREE.Material).dispose();
      }
    };
    // Cleanup on unmount: `curvas` is stable after initialization, not reactive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ── Título flotante ──────────────────────────────────────────────────────── */
function Titulo({ texto, sub, color }: { texto: string; sub?: string; color: string }) {
  return (
    <Html position={[0, 4.5, 0]} center distanceFactor={20} pointerEvents="none">
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

/* ── Onda viajera (la longitud de onda visual depende de la frecuencia) ──────── */
function OndaViajera({ f, color, playing }: { f: number; color: string; playing: boolean }) {
  const norm = clamp((Math.log10(f) - LOGF_MIN) / (LOGF_MAX - LOGF_MIN), 0, 1);
  const ncyc = 1.4 + 17 * norm;
  const k = (2 * Math.PI * ncyc) / (2 * X);
  const w = 2.2 * k;            // rapidez de fase visual constante → "todas viajan igual de rápido"
  const aVis = 0.62;

  const tRef = useRef(0);
  // Geometry created once; `color` is applied via .color.set() below to avoid recreating the mesh on every color change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const curva = useMemo(() => nuevaCurva(color, 0.95, 2), []);
  useDisposeCurvas(curva);
  (curva.material as THREE.LineBasicMaterial).color.set(color);

  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
    const t = tRef.current;
    fillCurva(curva, (x) => WAVE_Y + aVis * Math.sin(k * x - w * t));
  });

  return <primitive object={curva} />;
}

/* ── Barra del espectro completo (7 bandas) + décadas + umbral ionizante ────── */
function BarraEspectro() {
  const xi = xOfF(F_IONIZANTE);
  return (
    <group>
      {/* segmentos de banda */}
      {BANDAS.map((b) => {
        const x0 = xOfF(b.fMin), x1 = xOfF(b.fMax);
        const w = Math.max(x1 - x0, 0.02), cx = (x0 + x1) / 2;
        if (b.esVisible) {
          // mini-arcoíris en la franja visible (izq = menos f = rojo; der = más f = violeta)
          const N = 16;
          return (
            <group key={b.id}>
              {Array.from({ length: N }, (_, i) => {
                const nm = NM_MAX - ((NM_MAX - NM_MIN) * i) / (N - 1);
                const sx = x0 + (w * (i + 0.5)) / N;
                return (
                  <mesh key={i} position={[sx, BAR_Y, 0]}>
                    <planeGeometry args={[w / N + 0.01, BAR_H]} />
                    <meshBasicMaterial color={colorVisible(nm)} toneMapped={false} side={THREE.DoubleSide} />
                  </mesh>
                );
              })}
            </group>
          );
        }
        return (
          <mesh key={b.id} position={[cx, BAR_Y, 0]}>
            <planeGeometry args={[w, BAR_H]} />
            <meshBasicMaterial color={b.color} transparent opacity={0.92} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* marco de la barra */}
      <Line points={[[-X, BAR_Y + BAR_H / 2, 0], [X, BAR_Y + BAR_H / 2, 0]] as Pt[]} color="#0a1424" lineWidth={1} transparent opacity={0.6} />
      <Line points={[[-X, BAR_Y - BAR_H / 2, 0], [X, BAR_Y - BAR_H / 2, 0]] as Pt[]} color="#0a1424" lineWidth={1} transparent opacity={0.6} />

      {/* etiquetas de banda (alternadas para no encimarse) */}
      {BANDAS.map((b, i) => {
        const cx = (xOfF(b.fMin) + xOfF(b.fMax)) / 2;
        const up = i % 2 === 1;
        const lblCol = b.esVisible ? "#e6f7ff" : b.color;
        return (
          <Html key={`${b.id}L`} position={[cx, BAR_Y + (up ? 1.18 : 0.66), 0]} center distanceFactor={19} pointerEvents="none">
            <div style={{ whiteSpace: "nowrap", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 8,
                background: "rgba(5,13,26,0.82)", border: `1px solid ${lblCol}66`, color: lblCol, fontWeight: 900, fontSize: 10.5,
              }}>
                <i className={`fa-solid ${b.icono}`} style={{ fontSize: 10 }} />
                {b.nombre}
              </div>
              <div style={{ fontSize: 8.5, color: "rgba(220,232,255,0.6)", marginTop: 1, fontWeight: 700 }}>{b.lambdaTxt}</div>
            </div>
          </Html>
        );
      })}

      {/* líneas de década (escala) */}
      {DECADAS.map(({ d, etq }) => {
        const x = xOfLogF(d);
        return (
          <group key={d}>
            <Line points={[[x, BAR_Y - BAR_H / 2 - 0.12, 0], [x, BAR_Y - BAR_H / 2 - 0.38, 0]] as Pt[]} color="#46587a" lineWidth={1} transparent opacity={0.7} />
            <Html position={[x, BAR_Y - 0.85, 0]} center distanceFactor={17} pointerEvents="none">
              <div style={{ whiteSpace: "nowrap", fontSize: 8.5, fontWeight: 800, color: "rgba(190,205,230,0.7)", fontFamily: "ui-monospace, monospace" }}>{etq}</div>
            </Html>
          </group>
        );
      })}

      {/* umbral de radiación ionizante (inicio de los rayos X) */}
      <Line points={[[xi, BAR_Y - 0.5, 0], [xi, WAVE_Y + 1.6, 0]] as Pt[]} color="#f87171" lineWidth={2} transparent opacity={0.8} dashed dashSize={0.18} gapSize={0.14} />
      <Html position={[xi, WAVE_Y + 1.85, 0]} center distanceFactor={17} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", padding: "2px 8px", borderRadius: 7, background: "rgba(40,8,12,0.85)", border: "1px solid #f8717188", color: "#fca5a5", fontWeight: 900, fontSize: 9.5, fontFamily: "system-ui, sans-serif" }}>
          <i className="fa-solid fa-radiation" style={{ marginRight: 5 }} />ionizante →
        </div>
      </Html>
    </group>
  );
}

/* ── (a) Explorador del espectro ──────────────────────────────────────────── */
function EscenaEspectro({ logF, playing }: Pick<EspectroSceneProps, "logF" | "playing">) {
  const f = Math.pow(10, logF);
  const pt = resolverEM(f);
  const enVisible = pt.banda.esVisible === true;
  const col = enVisible ? colorVisible((C_LUZ / f) * 1e9) : pt.banda.color;
  const xM = clamp(xOfF(f), -X, X);

  return (
    <group>
      <Titulo
        texto={pt.banda.nombre}
        sub={`f = ${fmtFrec(f)} · λ = ${fmtLambda(pt.lambda)} · E = ${fmtEnergia(pt.E_eV)}`}
        color={col}
      />

      <BarraEspectro />
      <OndaViajera f={f} color={col} playing={playing} />

      {/* marcador */}
      <Line points={[[xM, BAR_Y, 0], [xM, WAVE_Y, 0]] as Pt[]} color={col} lineWidth={2} transparent opacity={0.85} />
      <mesh position={[xM, BAR_Y, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.95} toneMapped={false} />
      </mesh>

      {/* lectura del marcador */}
      <Html position={[xM, WAVE_Y + 0.95, 0]} center distanceFactor={17} pointerEvents="none">
        <div style={{
          whiteSpace: "nowrap", textAlign: "center", padding: "5px 11px", borderRadius: 10,
          background: "rgba(4,12,26,0.9)", border: `1px solid ${col}`, color: "#fff",
          fontFamily: "ui-monospace, monospace", boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: col }}>{fmtFrec(f)}</div>
          <div style={{ fontSize: 10, fontWeight: 800, marginTop: 1 }}>λ = {fmtLambda(pt.lambda)}</div>
          <div style={{ fontSize: 10, fontWeight: 800 }}>E = {fmtEnergia(pt.E_eV)}</div>
          <div style={{ fontSize: 8.5, fontWeight: 900, marginTop: 2, color: pt.ionizante ? "#fca5a5" : "#86efac" }}>
            {pt.ionizante ? "● IONIZANTE" : "● no ionizante"}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ── (b) Luz visible ──────────────────────────────────────────────────────── */
const SEG_VIS = 72;

function EscenaVisible({ nm, playing }: Pick<EspectroSceneProps, "nm" | "playing">) {
  const cv = resolverVisible(nm);
  const col = cv.hex;
  const xM = clamp(xOfNm(nm), -X, X);

  // onda: más ciclos hacia el violeta (menor λ)
  const ncyc = 6 + (10 * (NM_MAX - nm)) / (NM_MAX - NM_MIN);
  const k = (2 * Math.PI * ncyc) / (2 * X);
  const w = 2.4 * k;
  const aVis = 0.7;

  const tRef = useRef(0);
  // Geometry created once; `col` is applied via .color.set() below to avoid recreating the mesh on every color change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const curva = useMemo(() => nuevaCurva(col, 0.98, 2), []);
  useDisposeCurvas(curva);
  (curva.material as THREE.LineBasicMaterial).color.set(col);
  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
    const t = tRef.current;
    fillCurva(curva, (x) => WAVE_Y + aVis * Math.sin(k * x - w * t));
  });

  return (
    <group>
      <Titulo texto={`luz ${cv.nombre}`} sub={`λ = ${fmt0(nm)} nm · f = ${fmtFrec(cv.f)} · E = ${fmtEnergia(cv.E_eV)}`} color={col} />

      {/* barra de arcoíris */}
      {Array.from({ length: SEG_VIS }, (_, i) => {
        const t = i / (SEG_VIS - 1);
        const nmS = NM_MIN + (NM_MAX - NM_MIN) * t;
        const x = -X + 2 * X * t;
        return (
          <mesh key={i} position={[x, BAR_Y, 0]}>
            <planeGeometry args={[(2 * X) / SEG_VIS + 0.02, BAR_H + 0.1]} />
            <meshBasicMaterial color={colorVisible(nmS)} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      <Line points={[[-X, BAR_Y + (BAR_H + 0.1) / 2, 0], [X, BAR_Y + (BAR_H + 0.1) / 2, 0]] as Pt[]} color="#0a1424" lineWidth={1} transparent opacity={0.5} />
      <Line points={[[-X, BAR_Y - (BAR_H + 0.1) / 2, 0], [X, BAR_Y - (BAR_H + 0.1) / 2, 0]] as Pt[]} color="#0a1424" lineWidth={1} transparent opacity={0.5} />

      {/* marcas de nm */}
      {[400, 450, 500, 550, 600, 650, 700].map((tick) => {
        const x = xOfNm(tick);
        return (
          <group key={tick}>
            <Line points={[[x, BAR_Y - (BAR_H + 0.1) / 2 - 0.1, 0], [x, BAR_Y - (BAR_H + 0.1) / 2 - 0.32, 0]] as Pt[]} color="#46587a" lineWidth={1} transparent opacity={0.7} />
            <Html position={[x, BAR_Y - 0.85, 0]} center distanceFactor={17} pointerEvents="none">
              <div style={{ whiteSpace: "nowrap", fontSize: 8.5, fontWeight: 800, color: "rgba(200,212,235,0.75)", fontFamily: "ui-monospace, monospace" }}>{tick} nm</div>
            </Html>
          </group>
        );
      })}

      <primitive object={curva} />

      {/* marcador */}
      <Line points={[[xM, BAR_Y, 0], [xM, WAVE_Y, 0]] as Pt[]} color={col} lineWidth={2} transparent opacity={0.85} />
      <mesh position={[xM, BAR_Y, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.95} toneMapped={false} />
      </mesh>
      <Html position={[xM, WAVE_Y + 0.95, 0]} center distanceFactor={17} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "5px 11px", borderRadius: 10, background: "rgba(4,12,26,0.9)", border: `1px solid ${col}`, color: "#fff", fontFamily: "ui-monospace, monospace", boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: col }}>{fmt0(nm)} nm · {cv.nombre}</div>
          <div style={{ fontSize: 10, fontWeight: 800, marginTop: 1 }}>f = {fmtFrec(cv.f)}</div>
          <div style={{ fontSize: 10, fontWeight: 800 }}>E = {fmtEnergia(cv.E_eV)}</div>
        </div>
      </Html>

      {/* recordatorio: franja diminuta */}
      <Html position={[0, BAR_Y - 1.5, 0]} center distanceFactor={18} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 8, background: "rgba(5,13,26,0.8)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(220,232,255,0.85)", fontWeight: 800, fontSize: 9.5, fontFamily: "system-ui, sans-serif" }}>
          La luz visible (380–700 nm) es apenas una franja diminuta de todo el espectro
        </div>
      </Html>
    </group>
  );
}

/* ── (c) Aplicaciones reales ──────────────────────────────────────────────── */
function EscenaAplicaciones({ aplId, playing }: Pick<EspectroSceneProps, "aplId" | "playing">) {
  const apl = aplicacionPorId(aplId);
  const pt = resolverEM(apl.f);
  const banda = bandaPorFrecuencia(apl.f);
  const enVisible = banda.esVisible === true;
  const col = enVisible ? colorVisible((C_LUZ / apl.f) * 1e9) : banda.color;
  const xM = clamp(xOfF(apl.f), -X, X);

  return (
    <group>
      <Titulo
        texto={apl.nombre}
        sub={`${banda.nombre} · f = ${fmtFrec(apl.f)} · λ = ${fmtLambda(pt.lambda)}`}
        color={col}
      />

      <BarraEspectro />
      <OndaViajera f={apl.f} color={col} playing={playing} />

      {/* alfileres de todas las aplicaciones */}
      {APLICACIONES.map((a) => {
        const x = clamp(xOfF(a.f), -X, X);
        const sel = a.id === apl.id;
        const c = CAT_COLOR[a.categoria];
        return (
          <mesh key={a.id} position={[x, BAR_Y + BAR_H / 2 + 0.18, 0]}>
            <sphereGeometry args={[sel ? 0.16 : 0.085, 16, 16]} />
            <meshStandardMaterial color={sel ? col : c} emissive={sel ? col : c} emissiveIntensity={sel ? 0.95 : 0.5} toneMapped={false} />
          </mesh>
        );
      })}

      {/* marcador de la aplicación seleccionada */}
      <Line points={[[xM, BAR_Y, 0], [xM, WAVE_Y, 0]] as Pt[]} color={col} lineWidth={2} transparent opacity={0.85} />
      <mesh position={[xM, BAR_Y, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.95} toneMapped={false} />
      </mesh>
      <Html position={[xM, WAVE_Y + 0.95, 0]} center distanceFactor={17} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "5px 11px", borderRadius: 10, background: "rgba(4,12,26,0.9)", border: `1px solid ${col}`, color: "#fff", fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 900, color: col }}>
            <i className={`fa-solid ${apl.icono}`} style={{ marginRight: 6 }} />{apl.nombre}
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 800, marginTop: 2, fontFamily: "ui-monospace, monospace" }}>{fmtFrec(apl.f)} · {fmtLambda(pt.lambda)}</div>
          <div style={{ fontSize: 8.5, fontWeight: 900, marginTop: 2, color: pt.ionizante ? "#fca5a5" : "#86efac" }}>
            {pt.ionizante ? "● IONIZANTE" : "● no ionizante"} · {banda.nombre}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ── Contenido ────────────────────────────────────────────────────────────── */
function Contenido({ modo, logF, nm, aplId, playing, accent, resetNonce }: EspectroSceneProps) {
  return (
    <>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 26, 75]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 8]} intensity={1.15} />
      <pointLight position={[-8, 4, 7]} intensity={0.5} color={accent} />
      <Stars radius={70} depth={30} count={1200} factor={3} saturation={0} fade speed={0.5} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "espectro" && <EscenaEspectro logF={logF} playing={playing} />}
        {modo === "visible" && <EscenaVisible nm={nm} playing={playing} />}
        {modo === "aplicaciones" && <EscenaAplicaciones aplId={aplId} playing={playing} />}
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
        minDistance={10}
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

export default function EspectroScene(props: EspectroSceneProps) {
  const cam = { position: [0, 0.6, 15.5] as Pt, fov: 48 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
