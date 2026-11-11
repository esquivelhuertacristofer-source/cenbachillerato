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
 * <Contenido>. React Compiler: la animación vive en useFrame que MUTA el buffer
 * de la curva gruesa (Line2) en sitio (nunca setState); la pausa congela
 * acumulando tiempo solo cuando `playing`. La onda en pantalla es esquemática
 * (nº de ciclos acotado); los números son exactos.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { PanelGrafica } from "./_tablero";
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
const BAR_Y = -1.5;     // y de la barra del espectro
const BAR_H = 0.7;      // alto de la barra
const WAVE_Y = 1.3;     // y central de la onda viajera
const NPTS = 220;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const xOfLogF = (lf: number) => -X + (2 * X * (lf - LOGF_MIN)) / (LOGF_MAX - LOGF_MIN);
const xOfF = (f: number) => xOfLogF(Math.log10(f));
const xOfNm = (nm: number) => -X + (2 * X * (nm - NM_MIN)) / (NM_MAX - NM_MIN);

const DECADAS = [6, 9, 12, 15, 18, 21];

/* ── Etiqueta: tamaño fijo en píxeles (≥ 14 px). `ancha` se oculta en el celular ── */
function Etiqueta({ pos, color, children, ancha = false, borde = true }: {
  pos: Pt; color: string; children: React.ReactNode; ancha?: boolean; borde?: boolean;
}) {
  const ancho = useThree((s) => s.size.width);
  if (ancha && ancho < 640) return null; // el dato ya está en el panel
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{
        whiteSpace: "nowrap", textAlign: "center", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.9)",
        border: borde ? `1.5px solid ${color}` : "1.5px solid transparent", color, fontWeight: 900, fontSize: 14,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Encuadre: el dominio X siempre cabe a lo ancho ──────────────────────────── */
function Encuadre() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { width, height } = useThree((s) => s.size);
  useEffect(() => {
    const aspecto = width / Math.max(1, height);
    const mitad = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = clamp((X + 1.3) / (mitad * aspecto), 14, 30);
    camera.position.set(0, 0.5 * (d / 14), d);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);
  return null;
}

/* ── Onda con volumen: tubo cuyo buffer (posición y normal) se reescribe en sitio ──
   Mismo cálculo que antes, pero la curva ocupa espacio: recibe luz y se le ve el
   canto. No se recrea geometría por cuadro: solo se actualizan los atributos. */
const RAD = 10;       // lados de la sección del tubo
const GROSOR_ONDA = 0.075;

function CurvaGruesa({ fn, color, ancho = GROSOR_ONDA }: { fn: (x: number) => number; color: string; ancho?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const nv = NPTS * (RAD + 1);
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
    g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
    const idx: number[] = [];
    for (let i = 0; i < NPTS - 1; i++) {
      for (let j = 0; j < RAD; j++) {
        const a = i * (RAD + 1) + j, b = (i + 1) * (RAD + 1) + j;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    g.setIndex(idx);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(() => {
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const nor = geo.getAttribute("normal") as THREE.BufferAttribute;
    const e = 0.01;
    for (let i = 0; i < NPTS; i++) {
      const x = -X + (2 * X * i) / (NPTS - 1);
      const y = fn(x);
      const dy = (fn(x + e) - fn(x - e)) / (2 * e);
      const l = Math.hypot(1, dy);
      const nx = -dy / l, ny = 1 / l;       // normal en el plano de la onda
      for (let j = 0; j <= RAD; j++) {
        const th = (2 * Math.PI * j) / RAD;
        const c = Math.cos(th), sn = Math.sin(th);
        const k = i * (RAD + 1) + j;
        const vx = c * nx, vy = c * ny, vz = sn;
        pos.setXYZ(k, x + ancho * vx, y + ancho * vy, ancho * vz);
        nor.setXYZ(k, vx, vy, vz);
      }
    }
    pos.needsUpdate = true;
    nor.needsUpdate = true;
  });
  return (
    <mesh geometry={geo} frustumCulled={false} castShadow>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
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
  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
  });

  return <CurvaGruesa color={color} fn={(x) => WAVE_Y + aVis * Math.sin(k * x - w * tRef.current)} />;
}

/* ── Bloque de la franja: caja con canto y barniz. El color sigue siendo el dato. ── */
const PROF = 0.34;   // profundidad de la franja
function Bloque({ x, w, h, color, op = 1 }: { x: number; w: number; h: number; color: string; op?: number }) {
  return (
    <mesh position={[x, BAR_Y, 0]} castShadow>
      <boxGeometry args={[w, h, PROF]} />
      <meshPhysicalMaterial
        color={color} emissive={color} emissiveIntensity={0.42} roughness={0.38} metalness={0.05}
        clearcoat={0.7} clearcoatRoughness={0.25} transparent={op < 1} opacity={op}
      />
    </mesh>
  );
}

/** Marco-bandeja de la franja (bisel metálico por detrás y por encima de los bloques). */
function MarcoBarra({ h }: { h: number }) {
  return (
    <group>
      <mesh position={[0, BAR_Y, -PROF / 2 - 0.08]} castShadow receiveShadow>
        <boxGeometry args={[2 * X + 0.4, h + 0.3, 0.16]} />
        <meshStandardMaterial color="#1b2a40" roughness={0.4} metalness={0.7} envMapIntensity={1.1} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, BAR_Y + s * (h / 2 + 0.1), -0.02]} castShadow>
          <boxGeometry args={[2 * X + 0.4, 0.1, PROF + 0.08]} />
          <meshStandardMaterial color="#51698a" roughness={0.35} metalness={0.8} envMapIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Barra del espectro completo (7 bandas) + décadas + umbral ionizante ────── */
function BarraEspectro({ fSel, color }: { fSel: number; color: string }) {
  const xi = xOfF(F_IONIZANTE);
  const banda = bandaPorFrecuencia(fSel);
  const cxB = clamp((xOfF(banda.fMin) + xOfF(banda.fMax)) / 2, -X + 1.8, X - 1.8);
  return (
    <group>
      <MarcoBarra h={BAR_H} />
      {/* segmentos de banda */}
      {BANDAS.map((b) => {
        const x0 = xOfF(b.fMin), x1 = xOfF(b.fMax);
        const w = Math.max(x1 - x0, 0.02), cx = (x0 + x1) / 2;
        if (b.esVisible) {
          // mini-arcoíris en la franja visible (izq = menos f = rojo; der = más f = violeta)
          const N = 12;
          return (
            <group key={b.id}>
              {Array.from({ length: N }, (_, i) => {
                const nm = NM_MAX - ((NM_MAX - NM_MIN) * i) / (N - 1);
                const sx = x0 + (w * (i + 0.5)) / N;
                return <Bloque key={i} x={sx} w={w / N + 0.01} h={BAR_H} color={colorVisible(nm)} />;
              })}
            </group>
          );
        }
        return <Bloque key={b.id} x={cx} w={Math.max(w - 0.04, 0.02)} h={BAR_H} color={b.color} op={0.95} />;
      })}

      {/* marcas de década (sin texto: la escala va en el medidor del panel) */}
      {DECADAS.map((d) => {
        const x = xOfLogF(d);
        return <Line key={d} points={[[x, BAR_Y - BAR_H / 2 - 0.2, 0.1], [x, BAR_Y - BAR_H / 2 - 0.45, 0.1]] as Pt[]} color="#6b7fa3" lineWidth={2} transparent opacity={0.8} />;
      })}

      {/* banda actual, bajo la barra */}
      <Etiqueta pos={[cxB, BAR_Y - 1.05, 0]} color={banda.esVisible ? "#e6f7ff" : color}>
        <i className={`fa-solid ${banda.icono}`} style={{ marginRight: 6 }} />{banda.nombre}
      </Etiqueta>

      {/* umbral de radiación ionizante (inicio de los rayos X) */}
      <Line points={[[xi, BAR_Y - 0.45, 0.2], [xi, WAVE_Y + 2.0, 0.2]] as Pt[]} color="#f87171" lineWidth={2.5} transparent opacity={0.85} dashed dashSize={0.18} gapSize={0.14} />
      <Etiqueta pos={[clamp(xi, -X + 1.1, X - 1.1), WAVE_Y + 2.45, 0]} color="#fca5a5">
        <i className="fa-solid fa-radiation" style={{ marginRight: 5 }} />ionizante →
      </Etiqueta>
    </group>
  );
}

/* ── Marcador: corredera con cuerpo (placa que cruza la franja + esfera + punta) ── */
function Marcador({ x, col, h = BAR_H }: { x: number; col: string; h?: number }) {
  return (
    <>
      <Line points={[[x, BAR_Y, 0.3], [x, WAVE_Y, 0.3]] as Pt[]} color={col} lineWidth={3} transparent opacity={0.85} />
      {/* placa que abraza la franja */}
      <mesh position={[x, BAR_Y, 0.02]} castShadow>
        <boxGeometry args={[0.13, h + 0.5, PROF + 0.2]} />
        <meshPhysicalMaterial color="#e8eef7" roughness={0.3} metalness={0.5} clearcoat={0.6} />
      </mesh>
      {/* punta que señala la banda, por debajo */}
      <mesh position={[x, BAR_Y - h / 2 - 0.42, 0.02]} castShadow>
        <coneGeometry args={[0.2, 0.38, 20]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[x, BAR_Y, PROF / 2 + 0.2]} castShadow>
        <sphereGeometry args={[0.24, 28, 28]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} roughness={0.35} />
      </mesh>
    </>
  );
}

/** Lectura sobre el marcador: la 1.ª línea siempre; el detalle solo en pantallas anchas. */
function Lectura({ x, col, titulo, detalle, pie }: { x: number; col: string; titulo: string; detalle: string[]; pie?: { txt: string; col: string } }) {
  const ancho = useThree((s) => s.size.width);
  const ancha = ancho >= 640;
  return (
    <Etiqueta pos={[clamp(x, -X + 1.9, X - 1.9), WAVE_Y + 1.15, 0]} color={col}>
      <div>{titulo}</div>
      {ancha && detalle.map((d, i) => <div key={i} style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{d}</div>)}
      {ancha && pie && <div style={{ fontSize: 14, fontWeight: 900, color: pie.col }}>{pie.txt}</div>}
    </Etiqueta>
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
      <BarraEspectro fSel={f} color={col} />
      <OndaViajera f={f} color={col} playing={playing} />
      <Marcador x={xM} col={col} />
      <Lectura
        x={xM} col={col} titulo={fmtFrec(f)}
        detalle={[`λ = ${fmtLambda(pt.lambda)}`, `E = ${fmtEnergia(pt.E_eV)}`]}
        pie={{ txt: pt.ionizante ? "IONIZANTE" : "no ionizante", col: pt.ionizante ? "#fca5a5" : "#86efac" }}
      />
    </group>
  );
}

/* ── (b) Luz visible ──────────────────────────────────────────────────────── */
const SEG_VIS = 36;

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
  useFrame((_, dt) => {
    if (playing) tRef.current += dt;
  });

  return (
    <group>
      {/* barra de arcoíris */}
      <MarcoBarra h={BAR_H + 0.1} />
      {Array.from({ length: SEG_VIS }, (_, i) => {
        const t = (i + 0.5) / SEG_VIS;
        const nmS = NM_MIN + (NM_MAX - NM_MIN) * t;
        return <Bloque key={i} x={-X + 2 * X * t} w={(2 * X) / SEG_VIS + 0.01} h={BAR_H + 0.1} color={colorVisible(nmS)} />;
      })}

      {/* marcas de nm: solo 3 llevan texto */}
      {[400, 450, 500, 550, 600, 650, 700].map((tick) => {
        const x = xOfNm(tick);
        return <Line key={tick} points={[[x, BAR_Y - (BAR_H + 0.1) / 2 - 0.2, 0.1], [x, BAR_Y - (BAR_H + 0.1) / 2 - 0.45, 0.1]] as Pt[]} color="#6b7fa3" lineWidth={2} transparent opacity={0.8} />;
      })}
      {[400, 550, 700].map((tick) => (
        <Etiqueta key={tick} pos={[clamp(xOfNm(tick), -X + 0.9, X - 0.9), BAR_Y - 1.05, 0]} color="#c8d4eb" borde={false}>{tick} nm</Etiqueta>
      ))}

      <CurvaGruesa color={col} fn={(x) => WAVE_Y + aVis * Math.sin(k * x - w * tRef.current)} />

      <Marcador x={xM} col={col} h={BAR_H + 0.1} />
      <Lectura x={xM} col={col} titulo={`${fmt0(nm)} nm · ${cv.nombre}`} detalle={[`f = ${fmtFrec(cv.f)}`, `E = ${fmtEnergia(cv.E_eV)}`]} />
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
      <BarraEspectro fSel={apl.f} color={col} />
      <OndaViajera f={apl.f} color={col} playing={playing} />

      {/* alfileres de todas las aplicaciones */}
      {APLICACIONES.map((a) => {
        const x = clamp(xOfF(a.f), -X, X);
        const sel = a.id === apl.id;
        const c = CAT_COLOR[a.categoria];
        return (
          <mesh key={a.id} position={[x, BAR_Y + BAR_H / 2 + 0.3, 0.2]}>
            <sphereGeometry args={[sel ? 0.18 : 0.1, 18, 18]} />
            <meshStandardMaterial color={sel ? col : c} emissive={sel ? col : c} emissiveIntensity={sel ? 0.6 : 0.35} roughness={0.4} />
          </mesh>
        );
      })}

      <Marcador x={xM} col={col} />
      <Lectura
        x={xM} col={col} titulo={apl.nombre}
        detalle={[`${fmtFrec(apl.f)} · ${fmtLambda(pt.lambda)}`]}
        pie={{ txt: pt.ionizante ? "IONIZANTE" : "no ionizante", col: pt.ionizante ? "#fca5a5" : "#86efac" }}
      />
    </group>
  );
}

/* ── Contenido ────────────────────────────────────────────────────────────── */
function Contenido({ modo, logF, nm, aplId, playing, accent, resetNonce }: EspectroSceneProps) {
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. Sin altura: el
          escenario la MIDE de la propia escena al montarse. */}
      <Escenario acento={accent} mesa={false} niebla={false} />
      <Encuadre />

      {/* TABLERO DE FONDO: con él detrás, el conjunto se lee como un instrumento
          colgado y no como un dibujo flotando; los colores siguen siendo los reales. */}
      <PanelGrafica ancho={2 * X + 1.6} alto={7.6} frente={-0.42} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "espectro" && <EscenaEspectro logF={logF} playing={playing} />}
        {modo === "visible" && <EscenaVisible nm={nm} playing={playing} />}
        {modo === "aplicaciones" && <EscenaAplicaciones aplId={aplId} playing={playing} />}
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={10}
        maxDistance={32}
        target={[0, 0, 0]}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 1.7}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.35} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function EspectroScene(props: EspectroSceneProps) {
  const cam = { position: [0, 0.5, 14.5] as Pt, fov: 48 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
