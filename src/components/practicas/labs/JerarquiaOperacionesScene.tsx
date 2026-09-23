"use client";

/**
 * Escena 3D del laboratorio «Jerarquía de operaciones» (PM-I-P10).
 *
 *  - pasos: la TORRE DE PASOS. Cada renglón es la expresión escrita con fichas;
 *    al elegir la operación correcta, sus fichas se «funden» por un embudo en
 *    una sola ficha del renglón de abajo, como se escribe en el cuaderno. A la
 *    izquierda, la escalera de la jerarquía enciende el escalón que se usó.
 *    Alternativa: el ÁRBOL de la expresión (rayos X de su estructura).
 *  - razon: dos máquinas que leen la misma expresión con reglas distintas; sobre
 *    cada una, el árbol que construye su regla se resuelve paso a paso y el
 *    resultado cae en su pantalla.
 *  - constructor: el árbol de la expresión que arma el alumno y, debajo, la
 *    recta numérica con la meta, el resultado actual y los resultados hallados.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Modo,
  type Nodo,
  type Tok,
  type OpBin,
  type Categoria,
  CATEGORIA_DEF,
  EXPRESIONES,
  CASOS,
  RETOS_CONSTRUCTOR,
  leer,
  serializar,
  textoTok,
  reproducir,
  resolverTodo,
  categoriaDe,
  hijosDe,
  escritoDe,
  textoConstructor,
  valorConstructor,
  qDeTexto,
  aNumero,
  fmtQ,
  evaluar,
  valorTexto,
  JERARQUIA,
} from "./jerarquia-operaciones-data";

export interface JerarquiaSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Torre de pasos
  exprId: string;
  elegidos: string[];
  errorId: string | null;
  errorTexto: string | null;
  verArbol: boolean;
  onElegir: (id: string) => void;
  // ¿Quién tiene razón?
  casoId: string;
  pasoAuto: number;
  revelado: boolean;
  // Constructor
  retoId: string;
  ops: OpBin[];
  grupo: string;
  hallados: string[];
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const NO = "#f87171";
const OKC = "#34d399";
const FONDO = "#050b17";

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
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

/** Un número tal como se escribe: las fracciones, apiladas. */
function Numero({ texto, fs, col = "#fff" }: { texto: string; fs: number; col?: string }) {
  const par = texto.startsWith("(") && texto.endsWith(")");
  const cuerpo = par ? texto.slice(1, -1) : texto;
  const frac = /^(−?)(\d+)\/(\d+)$/.exec(cuerpo);
  const estilo = { color: col, fontWeight: 900, fontSize: fs, fontFamily: "ui-rounded, 'Segoe UI', system-ui, sans-serif", lineHeight: 1, whiteSpace: "nowrap" as const, fontVariantNumeric: "tabular-nums" as const };
  if (!frac) return <span style={estilo}>{texto}</span>;
  return (
    <span style={{ ...estilo, display: "inline-flex", alignItems: "center", gap: 2 }}>
      {par && "("}
      {frac[1]}
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", fontSize: fs * 0.72 }}>
        <span>{frac[2]}</span>
        <span style={{ width: "100%", height: 2, background: col, margin: "2px 0" }} />
        <span>{frac[3]}</span>
      </span>
      {par && ")"}
    </span>
  );
}

const colorCat = (c: Categoria) => CATEGORIA_DEF[c].color;
const catDeTok = (t: Tok): Categoria => (t.t === "pot" || t.t === "raiz" ? "potencia" : t.t === "neg" ? "signo" : t.t === "abre" || t.t === "cierra" ? "agrupacion" : t.t === "op" && (t.op === "×" || t.op === "÷") ? "multiplicacion" : "suma");

/* ════════════════════════════════════════════════════════════════════════
 * FONDO: pizarrón cuadriculado
 * ════════════════════════════════════════════════════════════════════════ */

function Pizarron({ y = 0, z = -1.6, ancho = 30, color }: { y?: number; z?: number; ancho?: number; color: string }) {
  return (
    <group position={[0, y, z]}>
      <mesh>
        <planeGeometry args={[ancho, ancho * 0.62]} />
        <meshStandardMaterial color="#07142a" roughness={0.95} />
      </mesh>
      <gridHelper args={[ancho, ancho * 2, color, "#12305a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} material-transparent material-opacity={0.22} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. TORRE DE PASOS
 * ════════════════════════════════════════════════════════════════════════ */

const FILA_H = 1.3;
const GAP = 0.08;
const ALTO_FICHA = 0.64;

interface FichaInfo {
  tok: Tok;
  nodo: string;
  x: number;
  w: number;
  texto: string;
}

function anchoTok(t: Tok, texto: string): number {
  if (t.t === "num") {
    const cuerpo = texto.replace(/[()]/g, "");
    const f = /^(−?)(\d+)\/(\d+)$/.exec(cuerpo);
    const largo = f ? Math.max(f[2]!.length, f[3]!.length) + (f[1] ? 1 : 0) + (texto.startsWith("(") ? 1.4 : 0) : texto.length;
    return Math.max(0.56, 0.28 + 0.2 * largo);
  }
  if (t.t === "op") return t.implicita ? 0.06 : 0.56;
  if (t.t === "abre" || t.t === "cierra") return 0.26;
  if (t.t === "pot") return 0.36;
  if (t.t === "raiz") return 0.4;
  return 0.3;
}

function fichasDe(arbol: Nodo): { fichas: FichaInfo[]; ancho: number } {
  const tv = serializar(arbol);
  const toks = tv.map((t) => t.tok);
  const textos = tv.map((t, i) => textoTok(t.tok, i === 0, toks[i + 1]));
  const ws = tv.map((t, i) => anchoTok(t.tok, textos[i]!));
  const ancho = ws.reduce((a, b) => a + b, 0) + GAP * (ws.length - 1);
  let x = -ancho / 2;
  const fichas = tv.map((t, i) => {
    const w = ws[i]!;
    const f = { tok: t.tok, nodo: t.nodo, x: x + w / 2, w, texto: textos[i]! };
    x += w + GAP;
    return f;
  });
  return { fichas, ancho };
}

const GEO_CAJA = new THREE.BoxGeometry(1, 1, 1);

function Ficha({ f, activa, error, resalte, esResultado, final, onElegir }: { f: FichaInfo; activa: boolean; error: boolean; resalte: string | null; esResultado: boolean; final: boolean; onElegir: (id: string) => void }) {
  const grupo = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const t = useRef({ nace: -1, err: -1, eraError: false });
  const t0 = f.tok.t;
  const elegible = activa && (t0 === "op" || t0 === "pot" || t0 === "raiz") && !(t0 === "op" && f.tok.implicita);
  const cat = catDeTok(f.tok);
  const base = t0 === "num" ? (final ? "#0b3b2e" : "#13233b") : colorCat(cat);
  useFrame(({ clock }) => {
    const g = grupo.current;
    if (!g) return;
    const s = t.current;
    const ahora = clock.elapsedTime;
    if (s.nace < 0) s.nace = ahora;
    if (error && !s.eraError) s.err = ahora;
    s.eraError = error;
    // Nacimiento: el resultado aparece con un pequeño salto.
    const k = Math.min(1, (ahora - s.nace) / 0.45);
    const pop = esResultado ? 1 + Math.sin(k * Math.PI) * 0.28 : 1;
    g.scale.setScalar(pop);
    const de = s.err > 0 ? ahora - s.err : 99;
    g.position.x = f.x + (error && de < 0.7 ? Math.sin(de * 42) * 0.07 * (1 - de / 0.7) : 0);
    g.position.y = (t0 === "pot" ? 0.2 : 0) + (elegible ? Math.sin(ahora * 2.2 + f.x) * 0.02 : 0);
    if (mat.current) {
      const pulso = final ? 0.5 + Math.sin(ahora * 3) * 0.25 : 0;
      mat.current.emissiveIntensity = error ? 0.9 : resalte ? 0.55 : elegible ? 0.32 : t0 === "num" ? 0.08 + pulso : 0.18;
    }
  });
  const alto = t0 === "pot" ? 0.4 : t0 === "num" ? ALTO_FICHA : 0.54;
  const conCaja = t0 === "num" || t0 === "op" || t0 === "pot" || t0 === "raiz";
  const col = error ? NO : resalte && t0 === "num" ? "#1b2f4d" : base;
  const fs = t0 === "pot" ? 20 : t0 === "abre" || t0 === "cierra" ? 34 : f.tok.t === "num" && f.texto.includes("/") ? 22 : 25;
  return (
    <group ref={grupo}>
      {conCaja && !(t0 === "op" && f.tok.implicita) && (
        <mesh
          geometry={GEO_CAJA}
          scale={[f.w, alto, 0.22]}
          onClick={(e) => {
            if (!elegible) return;
            e.stopPropagation();
            onElegir(f.nodo);
          }}
          onPointerOver={() => {
            if (elegible) document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <meshStandardMaterial ref={mat} color={col} emissive={error ? NO : resalte ?? (t0 === "num" ? (final ? OKC : "#3b82f6") : base)} emissiveIntensity={0.2} roughness={0.4} metalness={0.15} />
        </mesh>
      )}
      {resalte && t0 === "num" && (
        <mesh position={[0, -alto / 2 - 0.04, 0.12]} geometry={GEO_CAJA} scale={[f.w, 0.05, 0.05]}>
          <meshBasicMaterial color={resalte} toneMapped={false} />
        </mesh>
      )}
      <Html position={[0, 0, 0.13]} center distanceFactor={9} zIndexRange={[16, 0]} style={{ pointerEvents: "none" }}>
        {t0 === "num" ? (
          <Numero texto={f.texto} fs={fs} col={final ? "#d1fae5" : "#fff"} />
        ) : (
          <span style={{ color: t0 === "abre" || t0 === "cierra" ? colorCat("agrupacion") : t0 === "op" ? "#0b1220" : "#fff", fontSize: fs, fontWeight: 900, fontFamily: "ui-rounded, 'Segoe UI', system-ui, sans-serif", lineHeight: 1 }}>{t0 === "op" && f.tok.implicita ? "" : f.texto}</span>
        )}
      </Html>
    </group>
  );
}

function Fila({ arbol, y, activa, errorId, tramo, colTramo, resultadoIdx, final, onElegir }: { arbol: Nodo; y: number; activa: boolean; errorId: string | null; tramo: [number, number] | null; colTramo: string | null; resultadoIdx: number | null; final: boolean; onElegir: (id: string) => void }) {
  const grupo = useRef<THREE.Group>(null);
  const dy = useRef(0.9);
  useFrame((_, dt) => {
    dy.current += (0 - dy.current) * suave(dt, 0.12);
    if (grupo.current) grupo.current.position.y = y + dy.current;
  });
  const { fichas } = useMemo(() => fichasDe(arbol), [arbol]);
  return (
    <group ref={grupo} position={[0, y + 0.9, 0]}>
      {fichas.map((f, i) => (
        <Ficha
          key={`${i}-${f.nodo}-${f.texto}`}
          f={f}
          activa={activa}
          error={activa && errorId === f.nodo && (f.tok.t === "op" || f.tok.t === "pot" || f.tok.t === "raiz")}
          resalte={tramo && i >= tramo[0] && i < tramo[1] ? colTramo : null}
          esResultado={resultadoIdx === i}
          final={final}
          onElegir={onElegir}
        />
      ))}
    </group>
  );
}

/** Embudo translúcido que une lo que se opera con su resultado. */
function Embudo({ x0, x1, yA, rx0, rx1, yB, color }: { x0: number; x1: number; yA: number; rx0: number; rx1: number; yB: number; color: string }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array([x0, yA, 0, x1, yA, 0, rx1, yB, 0, x0, yA, 0, rx1, yB, 0, rx0, yB, 0]);
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [x0, x1, yA, rx0, rx1, yB]);
  useEffect(() => () => geo.dispose(), [geo]);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = 0.16 + Math.sin(clock.elapsedTime * 2.4) * 0.05;
  });
  return (
    <mesh geometry={geo} position={[0, 0, -0.05]}>
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const ESCALONES: { cat: Categoria; simbolos: string; n: number }[] = [
  { cat: "agrupacion", simbolos: "( ) [ ] { }", n: 1 },
  { cat: "potencia", simbolos: "x²  √", n: 2 },
  { cat: "multiplicacion", simbolos: "×  ÷", n: 3 },
  { cat: "suma", simbolos: "+  −", n: 4 },
];

/** La escalera de la jerarquía: el escalón más alto va primero. */
function Escalera({ pos, activa }: { pos: Pt; activa: Categoria | null }) {
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  useFrame(({ clock }) => {
    ESCALONES.forEach((e, i) => {
      const m = mats.current[i];
      if (!m) return;
      const on = activa === e.cat || (activa === "signo" && e.cat === "potencia");
      m.emissiveIntensity = on ? 0.75 + Math.sin(clock.elapsedTime * 5) * 0.2 : 0.12;
    });
  });
  return (
    <group position={pos} rotation={[0, 0.16, 0]}>
      {ESCALONES.map((e, i) => {
        const h = (4 - i) * 0.62;
        const col = colorCat(e.cat);
        return (
          <group key={e.cat} position={[i * 0.78, 0, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.74, h, 0.9]} />
              <meshStandardMaterial
                ref={(m) => {
                  mats.current[i] = m;
                }}
                color={col}
                emissive={col}
                emissiveIntensity={0.12}
                roughness={0.45}
              />
            </mesh>
            <Html position={[0, h + 0.36, 0.3]} center distanceFactor={10} zIndexRange={[14, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", color: "#fff", whiteSpace: "nowrap", lineHeight: 1.05 }}>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{e.n}.º</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: col }}>{e.simbolos}</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function EscenaPasos({ exprId, elegidos, errorId, errorTexto, onElegir, modoColor }: { exprId: string; elegidos: string[]; errorId: string | null; errorTexto: string | null; onElegir: (id: string) => void; modoColor: string }) {
  const expr = EXPRESIONES.find((e) => e.id === exprId) ?? EXPRESIONES[0]!;
  const arbol0 = useMemo(() => leer(expr.texto), [expr.texto]);
  const pasos = useMemo(() => reproducir(arbol0, elegidos), [arbol0, elegidos]);
  const totalPasos = useMemo(() => resolverTodo(arbol0).length, [arbol0]);
  const filas = [arbol0, ...pasos.map((p) => p.despues)];
  const anchoMax = useMemo(() => fichasDe(arbol0).ancho, [arbol0]);
  const alto = totalPasos * FILA_H;
  const y0 = alto / 2;
  const actual = filas[filas.length - 1]!;
  const terminado = actual.k === "num";
  const ultimaCat = pasos.length ? pasos[pasos.length - 1]!.categoria : null;
  const xEsc = -anchoMax / 2 - 3.3;
  return (
    <group>
      <Escalera pos={[xEsc, -Math.min(alto / 2, 2.2) + 0.2, 0]} activa={ultimaCat} />
      <Etiqueta pos={[xEsc + 2.9, -Math.min(alto / 2, 2.2) + 0.35, 0.6]} df={10} fs={11} col={`${modoColor}88`}>
        <i className="fa-solid fa-stairs" style={{ color: modoColor }} />
        Escalera de la jerarquía
      </Etiqueta>
      {filas.map((a, k) => {
        const paso = pasos[k];
        const siguientePaso = k > 0 ? pasos[k - 1] : undefined;
        return (
          <Fila
            key={`${exprId}-${k}`}
            arbol={a}
            y={y0 - k * FILA_H}
            activa={k === filas.length - 1 && !terminado}
            errorId={errorId}
            tramo={paso ? paso.tramo : null}
            colTramo={paso ? colorCat(paso.categoria) : null}
            resultadoIdx={siguientePaso ? siguientePaso.indiceResultado : null}
            final={terminado && k === filas.length - 1}
            onElegir={onElegir}
          />
        );
      })}
      {pasos.map((p, k) => {
        const fa = fichasDe(p.antes).fichas;
        const fb = fichasDe(p.despues).fichas;
        const a0 = fa[p.tramo[0]]!;
        const a1 = fa[p.tramo[1] - 1]!;
        const r = fb[p.indiceResultado]!;
        const yA = y0 - k * FILA_H - ALTO_FICHA / 2 - 0.08;
        const yB = y0 - (k + 1) * FILA_H + ALTO_FICHA / 2 + 0.05;
        const col = colorCat(p.categoria);
        return (
          <group key={`e-${exprId}-${k}`}>
            <Embudo x0={a0.x - a0.w / 2} x1={a1.x + a1.w / 2} yA={yA} rx0={r.x - r.w / 2} rx1={r.x + r.w / 2} yB={yB} color={col} />
            <Html position={[anchoMax / 2 + 0.55, (yA + yB) / 2, 0]} distanceFactor={10} zIndexRange={[14, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 7, padding: "4px 10px", borderRadius: 9, background: "rgba(4,10,22,0.82)", border: `1px solid ${col}99`, color: "#fff", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: col, color: "#0b1220", fontSize: 11, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</span>
                {p.texto}
              </div>
            </Html>
          </group>
        );
      })}
      {errorId && errorTexto && !terminado && (
        <Html position={[0, y0 - (filas.length - 1) * FILA_H - FILA_H * 0.95, 0.2]} center distanceFactor={10} zIndexRange={[22, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ padding: "7px 14px", borderRadius: 11, background: "rgba(69,10,10,0.9)", border: `1.5px dashed ${NO}`, color: "#fecaca", fontSize: 15, fontWeight: 900, whiteSpace: "nowrap", boxShadow: "0 8px 22px -10px #000" }}>
            <i className="fa-solid fa-xmark" style={{ marginRight: 8, color: NO }} />
            {errorTexto}
          </div>
        </Html>
      )}
      {terminado && (
        <Etiqueta pos={[0, y0 - (filas.length - 1) * FILA_H - 0.78, 0.3]} df={10} fs={13} col={`${OKC}aa`}>
          <i className="fa-solid fa-circle-check" style={{ color: OKC }} />
          Resultado en {pasos.length} {pasos.length === 1 ? "paso" : "pasos"}
        </Etiqueta>
      )}
      {!terminado && !errorId && (
        <Etiqueta pos={[0, y0 - (filas.length - 1) * FILA_H + 0.72, 0.2]} df={10} fs={11} col={`${modoColor}88`}>
          <i className="fa-solid fa-hand-pointer" style={{ color: modoColor }} />
          ¿Qué operación va primero?
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * ÁRBOL DE LA EXPRESIÓN (compartido)
 * ════════════════════════════════════════════════════════════════════════ */

interface NodoLay {
  id: string;
  nodo: Nodo;
  x: number;
  y: number;
  padre: string | null;
}
interface GrupoLay {
  id: string;
  b: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

function layoutArbol(arbol: Nodo, S = 1.3, L = 1.05) {
  const nodos: NodoLay[] = [];
  const grupos: GrupoLay[] = [];
  let hoja = 0;
  const va = (n: Nodo, prof: number, padre: string | null): { x: number; minX: number; maxX: number; maxY: number } => {
    if (n.k === "grp") {
      const r = va(n.hijo, prof, padre);
      grupos.push({ id: n.id, b: n.b, x0: r.minX - 0.5, x1: r.maxX + 0.5, y0: prof * L - 0.42, y1: r.maxY + 0.52 });
      return r;
    }
    const y = prof * L;
    if (n.k === "num") {
      const x = hoja++ * S;
      nodos.push({ id: n.id, nodo: n, x, y, padre });
      return { x, minX: x, maxX: x, maxY: y };
    }
    const hs = hijosDe(n).map((h) => va(h, prof + 1, n.id));
    const x = hs.reduce((a, h) => a + h.x, 0) / hs.length;
    nodos.push({ id: n.id, nodo: n, x, y, padre });
    return { x, minX: Math.min(...hs.map((h) => h.minX)), maxX: Math.max(...hs.map((h) => h.maxX)), maxY: Math.max(y, ...hs.map((h) => h.maxY)) };
  };
  const r = va(arbol, 0, null);
  const cx = (r.minX + r.maxX) / 2;
  nodos.forEach((n) => (n.x -= cx));
  grupos.forEach((g) => {
    g.x0 -= cx;
    g.x1 -= cx;
  });
  return { nodos, grupos, ancho: r.maxX - r.minX, alto: r.maxY, raizX: r.x - cx };
}

function simboloNodo(n: Nodo): string {
  if (n.k === "bin") return n.implicita ? "·" : n.op;
  if (n.k === "pot") return n.e === 2 ? "x²" : "x³";
  if (n.k === "raiz") return "√";
  if (n.k === "neg") return "−( )";
  return "";
}

function NodoArbol({ lay, listoSig, onElegir }: { lay: NodoLay; listoSig: boolean; onElegir?: (id: string) => void }) {
  const g = useRef<THREE.Group>(null);
  const est = useRef({ init: false, k: lay.nodo.k as string, pop: 0 });
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const esNum = lay.nodo.k === "num";
  useFrame(({ clock }, dt) => {
    const grp = g.current;
    if (!grp) return;
    const s = est.current;
    if (!s.init) {
      grp.position.set(lay.x, lay.y, 0);
      s.init = true;
    }
    if (s.k !== lay.nodo.k) {
      s.k = lay.nodo.k;
      s.pop = 1;
    }
    s.pop = Math.max(0, s.pop - dt * 2.2);
    grp.position.x += (lay.x - grp.position.x) * suave(dt, 0.1);
    grp.position.y += (lay.y - grp.position.y) * suave(dt, 0.1);
    grp.scale.setScalar(1 + Math.sin(s.pop * Math.PI) * 0.35);
    if (mat.current) mat.current.emissiveIntensity = listoSig ? 0.7 + Math.sin(clock.elapsedTime * 6) * 0.3 : esNum ? 0.1 : 0.35;
  });
  const cat = categoriaDe(lay.nodo);
  const col = esNum ? "#13233b" : colorCat(cat);
  const texto = esNum && lay.nodo.k === "num" ? fmtQ(lay.nodo.v, lay.nodo.dec) : simboloNodo(lay.nodo);
  const w = esNum ? Math.max(0.78, 0.3 + texto.replace(/\/.*/, "").length * 0.2) : 0;
  const clic = !esNum && !!onElegir;
  return (
    <group ref={g}>
      {esNum ? (
        <mesh geometry={GEO_CAJA} scale={[w, 0.56, 0.24]}>
          <meshStandardMaterial ref={mat} color={col} emissive="#3b82f6" emissiveIntensity={0.1} roughness={0.4} />
        </mesh>
      ) : (
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => {
            if (!onElegir) return;
            e.stopPropagation();
            onElegir(lay.id);
          }}
          onPointerOver={() => {
            if (clic) document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <cylinderGeometry args={[0.34, 0.34, 0.2, 32]} />
          <meshStandardMaterial ref={mat} color={col} emissive={col} emissiveIntensity={0.35} roughness={0.35} metalness={0.2} />
        </mesh>
      )}
      <Html position={[0, 0, 0.16]} center distanceFactor={9} zIndexRange={[16, 0]} style={{ pointerEvents: "none" }}>
        {esNum ? (
          <Numero texto={texto} fs={texto.includes("/") ? 18 : 21} />
        ) : (
          <span style={{ color: "#0b1220", fontSize: simboloNodo(lay.nodo).length > 1 ? 14 : 24, fontWeight: 900, fontFamily: "ui-rounded, 'Segoe UI', system-ui, sans-serif", whiteSpace: "nowrap" }}>{simboloNodo(lay.nodo)}</span>
        )}
      </Html>
    </group>
  );
}

const V_ARRIBA = new THREE.Vector3(0, 1, 0);

function Rama({ desde, hasta }: { desde: [number, number]; hasta: [number, number] }) {
  const m = useRef<THREE.Mesh>(null);
  const vec = useRef<{ a: THREE.Vector3; b: THREE.Vector3; d: THREE.Vector3 } | null>(null);
  useFrame((_, dt) => {
    if (!vec.current) vec.current = { a: new THREE.Vector3(desde[0], desde[1], -0.05), b: new THREE.Vector3(hasta[0], hasta[1], -0.05), d: new THREE.Vector3() };
    const { a, b, d: dir } = vec.current;
    const k = suave(dt, 0.1);
    a.x += (desde[0] - a.x) * k;
    a.y += (desde[1] - a.y) * k;
    b.x += (hasta[0] - b.x) * k;
    b.y += (hasta[1] - b.y) * k;
    const mesh = m.current;
    if (!mesh) return;
    dir.subVectors(b, a);
    const len = Math.max(0.001, dir.length());
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.scale.set(1, len, 1);
    mesh.quaternion.setFromUnitVectors(V_ARRIBA, dir.normalize());
  });
  return (
    <mesh ref={m}>
      <cylinderGeometry args={[0.035, 0.035, 1, 8]} />
      <meshStandardMaterial color="#64748b" emissive="#94a3b8" emissiveIntensity={0.15} roughness={0.5} />
    </mesh>
  );
}

function CajaGrupo({ g }: { g: GrupoLay }) {
  const w = g.x1 - g.x0;
  const h = g.y1 - g.y0;
  const col = colorCat("agrupacion");
  const cierra = g.b === "(" ? ")" : g.b === "[" ? "]" : "}";
  return (
    <group position={[(g.x0 + g.x1) / 2, (g.y0 + g.y1) / 2, -0.25]}>
      <mesh geometry={GEO_CAJA} scale={[w, h, 0.05]}>
        <meshStandardMaterial color={col} transparent opacity={0.08} depthWrite={false} emissive={col} emissiveIntensity={0.3} />
      </mesh>
      <Html position={[-w / 2, 0, 0.05]} center distanceFactor={9} zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
        <span style={{ color: col, fontSize: 26, fontWeight: 900, textShadow: "0 0 6px #050b17" }}>{g.b}</span>
      </Html>
      <Html position={[w / 2, 0, 0.05]} center distanceFactor={9} zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
        <span style={{ color: col, fontSize: 26, fontWeight: 900, textShadow: "0 0 6px #050b17" }}>{cierra}</span>
      </Html>
    </group>
  );
}

function ArbolVista({ arbol, pos, escala = 1, siguienteId, onElegir, clave }: { arbol: Nodo; pos: Pt; escala?: number; siguienteId?: string | null; onElegir?: (id: string) => void; clave: string }) {
  const lay = useMemo(() => layoutArbol(arbol), [arbol]);
  const porId = useMemo(() => new Map(lay.nodos.map((n) => [n.id, n])), [lay]);
  return (
    <group position={pos} scale={escala}>
      {lay.grupos.map((g) => (
        <CajaGrupo key={`${clave}-${g.id}`} g={g} />
      ))}
      {lay.nodos
        .filter((n) => n.padre)
        .map((n) => {
          const p = porId.get(n.padre!)!;
          return <Rama key={`${clave}-r-${n.id}`} desde={[n.x, n.y]} hasta={[p.x, p.y]} />;
        })}
      {lay.nodos.map((n) => (
        <NodoArbol key={`${clave}-${n.id}`} lay={n} listoSig={siguienteId === n.id} onElegir={onElegir} />
      ))}
    </group>
  );
}

function EscenaArbolPasos({ exprId, elegidos, onElegir, modoColor }: { exprId: string; elegidos: string[]; onElegir: (id: string) => void; modoColor: string }) {
  const expr = EXPRESIONES.find((e) => e.id === exprId) ?? EXPRESIONES[0]!;
  const arbol0 = useMemo(() => leer(expr.texto), [expr.texto]);
  const pasos = useMemo(() => reproducir(arbol0, elegidos), [arbol0, elegidos]);
  const actual = pasos.length ? pasos[pasos.length - 1]!.despues : arbol0;
  const alto = layoutArbol(arbol0).alto;
  return (
    <group>
      <ArbolVista arbol={actual} pos={[0, -alto / 2 - 0.2, 0]} clave={exprId} onElegir={onElegir} />
      <Etiqueta pos={[0, -alto / 2 - 1.05, 0.3]} df={10} fs={12} col={`${modoColor}88`}>
        <i className="fa-solid fa-diagram-project" style={{ color: modoColor }} />
        {actual.k === "num" ? `Resultado: ${fmtQ(actual.v, actual.dec)}` : "Cada operación espera a que sus dos lados sean números"}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. ¿QUIÉN TIENE RAZÓN?
 * ════════════════════════════════════════════════════════════════════════ */

function Aparato({ tipo, escrito, resultado, color, veredicto }: { tipo: string; escrito: string; resultado: string | null; color: string; veredicto: boolean | null }) {
  const txtEscrito = escrito;
  const pantallaCol = veredicto === null ? color : veredicto ? OKC : NO;
  const pantalla = (
    <div style={{ minWidth: 150, padding: "6px 12px", borderRadius: 6, background: tipo === "cuaderno" ? "#fdfcf5" : tipo === "hoja" ? "#ffffff" : "#a7c4a0", color: "#0b1220", fontFamily: tipo === "cuaderno" ? "'Segoe Print', 'Comic Sans MS', cursive" : "ui-monospace, monospace", textAlign: "right", border: `2px solid ${pantallaCol}`, boxShadow: veredicto === null ? "none" : `0 0 18px ${pantallaCol}` }}>
      {tipo === "hoja" && <div style={{ fontSize: 10, color: "#475569", textAlign: "left", fontFamily: "system-ui" }}>A1 · fx</div>}
      <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{txtEscrito}</div>
      <div style={{ fontSize: 22, fontWeight: 900, minHeight: 26 }}>{resultado ?? "…"}</div>
    </div>
  );
  if (tipo === "hoja")
    return (
      <group>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[2.4, 1.5, 0.12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.9, 0.065]}>
          <planeGeometry args={[2.2, 1.3]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#e2e8f0" emissiveIntensity={0.25} />
        </mesh>
        {Array.from({ length: 5 }, (_, k) => (
          <mesh key={k} position={[0, 0.35 + k * 0.28, 0.07]}>
            <planeGeometry args={[2.2, 0.012]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        ))}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.18, 0.3, 0.12]} />
          <meshStandardMaterial color="#374151" metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.9, 0.05, 0.5]} />
          <meshStandardMaterial color="#374151" metalness={0.5} />
        </mesh>
        <Html position={[0, 0.95, 0.1]} center distanceFactor={6.5} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
          {pantalla}
        </Html>
      </group>
    );
  if (tipo === "cuaderno")
    return (
      <group rotation={[-0.5, 0, 0]} position={[0, 0.3, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.62, 0, 0]} rotation={[0, s * -0.12, 0]} castShadow>
            <boxGeometry args={[1.2, 1.5, 0.03]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
        ))}
        {Array.from({ length: 8 }, (_, k) => (
          <mesh key={k} position={[0, -0.6 + k * 0.17, 0.03]}>
            <planeGeometry args={[2.3, 0.01]} />
            <meshBasicMaterial color="#93c5fd" />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.04, 1.52, 0.04]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <Html position={[0, 0.05, 0.1]} center distanceFactor={6.5} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
          {pantalla}
        </Html>
      </group>
    );
  const cientifica = tipo === "cientifica";
  return (
    <group rotation={[-0.85, 0, 0]} position={[0, 0.25, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 2.1, 0.16]} />
        <meshStandardMaterial color={cientifica ? "#1e293b" : "#475569"} roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.62, 0.085]}>
        <planeGeometry args={[1.25, 0.55]} />
        <meshStandardMaterial color="#86a37f" emissive="#86a37f" emissiveIntensity={0.2} />
      </mesh>
      {Array.from({ length: cientifica ? 20 : 16 }, (_, k) => {
        const cols = 4;
        const filas = cientifica ? 5 : 4;
        const c = k % cols;
        const f = Math.floor(k / cols);
        return (
          <mesh key={k} position={[-0.48 + c * 0.32, 0.18 - f * (1.05 / filas), 0.1]}>
            <boxGeometry args={[0.24, 0.15, 0.05]} />
            <meshStandardMaterial color={c === 3 ? "#f59e0b" : cientifica && f === 0 ? "#6366f1" : "#cbd5e1"} roughness={0.5} />
          </mesh>
        );
      })}
      <Html position={[0, 0.62, 0.12]} center distanceFactor={6.5} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
        {pantalla}
      </Html>
    </group>
  );
}

function EscenaRazon({ casoId, pasoAuto, revelado }: { casoId: string; pasoAuto: number; revelado: boolean }) {
  const caso = CASOS.find((c) => c.id === casoId) ?? CASOS[0]!;
  const base = (["izq", "der"] as const).map((lado) => {
    const maq = lado === "izq" ? caso.izq : caso.der;
    const escrito = escritoDe(caso, lado);
    const a0 = leer(escrito, maq.lectura, `${lado}`);
    return { lado, maq, escrito, a0, pasos: resolverTodo(a0) };
  });
  const maxAuto = Math.max(...base.map((b) => b.pasos.length));
  // Al terminar, vuelve a mostrarse el árbol completo para comparar estructuras.
  const repaso = revelado && pasoAuto > maxAuto;
  const lados = base.map(({ lado, maq, escrito, a0, pasos }) => {
    const k = revelado && !repaso ? Math.min(pasoAuto, pasos.length) : 0;
    const arbol = k === 0 ? a0 : pasos[k - 1]!.despues;
    const sig = revelado && !repaso && k < pasos.length ? pasos[k]!.id : null;
    const fin = evaluar(a0);
    const valor = fin ? valorTexto(a0) : "—";
    return { lado, maq, escrito, arbol, sig, listo: revelado && k >= pasos.length, valor, alto: layoutArbol(a0).alto };
  });
  return (
    <group position={[0, 0.2, 0]}>
      {lados.map((l) => {
        const x = l.lado === "izq" ? -3.3 : 3.3;
        const escala = 0.74;
        const bien = l.valor === caso.respuesta;
        const listo = l.listo || repaso;
        return (
          <group key={`${casoId}-${l.lado}`} position={[x, 0, 0]}>
            <mesh position={[0, -2.95, -0.3]} receiveShadow>
              <cylinderGeometry args={[1.45, 1.6, 0.18, 48]} />
              <meshStandardMaterial color="#0f1b2d" roughness={0.8} />
            </mesh>
            <mesh position={[0, -2.85, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.47, 0.022, 8, 64]} />
              <meshBasicMaterial color={listo ? (bien ? OKC : NO) : "#334155"} toneMapped={false} />
            </mesh>
            <group position={[0, -2.75, 0]} scale={0.8}>
              <Aparato tipo={l.maq.aparato} escrito={l.maq.pantalla ?? l.escrito} resultado={listo ? l.valor : null} color="#64748b" veredicto={listo ? bien : null} />
            </group>
            {revelado ? (
              <ArbolVista arbol={l.arbol} pos={[0, -0.6, -0.2]} escala={escala} siguienteId={l.sig} clave={`${casoId}-${l.lado}-${repaso ? "r" : "a"}`} />
            ) : (
              <Etiqueta pos={[0, 0.3, 0]} df={10} fs={30} col="rgba(251,146,60,0.5)">
                ?
              </Etiqueta>
            )}
            <Etiqueta pos={[0, revelado ? -0.6 + l.alto * escala + 0.75 : 1.6, 0]} df={10} fs={13} col={listo ? (bien ? `${OKC}aa` : `${NO}aa`) : "rgba(255,255,255,0.3)"}>
              <i className={`fa-solid ${l.maq.aparato === "hoja" ? "fa-table" : l.maq.aparato === "cuaderno" ? "fa-book-open" : "fa-calculator"}`} style={{ color: "#fdba74" }} />
              {l.maq.etq}
              {listo && <i className={`fa-solid ${bien ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: bien ? OKC : NO }} />}
            </Etiqueta>
          </group>
        );
      })}
      <Etiqueta pos={[0, 3.2, 0]} df={10} fs={15} col="#fb923caa">
        <i className="fa-solid fa-scale-unbalanced" style={{ color: "#fb923c" }} />
        {caso.expresion}
      </Etiqueta>
      {!revelado && (
        <Etiqueta pos={[0, -0.6, 0.5]} df={10} fs={12} col="#fb923c88">
          <i className="fa-solid fa-circle-question" style={{ color: "#fb923c" }} />
          Predice en el panel; después verás el árbol que arma cada una
        </Etiqueta>
      )}
      {repaso && (
        <Etiqueta pos={[0, -0.9, 0.5]} df={10} fs={12} col="#fb923c88">
          <i className="fa-solid fa-diagram-project" style={{ color: "#fb923c" }} />
          Mismos símbolos, árboles distintos
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. CONSTRUCTOR Y RECTA NUMÉRICA
 * ════════════════════════════════════════════════════════════════════════ */

const RECTA_Y = -2.5;
const RECTA_L = 11.5;

function Marcador({ x, texto, fuera, raizX, raizY, color }: { x: number; texto: string; fuera: boolean; raizX: number; raizY: number; color: string }) {
  const g = useRef<THREE.Group>(null);
  const haz = useRef<THREE.Mesh>(null);
  const cur = useRef(x);
  useFrame(({ clock }, dt) => {
    cur.current += (x - cur.current) * suave(dt, 0.08);
    if (g.current) {
      g.current.position.x = cur.current;
      g.current.position.y = RECTA_Y + 0.42 + Math.sin(clock.elapsedTime * 3) * 0.04;
    }
    if (haz.current) {
      const x0 = cur.current;
      const y0 = RECTA_Y + 0.75;
      const dx = raizX - x0;
      const dy = raizY - y0;
      const len = Math.hypot(dx, dy);
      haz.current.position.set(x0 + dx / 2, y0 + dy / 2, -0.1);
      haz.current.scale.set(1, Math.max(0.01, len), 1);
      haz.current.rotation.z = Math.atan2(-dx, dy);
    }
  });
  return (
    <>
      <mesh ref={haz}>
        <cylinderGeometry args={[0.018, 0.018, 1, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <group ref={g}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2, 0.44, 24]} />
          <meshStandardMaterial color={fuera ? NO : color} emissive={fuera ? NO : color} emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
        <Html position={[0, 0.62, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(4,10,22,0.9)", border: `1px solid ${fuera ? NO : color}`, color: "#fff", fontSize: 15, fontWeight: 900, whiteSpace: "nowrap" }}>{texto}</div>
        </Html>
      </group>
    </>
  );
}

function EscenaConstructor({ retoId, ops, grupo, hallados, modoColor }: { retoId: string; ops: OpBin[]; grupo: string; hallados: string[]; modoColor: string }) {
  const reto = RETOS_CONSTRUCTOR.find((r) => r.id === retoId) ?? RETOS_CONSTRUCTOR[0]!;
  const texto = textoConstructor(reto.numeros, ops, grupo);
  const arbol = leer(texto, JERARQUIA, "c");
  const v = valorConstructor(reto.numeros, ops, grupo);
  const meta = qDeTexto(reto.meta);
  const [lo, hi] = reto.rango;
  const aX = (val: number) => -RECTA_L / 2 + ((val - lo) / (hi - lo)) * RECTA_L;
  const lay = layoutArbol(arbol);
  const escala = Math.min(1, 7.5 / Math.max(1, lay.ancho + 1.4));
  const raizY = -1.25;
  const valNum = v ? aNumero(v) : 0;
  const fuera = !v || valNum < lo || valNum > hi;
  const xm = v ? aX(Math.min(hi, Math.max(lo, valNum))) : aX(lo);
  const logrado = !!v && v.n === meta.n && v.d === meta.d;
  const marcas: number[] = [];
  for (let t = Math.ceil(lo / reto.paso) * reto.paso; t <= hi + 1e-9; t += reto.paso) marcas.push(t);
  return (
    <group>
      <ArbolVista arbol={arbol} pos={[0, raizY, 0]} escala={escala} clave={`${retoId}-${texto}`} />
      {/* Recta numérica */}
      <mesh position={[0, RECTA_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, RECTA_L + 0.6, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.3} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (RECTA_L / 2 + 0.4), RECTA_Y, 0]} rotation={[0, 0, (-s * Math.PI) / 2]}>
          <coneGeometry args={[0.12, 0.3, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
      {marcas.map((t) => (
        <group key={t} position={[aX(t), RECTA_Y, 0]}>
          <mesh>
            <boxGeometry args={[t === 0 ? 0.05 : 0.03, t === 0 ? 0.42 : 0.26, 0.03]} />
            <meshStandardMaterial color={t === 0 ? "#fff" : "#94a3b8"} />
          </mesh>
          <Html position={[0, -0.42, 0]} center distanceFactor={10} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <span style={{ color: t === 0 ? "#fff" : "#94a3b8", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>{t < 0 ? `−${-t}` : t}</span>
          </Html>
        </group>
      ))}
      {/* Meta */}
      <group position={[aX(aNumero(meta)), RECTA_Y, 0.25]}>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.1, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0.2, 0.95, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.16, 0.4, 3]} />
          <meshStandardMaterial color={logrado ? OKC : "#facc15"} emissive={logrado ? OKC : "#facc15"} emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        <Html position={[0, -0.82, 0]} center distanceFactor={10} zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <span style={{ padding: "2px 8px", borderRadius: 7, background: "rgba(66,50,0,0.85)", border: "1px solid #facc15", color: "#fef08a", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }}>meta {reto.meta}</span>
        </Html>
      </group>
      {/* Resultados hallados */}
      {hallados.map((clave) => {
        const [n, d] = clave.split("/").map(Number);
        const val = n! / d!;
        if (val < lo || val > hi) return null;
        return (
          <mesh key={clave} position={[aX(val), RECTA_Y, 0.12]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
        );
      })}
      <Marcador x={xm} texto={v ? `${fmtQ(v, true)}${fuera ? (valNum > hi ? " →" : " ←") : ""}` : "sin valor"} fuera={fuera} raizX={lay.raizX * escala} raizY={raizY - 0.3} color={logrado ? OKC : modoColor} />
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function JerarquiaOperacionesScene(p: JerarquiaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const expr = EXPRESIONES.find((e) => e.id === p.exprId) ?? EXPRESIONES[0]!;
  const encuadre = useMemo(() => {
    const a0 = leer(expr.texto);
    if (vista === "pasos" && !p.verArbol) {
      const n = resolverTodo(a0).length;
      const ancho = fichasDe(a0).ancho + 7.6;
      const alto = n * FILA_H + 3.4;
      const dist = Math.max(8.2, ancho * 0.92, alto * 1.5);
      return { pos: [-1.2, 0.5, dist] as Pt, target: [-1.2, -0.5, 0] as Pt };
    }
    if (vista === "pasos") {
      const lay = layoutArbol(a0);
      const dist = Math.max(8.5, lay.ancho * 1.25 + 3, lay.alto * 2.1 + 3);
      return { pos: [0, 0.8, dist] as Pt, target: [0, 0, 0] as Pt };
    }
    if (vista === "razon") return { pos: [0, 0.6, 13.2] as Pt, target: [0, -0.1, 0] as Pt };
    return { pos: [0, 0.6, 12.2] as Pt, target: [0, -0.4, 0] as Pt };
  }, [vista, p.verArbol, expr.texto]);

  return (
    <Canvas key={`${vista}-${p.exprId}-${p.verArbol}-${p.casoId}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: encuadre.pos, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento="#38bdf8" fondo={FONDO} />
      <pointLight position={[-6, 3, 6]} intensity={0.45} color={modoColor} />
      <Pizarron color={modoColor} z={vista === "razon" ? -2.2 : -1.6} />

      {vista === "pasos" && !p.verArbol && <EscenaPasos exprId={p.exprId} elegidos={p.elegidos} errorId={p.errorId} errorTexto={p.errorTexto} onElegir={p.onElegir} modoColor={modoColor} />}
      {vista === "pasos" && p.verArbol && <EscenaArbolPasos exprId={p.exprId} elegidos={p.elegidos} onElegir={p.onElegir} modoColor={modoColor} />}
      {vista === "razon" && <EscenaRazon casoId={p.casoId} pasoAuto={p.pasoAuto} revelado={p.revelado} />}
      {vista === "constructor" && <EscenaConstructor retoId={p.retoId} ops={p.ops} grupo={p.grupo} hallados={p.hallados} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={26} maxPolarAngle={Math.PI * 0.62} minPolarAngle={Math.PI * 0.28} maxAzimuthAngle={Math.PI * 0.3} minAzimuthAngle={-Math.PI * 0.3} target={encuadre.target} />
      <EffectComposer>
        <Bloom intensity={0.28} luminanceThreshold={0.7} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
