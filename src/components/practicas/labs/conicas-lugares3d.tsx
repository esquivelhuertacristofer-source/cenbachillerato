"use client";

/**
 * LOS LUGARES GEOMÉTRICOS — la definición que se VE, sobre una pizarra de
 * esquisto con marco de latón.
 *
 *  · CIRCUNFERENCIA: un compás de latón abierto exactamente r gira alrededor del
 *    centro; el punto Q se clasifica dentro / sobre / fuera.
 *  · ELIPSE: el método del jardinero. Un hilo de largo 2a atado a dos clavos
 *    (los focos) y un lápiz que lo mantiene tenso va dibujando la curva.
 *  · PARÁBOLA: el punto P equidista del foco (un foco que brilla) y de la
 *    directriz (una regla de acero); los dos segmentos se mueven con él.
 *  · HIPÉRBOLA: P recorre las dos ramas; la diferencia de sus distancias a los
 *    focos no cambia.
 *
 * Lo que se mueve cada cuadro (el punto, el hilo, el compás, los segmentos) se
 * coloca por refs en `useFrame`, a partir de una fase suavizada; los números
 * de las etiquetas llegan por props.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CurvaTubo } from "./_tablero";
import {
  Pizarra, Etiqueta, Canica, Clavo, useFaseSuave, orientar, useCilindroUnitario,
  LATON, ACERO, FOCO_COL, D1_COL, D2_COL, DIR_COL, RAYO_COL, type Pt,
} from "./conicas-museo3d";
import { SUELO_SALA } from "./conicas-apolonio3d";
import { calcParab, puntoParab, distanciasParab, PARAB_HALF, fmtNum2, fmtPar, calcCirc } from "./conicas-data";
import {
  type Elipse, type Hiperbola, type P2, puntoElipse, distFocos, puntoHiperbola, ramaHiperbola, f2, LADO_PIZARRA,
} from "./conicas-museo-data";

/** Unidades de escena por unidad del plano (la pizarra mide ±8). */
export const U = 0.5;
const G = LADO_PIZARRA;
const YMAX = 7.4;
const S = (x: number, y: number, z = 0): Pt => [x * U, y * U, z];

/* ── Fondo común: la pizarra ─────────────────────────────────────────────── */
export function PizarraSala() {
  return <Pizarra lado={G} U={U} suelo={SUELO_SALA} />;
}

/** Etiqueta que sigue a un punto móvil (la posición la pone un ref). */
function EtiquetaMovil({ grupo, color, children }: { grupo: React.RefObject<THREE.Group | null>; color: string; children: React.ReactNode }) {
  return (
    <group ref={grupo}>
      <Etiqueta pos={[0, 0, 0]} color={color}>{children}</Etiqueta>
    </group>
  );
}

const v3 = () => new THREE.Vector3();

/* ═══════════════════════════════════════════════════════════════════════════
 * CIRCUNFERENCIA — el compás
 * ═══════════════════════════════════════════════════════════════════════════ */
const PIERNA = 2.7;

export function EscenaCircunferencia({ h, k, r, qx, qy, fase, accent }: {
  h: number; k: number; r: number; qx: number; qy: number; fase: number; accent: string;
}) {
  const c = calcCirc(h, k, r, qx, qy);
  const qCol = c.estadoQ === "dentro" ? "#34D399" : c.estadoQ === "sobre" ? "#fbbf24" : "#fb7185";
  const curva = useMemo(() => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2; pts.push(S(h + r * Math.cos(a), k + r * Math.sin(a), 0.03)); }
    return pts;
  }, [h, k, r]);
  const medida = useMemo<Pt[]>(() => [S(h, k, 0.05), S(qx, qy, 0.05)], [h, k, qx, qy]);

  const suave = useFaseSuave(fase);
  const cil = useCilindroUnitario(1, 12);
  const radio = useRef<THREE.Mesh>(null);
  const aguja = useRef<THREE.Mesh>(null);
  const lapiz = useRef<THREE.Mesh>(null);
  const cabeza = useRef<THREE.Group>(null);
  const punta = useRef<THREE.Mesh>(null);
  const etqR = useRef<THREE.Group>(null);
  const w = useMemo(() => ({ C: v3(), P: v3(), M: v3(), Hn: v3(), aux: v3(), P0: v3() }), []);

  useFrame(() => {
    const ang = suave.current * Math.PI * 2;
    w.C.set(h * U, k * U, 0.03);
    w.P.set((h + r * Math.cos(ang)) * U, (k + r * Math.sin(ang)) * U, 0.03);
    // bisagra del compás: sobre el punto medio, a la altura que permiten las piernas
    w.M.addVectors(w.C, w.P).multiplyScalar(0.5);
    const semi = (r * U) / 2;
    w.Hn.copy(w.M).setZ(Math.sqrt(Math.max(0.2, PIERNA * PIERNA - semi * semi)));
    if (radio.current) orientar(radio.current, w.C, w.P, w.aux, 0.03);
    if (aguja.current) orientar(aguja.current, w.C, w.Hn, w.aux, 0.065);
    if (lapiz.current) orientar(lapiz.current, w.Hn, w.P, w.aux, 0.065);
    if (cabeza.current) { cabeza.current.position.copy(w.Hn); cabeza.current.rotation.z = ang; }
    if (punta.current) punta.current.position.copy(w.P);
    if (etqR.current) etqR.current.position.set((w.C.x + w.P.x) / 2, (w.C.y + w.P.y) / 2 + 0.3, 0.2);
  });

  return (
    <group>
      <CurvaTubo puntos={curva} color={accent} grosor={0.055} brillo={1.1} />
      {/* el radio sobre la piedra */}
      <mesh ref={radio} geometry={cil}>
        <meshStandardMaterial color="#34D399" emissive="#34D399" emissiveIntensity={0.9} />
      </mesh>
      {/* compás de latón: pierna de aguja, pierna de lápiz y cabeza */}
      <mesh ref={aguja} geometry={cil} castShadow>
        <meshStandardMaterial color={LATON} roughness={0.25} metalness={0.95} />
      </mesh>
      <mesh ref={lapiz} geometry={cil} castShadow>
        <meshStandardMaterial color={LATON} roughness={0.25} metalness={0.95} />
      </mesh>
      <group ref={cabeza}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.12, 24]} />
          <meshStandardMaterial color={LATON} roughness={0.22} metalness={0.95} />
        </mesh>
        <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 14]} />
          <meshStandardMaterial color="#3a2a1c" roughness={0.6} />
        </mesh>
      </group>
      <mesh ref={punta}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshStandardMaterial color="#1f2937" emissive="#34D399" emissiveIntensity={0.6} />
      </mesh>
      {/* centro */}
      <Clavo p={S(h, k)} color="#f5d36b" />
      {/* punto de prueba Q */}
      <CurvaTubo puntos={medida} color={qCol} grosor={0.022} brillo={0.6} segmentos={6} radiales={6} />
      <Canica p={S(qx, qy, 0.14)} color={qCol} radio={0.15} />

      <Etiqueta pos={[h * U, k * U - 0.45, 0.2]} color="#f5d36b"><strong>C</strong>&nbsp;{fmtPar(h, k)}</Etiqueta>
      <EtiquetaMovil grupo={etqR} color="#34D399">r = {fmtNum2(r)}</EtiquetaMovil>
      <Etiqueta pos={[qx * U, qy * U + 0.48, 0.25]} color={qCol}><strong>Q</strong> {fmtPar(qx, qy)} · {c.estadoQ}</Etiqueta>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ELIPSE — el método del jardinero
 * ═══════════════════════════════════════════════════════════════════════════ */
/** Elipse parametrizada por el ángulo (no por longitud de arco): el tramo i del tubo es la fase i/N. */
class CurvaElipse extends THREE.Curve<THREE.Vector3> {
  constructor(private a: number, private b: number, private z: number) { super(); }
  getPoint(t: number, out = new THREE.Vector3()) {
    const f = t * Math.PI * 2;
    return out.set(this.a * Math.cos(f), this.b * Math.sin(f), this.z);
  }
  getPointAt(u: number, out = new THREE.Vector3()) { return this.getPoint(u, out); }
  getTangentAt(u: number, out = new THREE.Vector3()) { return this.getTangent(u, out); }
}
const SEG_ELIPSE = 220, RAD_ELIPSE = 10;
const HILO_Z = 0.27;

export function EscenaElipse({ el, fase, accent }: { el: Elipse; fase: number; accent: string }) {
  const suave = useFaseSuave(fase);
  const cil = useCilindroUnitario(1, 8);
  // Dos copias del mismo tubo: el trazo es una ventana del lazo que puede dar la
  // vuelta por el cero, y una sola `drawRange` no puede partirse en dos.
  const geoTrazo = useMemo(() => {
    const crear = () => new THREE.TubeGeometry(new CurvaElipse(el.a * U, el.b * U, 0.03), SEG_ELIPSE, 0.05, RAD_ELIPSE, true);
    return [crear(), crear()] as const;
  }, [el.a, el.b]);
  const guia = useMemo(() => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 160; i++) { const [x, y] = puntoElipse(el, i / 160); pts.push(S(x, y, 0.02)); }
    return pts;
  }, [el]);

  const hilo1 = useRef<THREE.Mesh>(null);
  const hilo2 = useRef<THREE.Mesh>(null);
  const lapiz = useRef<THREE.Group>(null);
  const etq1 = useRef<THREE.Group>(null);
  const etq2 = useRef<THREE.Group>(null);
  const avance = useRef({ ultimo: -1, recorrido: 0, clave: "" });
  const w = useMemo(() => ({ F1: v3(), F2: v3(), P: v3(), aux: v3() }), []);

  useFrame(() => {
    const f = suave.current;
    const [x, y] = puntoElipse(el, f);
    w.F1.set(-el.c * U, 0, HILO_Z); w.F2.set(el.c * U, 0, HILO_Z); w.P.set(x * U, y * U, HILO_Z);
    if (hilo1.current) orientar(hilo1.current, w.F1, w.P, w.aux, 0.024);
    if (hilo2.current) orientar(hilo2.current, w.P, w.F2, w.aux, 0.024);
    // el lápiz: punta en la piedra, inclinado hacia afuera como lo sostiene una mano
    if (lapiz.current) { lapiz.current.position.set(x * U, y * U, 0); lapiz.current.rotation.set(-Math.sin(f * Math.PI * 2) * 0.22, Math.cos(f * Math.PI * 2) * 0.22, 0); }
    if (etq1.current) etq1.current.position.set((w.F1.x + w.P.x) / 2, (w.F1.y + w.P.y) / 2 + 0.28, 0.5);
    if (etq2.current) etq2.current.position.set((w.F2.x + w.P.x) / 2, (w.F2.y + w.P.y) / 2 - 0.28, 0.5);
    // el trazo crece con lo que el lápiz ya recorrió (una vuelta y queda completo)
    const av = avance.current;
    const clave = `${el.a}|${el.c}`;
    if (av.clave !== clave) { av.clave = clave; av.recorrido = 0; av.ultimo = f; }
    let dlt = f - av.ultimo; if (dlt < -0.5) dlt += 1; if (dlt > 0.5) dlt -= 1;
    av.recorrido = Math.min(1, av.recorrido + Math.abs(dlt));
    av.ultimo = f;
    // TubeGeometry: 6·radiales índices por tramo; se dibuja la ventana [desde, desde + n)
    const porTramo = RAD_ELIPSE * 6;
    const [g1, g2] = geoTrazo;
    if (av.recorrido >= 1) { g1.setDrawRange(0, SEG_ELIPSE * porTramo); g2.setDrawRange(0, 0); return; }
    const n = Math.floor(av.recorrido * SEG_ELIPSE);
    const desde = Math.floor((((f - av.recorrido) % 1) + 1) % 1 * SEG_ELIPSE);
    const primero = Math.min(n, SEG_ELIPSE - desde);
    g1.setDrawRange(desde * porTramo, primero * porTramo);
    g2.setDrawRange(0, (n - primero) * porTramo);
  });

  const P = puntoElipse(el, fase);
  const { d1, d2 } = distFocos(P, el.c);

  return (
    <group>
      {/* la curva que el lápiz va a dibujar, apenas insinuada */}
      <CurvaTubo puntos={guia} color="#35506b" grosor={0.018} brillo={0.15} radiales={6} />
      {/* el trazo de grafito luminoso */}
      {geoTrazo.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} roughness={0.35} />
        </mesh>
      ))}
      {/* los clavos (focos) */}
      <Clavo p={S(-el.c, 0)} />
      <Clavo p={S(el.c, 0)} />
      {/* el hilo tenso */}
      <mesh ref={hilo1} geometry={cil} castShadow>
        <meshStandardMaterial color="#f3ead8" emissive={D1_COL} emissiveIntensity={0.6} roughness={0.9} />
      </mesh>
      <mesh ref={hilo2} geometry={cil} castShadow>
        <meshStandardMaterial color="#f3ead8" emissive={D2_COL} emissiveIntensity={0.6} roughness={0.9} />
      </mesh>
      {/* el lápiz */}
      <group ref={lapiz}>
        <mesh position={[0, 0, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.03, 0.1, 12]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.22]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.085, 0.25, 6]} />
          <meshStandardMaterial color="#e6c79c" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 1.32, 6]} />
          <meshStandardMaterial color="#f2b632" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0, 1.7]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.088, 0.088, 0.1, 16]} />
          <meshStandardMaterial color={LATON} roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, 1.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.14, 16]} />
          <meshStandardMaterial color="#e88a9a" roughness={0.8} />
        </mesh>
      </group>

      <Etiqueta pos={[0, G * U + 0.55, 0.2]} color="#fbbf24" grande ancha>
        d₁ + d₂ = {f2(d1 + d2)} = 2a
      </Etiqueta>
      <EtiquetaMovil grupo={etq1} color={D1_COL}>d₁ = {f2(d1)}</EtiquetaMovil>
      <EtiquetaMovil grupo={etq2} color={D2_COL}>d₂ = {f2(d2)}</EtiquetaMovil>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PARÁBOLA — foco y directriz
 * ═══════════════════════════════════════════════════════════════════════════ */
export function EscenaParabola({ p, fase, mostrarFocal, accent, fino }: { p: number; fase: number; mostrarFocal: boolean; accent: string; fino: boolean }) {
  const par = calcParab(p);
  const halfEff = Math.min(PARAB_HALF, Math.sqrt(4 * p * YMAX));
  const curva = useMemo(() => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 160; i++) { const x = -halfEff + (i / 160) * 2 * halfEff; pts.push(S(x, (x * x) / (4 * p), 0.03)); }
    return pts;
  }, [p, halfEff]);
  // rayos de la propiedad focal: bajan paralelos al eje y se reflejan al foco
  const rayos = useMemo(() => {
    const xs = (fino ? [-0.7, 0.7] : [-0.82, -0.55, -0.28, 0.28, 0.55, 0.82]).map((f) => f * halfEff);
    return xs.map((x) => {
      const [hx, hy] = puntoParab(x, p);
      return [S(x, YMAX, 0.06), S(hx, hy, 0.06), S(0, p, 0.06)] as Pt[];
    });
  }, [p, halfEff, fino]);

  const suave = useFaseSuave(fase);
  const cil = useCilindroUnitario(1, 10);
  const seg1 = useRef<THREE.Mesh>(null);
  const seg2 = useRef<THREE.Mesh>(null);
  const bola = useRef<THREE.Group>(null);
  const pie = useRef<THREE.Mesh>(null);
  const etq1 = useRef<THREE.Group>(null);
  const etq2 = useRef<THREE.Group>(null);
  const pulsos = useRef<THREE.InstancedMesh>(null);
  const w = useMemo(() => ({ P: v3(), F: v3(), Q: v3(), aux: v3(), m: new THREE.Matrix4() }), []);
  const reloj = useRef(0);

  useFrame((_, dt) => {
    const t = halfEff * Math.sin(suave.current * Math.PI * 2);
    const [x, y] = puntoParab(t, p);
    w.P.set(x * U, y * U, 0.08); w.F.set(0, p * U, 0.08); w.Q.set(x * U, -p * U, 0.08);
    if (seg1.current) orientar(seg1.current, w.P, w.F, w.aux, 0.035);
    if (seg2.current) orientar(seg2.current, w.P, w.Q, w.aux, 0.035);
    if (bola.current) bola.current.position.copy(w.P);
    if (pie.current) pie.current.position.copy(w.Q);
    if (etq1.current) etq1.current.position.set((w.P.x + w.F.x) / 2 + 0.35, (w.P.y + w.F.y) / 2 + 0.15, 0.4);
    if (etq2.current) etq2.current.position.set(w.P.x + (x >= 0 ? 0.62 : -0.62), (w.P.y + w.Q.y) / 2, 0.4);
    // pulsos de luz por los rayos: todos llegan juntos al foco
    const im = pulsos.current;
    if (im && mostrarFocal) {
      reloj.current = (reloj.current + Math.min(dt, 0.05) * 0.32) % 1;
      // Desde la recta y = YMAX, el camino «bajar hasta la parábola + subir al foco»
      // mide YMAX + p para TODOS los rayos (la distancia al foco es la distancia a
      // la directriz): por eso llegan juntos.
      const total = (YMAX + p) * U;
      const dRec = Math.min(total, reloj.current * total * 1.2);
      rayos.forEach((r, i) => {
        const [a, b, c] = r as [Pt, Pt, Pt];
        const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
        let px: number, py: number;
        if (dRec <= l1) { px = a[0] + ((b[0] - a[0]) * dRec) / l1; py = a[1] + ((b[1] - a[1]) * dRec) / l1; }
        else { const q = Math.min(1, (dRec - l1) / Math.max(l2, 1e-6)); px = b[0] + (c[0] - b[0]) * q; py = b[1] + (c[1] - b[1]) * q; }
        w.m.makeTranslation(px, py, 0.08);
        im.setMatrixAt(i, w.m);
      });
      im.instanceMatrix.needsUpdate = true;
    }
  });

  const dd = distanciasParab(halfEff * Math.sin(fase * Math.PI * 2), p);

  return (
    <group>
      {/* directriz: una regla de acero sobre la piedra */}
      <mesh position={[0, -p * U, 0.04]} castShadow>
        <boxGeometry args={[G * U * 2 - 0.2, 0.11, 0.07]} />
        <meshStandardMaterial color={ACERO} roughness={0.28} metalness={0.9} />
      </mesh>
      <mesh position={[0, -p * U, 0.08]}>
        <boxGeometry args={[G * U * 2 - 0.2, 0.035, 0.01]} />
        <meshStandardMaterial color={DIR_COL} emissive={DIR_COL} emissiveIntensity={0.9} />
      </mesh>

      {mostrarFocal && (
        <>
          {rayos.map((r, i) => (
            <CurvaTubo key={i} puntos={r} color={RAYO_COL} grosor={0.032} brillo={0.8} segmentos={30} radiales={8} />
          ))}
          <instancedMesh ref={pulsos} args={[undefined, undefined, rayos.length]} key={`pul-${rayos.length}`}>
            <sphereGeometry args={[0.1, 14, 14]} />
            <meshStandardMaterial color="#e0f6ff" emissive={RAYO_COL} emissiveIntensity={2.2} />
          </instancedMesh>
        </>
      )}

      <CurvaTubo puntos={curva} color={accent} grosor={0.055} brillo={1.1} />
      <Canica p={S(0, 0, 0.08)} color="#60a5fa" radio={0.1} brillo={0.6} />
      {/* foco: una pequeña lámpara */}
      <Canica p={S(0, p, 0.1)} color={FOCO_COL} radio={0.16} brillo={1.8} />

      {/* los dos segmentos iguales */}
      <mesh ref={seg1} geometry={cil}>
        <meshStandardMaterial color={D1_COL} emissive={D1_COL} emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={seg2} geometry={cil}>
        <meshStandardMaterial color={D2_COL} emissive={D2_COL} emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={pie}>
        <boxGeometry args={[0.16, 0.16, 0.05]} />
        <meshStandardMaterial color={D2_COL} emissive={D2_COL} emissiveIntensity={0.7} />
      </mesh>
      <group ref={bola}><Canica color={accent} radio={0.16} /></group>

      <Etiqueta pos={[0.62, p * U + 0.12, 0.3]} color={FOCO_COL}><strong>F</strong> {fmtPar(0, par.focoY)}</Etiqueta>
      <Etiqueta pos={[G * U - 1.3, -p * U - 0.38, 0.3]} color={DIR_COL}>directriz y = {fmtNum2(par.directrizY)}</Etiqueta>
      <EtiquetaMovil grupo={etq1} color={D1_COL}>d₁ = {fmtNum2(dd.aFoco)}</EtiquetaMovil>
      <EtiquetaMovil grupo={etq2} color={D2_COL}>d₂ = {fmtNum2(dd.aDirectriz)}</EtiquetaMovil>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * HIPÉRBOLA — |d₁ − d₂| = 2a
 * ═══════════════════════════════════════════════════════════════════════════ */
export function EscenaHiperbola({ hi, fase, accent }: { hi: Hiperbola; fase: number; accent: string }) {
  const ramas = useMemo(() => ([1, -1] as const).map((r) => ramaHiperbola(hi, r).map(([x, y]) => S(x, y, 0.03))), [hi]);
  // asíntotas y = ±(b/a)x, punteadas con tramos cortos
  const asintotas = useMemo(() => {
    const m = hi.b / hi.a;
    const xMax = Math.min(G - 0.3, (G - 0.3) / m);
    const tramos: Pt[][] = [];
    for (const sg of [1, -1]) {
      const n = 22;
      for (let i = 0; i < n; i += 1) {
        if (i % 2) continue;
        const x0 = -xMax + (i / n) * 2 * xMax, x1 = -xMax + ((i + 1) / n) * 2 * xMax;
        tramos.push([S(x0, sg * m * x0, 0.02), S(x1, sg * m * x1, 0.02)]);
      }
    }
    return tramos;
  }, [hi]);

  const suave = useFaseSuave(fase);
  const cil = useCilindroUnitario(1, 10);
  const seg1 = useRef<THREE.Mesh>(null);
  const seg2 = useRef<THREE.Mesh>(null);
  const bola = useRef<THREE.Group>(null);
  const etq1 = useRef<THREE.Group>(null);
  const etq2 = useRef<THREE.Group>(null);
  const w = useMemo(() => ({ P: v3(), F1: v3(), F2: v3(), aux: v3() }), []);

  useFrame(() => {
    const [x, y] = puntoHiperbola(hi, suave.current);
    w.P.set(x * U, y * U, 0.08); w.F1.set(-hi.c * U, 0, 0.08); w.F2.set(hi.c * U, 0, 0.08);
    if (seg1.current) orientar(seg1.current, w.P, w.F1, w.aux, 0.035);
    if (seg2.current) orientar(seg2.current, w.P, w.F2, w.aux, 0.035);
    if (bola.current) bola.current.position.copy(w.P);
    if (etq1.current) etq1.current.position.set((w.P.x + w.F1.x) / 2, (w.P.y + w.F1.y) / 2 + 0.3, 0.4);
    if (etq2.current) etq2.current.position.set((w.P.x + w.F2.x) / 2, (w.P.y + w.F2.y) / 2 - 0.3, 0.4);
  });

  const P: P2 = puntoHiperbola(hi, fase);
  const { d1, d2 } = distFocos(P, hi.c);

  return (
    <group>
      {asintotas.map((t, i) => (
        <CurvaTubo key={i} puntos={t} color="#6b8db0" grosor={0.018} brillo={0.3} segmentos={2} radiales={6} />
      ))}
      {ramas.map((r, i) => <CurvaTubo key={i} puntos={r} color={accent} grosor={0.055} brillo={1.1} />)}
      <Clavo p={S(-hi.c, 0)} />
      <Clavo p={S(hi.c, 0)} />
      <Canica p={S(-hi.a, 0, 0.06)} color="#60a5fa" radio={0.09} brillo={0.6} />
      <Canica p={S(hi.a, 0, 0.06)} color="#60a5fa" radio={0.09} brillo={0.6} />
      <mesh ref={seg1} geometry={cil}>
        <meshStandardMaterial color={D1_COL} emissive={D1_COL} emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={seg2} geometry={cil}>
        <meshStandardMaterial color={D2_COL} emissive={D2_COL} emissiveIntensity={0.9} />
      </mesh>
      <group ref={bola}><Canica color={accent} radio={0.16} /></group>

      <Etiqueta pos={[0, G * U + 0.55, 0.2]} color="#f472b6" grande ancha>
        |d₁ − d₂| = {f2(Math.abs(d1 - d2))} = 2a
      </Etiqueta>
      <EtiquetaMovil grupo={etq1} color={D1_COL}>d₁ = {f2(d1)}</EtiquetaMovil>
      <EtiquetaMovil grupo={etq2} color={D2_COL}>d₂ = {f2(d2)}</EtiquetaMovil>
    </group>
  );
}
