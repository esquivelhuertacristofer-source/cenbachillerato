"use client";

/**
 * Organelos de la célula 3D (CNEYT-VI-P02, `celula-organelos-3d`).
 *
 * Cada pieza es geometría propia, no una primitiva suelta: el núcleo con su
 * doble envoltura, poros y nucléolo; el retículo rugoso tachonado de ribosomas
 * (instanciados); el Golgi en cisternas curvas; la mitocondria abierta a lo
 * largo con sus crestas; el cloroplasto con sus grana. Las piezas viven en
 * coordenadas LOCALES; `CelulaScene` las coloca, las atenúa y las selecciona.
 *
 * Reglas: nada de `new THREE.X` dentro de `useFrame`; geometrías en `useMemo`
 * con semilla fija; mallas repetidas con `instancedMesh`.
 */

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import {
  type Pt, type FormaRadial, type EjeCorte,
  azar, geoCascara, geoTapa, desplazar, formaEsfera, geoMediaCapsula, geoCantoCapsula, geoCrestas,
  geoCisterna, geoParam, geoTubos, paseo, puntosFibonacci, conRelieve, curvaNucleoide, curvaHelice,
  texturaMoteada, texturaCelulosa,
} from "./celula-geometrias";

export type Calidad = "alta" | "media" | "baja";

/* ── Instancias: N copias de una geometría en puntos dados ─────────────────── */
export function Instancias({ puntos, geo, escala = 1, escalas, orientar, children, sombra = false }: {
  puntos: THREE.Vector3[];
  geo: THREE.BufferGeometry;
  escala?: number;
  escalas?: number[];
  /** normales: si se dan, cada copia se orienta con su +Y (o +Z del toro) a lo largo de la normal */
  orientar?: THREE.Vector3[];
  children: ReactNode;
  sombra?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const z = new THREE.Vector3(0, 0, 1);
    puntos.forEach((p, i) => {
      o.position.copy(p);
      if (orientar) o.quaternion.setFromUnitVectors(z, orientar[i]!);
      else o.quaternion.identity();
      o.scale.setScalar(escalas ? escalas[i]! * escala : escala);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [puntos, escala, escalas, orientar]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, puntos.length]} castShadow={sombra}>
      {children}
    </instancedMesh>
  );
}

/* Geometrías base compartidas (se crean una sola vez por módulo). */
const GEO_BOLITA = new THREE.IcosahedronGeometry(1, 1);
const GEO_BOLITA_LISA = new THREE.SphereGeometry(1, 14, 10);
const GEO_PORO = new THREE.TorusGeometry(1, 0.34, 8, 18);

/* ── Puntos al azar DENTRO de una forma (citosol, ribosomas libres) ─────────── */
export function puntosDentro(forma: FormaRadial, n: number, semilla: number, rMin = 0, rMax = 0.92): THREE.Vector3[] {
  const rnd = azar(semilla);
  const out: THREE.Vector3[] = [];
  const d = new THREE.Vector3();
  while (out.length < n) {
    d.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
    const l = d.length();
    if (l < 0.05 || l > 1) continue;
    d.normalize();
    const R = forma(d);
    const r = R * (rMin + (rMax - rMin) * Math.cbrt(rnd()));
    out.push(d.clone().multiplyScalar(r));
  }
  return out;
}

/* ── Materiales de recorte: todos los del corte comparten los dos planos ───── */
export interface Corte {
  planos: THREE.Plane[];
  eje: EjeCorte;
  /** acimut del centro de la cuña y semiancho (radianes) */
  alfa: number;
  h: number;
}

/* ══════════════════════════════════════════════════════════════════════════
   ENVOLTURA: membrana (vidrio vivo), pared, citoplasma y el canto del corte
   ══════════════════════════════════════════════════════════════════════════ */
export interface ColoresCelula {
  membrana: string;
  atenuacion: string;
  canto: string;
  fondo: [string, string];
  pared?: [string, string];
  cantoPared?: string;
}

export function Envoltura({ forma, formaPared, corte, colores, calidad, selMemb, selPared }: {
  forma: FormaRadial;
  formaPared?: FormaRadial;
  corte: Corte;
  colores: ColoresCelula;
  calidad: Calidad;
  selMemb: boolean;
  selPared: boolean;
}) {
  const { geoMemb, geoFondo, fMembIn, fFondo } = useMemo(() => {
    const fMembIn = desplazar(forma, -0.07);
    const fFondo = desplazar(forma, -0.09);
    return { geoMemb: geoCascara(forma, 112, 72), geoFondo: geoCascara(fFondo, 72, 48), fMembIn, fFondo };
  }, [forma]);
  const geoPared = useMemo(() => (formaPared ? { fuera: geoCascara(formaPared, 96, 64), dentro: geoCascara(desplazar(formaPared, -0.2), 80, 56) } : null), [formaPared]);
  const texFondo = useMemo(() => texturaMoteada(colores.fondo[0], colores.fondo[1], 11), [colores.fondo]);
  const texPared = useMemo(() => (colores.pared ? texturaCelulosa(colores.pared[0], colores.pared[1], 5) : null), [colores.pared]);

  // Tapas del corte (se rehacen solo cuando cambia la apertura).
  const tapas = useMemo(() => {
    if (corte.h < 0.02) return null;
    const betas = [corte.alfa - corte.h, corte.alfa + corte.h];
    return {
      memb: betas.map((b) => geoTapa(forma, fMembIn, corte.eje, b)),
      fondo: betas.map((b) => geoTapa(fMembIn, fFondo, corte.eje, b)),
      pared: formaPared ? betas.map((b) => geoTapa(formaPared, desplazar(formaPared, -0.2), corte.eje, b)) : null,
    };
  }, [corte.alfa, corte.h, corte.eje, forma, fMembIn, fFondo, formaPared]);

  const clip = { clippingPlanes: corte.planos, clipIntersection: true } as const;
  const vidrio = calidad !== "baja";

  return (
    <group>
      {/* Citoplasma: la cara interior, opaca y moteada, que se ve por el corte. */}
      <mesh geometry={geoFondo}>
        <meshStandardMaterial map={texFondo} side={THREE.BackSide} roughness={0.82} metalness={0} {...clip} />
      </mesh>

      {/* Membrana plasmática: «vidrio vivo» — transmisión, irisación de pompa y brillo suave. */}
      <mesh geometry={geoMemb} renderOrder={2}>
        {vidrio ? (
          <meshPhysicalMaterial
            color={colores.membrana}
            transmission={1}
            thickness={0.55}
            roughness={0.16}
            ior={1.34}
            iridescence={selMemb ? 1 : 0.6}
            iridescenceIOR={1.32}
            iridescenceThicknessRange={[180, 520]}
            sheen={0.6}
            sheenColor={colores.canto}
            sheenRoughness={0.45}
            clearcoat={0.35}
            attenuationColor={colores.atenuacion}
            attenuationDistance={5}
            emissive={colores.canto}
            emissiveIntensity={selMemb ? 0.18 : 0}
            {...clip}
          />
        ) : (
          <meshStandardMaterial color={colores.membrana} transparent opacity={selMemb ? 0.42 : 0.26} roughness={0.2} depthWrite={false} {...clip} />
        )}
      </mesh>

      {/* Canto del corte: la bicapa vista de lado. */}
      {tapas?.memb.map((g, i) => (
        <mesh key={`m${i}`} geometry={g}>
          <meshStandardMaterial color={colores.canto} emissive={colores.canto} emissiveIntensity={selMemb ? 0.75 : 0.22} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {tapas?.fondo.map((g, i) => (
        <mesh key={`f${i}`} geometry={g}>
          <meshStandardMaterial color={colores.fondo[1]} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Pared celular (vegetal y procariota): opaca, con microfibrillas. */}
      {geoPared && (
        <>
          <mesh geometry={geoPared.fuera}>
            <meshStandardMaterial map={texPared} bumpMap={texPared} bumpScale={2.2} roughness={0.78} color={selPared ? "#ffffff" : "#e6eedc"} emissive={colores.cantoPared ?? "#a3e635"} emissiveIntensity={selPared ? 0.25 : 0} {...clip} />
          </mesh>
          <mesh geometry={geoPared.dentro}>
            <meshStandardMaterial map={texPared} side={THREE.BackSide} roughness={0.85} color="#b9c4ad" {...clip} />
          </mesh>
          {tapas?.pared?.map((g, i) => (
            <mesh key={`p${i}`} geometry={g}>
              <meshStandardMaterial color={colores.cantoPared ?? "#a3c46a"} emissive={colores.cantoPared ?? "#a3c46a"} emissiveIntensity={selPared ? 0.6 : 0.08} roughness={0.7} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

/* ── Citosol: partículas suspendidas que derivan despacio ──────────────────── */
export function Citosol({ puntos, color, corte, playing, girar, semilla = 21, tam = 0.035 }: {
  puntos: THREE.Vector3[]; color: string; corte: Corte; playing: boolean; girar: boolean; semilla?: number; tam?: number;
}) {
  const escalas = useMemo(() => { const r = azar(semilla + 1); return puntos.map(() => 0.5 + r() * 1.1); }, [puntos, semilla]);
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current && playing && girar) g.current.rotation.y += dt * 0.025;
  });
  return (
    <group ref={g}>
      <Instancias puntos={puntos} geo={GEO_BOLITA} escala={tam} escalas={escalas}>
        <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.18} clippingPlanes={corte.planos} clipIntersection />
      </Instancias>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   NÚCLEO: doble envoltura con poros, nucleoplasma, cromatina y nucléolo
   ══════════════════════════════════════════════════════════════════════════ */
export function Nucleo({ corte, calidad }: { corte: Corte | null; calidad: Calidad }) {
  const d = useMemo(() => {
    const fExt = formaEsfera(1, 0.035, 1.6, 4);
    const fExtIn = desplazar(fExt, -0.03);
    const fInt = desplazar(fExt, -0.075);
    const fIntIn = desplazar(fExt, -0.1);
    const rnd = azar(33);
    const curvas = Array.from({ length: calidad === "baja" ? 5 : 9 }, () => paseo(rnd, new THREE.Vector3(0, 0, 0), 0.8, 18, 0.22));
    const poros = puntosFibonacci(calidad === "baja" ? 70 : 130);
    return {
      fExt, fExtIn, fInt, fIntIn,
      ext: geoCascara(fExt, 80, 56),
      int: geoCascara(fIntIn, 64, 44),
      cromatina: geoTubos(curvas, 0.028, 90, 5),
      poros: poros.map((p) => p.clone().multiplyScalar(fExt(p) + 0.005)),
      normales: poros,
      nucleolo: conRelieve(new THREE.IcosahedronGeometry(0.36, 5), 0.16, 4.5, 2),
    };
  }, [calidad]);
  const tapas = useMemo(() => {
    if (!corte || corte.h < 0.02) return null;
    return [corte.alfa - corte.h, corte.alfa + corte.h].flatMap((b) => [
      geoTapa(d.fExt, d.fExtIn, corte.eje, b),
      geoTapa(d.fInt, d.fIntIn, corte.eje, b),
    ]);
  }, [corte, d]);
  const tex = useMemo(() => texturaMoteada("#1d0b3a", "#7c3aed", 17, 256, 128), []);
  const clip = corte ? { clippingPlanes: corte.planos, clipIntersection: true } : {};
  return (
    <group>
      <mesh geometry={d.ext}>
        <meshPhysicalMaterial color="#9b6bf2" roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.35} sheen={0.5} sheenColor="#e9d5ff" side={THREE.DoubleSide} {...clip} />
      </mesh>
      <mesh geometry={d.int}>
        <meshStandardMaterial map={tex} side={THREE.BackSide} roughness={0.75} {...clip} />
      </mesh>
      <Instancias puntos={d.poros} geo={GEO_PORO} escala={0.05} orientar={d.normales}>
        <meshStandardMaterial color="#efe3ff" roughness={0.4} {...clip} />
      </Instancias>
      <mesh geometry={d.cromatina}>
        <meshStandardMaterial color="#c4b5fd" roughness={0.55} emissive="#7c3aed" emissiveIntensity={0.25} {...clip} />
      </mesh>
      <mesh geometry={d.nucleolo} position={[0.12, 0.08, 0.1]}>
        <meshPhysicalMaterial color="#86198f" roughness={0.6} clearcoat={0.3} sheen={0.6} sheenColor="#f0abfc" />
      </mesh>
      {tapas?.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#e9d5ff" emissive="#c084fc" emissiveIntensity={0.25} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
/** Puntos de interés del núcleo (para rótulos), en coordenadas locales. */
export const NUCLEO_PARTES = { nucleolo: [0.12, 0.08, 0.1] as Pt, poro: [0.55, 0.72, -0.42] as Pt };

/* ══════════════════════════════════════════════════════════════════════════
   MITOCONDRIA: abierta a lo largo — membrana externa lisa, interna en crestas
   ══════════════════════════════════════════════════════════════════════════ */
export function geoMitocondria(Lh: number, R: number, nCrestas: number, semilla = 7) {
  const p = 2.7;
  const Lh2 = Lh * 0.95, R2 = R * 0.84;
  const crestas = geoCrestas(Lh2, R2, p, nCrestas, semilla);
  return {
    ext: geoMediaCapsula(Lh, R, p, 1, 0.012),
    int: geoMediaCapsula(Lh2, R2, p, 1, 0.01),
    cantoExt: geoCantoCapsula(Lh, R, Lh * 0.99, R * 0.95, p),
    cantoInt: geoCantoCapsula(Lh2, R2, Lh2 * 0.99, R2 * 0.94, p),
    crestas: crestas.geo,
    sitios: crestas.sitios,
    Lh, R, Lh2, R2, p,
  };
}
export type GeoMito = ReturnType<typeof geoMitocondria>;

export function MitoCuerpo({ g, matriz }: { g: GeoMito; matriz: THREE.Texture | null }) {
  return (
    <group>
      <mesh geometry={g.ext}>
        <meshPhysicalMaterial color="#f0763a" roughness={0.34} clearcoat={0.7} clearcoatRoughness={0.3} sheen={0.4} sheenColor="#ffd8b0" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={g.int}>
        <meshStandardMaterial color="#c2410c" map={matriz} side={THREE.BackSide} roughness={0.7} />
      </mesh>
      <mesh geometry={g.int}>
        <meshStandardMaterial color="#fb923c" roughness={0.55} side={THREE.FrontSide} />
      </mesh>
      <mesh geometry={g.crestas}>
        <meshPhysicalMaterial color="#fdba74" roughness={0.42} sheen={0.7} sheenColor="#fff1dc" clearcoat={0.25} />
      </mesh>
      <mesh geometry={g.cantoExt}>
        <meshStandardMaterial color="#ffe1c4" emissive="#fb923c" emissiveIntensity={0.18} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={g.cantoInt}>
        <meshStandardMaterial color="#ffd0a1" emissive="#f97316" emissiveIntensity={0.15} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Mitocondria dentro de la célula (pequeña, 6 crestas). */
export function Mitocondria() {
  const g = useMemo(() => geoMitocondria(0.82, 0.36, 7, 3), []);
  const tex = useMemo(() => texturaMoteada("#7c2d12", "#fdba74", 41, 256, 128), []);
  return <MitoCuerpo g={g} matriz={tex} />;
}

/* ══════════════════════════════════════════════════════════════════════════
   RETÍCULO ENDOPLASMÁTICO: rugoso (láminas con ribosomas) y liso (túbulos)
   ══════════════════════════════════════════════════════════════════════════ */
export function Reticulo({ radios, azim, polar, liso, nRibo, semilla = 5 }: {
  /** radios de las láminas alrededor del núcleo (local, centro en 0) */
  radios: number[];
  /** rango de acimut (rad, atan2(x,z)) y polar (rad) que cubren */
  azim: [number, number];
  polar: [number, number];
  /** centro y radio del retículo liso (túbulos), local */
  liso: { centro: Pt; radio: number } | null;
  nRibo: number;
  semilla?: number;
}) {
  const d = useMemo(() => {
    const lamina = (r0: number, k: number) => (u: number, v: number, out: THREE.Vector3) => {
      const b = azim[0] + (azim[1] - azim[0]) * u;
      const t = polar[0] + (polar[1] - polar[0]) * v;
      const r = r0 * (1 + 0.045 * Math.sin(b * 9 + k) * Math.sin(t * 7 + k * 2) + 0.025 * Math.sin(b * 23 + t * 5));
      out.set(Math.sin(b) * Math.sin(t) * r, Math.cos(t) * r, Math.cos(b) * Math.sin(t) * r);
    };
    const laminas = radios.map((r, k) => geoParam(lamina(r, k), 64, 36));
    // ribosomas sobre ambas caras de las láminas
    const rnd = azar(semilla);
    const ribo: THREE.Vector3[] = [];
    const p = new THREE.Vector3(), pu = new THREE.Vector3(), pv = new THREE.Vector3();
    for (let i = 0; i < nRibo; i++) {
      const k = i % radios.length;
      const f = lamina(radios[k]!, k);
      const u = 0.03 + rnd() * 0.94, v = 0.03 + rnd() * 0.94;
      f(u, v, p); f(u + 0.01, v, pu); f(u, v + 0.01, pv);
      const n = pu.sub(p).cross(pv.sub(p)).normalize();
      ribo.push(p.clone().addScaledVector(n, (i % 2 ? 1 : -1) * 0.045));
    }
    let tubos: THREE.BufferGeometry | null = null;
    if (liso) {
      const c = new THREE.Vector3(...liso.centro);
      const curvas = Array.from({ length: 7 }, () => paseo(rnd, c, liso.radio, 9, 0.24));
      tubos = geoTubos(curvas, 0.055, 60, 8);
    }
    return { laminas, ribo, tubos };
  }, [radios, azim, polar, liso, nRibo, semilla]);
  return (
    <group>
      {d.laminas.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshPhysicalMaterial color="#4cb6ea" roughness={0.45} sheen={0.6} sheenColor="#d6f1ff" clearcoat={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Instancias puntos={d.ribo} geo={GEO_BOLITA} escala={0.034}>
        <meshStandardMaterial color="#e8eef8" roughness={0.45} />
      </Instancias>
      {d.tubos && (
        <mesh geometry={d.tubos}>
          <meshPhysicalMaterial color="#8fd9f7" roughness={0.38} clearcoat={0.5} sheen={0.5} sheenColor="#e0f7ff" />
        </mesh>
      )}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   APARATO DE GOLGI: cisternas curvas apiladas y vesículas que brotan
   ══════════════════════════════════════════════════════════════════════════ */
const CIST = [
  { rho: 0.62, y: -0.26, col: "#f59e0b" },
  { rho: 0.74, y: -0.12, col: "#f7ab1c" },
  { rho: 0.8, y: 0.02, col: "#fbbf24" },
  { rho: 0.76, y: 0.16, col: "#fcd34d" },
  { rho: 0.64, y: 0.3, col: "#fde68a" },
];
export function Golgi() {
  const d = useMemo(() => {
    const cist = CIST.map((c) => geoCisterna(c.rho, 0.075, 0.42));
    const rnd = azar(9);
    const brotes: THREE.Vector3[] = [];
    CIST.forEach((c) => {
      for (let k = 0; k < 4; k++) {
        const a = rnd() * Math.PI * 2;
        const r = c.rho + 0.1;
        brotes.push(new THREE.Vector3(Math.cos(a) * r, c.y + 0.42 * r * r * 0.9, Math.sin(a) * r * 0.62));
      }
    });
    return { cist, brotes };
  }, []);
  return (
    <group>
      {d.cist.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, CIST[i]!.y, 0]}>
          <meshPhysicalMaterial color={CIST[i]!.col} roughness={0.38} clearcoat={0.55} clearcoatRoughness={0.3} sheen={0.4} sheenColor="#fff7d6" />
        </mesh>
      ))}
      <Instancias puntos={d.brotes} geo={GEO_BOLITA_LISA} escala={0.07}>
        <meshPhysicalMaterial color="#fde68a" roughness={0.3} clearcoat={0.8} />
      </Instancias>
    </group>
  );
}

/* ── Vesículas en tránsito: RE → Golgi → membrana (la secreción, en vivo) ──── */
export function Vesiculas({ rutas, playing, color = "#fde047", tam = 0.085 }: {
  rutas: THREE.Curve<THREE.Vector3>[]; playing: boolean; color?: string; tam?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    if (playing) t.current += dt;
    rutas.forEach((c, i) => {
      const f = (t.current * 0.16 + i / rutas.length) % 1;
      c.getPointAt(f, o.position);
      // brota, viaja y se funde con la membrana (se encoge al llegar)
      const s = Math.min(1, f * 8) * Math.min(1, (1 - f) * 7);
      o.scale.setScalar(tam * (0.25 + 0.75 * s));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[GEO_BOLITA_LISA, undefined, rutas.length]} frustumCulled={false}>
      <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} emissive={color} emissiveIntensity={0.35} />
    </instancedMesh>
  );
}

/* ── Lisosoma: vesícula brillante con gránulos ─────────────────────────────── */
export function Lisosoma({ semilla = 1 }: { semilla?: number }) {
  const geo = useMemo(() => conRelieve(new THREE.IcosahedronGeometry(1, 5), 0.07, 2.2, semilla), [semilla]);
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color="#ec5fa8" roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} sheen={0.6} sheenColor="#ffd1ea" />
    </mesh>
  );
}

/* ── Centrosoma: dos centriolos en ángulo recto ────────────────────────────── */
export function Centrosoma() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.3, 9]} />
        <meshStandardMaterial color="#a5b4fc" roughness={0.5} />
      </mesh>
      <mesh position={[0.08, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.3, 9]} />
        <meshStandardMaterial color="#a5b4fc" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ── Citoesqueleto: microtúbulos que salen del centrosoma hacia la membrana ── */
export function Citoesqueleto({ desde, forma, n, corte, color = "#9cc7ff" }: {
  desde: Pt; forma: FormaRadial; n: number; corte: Corte; color?: string;
}) {
  const geo = useMemo(() => {
    const rnd = azar(77);
    const c = new THREE.Vector3(...desde);
    const curvas = Array.from({ length: n }, () => {
      const dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
      const fin = dir.clone().multiplyScalar(forma(dir) * 0.93);
      const mid = c.clone().lerp(fin, 0.5).add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.6));
      return new THREE.CatmullRomCurve3([c.clone(), mid, fin]);
    });
    return geoTubos(curvas, 0.016, 40, 5);
  }, [desde, forma, n]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.1} transparent opacity={0.32} depthWrite={false} clippingPlanes={corte.planos} clipIntersection />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CLOROPLASTO: abierto a lo largo — doble membrana, estroma y grana
   ══════════════════════════════════════════════════════════════════════════ */
export function Cloroplasto() {
  const d = useMemo(() => {
    const Lh = 0.95, R = 0.5, p = 2.2, ap = 0.72;
    const Lh2 = Lh * 0.95, R2 = R * 0.88;
    const grana: THREE.Vector3[] = [];
    const lamelas: THREE.BufferGeometry[] = [];
    const nG = 6;
    for (let i = 0; i < nG; i++) {
      const x = -Lh2 * 0.72 + (1.44 * Lh2 * i) / (nG - 1);
      const z = -R2 * (0.38 + (i % 2) * 0.12);
      const pisos = 5 + (i % 3);
      for (let k = 0; k < pisos; k++) grana.push(new THREE.Vector3(x, (k - (pisos - 1) / 2) * 0.052, z));
      if (i < nG - 1) {
        const b = new THREE.BoxGeometry((1.44 * Lh2) / (nG - 1), 0.014, 0.1);
        b.translate(x + (0.72 * Lh2) / (nG - 1), (i % 2 ? 0.05 : -0.04), z - 0.02);
        lamelas.push(b);
      }
    }
    return {
      ext: geoMediaCapsula(Lh, R, p, ap, 0.01),
      int: geoMediaCapsula(Lh2, R2, p, ap, 0.008),
      canto: geoCantoCapsula(Lh, R, Lh2, R2 * 0.94, p, ap),
      grana,
      lamelas: lamelas.length ? lamelas : [new THREE.BufferGeometry()],
    };
  }, []);
  const geoDisco = useMemo(() => new THREE.CylinderGeometry(0.15, 0.15, 0.036, 22), []);
  const tex = useMemo(() => texturaMoteada("#0e3b1d", "#4ade80", 23, 256, 128), []);
  return (
    <group>
      <mesh geometry={d.ext}>
        <meshPhysicalMaterial color="#3fae5a" roughness={0.36} clearcoat={0.7} clearcoatRoughness={0.3} sheen={0.5} sheenColor="#d9ffd0" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={d.int}>
        <meshStandardMaterial map={tex} side={THREE.BackSide} roughness={0.75} />
      </mesh>
      <mesh geometry={d.canto}>
        <meshStandardMaterial color="#c8f5c4" emissive="#4ade80" emissiveIntensity={0.15} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Tilacoides: discos apilados en Y (grana). */}
      <Instancias puntos={d.grana} geo={geoDisco}>
        <meshPhysicalMaterial color="#15803d" roughness={0.4} clearcoat={0.4} sheen={0.5} sheenColor="#86efac" />
      </Instancias>
      {d.lamelas.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#22a052" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Vacuola central: un gran saco de agua con su tonoplasto ───────────────── */
export function Vacuola({ forma, corte, calidad }: { forma: FormaRadial; corte: Corte; calidad: Calidad }) {
  const d = useMemo(() => ({ fuera: geoCascara(forma, 96, 64), fIn: desplazar(forma, -0.05) }), [forma]);
  const tapas = useMemo(() => (corte.h < 0.02 ? null : [corte.alfa - corte.h, corte.alfa + corte.h].map((b) => geoTapa(forma, d.fIn, corte.eje, b))), [corte, forma, d]);
  const clip = { clippingPlanes: corte.planos, clipIntersection: true } as const;
  return (
    <group>
      <mesh geometry={d.fuera}>
        <meshStandardMaterial color="#1d6fb8" side={THREE.BackSide} transparent opacity={0.5} roughness={0.2} depthWrite={false} {...clip} />
      </mesh>
      <mesh geometry={d.fuera}>
        {calidad !== "baja" ? (
          <meshPhysicalMaterial color="#a8d8ff" transmission={0.95} thickness={0.8} roughness={0.08} ior={1.33} clearcoat={0.6} attenuationColor="#5aa9e6" attenuationDistance={4} {...clip} />
        ) : (
          <meshStandardMaterial color="#7cc4ff" transparent opacity={0.3} roughness={0.15} depthWrite={false} {...clip} />
        )}
      </mesh>
      {tapas?.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#cfe8ff" emissive="#60a5fa" emissiveIntensity={0.3} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PROCARIOTA: nucleoide (ADN circular enmarañado), plásmidos, flagelo, pili
   ══════════════════════════════════════════════════════════════════════════ */
export function Nucleoide() {
  const d = useMemo(() => {
    const rnd = azar(61);
    return {
      adn: geoTubos([curvaNucleoide(rnd, 1.55, 0.55, 0.6, 90)], 0.04, 900, 6),
      plasmido: new THREE.TorusGeometry(0.2, 0.03, 8, 40),
    };
  }, []);
  return (
    <group>
      <mesh geometry={d.adn}>
        <meshPhysicalMaterial color="#c99cff" roughness={0.38} clearcoat={0.5} sheen={0.6} sheenColor="#f3e8ff" emissive="#7e22ce" emissiveIntensity={0.25} />
      </mesh>
      <mesh geometry={d.plasmido} position={[2.05, 0.35, -0.35]} rotation={[0.9, 0.3, 0]}>
        <meshPhysicalMaterial color="#e879f9" roughness={0.38} clearcoat={0.5} emissive="#a21caf" emissiveIntensity={0.25} />
      </mesh>
      <mesh geometry={d.plasmido} position={[-2.15, -0.3, -0.25]} rotation={[0.3, 1.1, 0.4]} scale={0.8}>
        <meshPhysicalMaterial color="#e879f9" roughness={0.38} clearcoat={0.5} emissive="#a21caf" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}
export const NUCLEOIDE_PARTES = { adn: [0.6, 0.35, -0.1] as Pt, plasmido: [2.05, 0.35, -0.35] as Pt };

export function Flagelo({ x0, playing }: { x0: number; playing: boolean }) {
  const geo = useMemo(() => geoTubos([curvaHelice(x0, 6.5, 0.32, 3.2)], 0.05, 260, 7), [x0]);
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current && playing) g.current.rotation.x += dt * 5.5;
  });
  return (
    <group ref={g}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#b9c7d6" roughness={0.35} clearcoat={0.6} />
      </mesh>
    </group>
  );
}

export function Pili({ forma, n }: { forma: FormaRadial; n: number }) {
  const geo = useMemo(() => {
    const rnd = azar(88);
    const curvas = Array.from({ length: n }, () => {
      const d = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
      const a = d.clone().multiplyScalar(forma(d) - 0.05);
      const b = d.clone().multiplyScalar(forma(d) + 0.45 + rnd() * 0.35);
      const m = a.clone().lerp(b, 0.5).add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.12));
      return new THREE.CatmullRomCurve3([a, m, b]);
    });
    return geoTubos(curvas, 0.018, 10, 5);
  }, [forma, n]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#c7d2de" roughness={0.5} />
    </mesh>
  );
}

/* ── Células vecinas, desenfocadas al fondo: dan escala y profundidad ──────── */
export function Vecinas({ color }: { color: string }) {
  const pos: { p: Pt; r: number }[] = [
    { p: [-17, 3, -26], r: 5.2 },
    { p: [16, -2, -30], r: 5.8 },
    { p: [-4, -10, -34], r: 5 },
    { p: [8, 10, -36], r: 6.5 },
    { p: [25, 6, -24], r: 4.5 },
    { p: [-25, -6, -22], r: 4.6 },
  ];
  return (
    <group>
      {pos.map((c, i) => (
        <mesh key={i} position={c.p} scale={c.r}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent opacity={0.12} depthWrite={false} emissive={color} emissiveIntensity={0.05} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Partículas sueltas en una caja de puntos dada (ribosomas libres, etc.) ── */
export function Puntos({ puntos, tam, color, corte, emis = 0 }: { puntos: THREE.Vector3[]; tam: number; color: string; corte: Corte | null; emis?: number }) {
  return (
    <Instancias puntos={puntos} geo={GEO_BOLITA} escala={tam}>
      <meshStandardMaterial color={color} roughness={0.45} emissive={color} emissiveIntensity={emis} {...(corte ? { clippingPlanes: corte.planos, clipIntersection: true } : {})} />
    </Instancias>
  );
}
