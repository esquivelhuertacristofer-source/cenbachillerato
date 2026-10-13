"use client";

/**
 * REFRACCIÓN — tres montajes de laboratorio para la ley de Snell (CNEYT-V-P06).
 *
 *  · Frontera: disco óptico de Hartl (transportador vertical) con bloques
 *    semicirculares de agua, vidrio o diamante. El láser entra por la cara
 *    curva en dirección radial (sin desviarse) y se dobla SOLO en la cara
 *    plana del centro: n₁·sen θ₁ = n₂·sen θ₂. El brillo del rayo reflejado
 *    sigue la reflectancia de Fresnel: crece al acercarse al ángulo crítico
 *    y es total (100 %) al superarlo.
 *  · Fibra: el mismo ángulo dentro de un núcleo de medio 1 rodeado de medio 2.
 *    Con θ₁ > θ_c la luz queda atrapada rebote tras rebote y llega al final.
 *  · Prisma: la luz blanca se separa en colores porque n depende de λ.
 */

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { CurvaTubo } from "./_tablero";
import {
  Haces, Chispa, Pulso, Etiqueta, discontinuo,
  ANODIZADO_NEGRO, ALUMINIO, SUELO, type Pt, type Seg,
} from "./optica-banco3d";
import {
  resolverSnell, medioPorId, fresnelReflectancia, fmtAng, fmt2, fmt0,
  ESPECTRO, indiceCauchy, trazarPrisma, PRISMA_APICE, N_PRISMA_D, AMPL_PRISMA,
  trazarFibra, FIBRA_X0, FIBRA_X1, FIBRA_R as RF,
} from "./optica-data";

export { FIBRA_X0, FIBRA_X1 };

const RAD = Math.PI / 180;

/* ── Material de cada medio (transparencia de mezcla: el haz se ve dentro) ── */
function propsMedio(id: string): THREE.MeshPhysicalMaterialParameters | null {
  const base: THREE.MeshPhysicalMaterialParameters = {
    transparent: true, depthWrite: false, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04,
    envMapIntensity: 1.7, side: THREE.DoubleSide, specularIntensity: 1,
  };
  if (id === "agua") return { ...base, color: "#4aa8ee", opacity: 0.3 };
  if (id === "vidrio") return { ...base, color: "#b9eadc", opacity: 0.26 };
  if (id === "diamante") return { ...base, color: "#f3f5ff", opacity: 0.32, iridescence: 1, iridescenceIOR: 1.9, iridescenceThicknessRange: [180, 620], envMapIntensity: 2.6 };
  return null;
}

/* ── Disco óptico (transportador) ─────────────────────────────────────────── */
let _disco: THREE.CanvasTexture | null = null;
function texturaDisco(): THREE.CanvasTexture {
  if (_disco) return _disco;
  const N = 1024, c0 = N / 2, R = N / 2 - 6;
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  const fondo = g.createRadialGradient(c0, c0, 0, c0, c0, R);
  fondo.addColorStop(0, "#f4f6f8");
  fondo.addColorStop(1, "#dde3e9");
  g.fillStyle = fondo;
  g.beginPath(); g.arc(c0, c0, R, 0, Math.PI * 2); g.fill();
  // cuadrantes inferiores apenas teñidos
  g.fillStyle = "rgba(56,140,220,0.07)";
  g.beginPath(); g.moveTo(c0 - R, c0); g.arc(c0, c0, R, Math.PI, 0, true); g.fill();
  // eje de la frontera y normal
  g.strokeStyle = "rgba(20,30,45,0.35)"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(c0 - R, c0); g.lineTo(c0 + R, c0); g.stroke();
  g.setLineDash([14, 10]);
  g.beginPath(); g.moveTo(c0, c0 - R); g.lineTo(c0, c0 + R); g.stroke();
  g.setLineDash([]);
  // marcas
  g.fillStyle = "#18202b";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "700 30px system-ui, sans-serif";
  for (let d = 0; d < 360; d++) {
    const a = d * RAD;
    const s = Math.sin(a), co = Math.cos(a);
    const largo = d % 10 === 0 ? 40 : d % 5 === 0 ? 26 : 13;
    g.lineWidth = d % 10 === 0 ? 4 : 2;
    g.strokeStyle = "#18202b";
    g.beginPath();
    g.moveTo(c0 + s * R, c0 - co * R);
    g.lineTo(c0 + s * (R - largo), c0 - co * (R - largo));
    g.stroke();
    if (d % 10 === 0) {
      const v = d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d;
      const rr = R - 64;
      g.fillText(String(v), c0 + s * rr, c0 - co * rr);
    }
  }
  _disco = new THREE.CanvasTexture(c);
  _disco.colorSpace = THREE.SRGBColorSpace;
  _disco.anisotropy = 8;
  return _disco;
}

const RD = 3.1;  // radio del disco
const RB = 2.35; // radio de los bloques semicirculares
const Z_DISCO = -0.62;

function DiscoOptico() {
  return (
    <group>
      <mesh position={[0, 0, Z_DISCO - 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[RD, RD, 0.12, 96]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>
      <mesh position={[0, 0, Z_DISCO + 0.002]} receiveShadow>
        <circleGeometry args={[RD - 0.04, 96]} />
        <meshStandardMaterial map={texturaDisco()} roughness={0.62} metalness={0.05} />
      </mesh>
      {/* pie */}
      <mesh position={[0, -RD - 0.02, Z_DISCO - 0.06]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.3]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
      <mesh position={[0, SUELO + 0.09, Z_DISCO + 0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.18, 1.8]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
    </group>
  );
}

/** Bloque semicircular (D) de un medio: arriba (medio 1) o abajo (medio 2). */
function BloqueD({ medio, arriba }: { medio: string; arriba: boolean }) {
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-RB, 0);
    sh.absarc(0, 0, RB, Math.PI, 0, arriba);
    sh.lineTo(-RB, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 3, curveSegments: 72 });
    g.translate(0, 0, -0.45);
    return g;
  }, [arriba]);
  useEffect(() => () => geo.dispose(), [geo]);
  const p = propsMedio(medio);
  if (!p) return null;
  return (
    <mesh geometry={geo} renderOrder={2}>
      <meshPhysicalMaterial {...p} />
    </mesh>
  );
}

/** Láser de laboratorio: cuerpo anodizado, anillo frontal y abertura encendida. */
function Laser({ pos, dir, color = "#ff3b3b" }: { pos: Pt; dir: [number, number]; color?: string }) {
  const ang = Math.atan2(dir[1], dir[0]);
  return (
    <group position={pos} rotation={[0, 0, ang - Math.PI / 2]}>
      {/* el eje Y local apunta en la dirección del haz; el cuerpo queda atrás */}
      <mesh position={[0, -0.42, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.8, 24]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 24]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function arco(a0: number, a1: number, r: number): Pt[] {
  const N = 24, out: Pt[] = [];
  for (let i = 0; i < N; i++) {
    const a = a0 + (a1 - a0) * (i / (N - 1));
    out.push([Math.sin(a) * r, Math.cos(a) * r, 0.02]);
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * (1) FRONTERA — disco de Hartl
 * ═══════════════════════════════════════════════════════════════════════════ */
export function EscenaFrontera({ medio1, medio2, thetaInc, playing }: { medio1: string; medio2: string; thetaInc: number; playing: boolean }) {
  const m1 = medioPorId(medio1);
  const m2 = medioPorId(medio2);
  const sn = resolverSnell(m1.n, m2.n, thetaInc);
  const R = fresnelReflectancia(m1.n, m2.n, thetaInc);
  const t1 = thetaInc * RAD;
  const LASER_R = 2.62, FIN = 2.95;
  const O: Pt = [0, 0, 0];
  const A: Pt = [-Math.sin(t1) * LASER_R, Math.cos(t1) * LASER_R, 0];
  const refl: Pt = [Math.sin(t1) * FIN, Math.cos(t1) * FIN, 0];
  const refr: Pt | null = sn.reflexionTotal ? null : [Math.sin(sn.thetaRefDeg * RAD) * FIN, -Math.cos(sn.thetaRefDeg * RAD) * FIN, 0];
  const LASER = "#ff3b3b";

  const segs: Seg[] = [{ a: A, b: O, col: LASER, k: 1, r: 0.07 }];
  segs.push({ a: O, b: refl, col: LASER, k: Math.max(0.1, R), r: 0.07 });
  if (refr) segs.push({ a: O, b: refr, col: LASER, k: Math.max(0.12, 1 - R), r: 0.07 });
  segs.push(...discontinuo([0, 2.95, 0.01], [0, -2.95, 0.01], "#cfe6ff", 0.22, 0.16, 0.12).map((x) => ({ ...x, r: 0.022 })));

  const tc = sn.thetaCriticoDeg;
  const medio1Lbl: Pt = [-4.35, 1.5, 0.3];
  const medio2Lbl: Pt = [-4.35, -1.5, 0.3];

  return (
    <group>
      <DiscoOptico />
      <BloqueD medio={medio1} arriba />
      <BloqueD medio={medio2} arriba={false} />
      <Laser pos={A} dir={[-A[0], -A[1]]} />
      <Haces segs={segs} orden={20} />
      <Chispa pos={[0, 0, 0.02]} color="#ff6b5b" tam={0.55} k={0.9} />
      <Chispa pos={refl} color="#ff4b3b" tam={0.5} k={Math.max(0.15, R)} />
      {refr && <Chispa pos={refr} color="#ff4b3b" tam={0.5} k={Math.max(0.15, 1 - R)} />}
      <Pulso path={refr ? [A, O, refr] : [A, O, refl]} color="#ff9a8a" playing={playing} speed={2.6} />

      {/* ángulos */}
      <CurvaTubo puntos={arco(0, -t1, 1.05)} color="#fde047" grosor={0.03} />
      {refr && <CurvaTubo puntos={arco(Math.PI, Math.PI - sn.thetaRefDeg * RAD, 1.05)} color="#7dd3fc" grosor={0.03} />}
      {sn.reflexionTotal && <CurvaTubo puntos={arco(0, t1, 1.25)} color="#fbbf24" grosor={0.03} />}
      {/* ángulo crítico marcado en la orilla del disco */}
      {tc != null && (
        <CurvaTubo puntos={[[-Math.sin(tc * RAD) * 2.42, Math.cos(tc * RAD) * 2.42, 0.03], [-Math.sin(tc * RAD) * 3.05, Math.cos(tc * RAD) * 3.05, 0.03]] as Pt[]} color="#fde047" grosor={0.035} brillo={0.9} />
      )}

      <Etiqueta pos={[-Math.sin(t1 / 2) * 1.75 - 0.25, Math.cos(t1 / 2) * 1.75 + 0.1, 0.3]} color="#fde047" borde={false}>θ₁ = {fmtAng(thetaInc)}</Etiqueta>
      {refr ? (
        <Etiqueta pos={[Math.sin((sn.thetaRefDeg * RAD) / 2) * 1.75 + 0.35, -Math.cos((sn.thetaRefDeg * RAD) / 2) * 1.75, 0.3]} color="#7dd3fc" borde={false}>θ₂ = {fmtAng(sn.thetaRefDeg)}</Etiqueta>
      ) : (
        <Etiqueta pos={[1.6, 1.15, 0.3]} color="#fde047">reflexión total · 100 %</Etiqueta>
      )}
      <Etiqueta pos={medio1Lbl} color={m1.color} ancha>{m1.nombre} · n₁ = {fmt2(m1.n)}</Etiqueta>
      <Etiqueta pos={medio2Lbl} color={m2.color} ancha>{m2.nombre} · n₂ = {fmt2(m2.n)}</Etiqueta>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * (2) FIBRA ÓPTICA — el rayo rebota dentro del núcleo
 * ═══════════════════════════════════════════════════════════════════════════ */
export function EscenaFibra({ medio1, medio2, thetaInc, playing }: { medio1: string; medio2: string; thetaInc: number; playing: boolean }) {
  const m1 = medioPorId(medio1);
  const m2 = medioPorId(medio2);
  const tr = useMemo(() => trazarFibra(m1.n, m2.n, thetaInc), [m1.n, m2.n, thetaInc]);
  const LASER = "#ff3b3b";
  const segs = useMemo<Seg[]>(() => {
    const s: Seg[] = tr.tramos.map((t) => ({ a: t.a, b: t.b, col: LASER, k: Math.max(0.06, t.k), r: 0.06 }));
    for (const f of tr.fugas) s.push({ a: f.a, b: f.b, col: LASER, k: Math.max(0.05, f.k), r: 0.055 });
    return s;
  }, [tr]);
  const pNucleo: THREE.MeshPhysicalMaterialParameters = propsMedio(medio1) ?? { transparent: true, depthWrite: false, color: "#ffffff", opacity: 0.08, roughness: 0.05, clearcoat: 1 };
  const pRev = propsMedio(medio2);
  const largo = FIBRA_X1 - FIBRA_X0;
  const rCuna = pRev ? RF + 0.37 : RF + 0.06;
  const camino = useMemo(() => [tr.tramos[0]?.a ?? [FIBRA_X0, 0, 0], ...tr.tramos.map((t) => t.b)] as Pt[], [tr]);
  return (
    <group>
      {/* núcleo */}
      <mesh rotation={[0, 0, Math.PI / 2]} renderOrder={2}>
        <cylinderGeometry args={[RF, RF, largo, 48, 1, false]} />
        <meshPhysicalMaterial {...pNucleo} />
      </mesh>
      {/* revestimiento */}
      {pRev && (
        <mesh rotation={[0, 0, Math.PI / 2]} renderOrder={1}>
          <cylinderGeometry args={[RF + 0.32, RF + 0.32, largo, 48, 1, true]} />
          <meshPhysicalMaterial {...pRev} opacity={0.14} />
        </mesh>
      )}
      {/* conectores metálicos en los extremos */}
      {[FIBRA_X0 - 0.15, FIBRA_X1 + 0.15].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[RF + 0.38, RF + 0.38, 0.3, 40, 1, true]} />
          <meshStandardMaterial {...ALUMINIO} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* soportes */}
      {[-4.5, 0, 4.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, (SUELO - rCuna) / 2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, -SUELO - rCuna, 14]} />
            <meshStandardMaterial {...ALUMINIO} />
          </mesh>
          {/* cuna: media argolla por debajo del núcleo */}
          <mesh rotation={[0, Math.PI / 2, Math.PI]} castShadow>
            <torusGeometry args={[rCuna, 0.045, 10, 40, Math.PI]} />
            <meshStandardMaterial {...ANODIZADO_NEGRO} />
          </mesh>
          <mesh position={[0, SUELO + 0.06, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.45, 0.5, 0.12, 28]} />
            <meshStandardMaterial {...ANODIZADO_NEGRO} />
          </mesh>
        </group>
      ))}
      {/* láser acoplado a la entrada */}
      <Laser pos={[FIBRA_X0 - 0.35, 0, 0]} dir={[1, 0]} />
      {/* detector a la salida: se enciende con la luz que llega */}
      <mesh position={[FIBRA_X1 + 0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[RF + 0.3, RF + 0.3, 0.16, 40]} />
        <meshStandardMaterial color="#1a2330" emissive="#ff3b3b" emissiveIntensity={0.15 + 2.2 * tr.llega} roughness={0.4} />
      </mesh>

      <Haces segs={segs} orden={20} />
      {tr.llega > 0.02 && <Chispa pos={tr.fin} color="#ff5040" tam={0.9} k={tr.llega} />}
      <Pulso path={camino} color="#ffb0a0" playing={playing} speed={4.5} tam={0.36} />

      <Etiqueta pos={[-3, RF + 1.0, 0]} color={m1.color} ancha>núcleo: {m1.nombre} · n₁ = {fmt2(m1.n)}</Etiqueta>
      {pRev && <Etiqueta pos={[2.6, -RF - 1.05, 0]} color={m2.color} ancha>alrededor: {m2.nombre} · n₂ = {fmt2(m2.n)}</Etiqueta>}
      <Etiqueta pos={[FIBRA_X1 + 0.4, RF + 0.9, 0]} color={tr.llega > 0.5 ? "#86efac" : "#fca5a5"}>llega {fmt0(tr.llega * 100)} %</Etiqueta>
      <Etiqueta pos={[FIBRA_X0 + 0.4, -RF - 0.9, 0]} color="#fde047" borde={false}>θ₁ = {fmtAng(thetaInc)}</Etiqueta>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * (3) PRISMA — dispersión de la luz blanca
 * Ángulos exactos por color (Cauchy + Snell en dos caras). El abanico se
 * dibuja ampliado ×AMPL para que la diferencia —real, pero de ~1°— se vea.
 * ═══════════════════════════════════════════════════════════════════════════ */
const LP = 3.4; // lado del prisma
const PB = -1.15; // y de la base
const PH = (LP * Math.sqrt(3)) / 2;
const APICE: [number, number] = [0, PB + PH];
const B_IZQ: [number, number] = [-LP / 2, PB];
const B_DER: [number, number] = [LP / 2, PB];

function interseca(p: [number, number], d: [number, number], a: [number, number], b: [number, number]): [number, number] | null {
  const ex = b[0] - a[0], ey = b[1] - a[1];
  const den = d[0] * ey - d[1] * ex;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den;
  return [p[0] + d[0] * t, p[1] + d[1] * t];
}

export function EscenaPrisma({ thetaP, playing }: { thetaP: number; playing: boolean }) {
  const h = PH;
  const apice = APICE, bIzq = B_IZQ, bDer = B_DER;

  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(bIzq[0], bIzq[1]); sh.lineTo(bDer[0], bDer[1]); sh.lineTo(apice[0], apice[1]); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
    g.translate(0, 0, -0.75);
    return g;
  }, [apice, bIzq, bDer]);
  useEffect(() => () => geo.dispose(), [geo]);

  const trazo = useMemo(() => {
    const M: [number, number] = [(bIzq[0] + apice[0]) / 2, (bIzq[1] + apice[1]) / 2];
    const aIn = (-30 + thetaP) * RAD;
    const dIn: [number, number] = [Math.cos(aIn), Math.sin(aIn)];
    const inicio: Pt = [M[0] - dIn[0] * 4.4, M[1] - dIn[1] * 4.4, 0];
    const media = trazarPrisma(N_PRISMA_D, thetaP);
    const XS = 5.3;
    const colores = ESPECTRO.map((c) => {
      const n = indiceCauchy(c.nm);
      const r = trazarPrisma(n, thetaP);
      const t1v = media.theta1p + (r.theta1p - media.theta1p) * AMPL_PRISMA;
      const ai = (-30 + t1v) * RAD;
      const di: [number, number] = [Math.cos(ai), Math.sin(ai)];
      const P2 = interseca(M, di, bDer, apice) ?? M;
      if (r.tir || media.tir) {
        return { c, n, r, P2, sale: null as Pt | null };
      }
      const t2v = media.theta2 + (r.theta2 - media.theta2) * AMPL_PRISMA;
      const ao = (30 - t2v) * RAD;
      const dO: [number, number] = [Math.cos(ao), Math.sin(ao)];
      const t = (XS - P2[0]) / Math.max(1e-6, dO[0]);
      return { c, n, r, P2, sale: [P2[0] + dO[0] * t, P2[1] + dO[1] * t, 0] as Pt };
    });
    return { M, inicio, colores, media, XS, dIn };
  }, [thetaP, apice, bIzq, bDer]);

  const segs = useMemo<Seg[]>(() => {
    const s: Seg[] = [{ a: trazo.inicio, b: [trazo.M[0], trazo.M[1], 0], col: "#ffffff", k: 0.85, r: 0.085 }];
    for (const k of trazo.colores) {
      s.push({ a: [trazo.M[0], trazo.M[1], 0], b: [k.P2[0], k.P2[1], 0], col: k.c.color, k: 0.42, r: 0.06 });
      if (k.sale) s.push({ a: [k.P2[0], k.P2[1], 0], b: k.sale, col: k.c.color, k: 0.85, r: 0.06 });
    }
    return s;
  }, [trazo]);

  const rojo = trazo.colores[0]!, violeta = trazo.colores[trazo.colores.length - 1]!;
  const lampDir = trazo.dIn;
  const ang = Math.atan2(lampDir[1], lampDir[0]);
  return (
    <group>
      <mesh geometry={geo} renderOrder={2} castShadow>
        <meshPhysicalMaterial color="#eaf6ff" transparent opacity={0.24} depthWrite={false} roughness={0.03} clearcoat={1} clearcoatRoughness={0.03}
          iridescence={0.35} iridescenceIOR={1.5} envMapIntensity={2.2} side={THREE.DoubleSide} />
      </mesh>
      {/* platina giratoria */}
      <mesh position={[0, PB - 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.1, 2.1, 0.14, 64]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>
      <mesh position={[0, (PB - 0.15 + SUELO) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, PB - 0.15 - SUELO, 18]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>
      <mesh position={[0, SUELO + 0.07, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1, 0.14, 40]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
      {/* lámpara con rendija */}
      <group position={trazo.inicio} rotation={[0, 0, ang]}>
        <mesh position={[-0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.6, 0.7]} />
          <meshStandardMaterial {...ANODIZADO_NEGRO} />
        </mesh>
        <mesh position={[0.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.12, 0.36]} />
          <meshBasicMaterial color="#fffbe8" toneMapped={false} />
        </mesh>
      </group>
      {/* pantalla blanca donde cae el espectro */}
      <mesh position={[trazo.XS + 0.05, 0, 0]} rotation={[0, -Math.PI / 2 + 0.55, 0]} receiveShadow>
        <planeGeometry args={[1.8, 3.4]} />
        <meshStandardMaterial color="#e9edf1" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[trazo.XS + 0.05, (SUELO - 1.7) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, -1.7 - SUELO, 12]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>

      <Haces segs={segs} orden={20} />
      {trazo.colores.map((k) => k.sale && <Chispa key={k.c.id} pos={k.sale} color={k.c.color} tam={0.42} k={1} />)}
      <Pulso path={[trazo.inicio, [trazo.M[0], trazo.M[1], 0]]} color="#ffffff" playing={playing} speed={2.2} />
      <Chispa pos={[trazo.M[0], trazo.M[1], 0]} color="#ffffff" tam={0.6} k={0.9} />

      <Etiqueta pos={[trazo.inicio[0] + 0.6, trazo.inicio[1] + 0.7, 0]} color="#f8fafc">luz blanca</Etiqueta>
      {trazo.media.tir ? (
        <Etiqueta pos={[1.2, 2.2, 0]} color="#fde047">reflexión total en la 2.ª cara</Etiqueta>
      ) : (
        <>
          {rojo.sale && <Etiqueta pos={[rojo.sale[0] - 0.4, rojo.sale[1] + 0.55, 0]} color="#ff6b5b" ancha>rojo: se desvía menos</Etiqueta>}
          {violeta.sale && <Etiqueta pos={[violeta.sale[0] - 0.4, violeta.sale[1] - 0.55, 0]} color="#c49bff" ancha>violeta: se desvía más</Etiqueta>}
          <Etiqueta pos={[0, PB + h + 0.55, 0]} color="#fde047" borde={false}>δ = {fmtAng(trazo.media.desviacion)} · ápice {PRISMA_APICE}°</Etiqueta>
        </>
      )}
    </group>
  );
}
